import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./authContext";

export default function AuthRoute() {
  const { isAuthenticated, isLoggingOut } = useAuth();
  const location = useLocation();

  if (!isAuthenticated && !isLoggingOut) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}