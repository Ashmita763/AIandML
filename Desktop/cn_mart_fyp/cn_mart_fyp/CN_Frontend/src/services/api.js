import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    timeout: 5000,
});

// Add base URL for images
api.imageUrl = 'http://localhost:3000';

// Get token based on path - use admin token for admin routes, user token for user routes
const getTokenForPath = (path) => {
    if (path.includes('/admin') || path.includes('/user/all')) {
        return localStorage.getItem('adminToken');
    }
    return localStorage.getItem('userToken');
};

// Add request interceptor - ensure every request includes the appropriate token
api.interceptors.request.use(
    (config) => {
        const token = getTokenForPath(config.url);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor with improved error handling - make it much less aggressive about logout
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only logout for confirmed authentication failures, not network errors
        if (
            error.response?.status === 401 &&
            error.response?.data?.message === "Invalid or expired token" &&
            !error.config.url.includes("/cart") &&
            !error.config.url.includes("/wishlist")
        ) {
            console.warn("Token expired, logging out");
            localStorage.removeItem("userToken");
            localStorage.removeItem("userData");
            delete api.defaults.headers.common["Authorization"];
            
            // Use a brief timeout to avoid immediate redirect issues
            setTimeout(() => {
                window.location.href = "/signin";
            }, 100);
        }
        return Promise.reject(error);
    }
);

// Export API endpoints
export const apiEndpoints = {
    // Authentication endpoints
    login: (data) => api.post('/user/signin', data),
    register: (data) => api.post('/user/siginup', data),
    verifyEmail: (data) => api.post('/user/verify-email', data),
    resendOtp: (data) => api.post('/user/resend-otp', data),

    // Get single product
    getProduct: (id) => api.get(`/product/${id}`),

    // Add review
    addReview: (productId, review) => api.post(`/product/${productId}/review`, review),

    // Change password
    changePassword: (data) => api.put('/auth/change-password', data),

    // Order endpoints
    createOrder: (orderData) => api.post("/order/new", orderData),
    getOrders: () => api.get("/orders/me"),
    getOrderDetails: (orderId) => api.get(`/order/${orderId}`),

    // Profile endpoints
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),

    // Admin endpoints
    getDashboardStats: () => api.get("/admin/dashboard-stats"),
    getAdminOrders: () => api.get("/admin/orders"),
    updateOrderStatus: (orderId, status) => api.put(`/admin/order/${orderId}`, { status }),

    // User management endpoints
    getAllUsers: () => api.get('/user/all', {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
    }),
    toggleUserStatus: (userId) => api.put(`/user/toggle-status/${userId}`, {}, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
    }),
    deleteUser: (userId) => api.delete(`/user/${userId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
    }),

    // Order management endpoints
    getAllOrders: () => api.get('/admin/orders'),
    clearDeliveredOrders: () => api.delete('/admin/orders/clear-delivered'),

    // User profile endpoints
    deleteProfile: () => api.delete('/auth/profile'),

    // Cart endpoints
    getCart: () => api.get('/cart'),
    addToCart: (data) => api.post('/cart/add', data),
    updateCart: (data) => api.put('/cart/update', data),
    removeFromCart: (productId) => api.delete(`/cart/remove/${productId}`),
    clearCart: () => api.delete('/cart/clear'),

    // Wishlist endpoints
    getWishlist: () => api.get('/wishlist'),
    addToWishlist: (data) => api.post('/wishlist/add', data),
    removeFromWishlist: (productId) => api.delete(`/wishlist/remove/${productId}`),
    isInWishlist: (productId) => api.get(`/wishlist/check/${productId}`),
    clearWishlist: () => api.delete('/wishlist/clear'),
};

export default api;
