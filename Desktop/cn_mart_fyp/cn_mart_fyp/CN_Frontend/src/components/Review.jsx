import { useState, useEffect } from "react";
import { FaStar, FaImage, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../services/api";

const Review = ({ isOpen, onClose, orderId, item, onReviewSubmit }) => {
  const [reviewData, setReviewData] = useState({
    rating: 0,
    comment: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [canReview, setCanReview] = useState(true);
  const [existingReview, setExistingReview] = useState(null);

  // Check if item has already been reviewed
  useEffect(() => {
    if (isOpen && item && orderId) {
      const checkReviewStatus = async () => {
        try {
          // Check if user can review this product
          const response = await api.get(
            `/review/check/${orderId}/${item.product._id}`
          );
          if (response.data.success) {
            if (response.data.hasReviewed && response.data.review) {
              // Found existing review - load it for editing
              setExistingReview(response.data.review);
              setReviewData({
                rating: response.data.review.rating || 0,
                comment: response.data.review.comment || "",
                image: null, // Cannot edit uploaded image, can only replace
              });
              setCanReview(true);
            } else {
              // No existing review - check if order is delivered
              setExistingReview(null);
              setReviewData({ rating: 0, comment: "", image: null });
              // Can review only delivered orders
              setCanReview(response.data.canReview);
            }
          }
        } catch (error) {
          console.error("Error checking review status:", error);
          if (error.response?.status === 404) {
            toast.error("Cannot find order or product information");
            onClose();
          }
        }
      };

      checkReviewStatus();
    }
  }, [isOpen, orderId, item]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canReview) {
      toast.error("You can only review delivered products");
      return;
    }

    if (reviewData.rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("orderId", orderId);
      formData.append("itemId", item._id);
      formData.append("rating", reviewData.rating.toString());

      if (reviewData.comment?.trim()) {
        formData.append("comment", reviewData.comment.trim());
      }
      if (reviewData.image) {
        formData.append("image", reviewData.image);
      }

      let url = "/review/create";
      // If editing existing review
      if (existingReview) {
        url = `/review/update/${existingReview._id}`;
      }

      const response = await api.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success(
          existingReview
            ? "Review updated successfully!"
            : "Review submitted successfully!"
        );
        onReviewSubmit && onReviewSubmit();
        onClose();
        setReviewData({ rating: 0, comment: "", image: null });
      } else {
        throw new Error(response.data.message || "Review submission failed");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
        isOpen ? "" : "hidden"
      }`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white p-6 rounded-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">
          {existingReview ? "Edit Your Review" : "Write a Review"}
        </h2>
        <div className="mb-4">
          <p className="font-medium">{item?.product?.name}</p>
          <p className="text-sm text-gray-500">
            Order #{orderId?.substring(0, 8)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    setReviewData((prev) => ({ ...prev, rating: star }))
                  }
                  className={`text-2xl ${
                    star <= reviewData.rating
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                >
                  <FaStar />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-4">
            <label
              htmlFor="review-comment"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Comment
            </label>
            <textarea
              id="review-comment"
              value={reviewData.comment}
              onChange={(e) =>
                setReviewData((prev) => ({ ...prev, comment: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500"
              rows="4"
              placeholder="Write your review here..."
            />
          </div>

         

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || reviewData.rating === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" /> Processing...
                </>
              ) : existingReview ? (
                "Update Review"
              ) : (
                "Submit Review"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Review;
