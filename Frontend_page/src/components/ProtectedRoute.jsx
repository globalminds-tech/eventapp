import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  const role = (sessionStorage.getItem("role") || localStorage.getItem("role"))?.toLowerCase();

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;