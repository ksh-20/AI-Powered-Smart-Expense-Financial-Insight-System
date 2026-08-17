import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import { useSettings } from "../context/SettingsContext";

const CATEGORIES = [
  "Food & Dining", "Transport", "Shopping", "Entertainment",
  "Healthcare", "Utilities", "Education", "Travel", "Groceries", "Other",
];

const CATEGORY_ICONS = {
  "Food & Dining": "🍽️",
  "Transport": "🚗",
  "Shopping": "🛍️",
  "Entertainment": "🎬",
  "Healthcare": "🏥",
  "Utilities": "💡",
  "Education": "📚",
  "Travel": "✈️",
  "Groceries": "🛒",
  "Other": "📦",
};

function StatusBadge({ status }) {
  const map = {
    safe: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
    warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/20",
    exceeded: "bg-red-500/20 text-red-400 border-red-500/20",
  };
  const labels = { safe: "On Track", warning: "Warning", exceeded: "Exceeded" };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${map[status]}`}>
      {labels[status]}
    </span>
  );
}

function ProgressBar({ percent, status }) {
  const colors = {
    safe: "bg-emerald-500",
    warning: "bg-yellow-500",
    exceeded: "bg-red-500",
  };
  return (
    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${colors[status]}`}
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  );
}

function Modal({ onClose, onSave, editGoal, existingCategories }) {
  const { symbol } = useSettings();
  const available = CATEGORIES.filter(
    (c) => !existingCategories.includes(c) || (editGoal && c === editGoal.category)
  );

  const [category, setCategory] = useState(editGoal?.category || available[0] || "Other");
  const [limit, setLimit] = useState(editGoal?.monthly_limit || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsed = parseFloat(limit);
    if (!parsed || parsed <= 0) {
      setError("Enter a valid amount greater than 0");
      return;
    }
    setSaving(true);
    try {
      await onSave({ category, monthly_limit: parsed });
      onClose();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">
            {editGoal ? "Edit Budget Goal" : "Add Budget Goal"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wider">
              Category
            </label>
            <select
              id="budget-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={!!editGoal}
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
            >
              {(editGoal ? CATEGORIES : available).map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_ICONS[c]} {c}
                </option>
              ))}
            </select>
            {!editGoal && available.length === 0 && (
              <p className="text-xs text-yellow-400 mt-1">All categories already have goals.</p>
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wider">
              Monthly Limit
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                {symbol}
              </span>
              <input
                id="budget-limit-input"
                type="number"
                min="1"
                step="100"
                value={limit}
                onChange={(e) => { setLimit(e.target.value); setError(""); }}
                placeholder="0"
                className="w-full bg-slate-800 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-white/10 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="budget-save-btn"
              disabled={saving || (!editGoal && available.length === 0)}
              className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/30"
            >
              {saving ? "Saving…" : editGoal ? "Update Goal" : "Add Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Budget() {
  const { formatAmount } = useSettings();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProgress = useCallback(async () => {
    try {
      const res = await api.get("/api/budget/progress");
      setProgress(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  const handleSave = async ({ category, monthly_limit }) => {
    if (editGoal) {
      await api.put(`/api/budget/${editGoal.id}`, { monthly_limit });
      showToast("Budget goal updated!");
    } else {
      await api.post("/api/budget/", { category, monthly_limit });
      showToast("Budget goal added!");
    }
    setEditGoal(null);
    await fetchProgress();
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/api/budget/${id}`);
      showToast("Budget goal removed.", "info");
      await fetchProgress();
    } catch {
      showToast("Failed to delete.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const existingCategories = progress.map((p) => p.category);
  const totalBudget = progress.reduce((s, p) => s + p.monthly_limit, 0);
  const totalSpent = progress.reduce((s, p) => s + p.spent, 0);
  const overBudget = progress.filter((p) => p.status === "exceeded").length;
  const atRisk = progress.filter((p) => p.status === "warning").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-500 text-sm">
        Loading budget goals…
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-2xl border transition-all ${
          toast.type === "error" ? "bg-red-900/80 border-red-500/30 text-red-200" :
          toast.type === "info" ? "bg-slate-800 border-white/10 text-gray-300" :
          "bg-emerald-900/80 border-emerald-500/30 text-emerald-200"
        }`}>
          {toast.type === "success" ? "✓ " : toast.type === "error" ? "✕ " : "ℹ "}{toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Budget Goals</h1>
          <p className="text-gray-400 text-sm mt-1">
            Set monthly spending limits per category and track your progress
          </p>
        </div>
        <button
          id="add-budget-goal-btn"
          onClick={() => { setEditGoal(null); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-900/30"
        >
          <span className="text-base leading-none">+</span>
          Add Goal
        </button>
      </div>

      {/* Summary cards */}
      {progress.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Budget",  value: formatAmount(totalBudget),  accent: "text-white" },
            { label: "Total Spent",   value: formatAmount(totalSpent),   accent: totalSpent > totalBudget ? "text-red-400" : "text-white" },
            { label: "Goals Set",     value: progress.length,            accent: "text-indigo-400" },
            { label: "Over Budget",   value: overBudget + (atRisk ? ` (${atRisk} at risk)` : ""), accent: overBudget > 0 ? "text-red-400" : "text-emerald-400" },
          ].map(({ label, value, accent }) => (
            <div key={label} className="bg-white/[0.04] border border-white/10 rounded-2xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
              <p className={`text-xl font-bold ${accent}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Budget goal cards */}
      {progress.length === 0 ? (
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-16 text-center">
          <p className="text-4xl mb-4">🎯</p>
          <p className="text-white font-semibold text-lg mb-1">No budget goals yet</p>
          <p className="text-gray-500 text-sm mb-6">
            Add per-category monthly limits to track your spending more precisely
          </p>
          <button
            onClick={() => { setEditGoal(null); setShowModal(true); }}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all"
          >
            + Add your first goal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {progress.map((p) => (
            <div
              key={p.id}
              className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{CATEGORY_ICONS[p.category] || "📦"}</span>
                  <div>
                    <p className="text-white font-semibold text-sm">{p.category}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatAmount(p.spent)}{" "}
                      <span className="text-gray-600">/ {formatAmount(p.monthly_limit)}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={p.status} />
                  <span className={`text-sm font-bold ${
                    p.status === "exceeded" ? "text-red-400" :
                    p.status === "warning"  ? "text-yellow-400" : "text-emerald-400"
                  }`}>
                    {p.percent_used}%
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      id={`edit-goal-${p.id}`}
                      onClick={() => { setEditGoal(p); setShowModal(true); }}
                      className="px-2.5 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    >
                      Edit
                    </button>
                    <button
                      id={`delete-goal-${p.id}`}
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                      className="px-2.5 py-1.5 text-xs text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                    >
                      {deletingId === p.id ? "…" : "Remove"}
                    </button>
                  </div>
                </div>
              </div>

              <ProgressBar percent={p.percent_used} status={p.status} />

              {p.status === "exceeded" && (
                <p className="text-xs text-red-400 mt-2">
                  ⚠ Over by {formatAmount(p.spent - p.monthly_limit)}
                </p>
              )}
              {p.status === "warning" && (
                <p className="text-xs text-yellow-400 mt-2">
                  Only {formatAmount(p.monthly_limit - p.spent)} remaining this month
                </p>
              )}
              {p.status === "safe" && (
                <p className="text-xs text-gray-600 mt-2">
                  {formatAmount(p.monthly_limit - p.spent)} remaining this month
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <Modal
          onClose={() => { setShowModal(false); setEditGoal(null); }}
          onSave={handleSave}
          editGoal={editGoal}
          existingCategories={existingCategories}
        />
      )}
    </div>
  );
}
