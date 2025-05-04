import React, { useState } from "react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { FaTrash, FaCartPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../utils/imageUtils";
import { useAuth } from "../context/AuthContext"; // Import auth context

const Wishlist = () => {
  const {
    wishlist,
    removeFromWishlist,
    loading: wishlistLoading,
  } = useWishlist();
  const { addToCart, loading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth(); // Add this to check auth status
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin");
    }
  }, [isAuthenticated, navigate]);

  const handleMoveToCart = async (product) => {
    if (product.stock <= 0) {
      toast.error("Product is out of stock!");
      return;
    }

    try {
      setLoading(true);
      const added = await addToCart({ ...product, quantity: 1 });
      if (added) {
        await removeFromWishlist(product._id);
      }
    } catch (error) {
      console.error("Error moving item to cart:", error);
      toast.error("Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      setLoading(true);
      await removeFromWishlist(productId);
      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Show loading state with a spinner for better UX
  if (wishlistLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] pt-20">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-lg">Loading your wishlist...</p>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-semibold mb-4">Your wishlist is empty</h2>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-18 pt-20">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Image Container */}
            <div
              className="relative h-48 cursor-pointer"
              onClick={() => handleProductClick(product._id)}
            >
              <img
                src={getImageUrl(product.image)}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/images/default-product.png";
                  e.target.onerror = null;
                }}
              />
              {product.stock <= 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white font-semibold">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div
                className="cursor-pointer"
                onClick={() => handleProductClick(product._id)}
              >
                <h3 className="text-lg font-semibold mb-2 hover:text-blue-600">
                  {product.name}
                </h3>
                <p className="text-gray-600 mb-2 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">
                    Rs.{product.price}
                    {product.unit && ` / ${product.unit}`}
                  </span>
                  <span
                    className={`text-sm ${
                      product.stock > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {product.stock > 0
                      ? `${product.stock} left`
                      : "Out of Stock"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleMoveToCart(product)}
                  disabled={product.stock <= 0 || loading}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded
                    ${
                      product.stock > 0 && !loading
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-gray-300 cursor-not-allowed text-gray-500"
                    }`}
                >
                  <FaCartPlus />
                  Add to Cart
                </button>
                <button
                  onClick={() => handleRemove(product._id)}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded hover:bg-red-600 disabled:bg-red-300"
                >
                  <FaTrash />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
