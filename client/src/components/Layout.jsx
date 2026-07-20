import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout({ token, user, onLogout, onUpdateUser }) {
  return (
    <div className="min-h-screen bg-linear-to-br from-champagne/40 via-white to-white">
      <Navbar
        user={user}
        onLogout={onLogout}
        token={token}
        onUpdateUser={onUpdateUser}
      />
      <Outlet context={{ token }} />
    </div>
  );
}
