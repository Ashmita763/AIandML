import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../services/api";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // More robust initialization to prevent auto logout on refresh
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Get token and user data from localStorage
        const userToken = localStorage.getItem("userToken");
        const userData = localStorage.getItem("userData");

        console.log("Initializing auth state:", {
          hasToken: !!userToken,
          hasUserData: !!userData,
        });

        if (userToken && userData) {
          try {
            // Parse user data and set authentication state
            const parsedUserData = JSON.parse(userData);
            setUser(parsedUserData);
            setIsAuthenticated(true);

            // Ensure auth header is set for future requests
            api.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${userToken}`;
            console.log("Auth header set on initialization");
          } catch (parseError) {
            // Handle JSON parse error, but don't log out the user
            console.error("Error parsing user data:", parseError);
          }
        } else {
          // No token or user data, ensure user is logged out
          setUser(null);
          setIsAuthenticated(false);
          delete api.defaults.headers.common["Authorization"];
        }
      } catch (error) {
        console.error("Error during auth initialization:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Less aggressive token validation
  useEffect(() => {
    if (!isAuthenticated) return;

    // Check token exists without frequent API calls
    const checkTokenExists = () => {
      const userToken = localStorage.getItem("userToken");
      if (!userToken) {
        logout();
      }
    };

    checkTokenExists();

    // Only check occasionally to avoid unnecessary API calls
    const interval = setInterval(checkTokenExists, 30 * 60 * 1000); // Check every 30 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Function to handle login
  const login = async (email, password) => {
    try {
      console.log(`Attempting login for ${email}`);
      const response = await api.post("/user/signin", { email, password });
      console.log("Login response:", response.data);

      if (response.data.success) {
        const { token, user } = response.data;

        // Store auth data in localStorage
        localStorage.setItem("userToken", token);
        localStorage.setItem("userData", JSON.stringify(user));

        // Set auth header for all future API requests
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        console.log("Authorization header set with token:", token);

        // Update state
        setUser(user);
        setIsAuthenticated(true);

        console.log("Login successful, auth state updated");
        return { success: true };
      } else {
        return {
          success: false,
          message: response.data.message || "Login failed",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  // Ensure logout properly cleans up
  const logout = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");

    // Clear auth header
    delete api.defaults.headers.common["Authorization"];

    // Reset state
    setUser(null);
    setIsAuthenticated(false);

    console.log("User logged out");
  }, []);

  // Provide auth context
  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
