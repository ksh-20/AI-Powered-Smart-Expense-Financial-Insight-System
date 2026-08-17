import { useState, useRef, useEffect } from "react";
import api from "../api/axios";

const STARTER_PROMPTS = [
  {
    icon: "📊",
    title: "Spending Breakdown Analysis",
    prompt: "Analyze my top spending categories and highlight where I am overspending.",
  },
  {
    icon: "🎯",
    title: "50/30/20 Rule Health Check",
    prompt: "Evaluate my spending against the 50/30/20 budget framework and suggest adjustments.",
  },
  {
    icon: "⚡",
    title: "Fast Savings Recommendations",
    prompt: "What are 3 high-impact, immediate actions I can take to save money this month?",
  },
  {
    icon: "🛡️",
    title: "Emergency Fund Planning",
    prompt: "How much emergency fund should I accumulate based on my current monthly outflow?",
  },
];

export default function Chatbot() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, loading]);

  const send = async (overrideMsg = null) => {
    const textToSend = (overrideMsg !== null ? overrideMsg : message).trim();
    if (!textToSend || loading) return;

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMsgObj = {
      type: "user",
      text: textToSend,
      time: timestamp,
    };

    setChat((prev) => [...prev, userMsgObj]);
    if (overrideMsg === null) {
      setMessage("");
    }
    setLoading(true);

    try {
      const res = await api.post("/api/chatbot", { message: textToSend });
      const botMsgObj = {
        type: "bot",
        text: res.data.response || "No response received.",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setChat((prev) => [...prev, botMsgObj]);
    } catch (err) {
      console.error("Chatbot API error:", err);
      const errorMsgObj = {
        type: "bot",
        text: "I encountered an issue connecting to the advisory intelligence service. Please check your connection or try again shortly.",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setChat((prev) => [...prev, errorMsgObj]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClear = () => {
    setChat([]);
  };

  return (
    <div className="bg-slate-900/70 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col h-[640px] relative overflow-hidden">
      {/* ── Chat Header Ribbon ────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-base font-extrabold shadow-lg shadow-indigo-600/30 border border-indigo-400/30">
            ✦
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">FinAI Intelligence</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400">Context-aware financial advisor</p>
          </div>
        </div>

        {chat.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
          >
            Clear Thread
          </button>
        )}
      </div>

      {/* ── Message Thread / Conversation Area ─────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {chat.length === 0 ? (
          /* Empty State: Interactive Starter Prompt Cards */
          <div className="h-full flex flex-col justify-center max-w-xl mx-auto text-center space-y-6">
            <div>
              <span className="inline-block p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-2xl mb-3">
                💬
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">
                How can I assist your finances today?
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                Ask about spending reduction, budget optimizations, category allocations, or select a prompt below:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {STARTER_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => send(p.prompt)}
                  className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-indigo-500/40 transition-all text-xs group text-left"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span>{p.icon}</span>
                    <span className="font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {p.title}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">
                    {p.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Message List */
          chat.map((c, i) => (
            <div
              key={i}
              className={`flex gap-3 ${
                c.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {c.type === "bot" && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                  ✦
                </div>
              )}

              <div
                className={`group relative rounded-3xl p-5 max-w-[85%] sm:max-w-[75%] shadow-xl backdrop-blur-md ${
                  c.type === "user"
                    ? "bg-indigo-600 text-white rounded-br-none border border-indigo-400/30"
                    : "bg-slate-800/80 text-slate-100 rounded-bl-none border border-white/10"
                }`}
              >
                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-normal">
                  {c.text}
                </div>

                <div className="flex items-center justify-between gap-4 mt-3 pt-2 border-t border-white/10 text-[10px] text-slate-300">
                  <span>{c.time}</span>
                  {c.type === "bot" && (
                    <button
                      onClick={() => handleCopy(c.text, i)}
                      className="hover:text-white transition-colors flex items-center gap-1"
                    >
                      {copiedIndex === i ? "✓ Copied" : "Copy"}
                    </button>
                  )}
                </div>
              </div>

              {c.type === "user" && (
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                  👤
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
              ✦
            </div>
            <div className="bg-slate-800/80 border border-white/10 rounded-2xl px-5 py-3.5 flex items-center gap-3 text-xs text-slate-300">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span>FinAI is synthesizing financial intelligence…</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Bar (Pinned at bottom) ───────────────────────────────── */}
      <div className="p-4 bg-slate-950/60 border-t border-white/10 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-center gap-3"
        >
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about category budgets, expense reduction, or financial rules..."
            disabled={loading}
            className="flex-1 bg-slate-900 border border-white/15 focus:border-indigo-500 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-slate-400 outline-none transition-all shadow-inner focus:ring-2 focus:ring-indigo-500/20"
          />

          <button
            type="submit"
            disabled={!message.trim() || loading}
            className={`px-6 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              !message.trim() || loading
                ? "bg-white/5 text-slate-400 cursor-not-allowed border border-white/5"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30"
            }`}
          >
            <span>Send</span>
            <span>→</span>
          </button>
        </form>
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-2">
          <span>Press Enter to send</span>
          <span>Powered by Gemini 2.5 Flash</span>
        </div>
      </div>
    </div>
  );
}