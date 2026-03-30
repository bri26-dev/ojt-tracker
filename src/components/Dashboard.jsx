import { FiCalendar, FiClock, FiTrendingUp, FiTarget } from "react-icons/fi";

function Dashboard({
  entries = [],
  totalHours = 0,
  remainingHours = 500,
  progressPercent = 0,
  setActivePage,
}) {
  const GOAL_DAYS = 62.5; // 🔥 500 / 8

  /* 🔥 DAYS LOGGED */
  const completedDays = new Set(
    entries
      .filter((e) => e && typeof e.date === "string" && e.date.length > 0)
      .map((e) => e.date),
  ).size;

  /* 🔥 AVERAGE */
  const avgHours = completedDays > 0 ? totalHours / completedDays : 0;

  /* 🔥 DAYS LEFT BASED ON GOAL */
  const remainingDays = Math.max(Math.ceil(GOAL_DAYS - completedDays), 0);

  const isNew = entries.length === 0;

  const stats = [
    {
      label: "Days",
      value: completedDays,
      icon: <FiCalendar size={14} />,
      glow: "shadow-[0_0_18px_rgba(59,130,246,0.35)] border-blue-500/40",
    },
    {
      label: "Left",
      value: `${Number(remainingDays.toFixed(1)).toString()}`,
      icon: <FiTarget size={14} />,
      glow: "shadow-[0_0_18px_rgba(249,115,22,0.35)] border-orange-500/40",
    },
    {
      label: "Total",
      value: `${Number(totalHours.toFixed(1)).toString()} hrs`,
      icon: <FiClock size={14} />,
      glow: "shadow-[0_0_18px_rgba(34,211,238,0.35)] border-cyan-500/40",
    },
    {
      label: "Ave",
      value: `${Number(avgHours.toFixed(1)).toString()} hrs`,
      icon: <FiTrendingUp size={14} />,
      glow: "shadow-[0_0_18px_rgba(168,85,247,0.35)] border-purple-500/40",
    },
  ];

  /* 🔥 STATIC COLOR */
  const getDotColor = (index) => {
    const ratio = index / 19;

    if (progressPercent < 25) return `hsl(0 85% ${22 + ratio * 28}%)`;
    if (progressPercent < 50) return `hsl(28 95% ${28 + ratio * 25}%)`;
    if (progressPercent < 75) return `hsl(90 80% ${28 + ratio * 25}%)`;
    if (progressPercent < 100) return `hsl(142 75% ${28 + ratio * 25}%)`;

    return `hsl(210 90% ${30 + ratio * 25}%)`;
  };

  const filledCount = Math.round((progressPercent / 100) * 20);

  return (
    <div className="min-h-screen text-white p-3 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">OJT Dashboard</h1>
        <p className="text-neutral-400 text-sm">
          Track your internship journey
        </p>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-4 gap-2">
        {stats.map((card, i) => (
          <div
            key={i}
            className={`rounded-lg border bg-neutral-900/95 backdrop-blur-xl p-3 ${card.glow}`}
          >
            <div className="flex items-center justify-between text-neutral-400">
              <p className="text-[12px] truncate">{card.label}</p>
              {card.icon}
            </div>

            <h3 className="text-base font-bold mt-2">{card.value}</h3>
          </div>
        ))}
      </div>

      {/* PROGRESS */}
      <div className="flex flex-col items-center">
        <div className="relative w-90 h-90 flex items-center justify-center">
          <div className="absolute w-40 h-40 rounded-full bg-green-500/10 blur-3xl" />

          <svg viewBox="10 10 200 200" className="w-full h-full">
            {Array.from({ length: 20 }).map((_, i) => {
              const offset = -Math.PI / 2.5;
              const angle = (i / 20) * 2 * Math.PI + offset;

              const radius = 80;

              const x = 110 + radius * Math.cos(angle);
              const y = 110 + radius * Math.sin(angle);

              const filled = i < filledCount;

              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="10"
                  style={{
                    fill: filled ? getDotColor(i) : "#1e293b",
                    filter: filled
                      ? "drop-shadow(0 0 10px rgba(255,255,255,0.15))"
                      : "none",
                  }}
                  className="transition-all duration-700"
                />
              );
            })}
          </svg>

          {/* CENTER */}
          <div className="absolute text-center">
            <p className="text-5xl font-semibold">
              {Math.round(progressPercent)}%
            </p>
            <p className="text-md text-neutral-400 mt-1">
              {remainingHours.toFixed(0)} hrs remaining
            </p>
          </div>
        </div>

        {/* BUTTON */}
        <button
          onClick={() => setActivePage("journal")}
          className="
            mt-4 w-[55%]
            flex items-center justify-center gap-2
            bg-gradient-to-r from-blue-500 to-purple-500
            py-3 rounded-xl text-sm font-semibold
            shadow-[0_0_20px_rgba(99,102,241,0.5)]
            hover:scale-[1.03] active:scale-95 transition
          "
        >
          {isNew ? "Get Started" : "Add Entry"}
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
