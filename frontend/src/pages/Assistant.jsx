import Chatbot from "../components/Chatbot";

export default function Assistant() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              AI Financial Assistant
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Live Advisor
            </span>
          </div>
          <p className="text-slate-300 text-sm mt-1">
            Personalized conversational financial intelligence powered by real-time spending telemetry
          </p>
        </div>
      </div>

      {/* ── Chatbot Interface ─────────────────────────────────────────── */}
      <Chatbot />
    </div>
  );
}