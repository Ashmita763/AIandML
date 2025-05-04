import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import {
  FaShoppingCart,
  FaHeart,
  FaUser,
  FaHome,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaSignInAlt,
  FaSearch,
  FaStore,
} from "react-icons/fa";
import { BiSolidBriefcaseAlt2 } from "react-icons/bi";


const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { cart, cartItemsCount } = useCart();
  const { wishlist, wishlistItemsCount } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  // Close mobile menu when location changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
           
            <span className="text-xl font-bold text-green-600 hidden sm:block">
              CN Mart
            </span>
          </Link>


          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="nav-link text-base font-medium text-gray-700 hover:text-green-500 flex items-center"
            >
              <FaHome className="mr-1" />
              <span>Home</span>
            </Link>
           
            <Link
              to="/cart"
              className="nav-link text-base font-medium text-gray-700 hover:text-green-500 relative flex items-center"
            >
              <FaShoppingCart className="mr-1" />
              <span>Cart</span>
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cartItemsCount}
                </span>
              )}
            </Link>
            <Link
              to="/wishlist"
              className="nav-link text-base font-medium text-gray-700 hover:text-green-500 relative flex items-center"
            >
              <FaHeart className="mr-1" />
              <span>Wishlist</span>
              {wishlistItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {wishlistItemsCount}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <div className="flex space-x-4 items-center">
                <Link to="/orders"
                className="nav-link text-base font-medium text-gray-700 hover:text-green-500 flex items-center">
                  <BiSolidBriefcaseAlt2   className="mr-1"/>
                <span>My Orders</span>
                </Link>
                <Link
                  to="/profile"
                  className="nav-link text-base font-medium text-gray-700 hover:text-green-500 flex items-center"
                >
                  <FaUser className="mr-1" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="nav-link text-base font-medium text-gray-700 hover:text-green-500 flex items-center"
                >
                  <FaSignOutAlt className="mr-1" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/signin"
                className="nav-link text-base font-medium text-gray-700 hover:text-green-500 flex items-center"
              >
                <FaSignInAlt className="mr-1" />
                <span>Sign In</span>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-green-500 focus:outline-none"
            >
              {isOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-4 py-2 space-y-3 max-h-[80vh] overflow-y-auto">
        

            {/* Stylish Mobile Navigation Links */}
            <div className="space-y-2 py-2">
              <Link
                to="/"
                className="mobile-nav-link flex items-center justify-between p-3 rounded-lg hover:bg-green-50 transition-colors"
              >
                <div className="flex items-center">
                  <FaHome className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-gray-800 font-medium">Home</span>
                </div>
              </Link>

            

              <Link
                to="/cart"
                className="mobile-nav-link flex items-center justify-between p-3 rounded-lg hover:bg-green-50 transition-colors"
              >
                <div className="flex items-center">
                  <FaShoppingCart className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-gray-800 font-medium">Cart</span>
                </div>
                {cartItemsCount > 0 && (
                  <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    {cartItemsCount}
                  </span>
                )}
              </Link>

              <Link
                to="/wishlist"
                className="mobile-nav-link flex items-center justify-between p-3 rounded-lg hover:bg-green-50 transition-colors"
              >
                <div className="flex items-center">
                  <FaHeart className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-gray-800 font-medium">Wishlist</span>
                </div>
                {wishlistItemsCount > 0 && (
                  <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    {wishlistItemsCount}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <>
                <Link to="/orders"
                className="mobile-nav-link flex items-center p-3 rounded-lg hover:bg-green-50 transition-colors">
                  <BiSolidBriefcaseAlt2   className="w-5 h-5 text-green-600 mr-3"/>
                <span>My Orders</span>
                </Link>
                  <Link
                    to="/profile"
                    className="mobile-nav-link flex items-center justify-between p-3 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <FaUser className="w-5 h-5 text-green-600 mr-3" />
                      <span className="text-gray-800 font-medium">Profile</span>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="mobile-nav-link w-full flex items-center justify-between p-3 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <FaSignOutAlt className="w-5 h-5 text-green-600 mr-3" />
                      <span className="text-gray-800 font-medium">Logout</span>
                    </div>
                  </button>
                </>
              ) : (
                <Link
                  to="/signin"
                  className="mobile-nav-link flex items-center justify-between p-3 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <div className="flex items-center">
                    <FaSignInAlt className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-gray-800 font-medium">Sign In</span>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
