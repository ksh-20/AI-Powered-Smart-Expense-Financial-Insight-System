export default function Card({ title, value, icon, color = "indigo" }) {
  const glowColors = {
    indigo: "from-indigo-500/20 to-indigo-500/0 border-indigo-500/20",
    violet: "from-violet-500/20 to-violet-500/0 border-violet-500/20",
    cyan: "from-cyan-500/20 to-cyan-500/0 border-cyan-500/20",
    emerald: "from-emerald-500/20 to-emerald-500/0 border-emerald-500/20",
  };

  return (
    <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-xl relative overflow-hidden group hover:border-indigo-500/40 transition-all">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${glowColors[color] || glowColors.indigo} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`} />
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          {title}
        </h2>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <p className="text-2xl md:text-3xl font-extrabold text-white mt-2 font-mono tracking-tight">
        {value}
      </p>
    </div>
  );
}