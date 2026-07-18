import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const NAV = [
  { to: "/",           label: "Dashboard",  icon: "◈" },
  { to: "/expenses",   label: "Expenses",   icon: "₹" },
  { to: "/analytics",  label: "Analytics",  icon: "◉" },
  { to: "/forecast",   label: "Forecast",   icon: "▲" },
  { to: "/anomalies",  label: "Anomalies",  icon: "⚠" },
  { to: "/insights",   label: "Insights",   icon: "✦" },
  { to: "/budget",     label: "Budget Goals", icon: "🎯" },
  { to: "/assistant",  label: "Assistant",  icon: "✧" },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="w-64 min-h-screen bg-black/40 border-r border-white/5 flex flex-col py-6 px-4">
      {/* Logo */}
      <div className="px-2 mb-8">
        <h1 className="text-xl font-bold text-white tracking-tight">
          Fin<span className="text-indigo-400">AI</span>
        </h1>
        <p className="text-xs text-gray-600 mt-0.5">Smart Expense Insights</p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map(({ to, label, icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-base leading-none">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="flex flex-col gap-1 mt-4 border-t border-white/5 pt-4">
        <Link
          to="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
            pathname === "/settings"
              ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/20"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <span className="text-base leading-none">⚙</span>
          Settings
        </Link>
        <Link
          to="/profile"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
            pathname === "/profile"
              ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/20"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <span className="text-base leading-none">◎</span>
          Profile
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-150 text-left"
        >
          <span className="text-base leading-none">→</span>
          Logout
        </button>
      </div>
    </div>
  );
}