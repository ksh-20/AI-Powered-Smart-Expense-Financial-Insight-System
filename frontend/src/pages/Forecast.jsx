import { useEffect, useState } from "react";
import api from "../api/axios";
import Loading from "../components/Loading";
import { useSettings } from "../context/SettingsContext";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

const formatMonthLabel = (monthStr) => {
  const [year, month] = monthStr.split("-");
  const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
  return dateObj.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

export default function Forecast() {
  const { formatAmount } = useSettings();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/forecast")
      .then((res) => {
        const hist = res.data.historical || [];
        const fore = res.data.forecast || [];

        const combined = [];

        hist.forEach((h) => {
          combined.push({
            month: formatMonthLabel(h.month),
            historical: h.amount,
            forecast: null
          });
        });

        if (hist.length > 0 && fore.length > 0) {
          // Connect the line smoothly
          combined[combined.length - 1].forecast = hist[hist.length - 1].amount;
        }

        fore.forEach((f) => {
          combined.push({
            month: formatMonthLabel(f.month),
            historical: null,
            forecast: f.amount
          });
        });

        setData(combined);
        setLoading(false);
      })
      .catch((err) => {
        setError("Could not retrieve forecasting data.");
        setLoading(false);
      });
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Spending Forecast</h1>
        <p className="text-gray-400 text-sm mt-1">
          Predict future expenditures based on historical monthly spending patterns.
        </p>
      </div>

      {error ? (
        <div className="bg-red-500/20 border border-red-500/40 text-red-300 px-6 py-4 rounded-2xl">
          {error}
        </div>
      ) : data.length === 0 ? (
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-8 text-center">
          <p className="text-gray-400 text-sm">Add some historical expenses to see forecast projections.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Legend and Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-3 h-10 rounded-full bg-indigo-500" />
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Historical Trend</p>
                <p className="text-sm text-gray-200 mt-0.5">Aggregated actual monthly expenditures</p>
              </div>
            </div>
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-3 h-10 rounded-full bg-purple-500 style={{ borderStyle: 'dashed' }}" className="w-3 h-10 rounded-full border-2 border-dashed border-purple-500 bg-transparent" />
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Future Forecast</p>
                <p className="text-sm text-gray-200 mt-0.5">3-month predicted expenditure projection</p>
              </div>
            </div>
          </div>

          {/* Line Chart Card */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-md">
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="month"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "13px"
                    }}
                    formatter={(value) => [formatAmount(value), "Spending"]}
                  />
                  <Legend verticalAlign="top" height={36} />
                  
                  {/* Historical Solid Line */}
                  <Line
                    type="monotone"
                    dataKey="historical"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 1 }}
                    activeDot={{ r: 7 }}
                    name="Historical Spend"
                  />
                  
                  {/* Forecast Dashed Line */}
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#a855f7"
                    strokeWidth={3}
                    strokeDasharray="6 6"
                    dot={{ r: 4, strokeWidth: 1 }}
                    activeDot={{ r: 7 }}
                    name="Forecasted Spend"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}