import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();

  // Wait until both user auth and role data (which could be explicit null) finish loading
  if (loading) return null;
  
  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && allowedRoles.length > 0) {
    if (role === null && loading === false) {
      // User exists but has no role at all yet (edge case, but prevents infinite loop)
      return <Navigate to="/login" replace />;
    }
    if (!allowedRoles.includes(role)) {
      return <Navigate to="/inventory" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
