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

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  // Create a fetchCart function that can be called from anywhere
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get("/cart");

      console.log("Cart response:", response.data);

      if (response.data.success) {
        if (response.data.cart && Array.isArray(response.data.cart.items)) {
          // Format cart items to match what the components expect
          const formattedItems = response.data.cart.items.map((item) => ({
            ...item.product,
            quantity: item.quantity,
          }));
          setCart(formattedItems);
        } else if (Array.isArray(response.data.cart)) {
          setCart(response.data.cart);
        } else {
          console.warn("Unexpected cart format:", response.data.cart);
          setCart([]);
        }
      } else {
        setCart([]);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch cart on mount and when authentication changes
  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, fetchCart]);

  const addToCart = async (product) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add to cart");
      return false;
    }

    try {
      setLoading(true);
      const response = await api.post("/cart/add", {
        productId: product._id,
        quantity: product.quantity || 1,
      });

      if (response.data.success) {
        // Immediately fetch the updated cart
        await fetchCart();
        toast.success(`${product.name} added to cart`);
        return true;
      } else {
        throw new Error(response.data.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error.message || "Failed to add to cart");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await api.put("/cart/update", {
        productId,
        quantity,
      });

      if (response.data.success) {
        await fetchCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating cart:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to update item quantity";
      toast.error(errorMsg);
      return false;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await api.delete(`/cart/remove/${productId}`);

      if (response.data.success) {
        await fetchCart();
        toast.info("Removed from cart");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove from cart");
      return false;
    }
  };

  const clearCart = async () => {
    try {
      const response = await api.delete("/cart/clear");

      if (response.data.success) {
        await fetchCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart");
      return false;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        loading,
        fetchCart,
        cartTotal: Array.isArray(cart)
          ? cart.reduce(
              (total, item) => total + item.price * (item.quantity || 1),
              0
            )
          : 0,
        cartItemsCount: Array.isArray(cart) ? cart.length : 0,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

export default CartContext;
