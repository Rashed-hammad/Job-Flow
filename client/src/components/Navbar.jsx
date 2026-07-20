import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import Logo from "./Logo";

const NAV_LINKS = [
  { to: "/board", label: "Board" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/cvs", label: "My CVs" },
];

const getInitials = (name) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

export default function Navbar({ user, onLogout }) {
  return (
    <header className="border-b border-champagne bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-hunter shadow-sm shadow-hunter/30">
            <Logo className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Job<span className="text-hunter">Flow</span>
            </h1>
            <p className="hidden text-sm text-slate-500 sm:block">
              Your application pipeline
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-hunter/10 text-hunter"
                    : "text-slate-600 hover:bg-champagne/30"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-hunter text-xs font-semibold text-white">
                {getInitials(user.name)}
              </div>
              <span className="hidden text-sm font-medium text-slate-700 sm:inline">
                {user.name}
              </span>
            </div>
          )}
          <button
            onClick={onLogout}
            aria-label="Log out"
            className="flex items-center gap-1.5 rounded-lg border border-champagne bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-champagne/30"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-t border-champagne px-4 py-2 sm:hidden">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex-1 rounded-lg px-2 py-2 text-center text-xs font-medium transition-colors ${
                isActive
                  ? "bg-hunter text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </header>
  );
}
