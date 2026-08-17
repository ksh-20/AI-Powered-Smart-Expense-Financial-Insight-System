import { useState } from "react";
import { useSettings } from "../context/SettingsContext";

const CURRENCIES = [
  { code: "INR", label: "₹ Indian Rupee" },
  { code: "USD", label: "$ US Dollar" },
  { code: "EUR", label: "€ Euro" },
  { code: "GBP", label: "£ British Pound" },
  { code: "JPY", label: "¥ Japanese Yen" },
  { code: "AUD", label: "A$ Australian Dollar" },
  { code: "CAD", label: "C$ Canadian Dollar" },
];

const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];

const CATEGORIES = [
  "Food & Dining","Transport","Shopping","Entertainment",
  "Healthcare","Utilities","Education","Travel","Groceries","Other",
];

/* ── Section wrapper ─────────────────────────────── */
function Section({ title, children }) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 space-y-5">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
        {title}
      </h2>
      {children}
    </div>
  );
}

/* ── Toggle switch ───────────────────────────────── */
function Toggle({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
          checked ? "bg-indigo-600" : "bg-white/10"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

/* ── Select field ────────────────────────────────── */
function SelectField({ label, value, onChange, options }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-sm font-medium text-white">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors min-w-[200px]"
      >
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ── Budget input ────────────────────────────────── */
function BudgetField({ symbol, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-white">Monthly Budget</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Set to 0 to disable budget tracking
        </p>
      </div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
          {symbol}
        </span>
        <input
          type="number"
          min="0"
          step="any"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="bg-slate-800 border border-white/10 rounded-xl pl-8 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors w-40 text-right"
        />
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────── */
export default function Settings() {
  const { settings, updateSettings, loading, symbol } = useSettings();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // local draft — only pushed on "Save"
  const [draft, setDraft] = useState(null);
  const current = draft ?? settings;

  const set = (key) => (val) =>
    setDraft((prev) => ({ ...(prev ?? settings), [key]: val }));

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    await updateSettings(draft);
    setDraft(null);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => setDraft(null);

  const isDirty = draft !== null;

  if (loading && !settings.currency)
    return (
      <div className="flex items-center justify-center py-32 text-gray-500">
        Loading settings…
      </div>
    );

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage your preferences — changes are saved to your account
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isDirty && (
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Discard
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              isDirty
                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30"
                : "bg-white/5 text-gray-600 cursor-not-allowed"
            }`}
          >
            {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {/* ── Display ── */}
        <Section title="Display">
          <SelectField
            label="Currency"
            value={current.currency}
            onChange={set("currency")}
            options={CURRENCIES.map((c) => ({ value: c.code, label: c.label }))}
          />
          <SelectField
            label="Date Format"
            value={current.date_format}
            onChange={set("date_format")}
            options={DATE_FORMATS}
          />
        </Section>

        {/* ── Budget ── */}
        <Section title="Budget">
          <BudgetField
            symbol={symbol}
            value={current.monthly_budget}
            onChange={set("monthly_budget")}
          />
          {current.monthly_budget > 0 && (
            <div className="flex items-center gap-2 px-4 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <span className="text-indigo-400 text-sm">💡</span>
              <p className="text-xs text-indigo-300">
                You'll see budget progress on your Dashboard when this is set.
              </p>
            </div>
          )}
        </Section>

        {/* ── Expenses ── */}
        <Section title="Expenses">
          <SelectField
            label="Default Category"
            value={current.default_category}
            onChange={set("default_category")}
            options={CATEGORIES}
          />
        </Section>

        {/* ── Notifications ── */}
        <Section title="Notifications">
          <Toggle
            label="Enable Notifications"
            desc="Master switch for all in-app alerts"
            checked={current.notifications_enabled}
            onChange={set("notifications_enabled")}
          />
          <div
            className={`space-y-4 transition-opacity ${
              current.notifications_enabled ? "opacity-100" : "opacity-30 pointer-events-none"
            }`}
          >
            <Toggle
              label="Anomaly Alerts"
              desc="Get alerted when unusual spending is detected"
              checked={current.anomaly_alerts}
              onChange={set("anomaly_alerts")}
            />
            <Toggle
              label="Budget Warnings"
              desc="Warn when you're close to your monthly budget"
              checked={current.budget_warnings}
              onChange={set("budget_warnings")}
            />
          </div>
        </Section>

        {/* ── Danger ── */}
        <Section title="Account">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Current Settings Summary</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Currency: {current.currency} · Budget:{" "}
                {current.monthly_budget > 0
                  ? `${symbol}${current.monthly_budget.toLocaleString()}/mo`
                  : "No limit"}{" "}
                · Format: {current.date_format}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
              Active
            </span>
          </div>
        </Section>
      </div>

      {/* Unsaved banner */}
      {isDirty && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3 bg-slate-800 border border-white/10 rounded-2xl shadow-2xl text-sm">
          <span className="text-yellow-400">●</span>
          <span className="text-gray-300">You have unsaved changes</span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all"
          >
            {saving ? "Saving…" : "Save now"}
          </button>
          <button onClick={handleReset} className="text-gray-500 hover:text-gray-300">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
