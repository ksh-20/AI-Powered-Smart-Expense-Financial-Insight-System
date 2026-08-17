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
  Legend,
} from "recharts";

const COLORS = [
  "#6366f1", "#8b5cf6", "#06b6d4",
  "#10b981", "#f59e0b", "#ef4444",
  "#ec4899", "#14b8a6", "#84cc16",
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [budgetData, setBudgetData] = useState([]);
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
      <div className="flex items-center justify-center py-32 text-gray-500 text-sm">
        Loading dashboard…
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
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Your financial overview at a glance</p>
      </div>

      {/* Stats cards */}
      <div className="grid md:grid-cols-3 gap-5 mb-8">
        <Card title="Total Spending"    value={formatAmount(data.total)} />
        <Card title="Transactions"      value={data.count ?? data.categories.reduce((s, c) => s + (c.count || 0), 0)} />
        <Card title="Categories"        value={data.categories.length} />
      </div>

      {/* Budget progress */}
      {budgetSet && (
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-white">Monthly Budget</p>
            <p className="text-sm text-gray-400">
              {formatAmount(data.total)}{" "}
              <span className="text-gray-600">/ {formatAmount(settings.monthly_budget)}</span>
            </p>
          </div>
          <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${budgetColor}`}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {budgetPct >= 100
              ? "⚠ Budget exceeded!"
              : `${(100 - budgetPct).toFixed(1)}% remaining`}
          </p>
        </div>
      )}

      {/* Pie chart */}
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">
          Spending by Category
        </h2>
        {data.categories.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
            No expense data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={340}>
            <PieChart>
              <Pie
                data={data.categories}
                dataKey="value"
                nameKey="name"
                outerRadius={130}
                innerRadius={60}
                paddingAngle={3}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.categories.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val) => formatAmount(val)}
                contentStyle={{
                  background: "#1e293b",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      {/* Budget Health section */}
      {budgetData.length > 0 && (() => {
        const atRisk = budgetData.filter((b) => b.status !== "safe");
        const displayed = atRisk.length > 0 ? atRisk.slice(0, 3) : budgetData.slice(0, 3);
        return (
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                🎯 Budget Health
              </h2>
              <Link
                to="/budget"
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                View all goals →
              </Link>
            </div>
            <div className="space-y-3">
              {displayed.map((b) => (
                <div key={b.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{b.category}</span>
                    <span className={`text-xs font-semibold ${
                      b.status === "exceeded" ? "text-red-400" :
                      b.status === "warning"  ? "text-yellow-400" : "text-emerald-400"
                    }`}>
                      {b.percent_used}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        b.status === "exceeded" ? "bg-red-500" :
                        b.status === "warning"  ? "bg-yellow-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(b.percent_used, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {formatAmount(b.spent)} / {formatAmount(b.monthly_limit)}
                  </p>
                </div>
              ))}
            </div>
            {atRisk.length === 0 && (
              <p className="text-xs text-emerald-400 mt-3">✓ All categories are within budget this month</p>
            )}
          </div>
        );
      })()}
    </div>
  );
}