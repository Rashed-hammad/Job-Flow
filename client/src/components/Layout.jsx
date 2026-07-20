import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout({ token, user, onLogout }) {
  return (
    <div className="min-h-screen bg-linear-to-br from-champagne/40 via-white to-white">
      <Navbar user={user} onLogout={onLogout} />
      <Outlet context={{ token }} />
    </div>
  );
}
