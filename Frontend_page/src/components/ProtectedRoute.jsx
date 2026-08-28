import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const reduxAuth = useSelector((state) => state.auth);
  
  const token = reduxAuth?.accessToken || sessionStorage.getItem("token") || localStorage.getItem("token");
  const role = (reduxAuth?.role || sessionStorage.getItem("role") || localStorage.getItem("role") || sessionStorage.getItem("userRole"))?.toLowerCase();

  const isValidToken = token && !token.includes("authenticated-user-token") && !token.includes("-session-token");

  if (!isValidToken) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && Array.isArray(allowedRoles) && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;