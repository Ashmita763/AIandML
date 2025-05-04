import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import api from "../services/api";

const inputClasses =
  "mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base";
const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart, total } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    alternatePhone: "",
    address: "",
    city: "",
    state: "",
    paymentMethod: "cod",
  });

  useEffect(() => {
    if (cart.length === 0) {
      navigate("/cart");
      return;
    }

    // Load user data
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    if (userData) {
      setFormData((prev) => ({
        ...prev,
        fullName: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || "",
      }));
    }
  }, [cart, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const orderData = {
        items: cart.map((item) => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          alternatePhone: formData.alternatePhone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
        },
        totalAmount: total > 1000 ? total : total + 50,
        shippingCost: total > 1000 ? 0 : 50,
        paymentMethod: formData.paymentMethod,
      };

      const response = await api.post("/order/create", orderData);

      if (response.data.success) {
        if (formData.paymentMethod === "cod") {
          clearCart();
          toast.success("Order placed successfully!");
          navigate("/orders");
          return;
        }

        // Handle online payments
        const paymentData = {
          amount: orderData.totalAmount,
          orderId: response.data.order._id,
        };

        if (formData.paymentMethod === "khalti") {
          const paymentResponse = await api.post(
            "/payment/khalti/init",
            paymentData
          );
          if (paymentResponse.data.success) {
            window.location.href = paymentResponse.data.payment_url;
          }
        } else if (formData.paymentMethod === "esewa") {
          const paymentResponse = await api.post(
            "/payment/esewa/init",
            paymentData
          );
          if (paymentResponse.data.success) {
            const form = document.createElement("form");
            form.setAttribute("method", "POST");
            form.setAttribute("action", paymentResponse.data.payment_url);

            for (const key in paymentResponse.data.params) {
              const input = document.createElement("input");
              input.setAttribute("type", "hidden");
              input.setAttribute("name", key);
              input.setAttribute("value", paymentResponse.data.params[key]);
              form.appendChild(input);
            }

            document.body.appendChild(form);
            form.submit();
          }
        }
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-8">
              Shipping Information
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={labelClasses}>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className={inputClasses}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className={labelClasses}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={inputClasses}
                  placeholder="Enter your email"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className={inputClasses}
                    placeholder="Your phone number"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Alternate Phone</label>
                  <input
                    type="tel"
                    name="alternatePhone"
                    value={formData.alternatePhone}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="Alternative phone (optional)"
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows={4}
                  className={inputClasses}
                  placeholder="Enter your full address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className={inputClasses}
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>Payment Method</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === "cod"}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">Cash on Delivery</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="khalti"
                      checked={formData.paymentMethod === "khalti"}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">Khalti</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="esewa"
                      checked={formData.paymentMethod === "esewa"}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">eSewa</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              >
                {loading ? "Processing..." : "Place Order"}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item._id} className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      {item.quantity} × Rs. {item.price}
                    </p>
                  </div>
                  <p className="font-medium">
                    Rs. {item.price * item.quantity}
                  </p>
                </div>
              ))}

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>Rs. {total}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>Shipping</span>
                  <span>{total > 1000 ? "Free" : "Rs. 50"}</span>
                </div>
                <div className="flex justify-between text-lg font-medium mt-4">
                  <span>Total</span>
                  <span>Rs. {total > 1000 ? total : total + 50}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
