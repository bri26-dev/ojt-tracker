import {
  FiHome,
  FiCalendar,
  FiClock,
  FiTrendingUp,
  FiTarget,
  FiCheckSquare,
  FiLayers,
} from "react-icons/fi";
import { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";

function Dashboard({
  entries = [],
  totalHours = 0,
  setActivePage,
  requiredHours = 500,
}) {
  const HOURS_PER_DAY = 8;

  /* ✅ SINGLE SOURCE OF TRUTH */
  const goalHours = useMemo(() => {
    const parsed = Number(requiredHours);
    return parsed > 0 ? parsed : 500;
  }, [requiredHours]);

  const remainingHours = useMemo(() => {
    return Math.max(goalHours - totalHours, 0);
  }, [goalHours, totalHours]);

  const progressPercent = useMemo(() => {
    return Math.min((totalHours / goalHours) * 100, 100);
  }, [totalHours, goalHours]);

  const [holidays, setHolidays] = useState({});

  useEffect(() => {
    const year = new Date().getFullYear();

    const fetchHolidays = async () => {
      try {
        const res = await fetch(
          `https://date.nager.at/api/v3/PublicHolidays/${year}/PH`,
        );
        const data = await res.json();

        const map = {};
        data.forEach((h) => {
          map[h.date] = h.localName || h.name;
        });

        setHolidays(map);
      } catch (err) {
        console.error("Failed to fetch holidays:", err);
      }
    };

    fetchHolidays();
  }, []);

  /* ✅ SHARED HOUR CALCULATOR */
  const calculateHours = (entry) => {
    if (!entry?.timeIn || !entry?.timeOut) return 0;

    const [inH, inM] = entry.timeIn.split(":").map(Number);
    const [outH, outM] = entry.timeOut.split(":").map(Number);

    let hrs = outH + outM / 60 - (inH + inM / 60);

    if (inH < 13 && outH > 12) hrs -= 1;

    return Math.max(hrs, 0);
  };

  const completedDays = useMemo(() => {
    return new Set(entries.filter((e) => e?.date).map((e) => e.date)).size;
  }, [entries]);

  const avgHours = useMemo(() => {
    return completedDays ? totalHours / completedDays : 0;
  }, [completedDays, totalHours]);

  const remainingDays = useMemo(() => {
    return Math.max(remainingHours / HOURS_PER_DAY, 0);
  }, [remainingHours]);

  const isNew = entries.length === 0;

  const entriesByDate = useMemo(() => {
    const map = {};
    entries.forEach((e) => {
      if (!e?.date) return;
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [entries]);

  const streak = useMemo(() => {
    if (!entries.length) return 0;

    const datesSet = new Set(entries.map((e) => e.date));
    let count = 0;
    let current = new Date();

    while (true) {
      const key = current.toISOString().split("T")[0];

      if (datesSet.has(key)) {
        count++;
        current.setDate(current.getDate() - 1);
      } else {
        break;
      }
    }

    return count;
  }, [entries]);

  const recentEntries = useMemo(() => {
    return [...entries]
      .filter((e) => e?.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7);
  }, [entries]);

  const formatDate = (date) => {
    if (!date) return "--";

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "--";

    const [h, m] = time.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;

    return `${hour12}:${String(m).padStart(2, "0")}${period.toLowerCase()}`;
  };

  const estimatedFinishDate = useMemo(() => {
    if (!entries.length || avgHours <= 0) return null;

    let remaining = remainingHours;
    let current = new Date();

    while (remaining > 0) {
      current.setDate(current.getDate() + 1);

      const key = current.toISOString().split("T")[0];
      const day = current.getDay();

      const isWeekend = day === 0 || day === 6;
      const isHoliday = holidays[key];

      if (isWeekend || isHoliday) continue;

      remaining -= avgHours;
    }

    return new Date(current);
  }, [entries, avgHours, remainingHours, holidays]);

  /* ================= MONTHLY ================= */
  const monthlyData = useMemo(() => {
    const map = {};

    entries.forEach((e) => {
      if (!e?.date) return;

      const d = new Date(e.date);
      if (isNaN(d)) return;

      const key = `${d.getFullYear()}-${d.getMonth()}`;

      if (!map[key]) {
        map[key] = {
          month: d.toLocaleString("default", { month: "short" }),
          hours: 0,
          date: new Date(d.getFullYear(), d.getMonth(), 1),
        };
      }

      map[key].hours += calculateHours(e);
    });

    return Object.values(map)
      .sort((a, b) => a.date - b.date) // ✅ ensure correct order
      .slice(-6)
      .map((m) => ({
        name: m.month,
        hours: Number(m.hours.toFixed(1)),
      }));
  }, [entries]);

  /* ================= 7 DAY TREND ================= */
  const trendData = useMemo(() => {
    const today = new Date();

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (6 - i)); // last 7 days ending today

      const key = d.toISOString().split("T")[0];

      const total = (entriesByDate[key] || []).reduce(
        (sum, e) => sum + calculateHours(e),
        0,
      );

      return {
        day: d.toLocaleDateString("en-US", { weekday: "short" }), // Mon, Tue...
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        hours: Number(total.toFixed(1)),
      };
    });
  }, [entriesByDate]);

  const getTrend = (data) => {
    if (!data || data.length < 2) return "No data";

    const first = data[0].hours;
    const last = data[data.length - 1].hours;

    const diff = last - first;

    // also check average slope
    const avg = data.reduce((sum, d) => sum + d.hours, 0) / data.length;

    if (diff > 1) return "↗ increasing";
    if (diff < -1) return "↘ declining";

    // fallback subtle detection
    if (last > avg) return "↗ slightly improving";
    if (last < avg) return "↘ slightly declining";

    return "→ stable";
  };

  /* ================= PRODUCTIVITY ================= */
  const productivityScore = useMemo(() => {
    const completed = entries.filter((e) => e?.timeOut);

    const fullDays = completed.filter((e) => calculateHours(e) >= 8).length;

    return completed.length
      ? Math.round((fullDays / completed.length) * 100)
      : 0;
  }, [entries]);

  /* ================= TASK LOAD ================= */
  const taskLoad = useMemo(() => {
    const validTasks = entries.reduce((sum, entry) => {
      const count =
        entry?.tasks?.filter(
          (task) =>
            task &&
            (task.task?.trim() ||
              task.start ||
              task.end ||
              task.remarks?.trim()),
        ).length || 0;

      return sum + count;
    }, 0);

    return {
      totalTasks: validTasks,
      avgTasks: completedDays ? (validTasks / completedDays).toFixed(1) : "0.0",
    };
  }, [entries, completedDays]);

  /* ================= STATS ================= */
  const stats = [
    {
      label: "Days",
      value: completedDays,
      icon: <FiCalendar size={14} />,
      card: "from-blue-500/10 to-cyan-500/10 border-blue-500/30",
      text: "text-blue-300",
      glow: "shadow-[0_0_20px_rgba(59,130,246,0.18)]",
    },
    {
      label: "Left",
      value: `${Number(remainingDays.toFixed(1))}`,
      icon: <FiTarget size={14} />,
      card: "from-orange-500/10 to-amber-500/10 border-orange-500/30",
      text: "text-orange-300",
      glow: "shadow-[0_0_20px_rgba(249,115,22,0.18)]",
    },
    {
      label: "Total",
      value: `${Number(totalHours.toFixed(1))} hrs`,
      icon: <FiClock size={14} />,
      card: "from-cyan-500/10 to-sky-500/10 border-cyan-500/30",
      text: "text-cyan-300",
      glow: "shadow-[0_0_20px_rgba(34,211,238,0.18)]",
    },
    {
      label: "Ave",
      value: `${Number(avgHours.toFixed(1))} hrs`,
      icon: <FiTrendingUp size={14} />,
      card: "from-violet-500/10 to-fuchsia-500/10 border-violet-500/30",
      text: "text-violet-300",
      glow: "shadow-[0_0_20px_rgba(139,92,246,0.18)]",
    },
  ];

  /* ================= PROGRESS DOTS ================= */
  const getDotColor = (index, boost = 0) => {
    let hue;

    if (progressPercent < 25)
      hue = 0; // red
    else if (progressPercent < 50)
      hue = 28; // orange
    else if (progressPercent < 75)
      hue = 190; // cyan
    else hue = 260; // violet

    const lightness = 18 + boost * 10;
    const saturation = 70 + boost * 20;

    return {
      fill: `hsl(${hue} ${saturation}% ${lightness}%)`,
      glow: `hsl(${hue} ${Math.min(saturation + 10, 100)}% ${Math.min(
        lightness + 25,
        70,
      )}%)`,
    };
  };

  const filledCount = Math.max(1, Math.round((progressPercent / 100) * 20));

  /* ================= SNAKE ================= */
  const [pulseIndex, setPulseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % 20);
    }, 130);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen text-white space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
          <FiHome />
          OJT Dashboard
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Track your internship journey
        </p>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-4 gap-2">
        {stats.map((card, i) => (
          <div
            key={i}
            className={`
        relative overflow-hidden
        rounded-xl border p-3
        bg-gradient-to-br ${card.card}
        ${card.glow}
      `}
          >
            {/* glow orb */}
            <div
              className={`absolute -top-5 -right-5 w-16 h-16 rounded-full blur-2xl opacity-70 ${card.text.replace(
                "text-",
                "bg-",
              )}`}
            />

            {/* content */}
            <div className="relative z-10">
              <div className={`flex items-center justify-between ${card.text}`}>
                <p className="text-[11px]">{card.label}</p>
                {card.icon}
              </div>

              <h3 className="text-base font-bold mt-2 text-white">
                {card.value}
              </h3>
            </div>

            {/* glowing animated border */}
            <div className="absolute inset-0 rounded-xl border border-white/5 pointer-events-none" />
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
                    fill: filled ? color.fill : "#0a0a0a",
                    stroke: filled ? color.glow : "#111827",
                    strokeWidth: filled ? 1.4 : 1,
                    filter: filled
                      ? `
      drop-shadow(0 0 ${2 + glow * 0.4}px ${color.glow})
      drop-shadow(0 0 ${4 + glow * 0.6}px ${color.glow})
    `
                      : "none",
                    transition: "all 0.25s ease-out",
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
    mt-5 mb-5 w-[34%]
    relative overflow-hidden
    rounded-2xl py-3
    bg-gradient-to-br from-cyan-500/10 to-violet-500/10
    border border-cyan-400/40
    text-sm font-semibold
    shadow-[0_0_25px_rgba(34,211,238,0.22)]
    hover:scale-[1.03]
    hover:shadow-[0_0_35px_rgba(34,211,238,0.35)]
    active:scale-95
    transition-all duration-300
  "
        >
          <span className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-violet-400/10 animate-pulse" />
          <span className="absolute inset-0 rounded-2xl border border-cyan-300/20 animate-pulse" />

          <span className="relative z-10">
            {isNew ? "✨ Start Journey" : "➕ Add Entry"}
          </span>
        </button>
      </div>

      {/* 🔥 STREAK + PROJECTION (PREMIUM) */}
      <div className="space-y-4 ">
        <div className="grid grid-cols-2 gap-2 ">
          {/* 🔥 STREAK CARD */}
          <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-4 shadow-[0_0_25px_rgba(249,115,22,0.25)]">
            {/* glow orb */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-500/20 blur-3xl rounded-full animate-pulse" />

            {/* header */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-orange-300">Streak</p>
              <div className="text-orange-400 text-lg animate-bounce">🔥</div>
            </div>

            {/* count */}
            <h3 className="text-2xl font-bold mt-2 text-white tracking-tight">
              {Math.min(streak, 5)}
              <span className="text-sm text-orange-300 ml-1">days</span>
            </h3>

            {/* message */}
            <p className="text-[11px] text-orange-200/70 mt-1">
              {streak === 0
                ? "Start your streak today"
                : streak <= 2
                  ? "Getting started — keep it up!"
                  : streak <= 4
                    ? "On fire! Almost full streak!"
                    : "🔥 Full streak! Amazing consistency!"}
            </p>

            {/* 🔥 streak dashes */}
            <div className="mt-3 flex justify-between gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const filled = i < Math.min(streak, 5);
                const boost = filled ? (i + 1) / 5 : 0; // gradual fire intensity

                return (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full transition-all duration-300`}
                    style={{
                      backgroundColor: filled
                        ? `hsl(${30 - boost * 10}, ${60 + boost * 20}%, ${30 + boost * 30}%)`
                        : "#1f2937",
                      boxShadow: filled
                        ? `0 0 ${4 + boost * 10}px hsl(${30 - boost * 10}, ${60 + boost * 20}%, ${30 + boost * 30}%)`
                        : "none",
                    }}
                  />
                );
              })}
            </div>
          </div>
          {/* 🎯 EST FINISH CARD */}
          <div
            className="
    relative overflow-hidden
    bg-gradient-to-br from-blue-500/10 to-purple-500/10
    border border-blue-500/30
    rounded-xl p-4
    shadow-[0_0_25px_rgba(59,130,246,0.25)]
  "
          >
            {/* glow */}
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />

            <div className="flex items-center justify-between">
              <p className="text-xs text-blue-300">Est. Finish</p>

              {/* 🎯 icon */}
              <div className="text-blue-400 text-lg animate-pulse">🎯</div>
            </div>

            <h3 className="text-xl font-bold mt-2 text-white tracking-tight">
              {estimatedFinishDate ? formatDate(estimatedFinishDate) : "--"}
            </h3>

            <p className="text-[11px] text-blue-200/70 mt-1">
              {estimatedFinishDate
                ? `At ~${avgHours.toFixed(1)} hrs/day pace`
                : "Log more data to predict finish"}
            </p>

            {/* 📊 mini progress indicator */}
            <div className="mt-3 flex items-center gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`
            h-1 flex-1 rounded
            ${
              i < Math.min(Math.floor(progressPercent / 10), 10)
                ? "bg-gradient-to-r from-blue-400 to-purple-500"
                : "bg-neutral-800"
            }
          `}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 🧠 TASK LOAD */}
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/30 rounded-2xl p-4 shadow-[0_0_25px_rgba(139,92,246,0.18)]">
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-violet-400/20 blur-3xl rounded-full animate-pulse" />

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold">Task Load</p>
            <div className="text-lg animate-bounce">🧠</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3">
              <div className="flex items-center justify-center gap-2 text-violet-300">
                <FiCheckSquare size={14} />
                <p className="text-[10px]">Total Tasks</p>
              </div>
              <p className="text-xl font-bold text-center mt-2">
                {taskLoad.totalTasks}
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3">
              <div className="flex items-center justify-center gap-2 text-fuchsia-300">
                <FiLayers size={14} />
                <p className="text-[10px]">Daily Avg</p>
              </div>
              <p className="text-xl font-bold text-center mt-2">
                {taskLoad.avgTasks}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-violet-200/70 mt-3">
            {Number(taskLoad.avgTasks) >= 5
              ? "Heavy daily workload"
              : Number(taskLoad.avgTasks) >= 3
                ? "Balanced daily workload"
                : "Light task distribution"}
          </p>
        </div>

        {/* 📊 MONTHLY ACTIVITY */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/30 rounded-2xl p-4 shadow-[0_0_25px_rgba(99,102,241,0.16)]">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-indigo-400/20 blur-3xl rounded-full animate-pulse" />
          {/* HEADER */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold">Monthly Analytics</p>
              <p className="text-[11px] text-indigo-200/70 mt-1">
                Performance from your first logged month to latest
              </p>
            </div>
            <div className="text-lg">📊</div>
          </div>
          {/* TOP META */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-2 text-center">
              <p className="text-[10px] text-gray-400">Range</p>
              <p className="text-xs font-semibold text-indigo-300">
                {monthlyData[0]?.name || "--"} →{" "}
                {monthlyData[monthlyData.length - 1]?.name || "--"}
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-2 text-center">
              <p className="text-[10px] text-gray-400">Peak</p>
              <p className="text-xs font-semibold text-violet-300">
                {Math.max(...monthlyData.map((m) => m.hours), 0)}h
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-2 text-center">
              <p className="text-[10px] text-gray-400">Average</p>
              <p className="text-xs font-semibold text-fuchsia-300">
                {monthlyData.length
                  ? (
                      monthlyData.reduce((sum, m) => sum + m.hours, 0) /
                      monthlyData.length
                    ).toFixed(1)
                  : 0}
                h
              </p>
            </div>
          </div>
          {/* CHART */}
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={monthlyData}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }} // small left margin
            >
              {/* Gradient */}
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
                </linearGradient>
              </defs>

              {/* Grid */}
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#262626"
                vertical={false}
              />

              {/* X Axis */}
              <XAxis
                dataKey="name"
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                padding={{ left: 10, right: 10 }}
              />

              {/* Y Axis */}
              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={30} // reserve space for numbers
              />

              {/* Tooltip */}
              <Tooltip
                cursor={{ fill: "rgba(99,102,241,0.08)" }}
                contentStyle={{
                  background: "#111827",
                  border: "1px solid #374151",
                  borderRadius: "12px",
                }}
                formatter={(value) => [`${value} hrs`, "Hours"]}
              />

              {/* Bars */}
              <Bar
                dataKey="hours"
                barSize={22}
                radius={[4, 4, 0, 0]} // rounded top corners
                fill="url(#barGradient)"
              />
            </BarChart>
          </ResponsiveContainer>
          {/* BOTTOM INSIGHTS */}
          <div className="mt-4 flex justify-between items-center text-[11px]">
            <span className="text-indigo-200/70">
              Total logged:{" "}
              {monthlyData.reduce((sum, m) => sum + m.hours, 0).toFixed(1)} hrs
            </span>

            <span className="text-violet-300">{getTrend(monthlyData)}</span>
          </div>
        </div>

        {/* 📈 7 DAY FLOW */}
        <div className="relative overflow-hidden bg-gradient-to-br from-sky-500/10 to-cyan-500/10 border border-sky-500/30 rounded-2xl p-4 shadow-[0_0_25px_rgba(14,165,233,0.16)]">
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-sky-400/20 blur-3xl rounded-full animate-pulse" />

          {/* HEADER */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold">7-Day Flow</p>
              <p className="text-[11px] text-sky-200/70 mt-1">
                Recent momentum and pace tracking
              </p>
            </div>
            <div className="text-lg">📈</div>
          </div>

          {/* META PILLS */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-2 text-center">
              <p className="text-[10px] text-gray-400">Total</p>
              <p className="text-xs font-semibold text-sky-300">
                {trendData.reduce((sum, d) => sum + d.hours, 0).toFixed(1)}h
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-2 text-center">
              <p className="text-[10px] text-gray-400">Best</p>
              <p className="text-xs font-semibold text-cyan-300">
                {Math.max(...trendData.map((d) => d.hours), 0)}h
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-2 text-center">
              <p className="text-[10px] text-gray-400">Average</p>
              <p className="text-xs font-semibold text-blue-300">
                {(trendData.reduce((sum, d) => sum + d.hours, 0) / 7).toFixed(
                  1,
                )}
                h
              </p>
            </div>
          </div>

          {/* CHART */}
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.04} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#262626"
                vertical={false}
              />

              <XAxis
                dataKey="day"
                interval={0}
                padding={{ left: 10, right: 10 }} // ✅ prevents clipping
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid #374151",
                  borderRadius: "12px",
                }}
                formatter={(value) => [`${value} hrs`, "Hours"]}
              />

              <Area
                type="monotone"
                dataKey="hours"
                stroke="#38bdf8"
                strokeWidth={4}
                fill="url(#trendGradient)"
                activeDot={{
                  r: 6,
                  fill: "#38bdf8",
                  stroke: "#0f172a",
                  strokeWidth: 2,
                }}
                style={{
                  filter: "drop-shadow(0 0 8px rgba(56,189,248,0.45))",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* FOOTER ANALYTICS */}
          <div className="mt-4 flex justify-between items-center text-[11px]">
            <span className="text-sky-200/70">
              {trendData.filter((d) => d.hours >= 8).length} productive days
            </span>

            <span className="text-cyan-300">{getTrend(trendData)}</span>
          </div>
        </div>

        {/* 🎯 PRODUCTIVITY */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-2xl p-4 shadow-[0_0_25px_rgba(16,185,129,0.18)]">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-400/20 blur-3xl rounded-full animate-pulse" />

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-white">
              Productivity Score
            </p>
            <div className="text-lg animate-pulse">⚡</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative w-32 h-20">
              <svg viewBox="0 0 120 70" className="w-full h-full">
                {/* background arc */}
                <path
                  d="M10 60 A50 50 0 0 1 110 60"
                  fill="none"
                  stroke="#1f2937"
                  strokeWidth="10"
                  // strokeLinecap="round"
                />

                {/* progress arc */}
                <path
                  d="M10 60 A50 50 0 0 1 110 60"
                  fill="none"
                  stroke="url(#productivityGradient)"
                  strokeWidth="10"
                  pathLength="100"
                  strokeDasharray="100"
                  strokeDashoffset={100 - productivityScore}
                  className="transition-all duration-700"
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(16,185,129,0.45))",
                  }}
                />

                <defs>
                  <linearGradient
                    id="productivityGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>

              {/* center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
                <span className="text-2xl mt-4 font-bold">
                  {productivityScore}%
                </span>
                <span className="text-[10px] text-emerald-300">Efficiency</span>
              </div>
            </div>

            <p className="text-xs text-emerald-200/80 mt-4">
              {productivityScore >= 85
                ? "Excellent consistency"
                : productivityScore >= 60
                  ? "Good work rhythm"
                  : "Try aiming for more full days"}
            </p>
          </div>
        </div>

        {/* ⚡ CONSISTENCY */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-4 shadow-[0_0_25px_rgba(34,197,94,0.16)]">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-green-400/20 blur-3xl rounded-full animate-pulse" />

          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm font-semibold">Consistency Heatmap</p>
              <p className="text-[11px] text-green-200/70 mt-1">
                Your last 30 days activity intensity
              </p>
            </div>
            <div className="text-lg animate-pulse">⚡</div>
          </div>

          <div className="grid grid-cols-10 gap-[4px]">
            {Array.from({ length: 30 }).map((_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (29 - i));
              const key = date.toISOString().split("T")[0];

              const total = (entriesByDate[key] || []).reduce(
                (sum, e) => sum + calculateHours(e),
                0,
              );

              let level = 0;
              if (total > 0 && total < 4) level = 1;
              else if (total >= 4 && total < 8) level = 2;
              else if (total >= 8) level = 3;

              const colors = [
                "bg-neutral-800",
                "bg-green-900",
                "bg-green-600",
                "bg-green-400",
              ];

              return (
                <div
                  key={i}
                  title={`${key} • ${total.toFixed(1)} hrs`}
                  className={`h-4 rounded-sm ${colors[level]} hover:scale-125 transition-all duration-300 cursor-pointer`}
                />
              );
            })}
          </div>

          {/* better legend */}
          <div className="flex items-center justify-between mt-4 text-[10px]">
            <span className="text-gray-400">Low</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-neutral-800 rounded-sm" />
              <div className="w-3 h-3 bg-green-900 rounded-sm" />
              <div className="w-3 h-3 bg-green-600 rounded-sm" />
              <div className="w-3 h-3 bg-green-400 rounded-sm" />
            </div>
            <span className="text-green-300">High</span>
          </div>
        </div>

        {/* 📅 RECENT ACTIVITY */}
        <div className="relative overflow-hidden bg-gradient-to-br from-sky-500/10 to-cyan-500/10 border border-sky-500/30 rounded-2xl p-4 shadow-[0_0_25px_rgba(14,165,233,0.16)]">
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-sky-400/20 blur-3xl rounded-full animate-pulse" />

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold">Activity Timeline</p>
              <p className="text-[11px] text-sky-200/70 mt-1">
                Your most recent internship logs
              </p>
            </div>
            <div className="text-lg animate-pulse">📅</div>
          </div>

          <div className="relative pl-5 space-y-4">
            <div className="absolute left-1.5 top-2 bottom-2 w-[2px] bg-gradient-to-b from-sky-400/40 via-cyan-400/30 to-sky-400/10" />

            {recentEntries.map((e) => {
              const completed = !!e.timeOut;

              return (
                <div
                  key={e.id}
                  className="relative flex items-start gap-3 group"
                >
                  <div
                    className={`w-3 h-3 rounded-full mt-1 ${
                      completed
                        ? "bg-green-400 shadow-[0_0_12px_rgba(34,197,94,0.8)]"
                        : "bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.8)]"
                    }`}
                  />

                  <div className="flex-1 bg-white/5 backdrop-blur-md border rounded-xl px-3 py-3 border border-white/10 hover:border-sky-400/20 hover:-translate-y-[1px] transition-all">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold">
                        {new Date(e.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>

                      <span
                        className={`text-[10px] px-2 py-1 rounded-full ${
                          completed
                            ? "bg-green-500/10 text-green-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {completed ? "Completed" : "Ongoing"}
                      </span>
                    </div>

                    {e.timeIn && e.timeOut && (
                      <p className="text-[11px] text-gray-400 mt-2">
                        ⏰ {formatTime(e.timeIn)} - {formatTime(e.timeOut)}
                      </p>
                    )}
                    <p
                      className={`text-[11px] mt-1 ${
                        calculateHours(e) >= 8
                          ? "text-green-400"
                          : calculateHours(e) > 0
                            ? "text-orange-400"
                            : "text-gray-400"
                      }`}
                    >
                      {calculateHours(e).toFixed(1)} hrs logged
                    </p>
                  </div>
                </div>
              );
            })}
            <p className="text-[11px] text-sky-200/60 mt-4 text-center">
              Showing your latest 7 logs • Full history available in Journal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
