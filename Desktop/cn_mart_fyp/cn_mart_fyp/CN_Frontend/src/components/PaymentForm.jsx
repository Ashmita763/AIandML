import { useState } from 'react';
import { toast } from 'react-toastify';

const DUMMY_CARD = {
  number: '4242 4242 4242 4242',
  expiry: '12/24',
  cvv: '123'
};

export default function PaymentForm({ amount, onSuccess }) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (
        cardNumber.replace(/\s/g, '') === DUMMY_CARD.number.replace(/\s/g, '') &&
        expiry === DUMMY_CARD.expiry &&
        cvv === DUMMY_CARD.cvv
      ) {
        toast.success('Payment successful!');
        onSuccess({
          paymentId: 'py_' + Math.random().toString(36).substr(2, 9),
          method: 'card',
          amount
        });
      } else {
        toast.error('Invalid card details. Use test card number.');
      }
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
      <div className="mb-4 p-3 bg-blue-50 rounded">
        <p className="text-sm text-blue-600">
          Use test card: {DUMMY_CARD.number}
        </p>
        <p className="text-sm text-blue-600">
          Expiry: {DUMMY_CARD.expiry}, CVV: {DUMMY_CARD.cvv}
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Card Number
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="1234 5678 9012 3456"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Expiry Date
              </label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="MM/YY"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                CVV
              </label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="123"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
              loading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Processing...' : `Pay ₹${amount}`}
          </button>
        </div>
      </form>
    </div>
  );
} 