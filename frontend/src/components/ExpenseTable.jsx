import { useState } from "react";

const CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Shopping",
  "Entertainment",
  "Healthcare",
  "Utilities",
  "Education",
  "Travel",
  "Groceries",
  "Other",
];

export default function ExpenseTable({ expenses, onEdit, onDelete }) {
  const [confirmId, setConfirmId] = useState(null);

  const handleDelete = (id) => {
    if (confirmId === id) {
      onDelete(id);
      setConfirmId(null);
    } else {
      setConfirmId(id);
      setTimeout(() => setConfirmId(null), 3000);
    }
  };

  const categoryColor = (cat) => {
    const map = {
      "Food & Dining": "bg-orange-500/20 text-orange-300",
      Transport: "bg-blue-500/20 text-blue-300",
      Shopping: "bg-pink-500/20 text-pink-300",
      Entertainment: "bg-purple-500/20 text-purple-300",
      Healthcare: "bg-red-500/20 text-red-300",
      Utilities: "bg-yellow-500/20 text-yellow-300",
      Education: "bg-cyan-500/20 text-cyan-300",
      Travel: "bg-green-500/20 text-green-300",
      Groceries: "bg-lime-500/20 text-lime-300",
      Other: "bg-gray-500/20 text-gray-300",
    };
    return map[cat] || "bg-indigo-500/20 text-indigo-300";
  };

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
        </svg>
        <p className="text-lg">No expenses yet</p>
        <p className="text-sm mt-1">Add one manually or upload a bank statement</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
            <th className="px-5 py-3 text-left">Description</th>
            <th className="px-5 py-3 text-left">Category</th>
            <th className="px-5 py-3 text-right">Amount</th>
            <th className="px-5 py-3 text-center">Date</th>
            <th className="px-5 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e, i) => (
            <tr
              key={e.id}
              className={`border-t border-white/5 transition-colors hover:bg-white/5 ${
                i % 2 === 0 ? "" : "bg-white/[0.02]"
              }`}
            >
              <td className="px-5 py-3.5 text-white font-medium max-w-xs truncate">
                {e.description}
              </td>
              <td className="px-5 py-3.5">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${categoryColor(e.category)}`}>
                  {e.category}
                </span>
              </td>
              <td className="px-5 py-3.5 text-right font-semibold text-emerald-400">
                ₹{Number(e.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </td>
              <td className="px-5 py-3.5 text-center text-gray-400">
                {new Date(e.date).toLocaleDateString("en-IN", {
                  day: "2-digit", month: "short", year: "numeric",
                })}
              </td>
              <td className="px-5 py-3.5 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onEdit(e)}
                    className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/40 transition-all"
                    title="Edit"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(e.id)}
                    className={`p-1.5 rounded-lg transition-all ${
                      confirmId === e.id
                        ? "bg-red-500 text-white animate-pulse"
                        : "bg-red-500/20 text-red-300 hover:bg-red-500/40"
                    }`}
                    title={confirmId === e.id ? "Click again to confirm" : "Delete"}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { CATEGORIES };