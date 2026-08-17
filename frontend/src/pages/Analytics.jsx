import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useSettings } from "../context/SettingsContext";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ReferenceLine,
} from "recharts";

const PALETTE = [
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

const TIMEFRAMES = [
  { id: "all", label: "All Time" },
  { id: "this_month", label: "This Month" },
  { id: "30d", label: "Last 30 Days" },
  { id: "90d", label: "Last 90 Days" },
  { id: "this_year", label: "This Year" },
];

export default function Analytics() {
  const { formatAmount } = useSettings();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("all");
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(null);
  const [categoryViewMode, setCategoryViewMode] = useState("total"); // "total" | "avg"
  const [dayPatternMode, setDayPatternMode] = useState("bar"); // "bar" | "radar"

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/analytics");
      setData(res.data);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // ── Dynamic filtering based on timeframe ──────────────────────────────────
  const filteredData = useMemo(() => {
    if (!data || !data.raw_expenses) return data;

    const raw = data.raw_expenses;
    if (timeframe === "all" || raw.length === 0) {
      return data;
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
    const currentMonthStr = `${currentYear}-${currentMonth}`;

    const filteredExpenses = raw.filter((e) => {
      if (!e.date) return false;
      const expDate = new Date(e.date);

      if (timeframe === "this_month") {
        return e.date.startsWith(currentMonthStr);
      }
      if (timeframe === "this_year") {
        return expDate.getFullYear() === currentYear;
      }
      if (timeframe === "30d") {
        const diffTime = now.getTime() - expDate.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 30;
      }
      if (timeframe === "90d") {
        const diffTime = now.getTime() - expDate.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 90;
      }
      return true;
    });

    const total = round(filteredExpenses.reduce((s, e) => s + e.amount, 0), 2);
    const count = filteredExpenses.length;

    // Categories
    const catMap = {};
    filteredExpenses.forEach((e) => {
      const cat = e.category || "Other";
      if (!catMap[cat]) catMap[cat] = { total: 0, count: 0, amounts: [] };
      catMap[cat].total += e.amount;
      catMap[cat].count += 1;
      catMap[cat].amounts.push(e.amount);
    });

    const categories = Object.entries(catMap).map(([cat, info]) => {
      const catTotal = round(info.total, 2);
      return {
        name: cat,
        value: catTotal,
        count: info.count,
        percent: total > 0 ? round((catTotal / total) * 100, 1) : 0,
        avg: round(catTotal / info.count, 2),
        max: round(Math.max(...info.amounts), 2),
        min: round(Math.min(...info.amounts), 2),
      };
    }).sort((a, b) => b.value - a.value);

    // Monthly Trend
    const monthMap = {};
    filteredExpenses.forEach((e) => {
      if (!e.date) return;
      const mStr = e.date.slice(0, 7);
      if (!monthMap[mStr]) monthMap[mStr] = { amount: 0, count: 0 };
      monthMap[mStr].amount += e.amount;
      monthMap[mStr].count += 1;
    });

    const monthly_trend = Object.keys(monthMap).sort().map((m) => {
      const amt = round(monthMap[m].amount, 2);
      const cnt = monthMap[m].count;
      const [y, mon] = m.split("-");
      const d = new Date(parseInt(y), parseInt(mon) - 1, 1);
      const name = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      return {
        month: m,
        name,
        amount: amt,
        count: cnt,
        avg: round(amt / cnt, 2),
      };
    });

    // Day of Week
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dowMap = Array.from({ length: 7 }, () => ({ amount: 0, count: 0 }));
    filteredExpenses.forEach((e) => {
      if (!e.date) return;
      const d = new Date(e.date);
      const dow = (d.getDay() + 6) % 7; // 0=Mon, 6=Sun
      dowMap[dow].amount += e.amount;
      dowMap[dow].count += 1;
    });

    const day_of_week = dayNames.map((name, i) => {
      const amt = round(dowMap[i].amount, 2);
      const cnt = dowMap[i].count;
      return {
        day: name,
        day_num: i,
        amount: amt,
        count: cnt,
        avg: cnt > 0 ? round(amt / cnt, 2) : 0,
      };
    });

    // Daily Trend
    const dailyMap = {};
    filteredExpenses.forEach((e) => {
      if (!e.date) return;
      if (!dailyMap[e.date]) dailyMap[e.date] = { amount: 0, count: 0 };
      dailyMap[e.date].amount += e.amount;
      dailyMap[e.date].count += 1;
    });

    const daily_trend = Object.keys(dailyMap).sort().map((d) => ({
      date: d,
      amount: round(dailyMap[d].amount, 2),
      count: dailyMap[d].count,
    }));

    // Summary
    const maxExp = filteredExpenses.length > 0
      ? filteredExpenses.reduce((max, e) => (e.amount > max.amount ? e : max), filteredExpenses[0])
      : null;

    const weekend_total = round(dowMap[5].amount + dowMap[6].amount, 2);
    const weekday_total = round(dowMap.slice(0, 5).reduce((s, x) => s + x.amount, 0), 2);
    const active_days = Object.keys(dailyMap).length;

    const summary = {
      avg_transaction: count > 0 ? round(total / count, 2) : 0,
      max_transaction: maxExp
        ? {
            amount: round(maxExp.amount, 2),
            category: maxExp.category,
            description: maxExp.description,
            date: maxExp.date,
          }
        : null,
      top_category: categories[0]
        ? { name: categories[0].name, amount: categories[0].value, percent: categories[0].percent }
        : null,
      weekend_total,
      weekday_total,
      weekend_percent: total > 0 ? round((weekend_total / total) * 100, 1) : 0,
      weekday_percent: total > 0 ? round((weekday_total / total) * 100, 1) : 0,
      active_days,
      daily_average: active_days > 0 ? round(total / active_days, 2) : 0,
      mom_change_pct: null,
    };

    // Interpretations for this slice
    const interpretations = [];
    if (categories.length > 0) {
      const topC = categories[0];
      if (topC.percent >= 40) {
        interpretations.push({
          type: "warning",
          tag: "High Concentration",
          title: `Dominant Spend: ${topC.name}`,
          text: `${topC.name} accounts for ${topC.percent}% of total expenditures in this period. Setting a category cap is recommended.`,
        });
      } else {
        interpretations.push({
          type: "info",
          tag: "Category Lead",
          title: `Top Category: ${topC.name}`,
          text: `${topC.name} leads spending with ${formatAmount(topC.value)} (${topC.percent}% of total) across ${topC.count} transactions.`,
        });
      }

      let cumPct = 0;
      const topCats = [];
      for (const c of categories) {
        cumPct += c.percent;
        topCats.push(c.name);
        if (cumPct >= 70) break;
      }
      if (topCats.length <= 2 && categories.length >= 3) {
        interpretations.push({
          type: "tip",
          tag: "Pareto Outflow",
          title: "Core Spending Drivers",
          text: `Just ${topCats.length} categories (${topCats.join(" & ")}) drive ${round(cumPct, 1)}% of your expenses in this timeframe.`,
        });
      }
    }

    if (total > 0) {
      const wAvg = weekend_total / 2;
      const wdAvg = weekday_total / 5;
      if (wAvg > wdAvg * 1.25 && weekend_total > 0) {
        const ratio = round(wAvg / Math.max(wdAvg, 0.01), 1);
        interpretations.push({
          type: "info",
          tag: "Weekend Spike",
          title: "Weekend Spending Spike",
          text: `Your average daily spend on weekends is ${ratio}x higher than weekdays. Peak outflow clusters around Saturday & Sunday.`,
        });
      } else if (wdAvg > wAvg * 1.25 && weekday_total > 0) {
        interpretations.push({
          type: "info",
          tag: "Weekday Regular",
          title: "Weekday Routine Driven",
          text: `${summary.weekday_percent}% of expenses occur Monday through Friday, reflecting structured routine spending.`,
        });
      }
    }

    if (summary.max_transaction && total > 0) {
      const share = round((summary.max_transaction.amount / total) * 100, 1);
      if (share >= 20 && count >= 3) {
        interpretations.push({
          type: "tip",
          tag: "Single Outlier",
          title: "Largest Single Transaction",
          text: `A single expense of ${formatAmount(summary.max_transaction.amount)} in ${summary.max_transaction.category} (${summary.max_transaction.description || "Expense"}) represents ${share}% of period outflows.`,
        });
      }
    }

    return {
      total,
      count,
      categories,
      monthly_trend,
      day_of_week,
      daily_trend,
      summary,
      interpretations: interpretations.length > 0 ? interpretations : data.interpretations || [],
      raw_expenses: raw,
    };
  }, [data, timeframe, formatAmount]);

  // ── Cumulative S-Curve Data ───────────────────────────────────────────────
  const cumulativeData = useMemo(() => {
    if (!filteredData || !filteredData.daily_trend || filteredData.daily_trend.length === 0) {
      return [];
    }
    let runningTotal = 0;
    return filteredData.daily_trend.map((item) => {
      runningTotal += item.amount;
      return {
        date: item.date,
        daily: item.amount,
        cumulative: round(runningTotal, 2),
      };
    });
  }, [filteredData]);

  // ── Export CSV Handler ───────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (!filteredData || !filteredData.categories || filteredData.categories.length === 0) return;
    const headers = ["Category", "Total Spent", "Share (%)", "Transactions", "Avg Ticket", "Max Single Spend"];
    const rows = filteredData.categories.map((c) => [
      `"${c.name}"`,
      c.value,
      `${c.percent}%`,
      c.count,
      c.avg,
      c.max,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_breakdown_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm font-medium">Crunching financial analytics…</p>
      </div>
    );
  }

  if (!data || data.count === 0) {
    return (
      <div className="max-w-5xl mx-auto py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Analytics & Financial Insights</h1>
          <p className="text-gray-400 text-sm mt-1">Deep expenditure intelligence and automated interpretations</p>
        </div>
        <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-12 text-center backdrop-blur-xl">
          <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold border border-indigo-500/20">
            📊
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Expense Data Recorded Yet</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
            Add transactions or upload your bank statements to unlock multi-dimensional analytics, behavioral charts, and AI interpretations.
          </p>
          <Link
            to="/expenses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/30"
          >
            <span>+</span> Add Your First Expense
          </Link>
        </div>
      </div>
    );
  }

  const current = filteredData || data;
  const categories = current.categories || [];
  const summary = current.summary || {};
  const monthlyTrend = current.monthly_trend || [];
  const dayOfWeek = current.day_of_week || [];
  const interpretations = current.interpretations || [];

  // Average category spend benchmark
  const avgCategorySpend = categories.length > 0
    ? round(current.total / categories.length, 2)
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* ── Header & Timeframe Controls ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Analytics & Insights
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Live Intelligence
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Deep expenditure telemetry, behavioral patterns, and automated financial interpretations
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Timeframe pills */}
          <div className="bg-slate-900/80 p-1 rounded-2xl border border-white/10 flex items-center gap-1 backdrop-blur-md">
            {TIMEFRAMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeframe(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  timeframe === t.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Export Action */}
          <button
            onClick={handleExportCSV}
            title="Download CSV breakdown"
            className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-medium border border-white/10 transition-all flex items-center gap-1.5"
          >
            <span>↓</span> Export
          </button>
        </div>
      </div>

      {/* ── 5 KPI Metric Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Card 1: Total Spending */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Outflow</p>
          <p className="text-xl md:text-2xl font-extrabold text-white mt-1.5 truncate">
            {formatAmount(current.total)}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[11px] text-indigo-400 font-medium bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
              {TIMEFRAMES.find((t) => t.id === timeframe)?.label}
            </span>
          </div>
        </div>

        {/* Card 2: Transactions */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden group hover:border-violet-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-all" />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Transactions</p>
          <p className="text-xl md:text-2xl font-extrabold text-white mt-1.5">
            {current.count}
          </p>
          <p className="text-[11px] text-gray-400 mt-2">
            across <span className="text-violet-300 font-semibold">{categories.length}</span> categories
          </p>
        </div>

        {/* Card 3: Avg Ticket Size */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Avg Transaction</p>
          <p className="text-xl md:text-2xl font-extrabold text-white mt-1.5 truncate">
            {formatAmount(summary.avg_transaction || 0)}
          </p>
          <p className="text-[11px] text-gray-400 mt-2 truncate">
            Peak: <span className="text-cyan-300 font-semibold">{formatAmount(summary.max_transaction?.amount || 0)}</span>
          </p>
        </div>

        {/* Card 4: Top Category */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Top Category</p>
          <p className="text-xl md:text-2xl font-extrabold text-white mt-1.5 truncate">
            {summary.top_category ? summary.top_category.name : "N/A"}
          </p>
          <p className="text-[11px] text-emerald-400 font-medium mt-2">
            {summary.top_category ? `${summary.top_category.percent}% of total spend` : "—"}
          </p>
        </div>

        {/* Card 5: Daily Run Rate / Velocity */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden group hover:border-amber-500/40 transition-all col-span-2 md:col-span-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Daily Velocity</p>
          <p className="text-xl md:text-2xl font-extrabold text-white mt-1.5 truncate">
            {formatAmount(summary.daily_average || 0)}
          </p>
          <p className="text-[11px] text-gray-400 mt-2">
            Weekend: <span className="text-amber-300 font-semibold">{summary.weekend_percent || 0}%</span>
          </p>
        </div>
      </div>

      {/* ── Smart Data Interpretations & AI Insights Section ────────────── */}
      {interpretations.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-purple-950/40 border border-indigo-500/20 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-base font-bold border border-indigo-500/30">
                ✦
              </span>
              <div>
                <h2 className="text-base font-bold text-white">Automated Financial Interpretations</h2>
                <p className="text-xs text-gray-400">Intelligent algorithmic observations on your expenditure behavior</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              {interpretations.length} Insights Generated
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {interpretations.map((item, idx) => {
              const borderColors = {
                warning: "border-amber-500/30 bg-amber-950/20 text-amber-200",
                info: "border-indigo-500/30 bg-indigo-950/20 text-indigo-200",
                tip: "border-cyan-500/30 bg-cyan-950/20 text-cyan-200",
                success: "border-emerald-500/30 bg-emerald-950/20 text-emerald-200",
              };
              const tagColors = {
                warning: "bg-amber-500/20 text-amber-300 border-amber-500/40",
                info: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
                tip: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
                success: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
              };
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border backdrop-blur-md transition-all hover:scale-[1.01] ${
                    borderColors[item.type] || borderColors.info
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        tagColors[item.type] || tagColors.info
                      }`}
                    >
                      {item.tag || "Insight"}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-300 leading-relaxed">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Chart Row 1: Category Breakdown & Benchmarks ─────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart 1: Interactive Donut Distribution */}
        <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Expenditure Distribution</h2>
              <p className="text-xs text-gray-400">Share of wallet across spending categories</p>
            </div>
            <span className="text-xs text-gray-400 font-medium bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
              {categories.length} Categories
            </span>
          </div>

          <div className="relative h-72 w-full flex items-center justify-center">
            {categories.length === 0 ? (
              <p className="text-gray-500 text-sm">No category data</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={115}
                    paddingAngle={3}
                    onMouseEnter={(_, index) => setActiveCategoryIndex(index)}
                    onMouseLeave={() => setActiveCategoryIndex(null)}
                  >
                    {categories.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PALETTE[index % PALETTE.length]}
                        stroke="rgba(15,23,42,0.8)"
                        strokeWidth={activeCategoryIndex === index ? 3 : 1}
                        style={{
                          filter:
                            activeCategoryIndex === index
                              ? "drop-shadow(0 0 8px rgba(99,102,241,0.6))"
                              : "none",
                          transform: activeCategoryIndex === index ? "scale(1.04)" : "scale(1)",
                          transformOrigin: "center center",
                          transition: "all 0.2s ease-out",
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={
                      <CustomTooltip formatAmount={formatAmount} total={current.total} />
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            )}

            {/* Donut Center Display */}
            {categories.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  {activeCategoryIndex !== null
                    ? categories[activeCategoryIndex]?.name
                    : "Total Spend"}
                </span>
                <span className="text-lg font-black text-white mt-0.5">
                  {activeCategoryIndex !== null
                    ? formatAmount(categories[activeCategoryIndex]?.value)
                    : formatAmount(current.total)}
                </span>
                <span className="text-[11px] font-bold text-indigo-400">
                  {activeCategoryIndex !== null
                    ? `${categories[activeCategoryIndex]?.percent}% share`
                    : `${current.count} txns`}
                </span>
              </div>
            )}
          </div>

          {/* Interactive Category Legend Pills */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5 max-h-36 overflow-y-auto pr-1">
            {categories.map((c, i) => (
              <button
                key={c.name}
                onMouseEnter={() => setActiveCategoryIndex(i)}
                onMouseLeave={() => setActiveCategoryIndex(null)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs transition-all border ${
                  activeCategoryIndex === i
                    ? "bg-indigo-600/30 border-indigo-500/50 text-white scale-105"
                    : "bg-white/[0.03] border-white/5 text-gray-300 hover:bg-white/[0.08]"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                />
                <span className="font-medium truncate max-w-[90px]">{c.name}</span>
                <span className="text-gray-400 font-mono text-[11px]">{c.percent}%</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chart 2: Category Comparison & Benchmark Bars */}
        <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Category Comparison</h2>
              <p className="text-xs text-gray-400">Comparing total spend vs category average</p>
            </div>
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 text-xs">
              <button
                onClick={() => setCategoryViewMode("total")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  categoryViewMode === "total"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Total Spend
              </button>
              <button
                onClick={() => setCategoryViewMode("avg")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  categoryViewMode === "avg"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Avg Ticket
              </button>
            </div>
          </div>

          <div className="h-80 w-full">
            {categories.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                No category data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categories}
                  margin={{ top: 20, right: 15, left: 10, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "14px",
                      color: "#fff",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                    }}
                    formatter={(val, name, item) => [
                      formatAmount(val),
                      categoryViewMode === "total"
                        ? `Total (${item.payload.percent}%)`
                        : "Avg Ticket",
                    ]}
                  />
                  {categoryViewMode === "total" && (
                    <ReferenceLine
                      y={avgCategorySpend}
                      stroke="#ec4899"
                      strokeDasharray="4 4"
                      label={{
                        value: `Avg (₹${avgCategorySpend.toFixed(0)})`,
                        fill: "#ec4899",
                        fontSize: 10,
                        position: "insideTopRight",
                      }}
                    />
                  )}
                  <Bar
                    dataKey={categoryViewMode === "total" ? "value" : "avg"}
                    radius={[8, 8, 0, 0]}
                  >
                    {categories.map((_, index) => (
                      <Cell
                        key={`bar-${index}`}
                        fill={PALETTE[index % PALETTE.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/5">
            <span>Dashed line: Mean category expenditure</span>
            <span>Hover bars for itemized breakdown</span>
          </div>
        </div>
      </div>

      {/* ── Chart Row 2: Temporal Trends & Behavioral Rhythms ────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart 3: Monthly Spending Trajectory & Trend */}
        <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Monthly Trajectory</h2>
              <p className="text-xs text-gray-400">Expenditure trend over calendar months</p>
            </div>
            {summary.mom_change_pct !== null && (
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-xl border ${
                  summary.mom_change_pct > 0
                    ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                }`}
              >
                {summary.mom_change_pct > 0 ? "▲" : "▼"} {Math.abs(summary.mom_change_pct)}% MoM
              </span>
            )}
          </div>

          <div className="h-72 w-full">
            {monthlyTrend.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                Single or no month data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyTrend}
                  margin={{ top: 15, right: 15, left: 10, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "14px",
                      color: "#fff",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                    }}
                    formatter={(val, name, item) => [
                      formatAmount(val),
                      `Spend (${item.payload.count} txns)`,
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSpend)"
                    dot={{ r: 4, fill: "#6366f1", stroke: "#fff", strokeWidth: 1.5 }}
                    activeDot={{ r: 7, fill: "#818cf8", stroke: "#fff", strokeWidth: 2 }}
                    name="Monthly Outflow"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/5">
            <span>Tracking monthly burn trajectory</span>
            <Link to="/forecast" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              View 3-Month Forecast →
            </Link>
          </div>
        </div>

        {/* Chart 4: Day-of-Week Behavioral Spending Rhythm */}
        <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Day-of-Week Rhythm</h2>
              <p className="text-xs text-gray-400">Spending velocity across days of the week</p>
            </div>
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 text-xs">
              <button
                onClick={() => setDayPatternMode("bar")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  dayPatternMode === "bar"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setDayPatternMode("radar")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  dayPatternMode === "radar"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Radar
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            {dayPatternMode === "radar" ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius={95} data={dayOfWeek}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                  <PolarRadiusAxis stroke="#64748b" fontSize={9} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "14px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(val) => [formatAmount(val), "Spend"]}
                  />
                  <Radar
                    name="Day Spend"
                    dataKey="amount"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dayOfWeek}
                  margin={{ top: 15, right: 15, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "14px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(val, name, item) => [
                      formatAmount(val),
                      `${item.payload.count} transactions (Avg: ${formatAmount(item.payload.avg)})`,
                    ]}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                    {dayOfWeek.map((entry, idx) => (
                      <Cell
                        key={`dow-${idx}`}
                        fill={entry.day === "Sat" || entry.day === "Sun" ? "#ec4899" : "#8b5cf6"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/5">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-500 inline-block" /> Weekend (
              {summary.weekend_percent}%)
              <span className="w-2 h-2 rounded-full bg-violet-500 inline-block ml-2" /> Weekday (
              {summary.weekday_percent}%)
            </span>
          </div>
        </div>
      </div>

      {/* ── Chart Row 3: Cumulative Outflow Progression (S-Curve) ────────── */}
      {cumulativeData.length > 1 && (
        <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Cumulative Spending Progression</h2>
              <p className="text-xs text-gray-400">Total accumulated expenditure across time</p>
            </div>
            <span className="text-xs text-cyan-400 font-mono font-semibold bg-cyan-500/10 px-3 py-1 rounded-xl border border-cyan-500/20">
              Total: {formatAmount(current.total)}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={cumulativeData}
                margin={{ top: 10, right: 15, left: 10, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="colorCumul" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(d) => {
                    if (!d) return "";
                    const parts = d.split("-");
                    return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : d;
                  }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "14px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  formatter={(val, name) => [
                    formatAmount(val),
                    name === "cumulative" ? "Accumulated Total" : "Daily Spend",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCumul)"
                  name="cumulative"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Category Analytics Deep Matrix Table ─────────────────────────── */}
      <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-white">Category Analytics Matrix</h2>
            <p className="text-xs text-gray-400">Granular metric breakdown and ticket volume per category</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              Showing <span className="text-white font-bold">{categories.length}</span> categories
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 pl-2">#</th>
                <th className="pb-3">Category</th>
                <th className="pb-3 text-right">Total Spent</th>
                <th className="pb-3 text-left pl-6">Share of Wallet</th>
                <th className="pb-3 text-center">Txns</th>
                <th className="pb-3 text-right">Avg Ticket</th>
                <th className="pb-3 text-right pr-2">Max Expense</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {categories.map((c, idx) => (
                <tr
                  key={c.name}
                  className="hover:bg-white/[0.04] transition-colors group"
                >
                  <td className="py-3.5 pl-2 font-mono text-gray-500">{idx + 1}</td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: PALETTE[idx % PALETTE.length] }}
                      />
                      <span className="font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {c.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 text-right font-extrabold text-white font-mono">
                    {formatAmount(c.value)}
                  </td>
                  <td className="py-3.5 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-white/10 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(c.percent, 100)}%`,
                            backgroundColor: PALETTE[idx % PALETTE.length],
                          }}
                        />
                      </div>
                      <span className="font-semibold text-gray-300 font-mono w-10 text-right">
                        {c.percent}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 text-center">
                    <span className="bg-white/5 text-gray-300 px-2.5 py-0.5 rounded-full border border-white/5 font-mono">
                      {c.count}
                    </span>
                  </td>
                  <td className="py-3.5 text-right text-gray-300 font-mono">
                    {formatAmount(c.avg)}
                  </td>
                  <td className="py-3.5 text-right pr-2 text-gray-400 font-mono">
                    {formatAmount(c.max)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function round(num, decimals = 2) {
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

// ── Custom Donut Tooltip ────────────────────────────────────────────────────
function CustomTooltip({ active, payload, formatAmount, total }) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-slate-900/95 border border-white/15 backdrop-blur-xl p-3.5 rounded-2xl shadow-2xl text-xs text-white z-50 min-w-[170px]">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: payload[0].fill }}
          />
          <p className="font-bold text-white">{d.name}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span>Spent:</span>
            <span className="font-bold text-white font-mono">{formatAmount(d.value)}</span>
          </div>
          <div className="flex items-center justify-between text-gray-400">
            <span>Share:</span>
            <span className="font-bold text-indigo-400 font-mono">{d.percent}%</span>
          </div>
          <div className="flex items-center justify-between text-gray-400">
            <span>Transactions:</span>
            <span className="font-semibold text-gray-200 font-mono">{d.count}</span>
          </div>
          <div className="flex items-center justify-between text-gray-400">
            <span>Avg Ticket:</span>
            <span className="font-semibold text-gray-200 font-mono">{formatAmount(d.avg)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}