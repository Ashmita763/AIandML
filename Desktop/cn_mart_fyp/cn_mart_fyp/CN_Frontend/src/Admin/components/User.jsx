import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaTrash, FaUserAlt, FaSearch } from "react-icons/fa";
import { MdBlock, MdCheckCircle } from "react-icons/md";
import api from "../../services/api";
import Loading from "../../components/Loading";

const User = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) {
        toast.error("Please login as admin");
        window.location.href = "/admin/login";
        return;
      }

      const response = await api.get("/user/all");

      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      if (error.response?.status === 403) {
        const message = error.response?.data?.message || "";
        if (message.includes("invalid") || message.includes("expired")) {
          localStorage.removeItem("adminToken");
          toast.error("Admin session expired. Please login again");
          window.location.href = "/admin/login";
        } else {
          toast.error("Access denied. Please login as admin");
        }
      } else {
        const message =
          error.response?.data?.message || "Failed to fetch users";
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      if (!userId) {
        console.error("Missing user ID:", userId);
        toast.error("Invalid user ID");
        return;
      }

      const response = await api.put(`/user/toggle-status/${userId}`);

      if (response.data.success) {
        toast.success(response.data.message);
        // Update local state to reflect the change
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, isActive: !user.isActive } : user
          )
        );
      }
    } catch (error) {
      console.error("Toggle status error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update user status";
      toast.error(errorMessage);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      if (!userId) {
        console.error("Missing user ID:", userId);
        toast.error("Invalid user ID");
        return;
      }

      const response = await api.delete(`/user/${userId}`);

      if (response.data.success) {
        toast.success(response.data.message);
        setShowConfirmDelete(null);
        // Update local state to remove the deleted user
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user._id !== userId)
        );
      }
    } catch (error) {
      console.error("Delete user error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete user";
      toast.error(errorMessage);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold mb-4 md:mb-0 flex items-center">
          <FaUserAlt className="mr-2" /> User Management
        </h2>
        <div className="w-full md:w-64 relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* User List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Password
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-600 font-medium">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || "Unknown"}
                        </div>
                        <div className="text-sm text-gray-500 md:hidden">
                          {user.email || "No email"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    {user.phone && (
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive ? "Active" : "Blocked"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.password}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(user._id)}
                        className={`${
                          user.isActive
                            ? "text-red-600 hover:text-red-900"
                            : "text-green-600 hover:text-green-900"
                        }`}
                        title={user.isActive ? "Block User" : "Unblock User"}
                      >
                        {user.isActive ? (
                          <MdBlock size={20} />
                        ) : (
                          <MdCheckCircle size={20} />
                        )}
                      </button>
                      <button
                        onClick={() => setShowConfirmDelete(user._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete User"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this user? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmDelete(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(showConfirmDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default User;
