import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  // Improved function to fetch wishlist data that properly handles errors
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get("/wishlist");
      console.log("Wishlist API response:", response.data);

      if (response.data.success) {
        if (
          response.data.wishlist &&
          Array.isArray(response.data.wishlist.products)
        ) {
          console.log(
            "Setting wishlist products:",
            response.data.wishlist.products
          );
          setWishlist(response.data.wishlist.products);
        } else if (Array.isArray(response.data.wishlist)) {
          console.log("Setting wishlist array:", response.data.wishlist);
          setWishlist(response.data.wishlist);
        } else {
          console.warn("Unexpected wishlist format:", response.data.wishlist);
          setWishlist([]);
        }
      } else {
        setWishlist([]);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Refresh wishlist on authentication change
  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated, fetchWishlist]);

  const addToWishlist = async (product) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add to wishlist");
      return false;
    }

    try {
      // First, check if product is already in wishlist to avoid duplicates
      if (isInWishlist(product._id)) {
        toast.info(`${product.name} is already in your wishlist`);
        return true;
      }

      setLoading(true);
      const response = await api.post("/wishlist/add", {
        productId: product._id,
      });

      if (response.data.success) {
        // Important: Always fetch fresh data after modifying wishlist
        await fetchWishlist();
        toast.success(`${product.name} added to wishlist`);
        return true;
      } else {
        throw new Error(response.data.message || "Failed to add to wishlist");
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error(error.response?.data?.message || "Failed to add to wishlist");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      setLoading(true);
      const response = await api.delete(`/wishlist/remove/${productId}`);

      if (response.data.success) {
        // Important: Always fetch fresh data after modifying wishlist
        await fetchWishlist();
        toast.info("Removed from wishlist");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // More robust isInWishlist function that handles different data structures
  const isInWishlist = useCallback(
    (productId) => {
      if (!Array.isArray(wishlist) || wishlist.length === 0) return false;

      return wishlist.some((item) => {
        // Handle both direct ID and object with _id field
        if (typeof item === "object" && item !== null) {
          return item._id === productId;
        } else if (typeof item === "string") {
          return item === productId;
        }
        return false;
      });
    },
    [wishlist]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist: async () => {
          try {
            const response = await api.delete("/wishlist/clear");
            if (response.data.success) {
              await fetchWishlist();
              return true;
            }
            return false;
          } catch (error) {
            console.error("Error clearing wishlist:", error);
            return false;
          }
        },
        loading,
        fetchWishlist,
        wishlistItemsCount: Array.isArray(wishlist) ? wishlist.length : 0,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);

export default WishlistContext;
