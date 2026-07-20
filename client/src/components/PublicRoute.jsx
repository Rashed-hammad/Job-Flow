import { Navigate, Outlet } from "react-router-dom";

export default function PublicRoute({ token }) {
  return token ? <Navigate to="/board" replace /> : <Outlet />;
}
