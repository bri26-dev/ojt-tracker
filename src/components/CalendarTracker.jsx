import { useState, useEffect } from "react";
import { FiCalendar } from "react-icons/fi";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { calculateHours } from "../utils/calculateHours";

function CalendarTracker({ entries }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState({});

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  /* Fetch Holidays */
  useEffect(() => {
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
        console.error(err);
      }
    };

    fetchHolidays();
  }, [year]);

  /* Calendar Setup */
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const entryMap = {};

  entries.forEach((e) => {
    if (!entryMap[e.date]) entryMap[e.date] = [];
    entryMap[e.date].push(e);
  });

  const days = [];

  for (let i = 0; i < startDay; i++) days.push(null);

  for (let d = 1; d <= totalDays; d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({ day: d, key });
  }

  /* Monthly Stats */
  const monthEntries = entries.filter((e) => {
    const [y, m] = e.date.split("-");
    return Number(y) === year && Number(m) - 1 === month;
  });

  const totalHours = monthEntries.reduce((s, e) => s + calculateHours(e), 0);

  const daysLogged = new Set(monthEntries.map((e) => e.date)).size;

  const prev = () => setCurrentDate(new Date(year, month - 1, 1));
  const next = () => setCurrentDate(new Date(year, month + 1, 1));

  const isToday = (key) => {
    const t = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return t === key;
  };

  /* 🔥 UPDATED LOGIC */
  const getDayStatus = (list) => {
    if (!list.length) return "none";

    const hasOngoing = list.some((e) => !e.timeOut);
    const totalHours = list.reduce((s, e) => s + calculateHours(e), 0);

    if (hasOngoing) return "ongoing";
    if (totalHours >= 8) return "complete";
    if (totalHours > 0) return "partial";

    return "none";
  };

  const getBg = (status, holiday) => {
    if (holiday) return "bg-pink-500/20";
    if (status === "complete") return "bg-green-500/20";
    if (status === "ongoing") return "bg-green-500/20"; // ✅ same as complete
    if (status === "partial") return "bg-orange-400/20";
    return "";
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-white flex items-center gap-2">
        <FiCalendar />
        Calendar
      </h2>
      <p className="text-gray-400 text-sm mt-1">Monitor your daily logs</p>

      <div className="bg-neutral-900 p-5 rounded-xl mt-4">
        {/* Header */}
        <div className="flex justify-between mb-6">
          <button onClick={prev}>
            <ChevronLeft />
          </button>

          <h3 className="font-semibold">
            {currentDate.toLocaleString("default", { month: "long" })} {year}
          </h3>

          <button onClick={next}>
            <ChevronRight />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6 text-sm">
          <Stat
            label="Total Hours"
            value={`${Number(totalHours.toFixed(1)).toString()} hrs`}
          />
          <Stat label="Days Logged" value={daysLogged} />
          <Stat
            label="Average"
            value={
              daysLogged
                ? `${Number((totalHours / daysLogged).toFixed(1).toString())} hrs`
                : "0"
            }
          />
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 text-xs text-gray-500 mb-2 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((item, i) => {
            if (!item) return <div key={i} />;

            const list = entryMap[item.key] || [];

            const hours = list.reduce((s, e) => s + calculateHours(e), 0);

            const holiday = holidays[item.key];

            const status = getDayStatus(list);

            const todayRing = isToday(item.key) ? "ring-2 ring-blue-500" : "";

            return (
              <div
                key={item.key}
                className={`border border-neutral-800 h-24 p-2 rounded ${getBg(status, holiday)} ${todayRing}`}
              >
                <p className="text-xs text-right font-medium">{item.day}</p>

                <div className="mt-6 text-xs">
                  {/* 🔥 ONGOING */}
                  {status === "ongoing" && (
                    <p className="text-orange-400 font-medium truncate break-words">
                      Ongoing
                    </p>
                  )}

                  {/* COMPLETED / PARTIAL HOURS */}
                  {status !== "ongoing" && hours > 0 && (
                    <p
                      className={
                        hours >= 8 ? "text-green-400" : "text-orange-400"
                      }
                    >
                      {hours.toFixed(1)} hrs
                    </p>
                  )}

                  {holiday && (
                    <p className="text-pink-400 text-[10px] truncate break-words">
                      {holiday}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-6 text-xs text-gray-400">
          <Legend color="bg-green-500/40" label="Complete" />
          <Legend color="bg-orange-400/40" label="Partial" />
          <Legend color="bg-pink-500/40" label="Holiday" />
          <Legend color="ring-2 ring-blue-500" label="Today" ring />
          <Legend color="bg-neutral-700" label="No Entry" />
        </div>
      </div>
    </div>
  );
}

/* UI */

const Stat = ({ label, value }) => (
  <div className="bg-neutral-800 p-3 rounded-lg">
    <p className="text-xs text-gray-400">{label}</p>
    <p className="font-semibold">{value}</p>
  </div>
);

const Legend = ({ color, label, ring }) => (
  <div className="flex items-center gap-2">
    <span
      className={`w-3 h-3 rounded ${ring ? "" : color} ${ring ? color : ""}`}
    />
    {label}
  </div>
);

export default CalendarTracker;
