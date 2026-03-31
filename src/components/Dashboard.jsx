import { FiCalendar, FiClock, FiTrendingUp, FiTarget } from "react-icons/fi";
import { useEffect, useState } from "react";

function Dashboard({
  entries = [],
  totalHours = 0,
  remainingHours = 500,
  progressPercent = 0,
  setActivePage,
}) {
  /* ================= CONSTANTS ================= */
  const TOTAL_GOAL_HOURS = 500;
  const HOURS_PER_DAY = 8;

  const completedDays = new Set(
    entries
      .filter((e) => e && typeof e.date === "string" && e.date.length > 0)
      .map((e) => e.date),
  ).size;

  const avgHours = completedDays > 0 ? totalHours / completedDays : 0;
  const remainingDays = Math.max(remainingHours / HOURS_PER_DAY, 0);
  const isNew = entries.length === 0;

  /* ================= STATS ================= */
  const stats = [
    {
      label: "Days",
      value: completedDays,
      icon: <FiCalendar size={14} />,
      glow: "shadow-[0_0_18px_rgba(59,130,246,0.35)] border-blue-500/40",
    },
    {
      label: "Left",
      value: `${Number(remainingDays.toFixed(1))}`,
      icon: <FiTarget size={14} />,
      glow: "shadow-[0_0_18px_rgba(249,115,22,0.35)] border-orange-500/40",
    },
    {
      label: "Total",
      value: `${Number(totalHours.toFixed(1))} hrs`,
      icon: <FiClock size={14} />,
      glow: "shadow-[0_0_18px_rgba(34,211,238,0.35)] border-cyan-500/40",
    },
    {
      label: "Ave",
      value: `${Number(avgHours.toFixed(1))} hrs`,
      icon: <FiTrendingUp size={14} />,
      glow: "shadow-[0_0_18px_rgba(168,85,247,0.35)] border-purple-500/40",
    },
  ];

  /* ================= COLOR ================= */
  const getDotColor = (index, boost = 0) => {
    let baseHue;

    if (progressPercent < 25) baseHue = 0;
    else if (progressPercent < 50) baseHue = 28;
    else if (progressPercent < 75) baseHue = 90;
    else if (progressPercent < 100) baseHue = 142;
    else baseHue = 210;

    const section = Math.floor(index / 5);
    const local = (index % 5) / 4;

    const baseLightness = [26, 30, 34, 38];
    const baseSaturation = [70, 78, 86, 94];

    const lightness = baseLightness[section] + local * 4 + boost * 6;
    const saturation = baseSaturation[section] + local * 4 + boost * 4;

    return `hsl(${baseHue} ${saturation}% ${lightness}%)`;
  };

  /* ================= PROGRESS ================= */
  const filledCount = Math.max(1, Math.round((progressPercent / 100) * 20));

  /* ================= SNAKE ANIMATION ================= */
  const [pulseIndex, setPulseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % 20); // full loop always
    }, 130); // speed

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen text-white space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-bold text-white">OJT Dashboard</h2>
        <p className="text-gray-400 text-sm mt-1">
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

              /* 🔥 snake distance (one direction only) */
              const distance = (pulseIndex - i + 20) % 20;

              const trailLength = 6;

              const isActive = filled;

              let boost = 0;
              let size = 10;
              let glow = 0;

              if (isActive && distance < trailLength) {
                const t = 1 - distance / trailLength;
                const eased = t * t;

                boost = eased;
                size = 10 + eased * 2;
                glow = eased * 12;
              }

              const color = getDotColor(i, boost);

              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={size}
                  style={{
                    fill: filled ? color : "#020617",
                    filter: filled
                      ? `
    drop-shadow(0 0 ${1 + glow * 0.4}px ${color})
    drop-shadow(0 0 ${2 + glow * 0.6}px ${color})
  `
                      : "none",
                    transition: isActive ? "all 0.25s ease-out" : "none",
                  }}
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
