import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials } from "@/app/store/authSlice";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const dispatch = useDispatch();
  const reduxAuth = useSelector((state) => state.auth);
  
  const token = reduxAuth?.accessToken || sessionStorage.getItem("token") || localStorage.getItem("token");
  const currentRole = (reduxAuth?.role || sessionStorage.getItem("role") || localStorage.getItem("role") || sessionStorage.getItem("userRole"))?.toLowerCase();

  const isValidToken = token && !token.includes("authenticated-user-token") && !token.includes("-session-token");

  if (!isValidToken) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && Array.isArray(allowedRoles)) {
    let storedUser = null;
    try {
      storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null");
    } catch {
      storedUser = null;
    }
    const user = reduxAuth?.user || storedUser || {};

    // Gather all roles the authenticated user legitimately possesses
    const allUserRoles = new Set();
    if (currentRole) allUserRoles.add(currentRole);
    if (user?.role) allUserRoles.add(user.role.toLowerCase());
    if (Array.isArray(user?.roles)) {
      user.roles.forEach((r) => r && allUserRoles.add(r.toLowerCase()));
    }
    if (user?.profiles?.organizer || user?.organizer_profile) {
      allUserRoles.add("organizer");
    }
    if (user?.profiles?.exhibitor || user?.exhibitor_profile) {
      allUserRoles.add("exhibitor");
    }
    if (["superuser", "superadmin", "admin"].includes(currentRole) || ["superuser", "superadmin", "admin"].includes(user?.role?.toLowerCase())) {
      allUserRoles.add("superuser");
      allUserRoles.add("superadmin");
      allUserRoles.add("organizer");
      allUserRoles.add("exhibitor");
    }

    // Check if user holds any of the allowed roles for this route
    const hasPermission = allowedRoles.some((r) => allUserRoles.has(r.toLowerCase()));

    if (!hasPermission) {
      return <Navigate to="/" replace />;
    }

    // If the active role in session differs from the workspace being accessed, sync it
    const matchingRole = allowedRoles.find((r) => allUserRoles.has(r.toLowerCase()));
    if (matchingRole && matchingRole !== currentRole && matchingRole !== "user") {
      sessionStorage.setItem("role", matchingRole);
      localStorage.setItem("role", matchingRole);
      if (reduxAuth?.token) {
        dispatch(setCredentials({ ...reduxAuth, role: matchingRole }));
      }
    }
  }

  return children;
};

export default ProtectedRoute;