import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaCheck,
  FaExclamationCircle,
  FaSpinner,
  FaEnvelope,
  FaSyncAlt,
} from "react-icons/fa";
import api from "../services/api";

const VerifyEmail = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract email from state or query params if available
    const urlParams = new URLSearchParams(location.search);
    const emailParam = urlParams.get("email");

    if (location.state?.email) {
      setEmail(location.state.email);
    } else if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/user/verify-email", {
        email,
        otp_code: otp,
      });

      if (response.data.success) {
        setVerified(true);
        toast.success("Email verified successfully!");

        // Automatically redirect to login page after 3 seconds
        setTimeout(() => {
          navigate("/signin");
        }, 3000);
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError(
        error.response?.data?.message ||
          "Failed to verify email. Please check your OTP and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError("Email is required to resend OTP");
      return;
    }

    setResendLoading(true);
    setError("");

    try {
      const response = await api.post("/user/resend-otp", { email });

      if (response.data.success) {
        toast.success("OTP resent to your email!");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      setError(
        error.response?.data?.message ||
          "Failed to resend OTP. Please try again later."
      );
    } finally {
      setResendLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <FaCheck className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900">
            Email Verified!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your email has been successfully verified.
          </p>
          <p className="mt-2 text-center text-sm text-gray-500">
            Redirecting to sign in page...
          </p>
          <Link
            to="/signin"
            className="mt-5 inline-block bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <FaEnvelope className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a verification code to{" "}
            <span className="font-medium text-blue-600">
              {email || "your email"}
            </span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <FaExclamationCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {!email && (
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700"
            >
              Verification Code (OTP)
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter 6-digit code"
              maxLength={6}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendLoading || !email}
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400"
            >
              {resendLoading ? (
                <FaSpinner className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <FaSyncAlt className="h-4 w-4 mr-2" />
              )}
              Resend Code
            </button>

            <Link
              to="/signin"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Back to Sign In
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !otp}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {loading ? (
                <FaSpinner className="animate-spin h-5 w-5 mr-2" />
              ) : (
                "Verify Email"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;
