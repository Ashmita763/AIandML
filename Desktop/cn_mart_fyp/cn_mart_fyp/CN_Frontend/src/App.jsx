import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/Header.jsx";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import UserHomePage from "./layouts/user/userHomePage.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Cart from "./pages/Cart.jsx";
import Wishlist from "./pages/Wishlist.jsx";
import Profile from "./pages/Profile.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Orders from "./pages/Order.jsx";
import Checkout from "./components/Checkout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import AdminRoute from "./components/AdminRoute";
import PrivateRoute from "./components/PrivateRoute";
import ForgotPassword from "./pages/ForgotPassword";

// Admin imports
import Layout from "./Admin/layouts/Layout";
import Dashboard from "./Admin/pages/Dashboard.jsx";
import Product from "./Admin/components/Product.jsx";
import User from "./Admin/components/User.jsx";
import Order from "./Admin/components/Order.jsx";
import AdminLogin from "./Admin/Auth/Login.jsx";
import Reviews from "./Admin/components/Reviews";
import VerifyEmail from "./pages/VerifyEmail.jsx";

// Import AdminAuthProvider
import { AdminAuthProvider } from "./context/AdminAuthContext";

// Import UserReviews
import UserReviews from "./pages/UserReviews.jsx";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Initialize auth state from localStorage
    const userToken = localStorage.getItem("userToken");
    const userData = localStorage.getItem("userData");
    return !!(userToken && userData);
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    // Initialize admin state from localStorage
    const adminToken = localStorage.getItem("adminToken");
    const adminData = localStorage.getItem("adminData");
    return !!(adminToken && adminData);
  });

  // Add auth state listener
  useEffect(() => {
    const handleStorageChange = () => {
      const userToken = localStorage.getItem("userToken");
      const userData = localStorage.getItem("userData");
      const adminToken = localStorage.getItem("adminToken");
      const adminData = localStorage.getItem("adminData");

      setIsAuthenticated(!!(userToken && userData));
      setIsAdmin(!!(adminToken && adminData));
    };

    // Listen for storage changes (useful for multiple tabs)
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Add auth check on mount and token refresh
  useEffect(() => {
    const validateToken = async () => {
      try {
        const userToken = localStorage.getItem("userToken");
        const adminToken = localStorage.getItem("adminToken");

        if (userToken) {
          // You can add an API call here to validate the token if needed
          setIsAuthenticated(true);
        }

        if (adminToken) {
          // You can add an API call here to validate the admin token if needed
          setIsAdmin(true);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Token validation error:", error);
        // Handle invalid token
        localStorage.removeItem("userToken");
        localStorage.removeItem("userData");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    };

    validateToken();
  }, []);

  // Create a wrapper component to handle header visibility
  const AppContent = () => {
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const isAdminRoute = location.pathname.startsWith("/admin");
    const hideHeaderPaths = [
      "/admin/login",
      "/signin",
      "/signup",
      "/verify-email",
    ];
    const shouldShowHeader =
      !hideHeaderPaths.includes(location.pathname) && !isAdminRoute;

    return (
      <div className="flex flex-col min-h-screen">
        {shouldShowHeader && <Header />}

        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected User Routes - Use imported PrivateRoute component */}
            <Route
              path="/userHomePage"
              element={
                <PrivateRoute>
                  <UserHomePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <PrivateRoute>
                  <Cart />
                </PrivateRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <PrivateRoute>
                  <Wishlist />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <PrivateRoute>
                  <Orders />
                </PrivateRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <PrivateRoute>
                  <Checkout />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-reviews"
              element={
                <PrivateRoute>
                  <UserReviews />
                </PrivateRoute>
              }
            />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <Layout />
                </AdminRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Product />} />
              <Route path="users" element={<User />} />
              <Route path="orders" element={<Order />} />
              <Route path="reviews" element={<Reviews />} />
            </Route>
          </Routes>
        </main>

        {shouldShowHeader && <Footer />}
        <ToastContainer />
      </div>
    );
  };

  return (
    <AuthProvider>
      <AdminAuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <AppContent />
            </Router>
          </WishlistProvider>
        </CartProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
};

export default App;
