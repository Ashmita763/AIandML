import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../services/api";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize admin auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const adminToken = localStorage.getItem("adminToken");
        const adminData = localStorage.getItem("adminData");
        console.log("initializeAuth - adminToken:", adminToken);
        console.log("initializeAuth - adminData:", adminData);
        
        if (adminToken && adminData) {
          // Make sure any user tokens are removed to prevent conflicts
          localStorage.removeItem("userToken");
          localStorage.removeItem("userData");
          
          const parsedAdminData = JSON.parse(adminData);
          
          // Set admin auth header
          api.defaults.headers.common["Authorization"] = `Bearer ${adminToken}`;
          console.log("Admin Authorization header set with token:", adminToken);
          
          setAdmin(parsedAdminData);
          setIsAuthenticated(true);
          console.log("Admin auth restored for:", parsedAdminData.email);
        } else {
          console.log("No admin auth data found in localStorage");
        }
      } catch (error) {
        console.error("Error initializing admin auth:", error);
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");
        delete api.defaults.headers.common["Authorization"];
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Function to handle admin login
  const login = async (email, password) => {
    try {
      console.log(`Attempting admin login for ${email}`);
      const response = await api.post("/admin/signin", { email, password });
      console.log("Admin login response:", response.data);

      if (response.data.success) {
        const { token, admin } = response.data;

        // Remove any user tokens to prevent conflicts
        localStorage.removeItem("userToken");
        localStorage.removeItem("userData");

        // Store admin auth data
        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminData", JSON.stringify(admin));

        // Set auth header for all future API requests
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        console.log("Admin Authorization header set with token:", token);

        // Update state
        setAdmin(admin);
        setIsAuthenticated(true);

        console.log("Admin login successful, auth state updated");
        return { success: true };
      } else {
        return {
          success: false,
          message: response.data.message || "Login failed",
        };
      }
    } catch (error) {
      console.error("Admin login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  // Function to handle admin logout
  const logout = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");

    // Clear auth header
    delete api.defaults.headers.common["Authorization"];
    console.log("Admin Authorization header cleared");

    // Reset state
    setAdmin(null);
    setIsAuthenticated(false);

    console.log("Admin logged out");
  }, []);

  // Verify token validity immediately and periodically
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkTokenValidity = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          logout();
          return;
        }

        // Ensure the token is in the headers
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Test the token with an admin-specific endpoint
        await api.get("/admin/dashboard-stats");
        console.log("Admin token validation succeeded");
      } catch (error) {
        console.error("Admin token validation error:", error);
        logout();
      }
    };

    // Check token validity immediately
    checkTokenValidity();

    // Then check periodically
    const interval = setInterval(checkTokenValidity, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, logout]);

  // Provide auth context
  const value = {
    admin,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};

export default AdminAuthContext;
