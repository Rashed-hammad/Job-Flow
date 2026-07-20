import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ token }) {
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}
