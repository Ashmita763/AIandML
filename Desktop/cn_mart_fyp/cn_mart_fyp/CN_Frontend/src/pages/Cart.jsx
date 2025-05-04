import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { FaTrash, FaMinus, FaPlus } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import OrderConfirmation from "../components/OrderConfirmation";
import { toast } from "react-toastify";

const Cart = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    loading: cartLoading,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [location, setLocation] = useState("kathmandu");
  const [loading, setLoading] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin");
    }
  }, [isAuthenticated, navigate]);

  // Calculate total
  const total = Array.isArray(cart)
    ? cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : 0;

  // Calculate delivery fee based on location
  const deliveryFee = location === "kathmandu" ? 0 : 100;

  // Update total to include delivery fee
  const finalTotal = total + deliveryFee;

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setLoading(true);
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      setLoading(true);
      await removeFromCart(productId);
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item from cart");
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSuccess = async () => {
    try {
      await clearCart();
      setIsCheckingOut(false);
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart");
    }
  };

  // Show loading state
  if (loading || cartLoading) {
    return (
      <div className="min-h-screen pt-20 flex justify-center items-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mb-4"></div>
          <p className="text-lg">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!Array.isArray(cart) || cart.length === 0) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-2xl mx-auto text-center py-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            to="/"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (isCheckingOut) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <OrderConfirmation
          cart={cart}
          total={finalTotal}
          onOrderSuccess={handleOrderSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-8">Shopping Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {Array.isArray(cart) &&
                  cart.map((item) => (
                    <li key={item._id} className="p-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded"
                          onError={(e) => {
                            e.target.src = "/images/default-product.png";
                            e.target.onerror = null;
                          }}
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {item.description}
                          </p>
                          <div className="mt-2 flex items-center space-x-4">
                            <div className="flex items-center border rounded">
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item._id,
                                    item.quantity - 1
                                  )
                                }
                                className="p-2 hover:bg-gray-100"
                                disabled={loading || item.quantity <= 1}
                              >
                                <FaMinus className="w-3 h-3" />
                              </button>
                              <span className="px-4">{item.quantity}</span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item._id,
                                    item.quantity + 1
                                  )
                                }
                                className="p-2 hover:bg-gray-100"
                                disabled={
                                  loading || item.quantity >= item.stock
                                }
                              >
                                <FaPlus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item._id)}
                              className="text-red-500 hover:text-red-600"
                              disabled={loading}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            Rs.{item.price * item.quantity}
                          </p>
                          <p className="text-sm text-gray-500">
                            Rs.{item.price} {item.unit && `/ ${item.unit}`}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              {/* Add location selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Location
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="kathmandu">Inside Kathmandu Valley</option>
                  <option value="outside">Outside Kathmandu Valley</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rs.{total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>
                    {deliveryFee === 0 ? "Free" : `Rs.${deliveryFee}`}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>Rs.{finalTotal}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsCheckingOut(true)}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                  disabled={loading}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
