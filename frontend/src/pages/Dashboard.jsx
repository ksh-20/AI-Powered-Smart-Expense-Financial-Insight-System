import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Card from "../components/Card";
import { useSettings } from "../context/SettingsContext";

import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#06b6d4", // Cyan
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Rose
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#84cc16", // Lime
  "#3b82f6", // Blue
  "#a855f7", // Purple
  "#f97316", // Orange
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [budgetData, setBudgetData] = useState([]);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(null);
  const { formatAmount, settings } = useSettings();

  useEffect(() => {
    api.get("/api/analytics")
      .then((res) => setData(res.data))
      .catch(console.error);
    api.get("/api/budget/progress")
      .then((res) => setBudgetData(res.data))
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Loading dashboard overview…</p>
      </div>
    );
  }

  const budgetSet = settings.monthly_budget > 0;
  const budgetPct = budgetSet
    ? Math.min((data.total / settings.monthly_budget) * 100, 100)
    : 0;
  const budgetColor =
    budgetPct >= 90 ? "bg-red-500" : budgetPct >= 70 ? "bg-yellow-500" : "bg-indigo-500";

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Your financial overview at a glance</p>
        </div>
        <Link
          to="/analytics"
          className="px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5"
        >
          <span>📊</span> Deep Analytics →
        </Link>
      </div>

      {/* ── 3 Stats Cards ─────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-3 gap-5">
        <Card
          title="Total Spending"
          value={formatAmount(data.total)}
          color="indigo"
        />
        <Card
          title="Transactions"
          value={data.count ?? data.categories.reduce((s, c) => s + (c.count || 0), 0)}
          color="violet"
        />
        <Card
          title="Categories"
          value={data.categories.length}
          color="cyan"
        />
      </div>

      {/* ── Monthly Budget Progress ───────────────────────────────────── */}
      {budgetSet && (
        <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-white">Monthly Budget</p>
              <p className="text-xs text-slate-400 mt-0.5">Budget limit utilization tracking</p>
            </div>
            <p className="text-sm font-bold text-white font-mono">
              {formatAmount(data.total)}{" "}
              <span className="text-slate-400 font-normal">/ {formatAmount(settings.monthly_budget)}</span>
            </p>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div
              className={`h-full rounded-full transition-all duration-700 ${budgetColor}`}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs mt-2.5">
            <span
              className={`font-semibold ${
                budgetPct >= 100
                  ? "text-red-400"
                  : budgetPct >= 70
                  ? "text-yellow-400"
                  : "text-emerald-400"
              }`}
            >
              {budgetPct >= 100
                ? "⚠ Budget exceeded!"
                : `${(100 - budgetPct).toFixed(1)}% remaining`}
            </span>
            <span className="text-slate-400 font-mono font-medium">{budgetPct.toFixed(1)}% Used</span>
          </div>
        </div>
      )}

      {/* ── Spending by Category Donut Chart ─────────────────────────── */}
      <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Spending by Category
            </h2>
            <p className="text-xs text-slate-400">Distribution of expenditures across all categories</p>
          </div>
          <span className="text-xs font-semibold text-slate-300 bg-white/5 px-3 py-1 rounded-xl border border-white/5 font-mono">
            {data.categories.length} Categories
          </span>
        </div>

        {data.categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-sm space-y-3">
            <span>No expense data recorded yet</span>
            <Link
              to="/expenses"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              + Add your first expense
            </Link>
          </div>
        ) : (
          <div>
            <div className="relative h-80 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categories}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={125}
                    innerRadius={75}
                    paddingAngle={3}
                    onMouseEnter={(_, index) => setActiveCategoryIndex(index)}
                    onMouseLeave={() => setActiveCategoryIndex(null)}
                  >
                    {data.categories.map((_, i) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={COLORS[i % COLORS.length]}
                        stroke="rgba(15,23,42,0.8)"
                        strokeWidth={activeCategoryIndex === i ? 3 : 1}
                        style={{
                          filter:
                            activeCategoryIndex === i
                              ? "drop-shadow(0 0 10px rgba(99,102,241,0.6))"
                              : "none",
                          transform: activeCategoryIndex === i ? "scale(1.04)" : "scale(1)",
                          transformOrigin: "center center",
                          transition: "all 0.2s ease-out",
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={
                      <CustomTooltip formatAmount={formatAmount} total={data.total} />
                    }
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Callout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {activeCategoryIndex !== null
                    ? data.categories[activeCategoryIndex]?.name
                    : "Total Outflow"}
                </span>
                <span className="text-xl font-black text-white mt-0.5 font-mono">
                  {activeCategoryIndex !== null
                    ? formatAmount(data.categories[activeCategoryIndex]?.value)
                    : formatAmount(data.total)}
                </span>
                <span className="text-xs font-bold text-indigo-400 mt-0.5">
                  {activeCategoryIndex !== null
                    ? `${data.categories[activeCategoryIndex]?.percent ?? ((data.categories[activeCategoryIndex]?.value / data.total) * 100).toFixed(1)}% share`
                    : `${data.categories.length} Categories`}
                </span>
              </div>
            </div>

            {/* Category Swatches Legend */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6 pt-6 border-t border-white/5">
              {data.categories.map((c, i) => {
                const pct = c.percent ?? ((c.value / data.total) * 100).toFixed(1);
                return (
                  <button
                    key={c.name}
                    onMouseEnter={() => setActiveCategoryIndex(i)}
                    onMouseLeave={() => setActiveCategoryIndex(null)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs transition-all border ${
                      activeCategoryIndex === i
                        ? "bg-indigo-600/30 border-indigo-500/50 text-white scale-105"
                        : "bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/[0.08]"
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="font-semibold">{c.name}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{pct}%</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Budget Health Section ─────────────────────────────────────── */}
      {budgetData.length > 0 && (() => {
        const atRisk = budgetData.filter((b) => b.status !== "safe");
        const displayed = atRisk.length > 0 ? atRisk.slice(0, 3) : budgetData.slice(0, 3);
        return (
          <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>🎯</span> Budget Health
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Category limits and consumption thresholds</p>
              </div>
              <Link
                to="/budget"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                View all goals →
              </Link>
            </div>
            <div className="space-y-4">
              {displayed.map((b) => (
                <div key={b.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">{b.category}</span>
                    <span className={`text-xs font-extrabold font-mono px-2.5 py-0.5 rounded-md border ${
                      b.status === "exceeded"
                        ? "bg-red-500/10 text-red-400 border-red-500/30"
                        : b.status === "warning"
                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    }`}>
                      {b.percent_used}% Used
                    </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        b.status === "exceeded"
                          ? "bg-red-500"
                          : b.status === "warning"
                          ? "bg-yellow-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(b.percent_used, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-2 font-mono">
                    <span>{formatAmount(b.spent)} spent</span>
                    <span>Limit: {formatAmount(b.monthly_limit)}</span>
                  </div>
                </div>
              ))}
            </div>
            {atRisk.length === 0 && (
              <p className="text-xs font-semibold text-emerald-400 mt-4 flex items-center gap-1.5">
                <span>✓</span> All tracked categories are within budget limits this month
              </p>
            )}
          </div>
        );
      })()}
    </div>
  );
}

// ── Custom Tooltip for Dashboard Donut ──────────────────────────────────────
function CustomTooltip({ active, payload, formatAmount, total }) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    const pct = d.percent ?? ((d.value / total) * 100).toFixed(1);
    return (
      <div className="bg-slate-900/95 border border-white/20 backdrop-blur-xl p-3.5 rounded-2xl shadow-2xl text-xs text-white z-50 min-w-[170px]">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: payload[0].fill }}
          />
          <p className="font-bold text-white">{d.name}</p>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-slate-300">
            <span>Spent:</span>
            <span className="font-bold text-white font-mono">{formatAmount(d.value)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Share:</span>
            <span className="font-bold text-indigo-400 font-mono">{pct}%</span>
          </div>
          {d.count && (
            <div className="flex items-center justify-between text-slate-300">
              <span>Transactions:</span>
              <span className="font-semibold text-slate-200 font-mono">{d.count}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}