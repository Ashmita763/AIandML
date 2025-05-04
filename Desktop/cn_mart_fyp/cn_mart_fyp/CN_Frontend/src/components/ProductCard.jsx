import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHeart, FaCartPlus, FaEye, FaStar } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { toast } from "react-toastify";
import { getImageUrl } from "../utils/imageUtils";

const ProductCard = ({ product, isAuthenticated }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please sign in to add to cart");
      navigate("/signin");
      return;
    }

    if (product.stock > 0) {
      addToCart({ ...product, quantity: 1 });
      toast.success("Added to cart!");
    }
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }

    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const handleProductClick = () => {
    navigate(`/product/${product._id}`);
  };

  const handleViewDetails = (e) => {
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation(); // Stop event from bubbling up
    navigate(`/product/${product._id}`);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleProductClick}
    >
      <div className="relative group cursor-pointer">
        {/* Loading placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}

        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          className={`w-full h-48 object-cover transition-opacity duration-300 ${
            !imageLoaded ? "opacity-0" : "opacity-100"
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            console.log("Image failed to load:", product.image); // For debugging
            e.target.src = "/images/default-product.png";
            e.target.onerror = null;
            setImageLoaded(true);
          }}
        />

        {/* Stock badge */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs bg-green-500 text-white z-10">
          {product.stock > 0 ? `${product.stock} left` : "Out of Stock"}
        </div>

        {/* Action buttons */}
        <div
          className={`absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center transition-opacity duration-300 z-20
            ${isHovered ? "opacity-100" : "opacity-0"}`}
        >
          <div className="flex gap-2">
            <button
              onClick={handleToggleWishlist}
              className={`p-1.5 bg-white rounded-full ${
                isInWishlist(product._id) ? "text-red-500" : "text-gray-400"
              } hover:text-red-500`}
            >
              <FaHeart className="w-4 h-4" />
            </button>
            <button
              onClick={handleAddToCart}
              disabled={!product.stock}
              className={`p-1.5 bg-white rounded-full ${
                product.stock > 0
                  ? "text-green-500 hover:text-green-600"
                  : "text-gray-400 cursor-not-allowed"
              }`}
            >
              <FaCartPlus className="w-4 h-4" />
            </button>
            <button
              onClick={handleViewDetails}
              className="p-1.5 bg-white rounded-full text-gray-700 hover:text-gray-900"
            >
              <FaEye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 cursor-pointer">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-1">
          {product.name || "Untitled Product"}
        </h3>
        <p
          className="text-xs text-gray-600 mt-1 overflow-hidden text-ellipsis whitespace-pre-line line-clamp-2"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            maxHeight: "2.6rem", // Approximately 2 lines of text with some spacing
          }}
        >
          {product.description || "No description available"}
        </p>

        <div className="mt-2">
          {/* Ratings */}
          <div className="flex items-center space-x-1 mb-2">
            <div className="flex items-center">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.rating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="ml-1 text-xs text-gray-600">
                {product.rating > 0
                  ? `${product.rating.toFixed(1)}`
                  : "No ratings"}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              ({product.totalReviews || 0})
            </span>
          </div>

          {/* Price and wishlist indicator */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-green-600">
              Rs.{product.price}
              {product.unit && ` / ${product.unit}`}
            </span>
            {isInWishlist(product._id) && (
              <FaHeart className="text-red-500 w-3 h-3" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
