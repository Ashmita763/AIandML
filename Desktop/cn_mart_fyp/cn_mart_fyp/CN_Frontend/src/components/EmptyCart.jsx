import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";

const EmptyCart = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <FaShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-2xl font-semibold text-gray-900">
            Your cart is empty
          </h2>
          <p className="mt-2 text-gray-600">
            Looks like you haven't added any items to your cart yet.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyCart;
