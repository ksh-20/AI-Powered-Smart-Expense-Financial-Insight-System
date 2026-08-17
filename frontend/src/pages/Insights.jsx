import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useSettings } from "../context/SettingsContext";

export default function Insights() {
  const { formatAmount } = useSettings();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all" | "budget" | "high" | "strategy" | "wants"

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/insights");
      setData(res.data);
    } catch (err) {
      console.error("Failed to load insights:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-slate-300 text-sm font-medium">
          Synthesizing multi-factor financial insights & budget goals…
        </p>
      </div>
    );
  }

  const rawInsights = data?.insights || [];
  const total = data?.total || 0;
  const count = data?.count || 0;
  const essentialPct = data?.essential_pct || 0;
  const discretionaryPct = data?.discretionary_pct || 0;
  const potentialSavings = data?.potential_monthly_savings || 0;
  const healthScore = data?.health_score || 85;
  const budgetSummary = data?.budget_goals_summary || {
    total_goals: 0,
    exceeded_count: 0,
    warning_count: 0,
    safe_count: 0,
  };
  const activeGoalsCount = budgetSummary.total_goals || (data?.budget_goals?.length ?? 0);

  const filteredInsights = rawInsights.filter((ins) => {
    if (filter === "budget") return ins.tag?.includes("Budget") || ins.tag?.includes("Goal");
    if (filter === "high") return ins.impact_level === "High";
    if (filter === "strategy") return ins.type === "strategy" || ins.tag?.includes("Strategy");
    if (filter === "wants") return ins.tag?.includes("Ratio") || ins.tag?.includes("Discretionary") || ins.tag?.includes("Concentration");
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Smart Financial Insights
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Budget-Linked AI Engine
            </span>
          </div>
          <p className="text-slate-300 text-sm mt-1">
            Algorithmic diagnostics, category budget goal tracking, lifestyle ratios, and automated savings blueprints
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/budget"
            className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white text-xs font-semibold border border-indigo-500/30 transition-all flex items-center gap-1.5"
          >
            <span>🎯</span> Manage Goals ({activeGoalsCount})
          </Link>
          <button
            onClick={fetchInsights}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium border border-white/10 transition-all flex items-center gap-1.5"
          >
            <span>⟳</span> Refresh
          </button>
        </div>
      </div>

      {/* ── Overview Telemetry Banner ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Potential Monthly Savings */}
        <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900/70 to-purple-950/40 border border-indigo-500/20 rounded-3xl p-5 backdrop-blur-xl relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Identified Monthly Savings
            </p>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              +{(potentialSavings * 12).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}/yr
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-white mt-2 font-mono">
            {formatAmount(potentialSavings)}
            <span className="text-xs text-slate-400 font-sans font-normal ml-1.5">/ month</span>
          </p>
          <p className="text-xs text-slate-300 mt-2">
            Derived from budget limits & discretionary optimizations
          </p>
        </div>

        {/* Card 2: Essential vs Wants Ratio */}
        <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-5 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              50/30/20 Allocation Split
            </p>
            <span className="text-xs font-mono font-bold text-indigo-300">
              {essentialPct}% Needs / {discretionaryPct}% Wants
            </span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden flex gap-1 mt-3">
            <div
              className="h-full bg-emerald-500 rounded-l-full transition-all duration-700"
              style={{ width: `${Math.max(5, essentialPct)}%` }}
              title={`Needs: ${essentialPct}%`}
            />
            <div
              className="h-full bg-purple-500 rounded-r-full transition-all duration-700"
              style={{ width: `${Math.max(5, discretionaryPct)}%` }}
              title={`Wants: ${discretionaryPct}%`}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-300 mt-2 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Needs (&le; 50%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" /> Wants (&le; 30%)
            </span>
          </div>
        </div>

        {/* Card 3: Tracked Outflow & Health Score */}
        <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-5 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Financial Health Score
            </p>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                healthScore >= 80
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                  : healthScore >= 65
                  ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                  : "bg-red-500/10 text-red-300 border-red-500/20"
              }`}
            >
              {healthScore >= 80 ? "Optimal" : healthScore >= 65 ? "Moderate" : "Attention"}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-2xl md:text-3xl font-extrabold text-white font-mono">{healthScore}</p>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <p className="text-xs text-slate-300 mt-2">
            Tracked across <span className="text-white font-bold">{count}</span> txns & <span className="text-indigo-300 font-bold">{activeGoalsCount}</span> budget goals
          </p>
        </div>
      </div>

      {/* ── Budget Goals Linked Status Ribbon ──────────────────────────── */}
      {activeGoalsCount > 0 && (
        <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-xl shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-lg">🎯</span>
            <div>
              <p className="text-xs font-bold text-white">Active Budget Goals Synchronized</p>
              <p className="text-[11px] text-slate-300">
                Insights are evaluating your actual burn rates against your defined category ceilings
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap text-xs font-semibold">
            {budgetSummary.exceeded_count > 0 && (
              <span className="bg-red-500/15 text-red-300 border border-red-500/30 px-2.5 py-1 rounded-xl">
                {budgetSummary.exceeded_count} Exceeded
              </span>
            )}
            {budgetSummary.warning_count > 0 && (
              <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-xl">
                {budgetSummary.warning_count} Near Limit
              </span>
            )}
            {budgetSummary.safe_count > 0 && (
              <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
                {budgetSummary.safe_count} On Track
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Filter Tabs ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: `All Insights (${rawInsights.length})` },
          { id: "budget", label: "Budget Goal Alerts" },
          { id: "high", label: "High Impact" },
          { id: "strategy", label: "Category Strategies" },
          { id: "wants", label: "Discretionary Trimming" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border ${
              filter === t.id
                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-900/60 border-white/5 text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Detailed Insight Cards Grid ────────────────────────────────── */}
      <div className="space-y-6">
        {filteredInsights.map((ins, idx) => {
          const typeThemes = {
            warning: {
              border: "border-amber-500/30",
              tagBg: "bg-amber-500/10 text-amber-300 border-amber-500/30",
              icon: "⚠️",
              glow: "bg-amber-500/10",
            },
            opportunity: {
              border: "border-indigo-500/30",
              tagBg: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
              icon: "✦",
              glow: "bg-indigo-500/10",
            },
            strategy: {
              border: "border-cyan-500/30",
              tagBg: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
              icon: "🎯",
              glow: "bg-cyan-500/10",
            },
            achievement: {
              border: "border-emerald-500/30",
              tagBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
              icon: "✓",
              glow: "bg-emerald-500/10",
            },
            tip: {
              border: "border-purple-500/30",
              tagBg: "bg-purple-500/10 text-purple-300 border-purple-500/30",
              icon: "💡",
              glow: "bg-purple-500/10",
            },
          };

          const theme = typeThemes[ins.type] || typeThemes.opportunity;

          return (
            <div
              key={ins.id || idx}
              className={`bg-slate-900/70 border ${theme.border} rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-xl space-y-6 relative overflow-hidden transition-all hover:border-indigo-500/40`}
            >
              <div className={`absolute top-0 right-0 w-64 h-64 ${theme.glow} rounded-full blur-3xl pointer-events-none`} />

              {/* Card Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xl">{theme.icon}</span>
                  <span
                    className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-xl border ${theme.tagBg}`}
                  >
                    {ins.tag || "Insight"}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-white/5 text-slate-200 border border-white/5">
                    {ins.impact_level || "Medium"} Impact
                  </span>
                </div>

                {ins.potential_savings > 0 && (
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20 self-start sm:self-auto">
                    Potential Savings: {formatAmount(ins.potential_savings)}/mo
                  </span>
                )}
              </div>

              {/* Title & Summary Callout */}
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  {ins.title}
                </h2>
                <div className="mt-3 bg-white/[0.03] border-l-4 border-indigo-500 pl-4 py-2.5 pr-3 rounded-r-xl">
                  <p className="text-xs md:text-sm text-indigo-200 font-medium leading-relaxed">
                    {ins.summary}
                  </p>
                </div>
              </div>

              {/* Multi-Paragraph Detailed Explanation */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Detailed Financial Analysis & Diagnostic
                </h3>
                <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                  {ins.detailed_explanation}
                </p>
              </div>

              {/* Actionable Execution Steps */}
              {ins.actionable_steps && ins.actionable_steps.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Recommended Actionable Steps
                  </h3>
                  <div className="grid gap-2.5">
                    {ins.actionable_steps.map((step, sIdx) => (
                      <div
                        key={sIdx}
                        className="bg-white/[0.02] border border-white/5 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-slate-200"
                      >
                        <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5 border border-indigo-500/30">
                          {sIdx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Benchmark Standard Comparison Callout */}
              {ins.benchmark_comparison && (
                <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-300">
                  <span className="text-base">📊</span>
                  <div>
                    <span className="font-semibold text-indigo-300">Financial Benchmark: </span>
                    <span>{ins.benchmark_comparison}</span>
                  </div>
                </div>
              )}

              {/* Card Footer Actions */}
              <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                <p className="text-[11px] text-slate-400">
                  Linked to your active category budget goals
                </p>
                <div className="flex items-center gap-3">
                  <Link
                    to="/budget"
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Adjust Budget Goals →
                  </Link>
                  <Link
                    to="/expenses"
                    className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    View Expenses →
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}