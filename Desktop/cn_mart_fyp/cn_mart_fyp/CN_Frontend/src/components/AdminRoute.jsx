import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import Loading from "./Loading";

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
