import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useSettings } from "../context/SettingsContext";
import FormattedText from "../components/FormattedText";

export default function Anomalies() {
  const { formatAmount } = useSettings();
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const [deepDives, setDeepDives] = useState({});
  const [deepDiveLoading, setDeepDiveLoading] = useState({});

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/anomaly");
      setAnomalies(res.data || []);
      // If there are anomalies, auto-expand the first one by default
      if (res.data && res.data.length > 0) {
        setExpandedId(res.data[0].id ?? res.data[0].index ?? 0);
      }
    } catch (err) {
      console.error("Failed to fetch anomalies:", err);
      setAnomalies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleDismiss = (e, id) => {
    e.stopPropagation();
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  const handleDeepDiveAI = async (e, anomaly) => {
    e.stopPropagation();
    const id = anomaly.id ?? anomaly.index;
    if (deepDives[id]) return;

    setDeepDiveLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await api.post("/api/anomaly/explain", {
        transaction_id: anomaly.id,
        amount: anomaly.amount,
        category: anomaly.category,
        description: anomaly.description,
        date: anomaly.date,
      });
      setDeepDives((prev) => ({ ...prev, [id]: res.data.explanation }));
    } catch (err) {
      console.error("Deep dive error:", err);
      setDeepDives((prev) => ({
        ...prev,
        [id]: "Could not retrieve live AI explanation. Please refer to the algorithmic NLP diagnostic above.",
      }));
    } finally {
      setDeepDiveLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const activeAnomalies = anomalies.filter(
    (a) => !dismissedIds.has(a.id ?? a.index)
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Spending Anomalies
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                activeAnomalies.length > 0
                  ? "bg-red-500/20 text-red-300 border-red-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              }`}
            >
              {activeAnomalies.length > 0 ? "⚠ Review Needed" : "✓ Sentinel Safe"}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Multi-factor statistical modeling & NLP semantic analysis for outlier detection
          </p>
        </div>

        <button
          onClick={fetchAnomalies}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-medium border border-white/10 transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <span className={loading ? "animate-spin" : ""}>⟳</span>
          {loading ? "Scanning Transactions…" : "Re-Scan History"}
        </button>
      </div>

      {/* ── Loading State ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 space-y-4">
          <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-medium">
            Running isolation forest & NLP semantic checks…
          </p>
        </div>
      ) : activeAnomalies.length === 0 ? (
        /* ── REQUIREMENT 1: Clean Empty State (No Anomaly) ─────────────── */
        <div className="bg-slate-900/60 border border-emerald-500/20 rounded-3xl p-10 md:p-14 text-center backdrop-blur-xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Shield Icon Badge */}
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-lg shadow-emerald-500/20">
            🛡️
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-tight">
            All Clear — No Anomalies Detected
          </h2>

          <p className="text-gray-300 text-sm max-w-xl mx-auto leading-relaxed mb-8">
            Our AI sentinel scanned your entire expenditure history against historical baselines,
            category standard deviations, and merchant semantic patterns. No suspicious spikes,
            unexpected high-ticket surges, or anomalous charges were found.
          </p>

          {/* 3 Status Metric Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
              <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                Baseline Health
              </p>
              <p className="text-lg font-bold text-emerald-400 mt-1">100% Normal</p>
              <p className="text-xs text-gray-500 mt-0.5">Zero statistical deviations</p>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
              <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                Threat Status
              </p>
              <p className="text-lg font-bold text-emerald-400 mt-1">Safe</p>
              <p className="text-xs text-gray-500 mt-0.5">No outlier charges</p>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
              <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                NLP Semantics
              </p>
              <p className="text-lg font-bold text-indigo-400 mt-1">Clean Patterns</p>
              <p className="text-xs text-gray-500 mt-0.5">Routine transactions only</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/expenses"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2"
            >
              <span>📋</span> View All Expenses
            </Link>
            <Link
              to="/analytics"
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-sm font-semibold border border-white/10 transition-all inline-flex items-center gap-2"
            >
              <span>📊</span> Open Analytics
            </Link>
          </div>
        </div>
      ) : (
        /* ── REQUIREMENT 2: Suspicious Transactions with NLP Explanations ── */
        <div className="space-y-6">
          {/* Alert Header Banner */}
          <div className="bg-red-950/30 border border-red-500/30 rounded-2xl p-5 flex items-center justify-between gap-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="text-sm font-bold text-red-200">
                  {activeAnomalies.length} Suspicious{" "}
                  {activeAnomalies.length === 1 ? "Transaction" : "Transactions"} Flagged
                </h3>
                <p className="text-xs text-red-300/80 mt-0.5">
                  Click any transaction card below to view the detailed NLP AI diagnostic and
                  statistical reasons.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-red-400 bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20 whitespace-nowrap">
              Action Advised
            </span>
          </div>

          {/* List of Suspicious Transaction Cards */}
          <div className="space-y-4">
            {activeAnomalies.map((a) => {
              const itemKey = a.id ?? a.index;
              const isExpanded = expandedId === itemKey;
              const nlp = a.nlp_explanation || {};
              const severityBadge = {
                critical: "bg-red-500/20 text-red-400 border-red-500/40",
                high: "bg-orange-500/20 text-orange-400 border-orange-500/40",
                moderate: "bg-amber-500/20 text-amber-400 border-amber-500/40",
              };

              return (
                <div
                  key={itemKey}
                  onClick={() => toggleExpand(itemKey)}
                  className={`bg-slate-900/70 border rounded-3xl transition-all duration-200 backdrop-blur-xl cursor-pointer overflow-hidden ${
                    isExpanded
                      ? "border-red-500/50 shadow-2xl shadow-red-950/40 ring-1 ring-red-500/30"
                      : "border-white/10 hover:border-red-500/30 hover:bg-slate-900/90"
                  }`}
                >
                  {/* Card Header Row */}
                  <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Alert Icon */}
                      <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center text-xl flex-shrink-0 mt-0.5">
                        ⚡
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span
                            className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                              severityBadge[a.severity] || severityBadge.high
                            }`}
                          >
                            {a.severity || "Suspicious"} Risk ({a.risk_score || 80}%)
                          </span>
                          <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/20">
                            {a.category || "General"}
                          </span>
                          {a.date && (
                            <span className="text-xs text-gray-400 font-mono">
                              {a.date}
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-white tracking-tight">
                          {a.description || "Unlabeled Transaction"}
                        </h3>

                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                          {a.reason || "Deviation from established spending baseline"}
                        </p>
                      </div>
                    </div>

                    {/* Amount & Expand Prompt */}
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
                      <p className="text-xl md:text-2xl font-black text-red-400 font-mono">
                        {formatAmount(a.amount)}
                      </p>

                      <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold mt-1">
                        <span>{isExpanded ? "Hide Explanation" : "Explain with NLP"}</span>
                        <span className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
                          ▼
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── EXPANDED NLP EXPLANATION PANEL ──────────────────── */}
                  {isExpanded && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="border-t border-red-500/20 bg-gradient-to-b from-red-950/20 via-slate-950/60 to-slate-950/80 p-6 md:p-8 space-y-6"
                    >
                      {/* NLP Summary Banner */}
                      <div className="bg-slate-900/90 border border-red-500/30 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-indigo-400 text-sm font-bold">🤖 NLP AI Diagnostic Summary</span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">
                            {a.flag_type || "Anomaly Classifier"}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-white leading-relaxed">
                          {nlp.summary || a.reason}
                        </p>
                      </div>

                      {/* Diagnostic Breakdown Points */}
                      {nlp.details && nlp.details.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                            Key Statistical & Semantic Trigger Factors
                          </h4>
                          <div className="grid gap-2.5">
                            {nlp.details.map((point, idx) => (
                              <div
                                key={idx}
                                className="bg-white/[0.03] border border-white/5 rounded-xl p-3.5 flex items-start gap-3 text-xs text-gray-200"
                              >
                                <span className="text-indigo-400 font-bold mt-0.5">✦</span>
                                <span className="leading-relaxed">{point}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Historical Baseline Context */}
                      {nlp.baseline_context && (
                        <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-4 flex items-center justify-between flex-wrap gap-2 text-xs">
                          <div className="flex items-center gap-2 text-gray-300">
                            <span className="text-base">📊</span>
                            <span className="font-semibold text-white">Baseline Context:</span>
                            <span className="text-gray-300">{nlp.baseline_context}</span>
                          </div>
                          {nlp.multiplier && (
                            <span className="font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/20 font-mono">
                              {nlp.multiplier}x Category Baseline
                            </span>
                          )}
                        </div>
                      )}

                      {/* Live AI Deep Dive Output (if requested) */}
                      {deepDives[itemKey] && (
                        <div className="bg-purple-950/30 border border-purple-500/30 rounded-2xl p-5 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                            <span>✧</span>
                            <span>Live AI Diagnostic Explanation</span>
                          </div>
                          <FormattedText
                            text={deepDives[itemKey]}
                            className="text-xs text-slate-200 leading-relaxed"
                          />
                        </div>
                      )}

                      {/* Suggested Action & Resolution Row */}
                      <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <p className="text-xs text-gray-400 max-w-md">
                          💡 <span className="font-semibold text-gray-300">Suggested Action:</span>{" "}
                          {nlp.suggested_action || "Verify this transaction against your bank statement."}
                        </p>

                        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                          {/* Live AI Ask Button */}
                          {!deepDives[itemKey] && (
                            <button
                              onClick={(e) => handleDeepDiveAI(e, a)}
                              disabled={deepDiveLoading[itemKey]}
                              className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-all flex items-center gap-1.5"
                            >
                              {deepDiveLoading[itemKey] ? (
                                <>
                                  <span className="w-3 h-3 border-2 border-purple-300/30 border-t-purple-300 rounded-full animate-spin" />
                                  Analyzing with AI…
                                </>
                              ) : (
                                <>
                                  <span>✧</span> Ask AI Deep-Dive
                                </>
                              )}
                            </button>
                          )}

                          {/* Mark as Legitimate Button */}
                          <button
                            onClick={(e) => handleDismiss(e, itemKey)}
                            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5"
                          >
                            <span>✓</span> Mark Verified
                          </button>

                          <Link
                            to="/expenses"
                            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20"
                          >
                            Edit Expense
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}