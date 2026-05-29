import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("accessToken");
  const user = localStorage.getItem("user");

  // ✅ if no token or user, redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Otherwise, allow route to render
  return <Outlet />;
};

export default ProtectedRoute;
