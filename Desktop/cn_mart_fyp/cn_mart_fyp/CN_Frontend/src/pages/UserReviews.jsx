import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaStar, FaEdit, FaTrash, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../services/api";
import { getImageUrl } from "../utils/imageUtils";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";
import Review from "../components/Review";

const UserReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserReviews();
    }
  }, [isAuthenticated]);

  const fetchUserReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get("/review/user");
      if (response.data.success) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      toast.error("Failed to load your reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleEditReview = (review) => {
    setSelectedReview({
      orderId: review.order,
      item: {
        _id: review._id,
        product: review.product
      }
    });
    setShowEditModal(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      const response = await api.delete(`/review/${reviewId}`);
      if (response.data.success) {
        toast.success("Review deleted successfully");
        // Refresh reviews list
        fetchUserReviews();
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center">
        <FaSpinner className="animate-spin text-blue-500 text-4xl mb-4" />
        <p className="text-gray-600">Loading your reviews...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4">
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">My Reviews</h1>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 mb-4">You haven't written any reviews yet.</p>
            <Link
              to="/orders"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Go to my orders
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link 
                        to={`/product/${review.product._id}`}
                        className="text-lg font-medium hover:text-blue-600"
                      >
                        {review.product.name}
                      </Link>
                      
                      <div className="flex items-center mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            className={`w-5 h-5 ${
                              star <= review.rating ? "text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-500">
                          {format(new Date(review.createdAt), "MMMM d, yyyy")}
                        </span>
                      </div>
                      
                      {review.comment && (
                        <p className="mt-4 text-gray-700">{review.comment}</p>
                      )}
                      
                      {review.image && (
                        <div className="mt-4">
                          <img
                            src={getImageUrl(review.image)}
                            alt="Review"
                            className="max-w-xs rounded-lg"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditReview(review)}
                        className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {selectedReview && (
        <Review
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedReview(null);
          }}
          orderId={selectedReview.orderId}
          item={selectedReview.item}
          onReviewSubmit={fetchUserReviews}
        />
      )}
    </div>
  );
};

export default UserReviews;
