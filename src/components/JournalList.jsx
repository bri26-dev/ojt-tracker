import React, { useState } from "react";
import {
  Copy,
  Check,
  RefreshCw,
  Calendar,
  CalendarDays,
  CalendarRange,
  Layers,
} from "lucide-react";

/* ================= HELPERS ================= */

const calculateHours = (entry) => {
  if (!entry.timeIn || !entry.timeOut) return 0;

  const [inH, inM] = entry.timeIn.split(":").map(Number);
  const [outH, outM] = entry.timeOut.split(":").map(Number);

  const start = new Date();
  start.setHours(inH, inM, 0);

  const end = new Date();
  end.setHours(outH, outM, 0);

  let hours = (end - start) / (1000 * 60 * 60);

  const lunchStart = new Date();
  lunchStart.setHours(12, 0, 0);

  const lunchEnd = new Date();
  lunchEnd.setHours(13, 0, 0);

  if (start < lunchEnd && end > lunchStart) hours -= 1;

  return Math.max(hours, 0);
};

const formatTo12Hour = (time) => {
  if (!time) return "";
  const [hour, minute] = time.split(":").map(Number);
  const ampm = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minute.toString().padStart(2, "0")} ${ampm}`;
};

/* ================= GROUPING ================= */

const groupBy = (entries, type) => {
  const groups = {};

  entries.forEach((entry) => {
    const date = new Date(entry.date);
    let key = "";

    if (type === "daily") key = date.toDateString();

    if (type === "weekly") {
      const firstDay = new Date(date.getFullYear(), 0, 1);
      const pastDays = Math.floor((date - firstDay) / 86400000);
      const weekNumber = Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
      key = `${date.getFullYear()}-W${weekNumber}`;
    }

    if (type === "monthly") {
      key = date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
    }

    if (type === "overall") key = "overall";

    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  });

  return groups;
};

const getDateRange = (entries, type = "weekly") => {
  const dates = entries.map((e) => new Date(e.date)).sort((a, b) => a - b);
  const start = dates[0];
  const end = dates[dates.length - 1];

  if (type === "daily") {
    return start.toLocaleDateString("default", {
      month: "short",
      day: "numeric",
    });
  }

  return `${start.toLocaleDateString("default", {
    month: "short",
    day: "numeric",
  })} – ${end.toLocaleDateString("default", {
    month: "short",
    day: "numeric",
  })}`;
};

/* ================= NARRATIVE WITH NOTES ================= */

const generateNarrativeWithNotes = (entries, summaryType = "weekly") => {
  const activities = [];
  const notes = [];

  entries.forEach((entry) => {
    entry.tasks?.forEach((t) => {
      if (t.task?.trim()) activities.push(t.task.trim());
    });

    if (entry.notes?.trim()) notes.push(entry.notes.trim());
  });

  const uniqueActivities = [...new Set(activities)];
  const uniqueNotes = [...new Set(notes)];

  // Main narrative
  let narrative = "";
  if (!uniqueActivities.length) {
    narrative = "No activities were recorded during this period.";
  } else {
    switch (summaryType) {
      case "daily":
        narrative = `Today, I focused on ${uniqueActivities
          .slice(0, 5)
          .join(", ")
          .toLowerCase()}. It was a productive day during my internship.`;
        break;
      case "weekly":
        narrative = `This week, I engaged in ${uniqueActivities
          .slice(0, 6)
          .join(", ")
          .toLowerCase()}. These activities helped me enhance my skills and gain practical experience.`;
        break;
      case "monthly":
        narrative = `Throughout this month, I worked on ${uniqueActivities
          .slice(0, 8)
          .join(", ")
          .toLowerCase()}. This period allowed me to consolidate my learning and contribute effectively to my tasks.`;
        break;
      case "overall":
        narrative = `Over the course of this internship, I participated in ${uniqueActivities
          .join(", ")
          .toLowerCase()}. These experiences have significantly contributed to my professional growth.`;
        break;
      default:
        narrative = `During this period, I was able to ${uniqueActivities
          .slice(0, 6)
          .join(", ")
          .toLowerCase()}.`;
    }
  }

  // Notes section
  let noteText = "";
  if (uniqueNotes.length) {
    const bulletNotes = uniqueNotes.map((n) => `\u00A0\u00A0• ${n}`);
    if (summaryType === "daily") {
      noteText = `My notes for this day, ${uniqueNotes.join(", ")}`;
    } else if (summaryType === "weekly") {
      noteText = `These are my notes for this week,\n${bulletNotes.join("\n")}`;
    } else if (summaryType === "monthly") {
      noteText = `These are my notes for this month,\n${bulletNotes.join("\n")}`;
    } else if (summaryType === "overall") {
      noteText = `These are my overall notes for my entire journal,\n${bulletNotes.join(
        "\n",
      )}`;
    }
  }

  return { narrative, notes: noteText };
};

/* ================= MAIN ================= */

function JournalList({ entries, onOpenEntry }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reportType, setReportType] = useState("daily"); // default to daily
  const [results, setResults] = useState([]);

  const sorted = [...entries].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  const grouped = {};
  sorted.forEach((entry) => {
    const key = new Date(entry.date).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(entry);
  });

  const totalEntries = entries.length;
  const completedDays = entries.filter((e) => e.timeOut).length;
  const totalHours = entries.reduce((s, e) => s + calculateHours(e), 0);

  /* 🔥 GENERATE */
  const handleGenerate = () => {
    setLoading(true);
    setResults([]);
    setCopied(false);

    setTimeout(() => {
      const groupedData = groupBy(entries, reportType);

      const labels = {
        daily: "Day",
        weekly: "Week",
        monthly: "Month",
        overall: "Overall Report",
      };

      const generated = Object.entries(groupedData).map(
        ([key, list], index) => {
          const { narrative, notes } = generateNarrativeWithNotes(
            list,
            reportType,
          );

          return {
            title:
              reportType === "overall"
                ? labels.overall
                : `${labels[reportType]} ${index + 1}`,
            range: getDateRange(list, reportType),
            narrative,
            notes,
          };
        },
      );

      setResults(generated);
      setLoading(false);
    }, 1000);
  };

  const copyAllReports = () => {
    if (!results.length) return;

    const fullText = results
      .map(
        (item) =>
          `${item.title}\n(${item.range})\n\n${item.narrative}\n${item.notes}`,
      )
      .join("\n\n-----------------\n\n");

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!entries.length)
    return (
      <div className="text-gray-400 text-center mt-10">No entries yet.</div>
    );

  return (
    <div className="space-y-6">
      {/* SUMMARY */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="Entries" value={totalEntries} />
        <SummaryCard label="Completed" value={completedDays} />
        <SummaryCard label="Total Hours" value={`${totalHours.toFixed(1)}h`} />
      </div>

      {/* CARD */}
      <div
        onClick={() => setShowModal(true)}
        className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 p-5 rounded-xl cursor-pointer hover:scale-[1.02] transition"
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-white font-semibold">Generate Report</h3>
            <p className="text-sm text-gray-400">
              Create narrative summaries in one click.
            </p>
          </div>
          <RefreshCw className="text-indigo-400 animate-pulse " size={26} />
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-neutral-900 w-[95%] max-w-lg rounded-2xl p-5 space-y-4 border border-neutral-800 animate-fadeIn">
            {/* HEADER */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg text-white font-bold">Generate Report</h2>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>

            {/* SELECTOR */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: "daily", icon: Calendar },
                { key: "weekly", icon: CalendarDays },
                { key: "monthly", icon: CalendarRange },
                { key: "overall", icon: Layers },
              ].map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setReportType(key)}
                  className={`
                    flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-xs capitalize
                    transition-all duration-300
                    ${
                      reportType === key
                        ? "bg-indigo-500/20 border border-indigo-400 text-white shadow-[0_0_10px_rgba(99,102,241,0.6)] scale-105"
                        : "bg-neutral-800 text-gray-400 hover:bg-neutral-700"
                    }
                  `}
                >
                  <Icon size={16} />
                  {key}
                </button>
              ))}
            </div>

            {/* GENERATE BUTTON */}
            <button
              onClick={handleGenerate}
              className="
                w-full 
                flex items-center justify-center gap-2
                bg-gradient-to-r from-blue-500 to-purple-500
                transition-all duration-300
                rounded-lg py-2
                font-medium
                shadow-md hover:shadow-lg
                active:scale-95
                shadow-[0_0_15px_rgba(99,102,241,0.4)]
                hover:shadow-[0_0_20px_rgba(139,92,246,0.6)]
              "
            >
              {loading ? (
                <>
                  <RefreshCw size={16} />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Generate
                </>
              )}
            </button>

            {/* LOADING */}
            {loading && (
              <div className="flex justify-center">
                <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {/* RESULTS */}
            <div className="max-h-[400px] overflow-y-auto space-y-3">
              {results.map((item, index) => {
                const fullText = `${item.title}\n(${item.range})\n\n${item.narrative}\n${item.notes}`;

                return (
                  <div
                    key={index}
                    className="bg-neutral-800 p-4 rounded-xl animate-slideUp"
                  >
                    <div className="flex justify-between">
                      <h4 className="text-m text-white font-bold">
                        {item.title}
                      </h4>

                      {/* COPY ONLY FOR FIRST CARD */}
                      {index === 0 && results.length > 0 && (
                        <button onClick={copyAllReports}>
                          {copied ? (
                            <Check className="text-green-400" size={16} />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-gray-400">{item.range}</p>
                    <p className="text-sm text-gray-300 mt-1">
                      {item.narrative}
                    </p>
                    {item.notes && (
                      <div className="text-sm text-gray-300 mt-2 whitespace-pre-line">
                        {item.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* GROUPED LIST */}
      <div className="space-y-8">
        {Object.entries(grouped).map(([month, list]) => (
          <div key={month} className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-300">{month}</h3>

            {list.map((entry) => (
              <div
                key={entry.id}
                onClick={() => onOpenEntry(entry)}
                className="
                  bg-neutral-900
                  border border-neutral-800
                  p-4
                  rounded-xl
                  cursor-pointer
                  hover:bg-neutral-800
                  transition
                  flex justify-between items-center
                "
              >
                <div>
                  <p className="font-medium">
                    {new Date(entry.date).toLocaleDateString("default", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(entry.date).toLocaleDateString("default", {
                      weekday: "short",
                    })}
                  </p>
                  <p className="text-sm text-gray-400">
                    {formatTo12Hour(entry.timeIn)} –{" "}
                    {entry.timeOut ? formatTo12Hour(entry.timeOut) : "Ongoing"}
                  </p>
                </div>
                <StatusBadge entry={entry} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= SMALL ================= */

const SummaryCard = ({ label, value }) => (
  <div className="bg-neutral-900 p-4 rounded-xl text-center">
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-xl font-bold">{value}</p>
  </div>
);

const StatusBadge = ({ entry }) => {
  if (!entry.timeOut) {
    return <span className="text-yellow-400 text-sm font-medium">Active</span>;
  }
  return <span className="text-green-400 text-sm font-medium">Completed</span>;
};

export default JournalList;
