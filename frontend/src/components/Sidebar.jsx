import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const NAV = [
  { to: "/",          label: "Dashboard",   icon: "◈" },
  { to: "/expenses",  label: "Expenses",    icon: "₹" },
  { to: "/analytics", label: "Analytics",   icon: "◉" },
  { to: "/forecast",  label: "Forecast",    icon: "▲" },
  { to: "/anomalies", label: "Anomalies",   icon: "⚠" },
  { to: "/insights",  label: "Insights",    icon: "✦" },
  { to: "/budget",    label: "Budget Goals",icon: "🎯" },
  { to: "/assistant", label: "Assistant",   icon: "✧" },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate("/login");
  };

  return (
    <>
      <aside className="w-64 h-screen sticky top-0 bg-slate-950/90 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between py-6 px-4 shrink-0 z-40 select-none shadow-2xl">
        {/* ── Top Header & Navigation ──────────────────────────────────── */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Logo */}
          <div className="px-3 mb-6 shrink-0">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-sm font-black shadow-lg shadow-indigo-600/40 border border-indigo-400/30">
                F
              </span>
              <span>
                Fin<span className="text-indigo-400">AI</span>
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Smart Financial Intelligence</p>
          </div>

          {/* Navigation Links (Scrollable if viewport is tiny) */}
          <nav className="flex flex-col gap-1.5 overflow-y-auto pr-1 flex-1">
            {NAV.map(({ to, label, icon }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-150 ${
                    active
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30"
                      : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  <span className={`text-base leading-none ${active ? "text-white" : "text-slate-400"}`}>
                    {icon}
                  </span>
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ── Bottom Section (Always Fixed in View) ────────────────────── */}
        <div className="flex flex-col gap-1.5 pt-4 border-t border-white/10 shrink-0 mt-4">
          <Link
            to="/settings"
            className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
              pathname === "/settings"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30"
                : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            <span className="text-base leading-none text-slate-400">⚙</span>
            Settings
          </Link>
          <Link
            to="/profile"
            className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
              pathname === "/profile"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30"
                : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            <span className="text-base leading-none text-slate-400">◎</span>
            Profile
          </Link>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 text-left"
          >
            <span className="text-base leading-none text-slate-400">→</span>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Logout Confirmation Modal ─────────────────────────────────── */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-slate-900 border border-white/15 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center text-lg font-bold">
                🚪
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Confirm Logout</h3>
                <p className="text-xs text-slate-400">Are you sure you want to exit?</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Logging out will end your current session. You will need to sign in again to access your expenses and insights.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-all"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}