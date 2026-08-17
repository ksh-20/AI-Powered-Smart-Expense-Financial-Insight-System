import { useEffect, useState } from "react";
import api from "../api/axios";
import Loading from "../components/Loading";
import { useSettings } from "../context/SettingsContext";

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const formatMonthLabel = (monthStr) => {
  if (!monthStr) return "";
  const [year, month] = monthStr.split("-");
  const dateObj = new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    1
  );
  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

export default function Forecast() {
  const { formatAmount } = useSettings();
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [rawForecast, setRawForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchForecast = async () => {
      try {
        const res = await api.get("/api/forecast");
        const hist = res.data?.historical || [];
        const fore = res.data?.forecast || [];
        const summ = res.data?.summary || null;

        const combined = [];

        // Historical data points
        hist.forEach((h) => {
          combined.push({
            month: formatMonthLabel(h.month),
            historical: h.amount,
            forecast: null,
            lower_bound: null,
            upper_bound: null,
          });
        });

        // Bridge anchor between last historical and first forecast
        if (hist.length > 0 && fore.length > 0) {
          combined[combined.length - 1].forecast = hist[hist.length - 1].amount;
          combined[combined.length - 1].lower_bound = hist[hist.length - 1].amount;
          combined[combined.length - 1].upper_bound = hist[hist.length - 1].amount;
        }

        // Forecast data points
        fore.forEach((f) => {
          combined.push({
            month: formatMonthLabel(f.month),
            historical: null,
            forecast: f.amount,
            lower_bound: f.lower_bound,
            upper_bound: f.upper_bound,
          });
        });

        if (mounted) {
          setData(combined);
          setRawForecast(fore);
          setSummary(summ);
          setError("");
        }
      } catch (err) {
        console.error("Forecast API error:", err);
        if (mounted) {
          setError("Could not retrieve forecasting data.");
          setData([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchForecast();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Spending Forecast
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Predictive ML
            </span>
          </div>
          <p className="text-slate-300 text-sm mt-1">
            Dynamic trend-aware future expenditure projections with seasonal weighting & variance modeling
          </p>
        </div>
      </div>

      {/* Error State */}
      {error ? (
        <div className="bg-red-500/20 border border-red-500/40 text-red-300 px-6 py-4 rounded-2xl font-medium">
          {error}
        </div>
      ) : data.length === 0 ? (
        /* Empty State */
        <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-12 text-center backdrop-blur-xl">
          <p className="text-slate-300 text-sm font-medium">
            Add historical transactions to generate intelligent spending forecasts.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ── 3 Summary Metric Cards ─────────────────────────────────── */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Next Month Forecast */}
              <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-5 backdrop-blur-xl shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Next Month Projected
                  </p>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                      summary.projected_mom_growth_pct > 0
                        ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                    }`}
                  >
                    {summary.projected_mom_growth_pct > 0 ? "▲ +" : "▼ "}
                    {summary.projected_mom_growth_pct}% vs Current
                  </span>
                </div>
                <p className="text-2xl font-extrabold text-white mt-2 font-mono">
                  {formatAmount(summary.next_month_projected)}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Expected burn based on recent velocity
                </p>
              </div>

              {/* Card 2: 3-Month Quarter Projection */}
              <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-5 backdrop-blur-xl shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    90-Day Quarter Outflow
                  </p>
                  <span className="text-xs font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                    3-Mo Horizon
                  </span>
                </div>
                <p className="text-2xl font-extrabold text-white mt-2 font-mono">
                  {formatAmount(summary.three_month_projected_total)}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Total accumulated upcoming expenditures
                </p>
              </div>

              {/* Card 3: Monthly Average */}
              <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-5 backdrop-blur-xl shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Projected Monthly Average
                  </p>
                  <span className="text-xs font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                    Avg / Mo
                  </span>
                </div>
                <p className="text-2xl font-extrabold text-white mt-2 font-mono">
                  {formatAmount(summary.avg_projected_monthly)}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Normalized monthly forecast baseline
                </p>
              </div>
            </div>
          )}

          {/* ── Legend Ribbon ─────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-xl shadow-lg">
              <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 flex-shrink-0 shadow-md shadow-indigo-500/40" />
              <div>
                <p className="text-xs text-slate-200 font-bold uppercase tracking-wider">
                  Historical Actual Spend
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verified aggregated monthly expenditures
                </p>
              </div>
            </div>

            <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-xl shadow-lg">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-dashed border-purple-400 bg-transparent flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-200 font-bold uppercase tracking-wider">
                  Dynamic Future Forecast
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Trend, calendar-adjusted & seasonal projections
                </p>
              </div>
            </div>
          </div>

          {/* ── Line Chart Card ───────────────────────────────────────── */}
          <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-xl">
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.08)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    stroke="#e2e8f0"
                    tick={{ fill: "#f1f5f9", fontSize: 12, fontWeight: 600 }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    stroke="#e2e8f0"
                    tick={{ fill: "#f1f5f9", fontSize: 12, fontWeight: 600 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.25)",
                      borderRadius: "16px",
                      color: "#ffffff",
                      fontSize: "12px",
                      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.7)",
                    }}
                    itemStyle={{ color: "#ffffff", fontWeight: "bold" }}
                    labelStyle={{ color: "#ffffff", fontWeight: "bold" }}
                    formatter={(value, name) => [
                      formatAmount(value),
                      name === "historical"
                        ? "Historical Actual"
                        : "Predicted Forecast",
                    ]}
                  />

                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ color: "#f8fafc", fontWeight: 600 }}
                  />

                  {/* Historical Solid Line */}
                  <Line
                    type="monotone"
                    dataKey="historical"
                    stroke="#6366f1"
                    strokeWidth={3.5}
                    dot={{
                      r: 5,
                      fill: "#6366f1",
                      stroke: "#ffffff",
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 8,
                      fill: "#818cf8",
                      stroke: "#ffffff",
                      strokeWidth: 2,
                    }}
                    name="Historical Spend"
                    connectNulls={false}
                  />

                  {/* Forecast Dashed Line */}
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#c084fc"
                    strokeWidth={3.5}
                    strokeDasharray="6 6"
                    dot={{
                      r: 5,
                      fill: "#a855f7",
                      stroke: "#ffffff",
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 8,
                      fill: "#c084fc",
                      stroke: "#ffffff",
                      strokeWidth: 2,
                    }}
                    name="Forecasted Spend"
                    connectNulls={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Itemized Forecast Breakdown Matrix ─────────────────────── */}
          {rawForecast.length > 0 && (
            <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-xl">
              <h3 className="text-base font-bold text-white mb-4 tracking-tight">
                Forecasted Monthly Horizon Breakdown
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/15 text-slate-200 uppercase tracking-wider font-bold">
                      <th className="pb-3 pl-2">Target Month</th>
                      <th className="pb-3 text-right">Projected Spend</th>
                      <th className="pb-3 text-center">Expected Range (Confidence)</th>
                      <th className="pb-3 text-center">Calendar Days</th>
                      <th className="pb-3 text-right pr-2">Projected Shift</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rawForecast.map((f) => (
                      <tr key={f.month} className="hover:bg-white/[0.04] transition-colors">
                        <td className="py-3.5 pl-2 font-bold text-white text-sm">
                          {formatMonthLabel(f.month)}
                        </td>
                        <td className="py-3.5 text-right font-extrabold text-purple-300 font-mono text-sm">
                          {formatAmount(f.amount)}
                        </td>
                        <td className="py-3.5 text-center text-slate-300 font-mono">
                          {formatAmount(f.lower_bound)} &mdash; {formatAmount(f.upper_bound)}
                        </td>
                        <td className="py-3.5 text-center text-slate-300 font-mono">
                          {f.days_in_month || 30} days
                        </td>
                        <td className="py-3.5 text-right pr-2 font-mono font-bold">
                          <span
                            className={
                              f.projected_change_pct > 0
                                ? "text-amber-300"
                                : f.projected_change_pct < 0
                                ? "text-emerald-300"
                                : "text-slate-300"
                            }
                          >
                            {f.projected_change_pct > 0 ? "+" : ""}
                            {f.projected_change_pct}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}