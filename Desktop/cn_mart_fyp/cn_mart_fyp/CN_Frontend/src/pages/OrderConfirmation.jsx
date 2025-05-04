// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { FaCheckCircle } from "react-icons/fa";
// import { toast } from "react-toastify";
// import Loading from "../components/Loading";
// import api from "../api";

// const OrderConfirmation = () => {
//   const [order, setOrder] = useState(null);
//   const { orderId } = useParams();
//   const [shippingAddress, setShippingAddress] = useState("");
//   const [note, setNote] = useState("");
//   const [paymentMethod, setPaymentMethod] = useState("cod");

//   useEffect(() => {
//     fetchOrder();
//   }, [orderId]);

//   const fetchOrder = async () => {
//     try {
//       const response = await api.get(`/order/${orderId}`);
//       if (response.data.success) {
//         setOrder(response.data.order);
//         setShippingAddress(response.data.order.shippingAddress);
//         setNote(response.data.order.note);
//         setPaymentMethod(response.data.order.paymentMethod);
//       }
//     } catch (error) {
//       console.error("Error fetching order:", error);
//       toast.error("Failed to fetch order details");
//     }
//   };

//   if (!order) return <Loading />;

//   return (
//     <div className="min-h-screen bg-gray-50 pt-20 px-4">
//       <div className="max-w-3xl mx-auto">
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="flex items-center justify-center mb-8">
//             <div className="bg-green-100 rounded-full p-3">
//               <FaCheckCircle className="text-green-500 text-3xl" />
//             </div>
//           </div>

//           <h1 className="text-2xl font-bold text-center mb-8">
//             Order Confirmed!
//           </h1>

//           <div className="space-y-4">
//             {order.items.map((item) => (
//               <div key={item._id} className="flex items-center gap-4">
//                 <div className="w-20 h-20 flex-shrink-0">
//                   <img
//                     src={item.product?.image || "/placeholder-image.jpg"}
//                     alt={item.product?.name || "Product"}
//                     className="w-full h-full object-contain rounded-md"
//                     style={{ backgroundColor: "#f3f4f6" }}
//                     onError={(e) => {
//                       e.target.src = "/placeholder-image.jpg";
//                       e.target.onerror = null;
//                     }}
//                   />
//                 </div>
//                 <div className="flex-1">
//                   <h3 className="font-medium">
//                     {item.product?.name || "Product Unavailable"}
//                   </h3>
//                   <p className="text-sm text-gray-500">
//                     Quantity: {item.quantity} × Rs.{item.price}
//                   </p>
//                 </div>
//                 <p className="font-medium">Rs.{item.quantity * item.price}</p>
//               </div>
//             ))}
//           </div>

//           <div className="space-y-8 p-8 bg-white rounded-lg shadow-md">
//             <div className="border-b pb-6">
//               <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
//               <div className="flex justify-between text-lg">
//                 <p>Total Amount:</p>
//                 <p className="font-semibold text-green-600">Rs.{order.total}</p>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               <div>
//                 <label className="block text-lg font-medium text-gray-700 mb-3">
//                   Shipping Address
//                 </label>
//                 <textarea
//                   value={shippingAddress}
//                   onChange={(e) => setShippingAddress(e.target.value)}
//                   className="w-full px-6 py-4 text-lg border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                   rows="6"
//                   placeholder="Enter your complete shipping address"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-lg font-medium text-gray-700 mb-3">
//                   Delivery Instructions
//                 </label>
//                 <textarea
//                   value={note}
//                   onChange={(e) => setNote(e.target.value)}
//                   className="w-full px-6 py-4 text-lg border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                   rows="6"
//                   placeholder="Any special instructions for delivery (optional)"
//                 />
//               </div>
//             </div>

//             <div className="mt-10">
//               <h3 className="text-xl font-semibold mb-6">Payment Method</h3>
//               <div className="space-y-6">
//                 <label className="flex items-center p-6 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
//                   <input
//                     type="radio"
//                     name="paymentMethod"
//                     value="cod"
//                     checked={paymentMethod === "cod"}
//                     onChange={(e) => setPaymentMethod(e.target.value)}
//                     className="h-6 w-6 text-green-600"
//                   />
//                   <div className="ml-4">
//                     <span className="text-lg font-medium">
//                       Cash on Delivery
//                     </span>
//                     <p className="text-gray-500 mt-1">
//                       Pay when your order arrives
//                     </p>
//                   </div>
//                 </label>

//                 <label className="flex items-center p-6 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
//                   <input
//                     type="radio"
//                     name="paymentMethod"
//                     value="khalti"
//                     checked={paymentMethod === "khalti"}
//                     onChange={(e) => setPaymentMethod(e.target.value)}
//                     className="h-6 w-6 text-green-600"
//                   />
//                   <div className="ml-4">
//                     <span className="text-lg font-medium">Pay with Khalti</span>
//                     <p className="text-gray-500 mt-1">
//                       Safe and secure online payment
//                     </p>
//                   </div>
//                 </label>
//               </div>
//             </div>

//             <div className="mt-10 border-t pt-8">
//               <div className="flex justify-between items-center mb-8">
//                 <div>
//                   <p className="text-gray-600">Total Amount</p>
//                   <p className="text-3xl font-bold text-green-600">
//                     Rs.{order.total}
//                   </p>
//                 </div>
//                 <button
//                   type="submit"
//                   className="px-10 py-4 text-lg bg-green-600 text-white rounded-lg hover:bg-green-700 
//                            transform hover:scale-105 transition-transform duration-200 
//                            focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
//                 >
//                   Confirm Order
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrderConfirmation;
