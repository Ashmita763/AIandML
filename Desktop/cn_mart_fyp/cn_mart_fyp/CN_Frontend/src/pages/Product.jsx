import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { FaHeart, FaRegHeart, FaSearch, FaFilter } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../services/api";
import { getImageUrl } from "../utils/imageUtils";
import ProductCard from "../components/ProductCard";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, wishlist = [] } = useWishlist(); // Default to empty array
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "popular", label: "Most Popular" },
  ];

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCategory, selectedSort, searchQuery]);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/product/search", {
        params: {
          category: selectedCategory,
          sort: selectedSort,
          search: searchQuery,
        },
      });
      if (response.data.success) {
        setProducts(response.data.products);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/product/category");
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to cart");
      navigate("/signin");
      return;
    }
    addToCart(product);
    toast.success(`${product.name} added to cart`, {
      position: "bottom-right",
      autoClose: 2000,
    });
  };

  const handleToggleWishlist = (product) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to wishlist");
      navigate("/signin");
      return;
    }

    // Check if product is in wishlist safely
    const isInWishlist =
      Array.isArray(wishlist) &&
      wishlist.some((item) => item._id === product._id);

    if (isInWishlist) {
      removeFromWishlist(product._id);
      toast.info(`${product.name} removed from wishlist`, {
        position: "bottom-right",
        autoClose: 2000,
      });
    } else {
      addToWishlist(product);
      toast.success(`${product.name} added to wishlist`, {
        position: "bottom-right",
        autoClose: 2000,
      });
    }
  };

  if (loading) return <Loading />;

  // Ensure we have a safe way to check if product is in wishlist
  const isInWishlist = (productId) => {
    return (
      Array.isArray(wishlist) && wishlist.some((item) => item._id === productId)
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search and Filter Header */}
      <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-lg">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>

        {/* Desktop Filters */}
        <div className="hidden md:flex items-center gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Mobile Filter Button */}
        <button
          className="md:hidden w-full flex items-center justify-center gap-2 py-2 px-4 bg-green-600 text-white rounded-lg"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {/* Mobile Filters */}
      {showFilters && (
        <div className="md:hidden space-y-4 mb-6">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            unit={product.unit}
            isAuthenticated={isAuthenticated} // Make sure this prop is passed!
            onAddToCart={() => handleAddToCart(product)}
            onToggleWishlist={() => handleToggleWishlist(product)}
            isInWishlist={isInWishlist(product._id)}
          />
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No products found matching your criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default Product;
