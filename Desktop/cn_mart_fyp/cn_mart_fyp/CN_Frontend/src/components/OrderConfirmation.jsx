import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PaymentForm from "./PaymentForm";
import api from "../services/api";

// Nepal cities data
const nepalCities = {
  "Kathmandu Valley": ["Kathmandu", "Lalitpur", "Bhaktapur"],
  "Province 1": ["Biratnagar", "Dharan", "Itahari", "Damak", "Birtamod"],
  Madhesh: ["Janakpur", "Birgunj", "Rajbiraj", "Malangawa"],
  Bagmati: ["Hetauda", "Bharatpur", "Bidur", "Dhulikhel"],
  Gandaki: ["Pokhara", "Gorkha", "Damauli", "Besisahar"],
  Lumbini: ["Butwal", "Nepalgunj", "Tulsipur", "Ghorahi"],
  Karnali: ["Birendranagar", "Jumla", "Dolpa"],
  Sudurpashchim: ["Dhangadhi", "Mahendranagar", "Dipayal"],
};

export default function OrderConfirmation({ cart, total, onOrderSuccess }) {
  const [step, setStep] = useState(1);
  const [orderDetails, setOrderDetails] = useState({
    fullName: "",
    email: "",
    phones: [""], // Array for multiple phone numbers
    address: "",
    city: "",
    province: "",
    zipCode: "",
    note: "",
  });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load user data and saved address
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const savedAddress = JSON.parse(
      localStorage.getItem("savedAddress") || "{}"
    );

    setOrderDetails((prev) => ({
      ...prev,
      fullName: userData.name || "",
      email: userData.email || "",
      phones: userData.phone ? [userData.phone] : [""],
      ...savedAddress,
    }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderDetails((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Handle city suggestions
    if (name === "city") {
      const cityMatches = [];
      Object.values(nepalCities).forEach((cities) => {
        cities.forEach((city) => {
          if (city.toLowerCase().startsWith(value.toLowerCase())) {
            cityMatches.push(city);
          }
        });
      });
      setSuggestions(cityMatches);
      setShowSuggestions(cityMatches.length > 0);
    }

    // Handle province selection
    if (name === "city") {
      Object.entries(nepalCities).forEach(([province, cities]) => {
        if (cities.includes(value)) {
          setOrderDetails((prev) => ({
            ...prev,
            province,
          }));
        }
      });
    }
  };

  const handlePhoneChange = (index, value) => {
    const updatedPhones = [...orderDetails.phones];
    updatedPhones[index] = value;
    setOrderDetails((prev) => ({
      ...prev,
      phones: updatedPhones,
    }));
  };

  const addPhoneNumber = () => {
    setOrderDetails((prev) => ({
      ...prev,
      phones: [...prev.phones, ""],
    }));
  };

  const removePhoneNumber = (index) => {
    if (orderDetails.phones.length > 1) {
      const updatedPhones = orderDetails.phones.filter((_, i) => i !== index);
      setOrderDetails((prev) => ({
        ...prev,
        phones: updatedPhones,
      }));
    }
  };

  const selectCity = (city) => {
    setOrderDetails((prev) => ({
      ...prev,
      city,
    }));
    setShowSuggestions(false);
  };

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    const requiredFields = ["fullName", "email", "phones", "address", "city"];
    const missingFields = requiredFields.filter(
      (field) => !orderDetails[field]
    );

    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(", ")}`);
      return;
    }

    // Save address for future use
    localStorage.setItem("savedAddress", JSON.stringify(orderDetails));
    setStep(2);
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    try {
      const response = await api.post("/order/new", {
        items: cart.map((item) => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: total,
        shippingAddress: orderDetails.address,
        phoneNumber: orderDetails.phones[0],
        note: orderDetails.note,
        paymentDetails,
      });

      if (response.data.success) {
        toast.success("Order placed successfully!");
        onOrderSuccess(); // Clear cart
        navigate("/orders"); // Redirect to orders page
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(error.response?.data?.message || "Failed to place order");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div
            className={`w-1/2 h-1 ${
              step >= 1 ? "bg-green-500" : "bg-gray-200"
            }`}
          />
          <div
            className={`w-1/2 h-1 ${
              step >= 2 ? "bg-green-500" : "bg-gray-200"
            }`}
          />
          <div className="absolute w-full flex justify-between">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? "bg-green-500 text-white" : "bg-gray-200"
              }`}
            >
              1
            </div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? "bg-green-500 text-white" : "bg-gray-200"
              }`}
            >
              2
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm">Delivery Details</span>
          <span className="text-sm">Payment</span>
        </div>
      </div>

      {step === 1 ? (
        <div className="bg-white p-8 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-8">Delivery Details</h2>
          <form onSubmit={handleDetailsSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={orderDetails.fullName}
                  onChange={handleInputChange}
                  className="h-12 text-lg px-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={orderDetails.email}
                  onChange={handleInputChange}
                  className="h-12 text-lg px-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Numbers *
              </label>
              <div className="space-y-4">
                {orderDetails.phones.map((phone, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => handlePhoneChange(index, e.target.value)}
                      className="h-12 text-lg px-4 flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      placeholder="Enter phone number"
                      required
                    />
                    {index === 0 ? (
                      <button
                        type="button"
                        onClick={addPhoneNumber}
                        className="h-12 px-4 text-green-600 hover:text-green-700 font-medium"
                      >
                        Add Another
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removePhoneNumber(index)}
                        className="h-12 px-4 text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={orderDetails.city}
                  onChange={handleInputChange}
                  className="h-12 text-lg px-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
                {showSuggestions && (
                  <ul className="absolute z-10 w-full bg-white mt-1 rounded-md shadow-lg max-h-48 overflow-auto border border-gray-200">
                    {suggestions.map((city) => (
                      <li
                        key={city}
                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-gray-700"
                        onClick={() => selectCity(city)}
                      >
                        {city}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code (Optional)
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={orderDetails.zipCode}
                  onChange={handleInputChange}
                  className="h-12 text-lg px-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Address *
              </label>
              <textarea
                name="address"
                value={orderDetails.address}
                onChange={handleInputChange}
                rows="4"
                className="text-lg px-4 py-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="House No., Street, Area, Landmark"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Note (Optional)
              </label>
              <textarea
                name="note"
                value={orderDetails.note}
                onChange={handleInputChange}
                rows="3"
                className="text-lg px-4 py-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="Any special instructions for delivery"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-4 px-6 rounded-md hover:bg-green-700 transition-colors font-medium text-lg"
            >
              Continue to Payment
            </button>
          </form>
        </div>
      ) : (
        <PaymentForm
          amount={total}
          onSuccess={handlePaymentSuccess}
          onBack={() => setStep(1)}
        />
      )}
    </div>
  );
}
