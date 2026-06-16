import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import ExpenseTable, { CATEGORIES } from "../components/ExpenseTable";
import Loading from "../components/Loading";
import { useSettings } from "../context/SettingsContext";

/* ─── helpers ────────────────────────────────────────────────── */
const today = () => new Date().toISOString().split("T")[0];

const emptyForm = {
  description: "",
  amount: "",
  category: CATEGORIES[0],
  date: today(),
};

/* ─── Toast ──────────────────────────────────────────────────── */
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [msg]);

  if (!msg) return null;
  const colors =
    type === "error"
      ? "bg-red-500/20 border-red-500/40 text-red-200"
      : "bg-emerald-500/20 border-emerald-500/40 text-emerald-200";

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl border backdrop-blur-sm shadow-xl text-sm font-medium flex items-center gap-3 transition-all duration-300 ${colors}`}
    >
      <span>{type === "error" ? "✖" : "✔"}</span>
      {msg}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">✕</button>
    </div>
  );
}

/* ─── Modal ──────────────────────────────────────────────────── */
function ExpenseModal({ mode, initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.description.trim()) return setError("Description is required.");
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
      return setError("Enter a valid positive amount.");
    if (!form.date) return setError("Date is required.");

    setSaving(true);
    try {
      const payload = {
        description: form.description.trim(),
        amount: parseFloat(form.amount),
        category: form.category,
        date: form.date,
      };
      if (mode === "add") {
        await api.post("/api/expenses/", payload);
        onSaved("Expense added successfully!", "add");
      } else {
        await api.put(`/api/expenses/${initial.id}`, payload);
        onSaved("Expense updated successfully!", "edit");
      }
      onClose();
    } catch (err) {
      setError(err?.response?.data?.detail || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            {mode === "add" ? "Add Expense" : "Edit Expense"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/40 text-red-300 text-sm px-4 py-2.5 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">
              Description
            </label>
            <input
              type="text"
              value={form.description}
              onChange={set("description")}
              placeholder="e.g. Grocery shopping"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">
                Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={set("amount")}
                placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">
                Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={set("date")}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">
              Category
            </label>
            <select
              value={form.category}
              onChange={set("category")}
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all disabled:opacity-50"
            >
              {saving ? "Saving…" : mode === "add" ? "Add Expense" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Upload Zone ────────────────────────────────────────────── */
function UploadZone({ onUploaded }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["pdf", "csv"].includes(ext)) {
      setError("Only PDF or CSV files are supported.");
      return;
    }
    setError("");
    setResult(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post("/api/upload/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
      onUploaded();
    } catch (err) {
      setError(err?.response?.data?.detail || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all select-none
        ${dragging ? "border-indigo-400 bg-indigo-500/10 scale-[1.01]" : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/5"}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.csv"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {uploading ? (
        <>
          <div className="w-10 h-10 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-400">Uploading &amp; extracting transactions…</p>
        </>
      ) : result ? (
        <>
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl">✓</div>
          <p className="text-sm text-emerald-300 font-medium">
            {result.transactions_imported} transactions imported from{" "}
            <span className="font-semibold">{result.file}</span>
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); setResult(null); }}
            className="text-xs text-gray-500 hover:text-gray-300 underline"
          >
            Upload another
          </button>
        </>
      ) : (
        <>
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-300 font-medium">
              Drop your bank statement here
            </p>
            <p className="text-xs text-gray-500 mt-0.5">PDF or CSV · click to browse</p>
          </div>
          {error && (
            <p className="text-xs text-red-400 mt-1">{error}</p>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function Expenses() {
  const { formatAmount } = useSettings();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { mode: "add" | "edit", data? }
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");

  const fetchExpenses = () => {
    api.get("/api/expenses").then((res) => {
      setExpenses(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchExpenses(); }, []);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const handleEdit = (expense) => {
    setModal({
      mode: "edit",
      data: {
        ...expense,
        amount: String(expense.amount),
        date: expense.date,
      },
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/expenses/${id}`);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      showToast("Expense deleted.");
    } catch {
      showToast("Failed to delete expense.", "error");
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchSearch =
      !search ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "All" || e.category === filterCat;
    return matchSearch && matchCat;
  });

  const totalFiltered = filteredExpenses.reduce((s, e) => s + e.amount, 0);

  if (loading) return <Loading />;

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Expenses</h1>
          <p className="text-gray-400 text-sm mt-1">
            {expenses.length} transactions ·{" "}
            {formatAmount(expenses.reduce((s, e) => s + e.amount, 0))} total
          </p>
        </div>
        <button
          onClick={() => setModal({ mode: "add", data: null })}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-900/30"
        >
          <span className="text-lg leading-none">+</span>
          Add Expense
        </button>
      </div>

      {/* Upload Zone */}
      <div className="mb-6">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
          Import Bank Statement
        </p>
        <UploadZone onUploaded={fetchExpenses} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          placeholder="Search expenses…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors w-64"
        />
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {(search || filterCat !== "All") && (
          <div className="flex items-center gap-2 ml-auto text-sm text-gray-400">
            <span>{filteredExpenses.length} results ·</span>
            <span className="text-emerald-400 font-semibold">
              {formatAmount(totalFiltered)}
            </span>
            <button
              onClick={() => { setSearch(""); setFilterCat("All"); }}
              className="ml-2 text-xs text-gray-500 hover:text-white underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <ExpenseTable
        expenses={filteredExpenses}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal */}
      {modal && (
        <ExpenseModal
          mode={modal.mode}
          initial={modal.data}
          onClose={() => setModal(null)}
          onSaved={(msg) => { showToast(msg); fetchExpenses(); }}
        />
      )}

      {/* Toast */}
      <Toast
        msg={toast.msg}
        type={toast.type}
        onClose={() => setToast({ msg: "", type: "success" })}
      />
    </div>
  );
}