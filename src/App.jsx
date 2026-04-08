import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock3,
  TimerReset,
  Settings2,
  Minus,
  Plus,
  CheckCircle2,
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Journal from "./components/Journal";
import CalendarTracker from "./components/CalendarTracker";
import Settings from "./components/Settings";
import Toast from "./components/Toast";
import { calculateHours } from "./utils/calculateHours";

/* ================= PAGE ORDER ================= */
const pageOrder = ["dashboard", "calendar", "journal", "settings"];

/* ================= PAGE ANIMATION ================= */
const variants = {
  initial: (direction) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -100 : 100,
    opacity: 0,
  }),
};

const transition = {
  duration: 0.3,
  ease: [0.25, 0.8, 0.25, 1],
};

function App() {
  const [requiredHours, setRequiredHours] = useState(() => {
    const saved = localStorage.getItem("ojtRequiredHours");
    return saved ? Number(saved) : 500;
  });

  const [showSetupModal, setShowSetupModal] = useState(() => {
    return !localStorage.getItem("ojtRequiredHours");
  });

  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customHours, setCustomHours] = useState(500);

  const [selectedHours, setSelectedHours] = useState(500);

  const [showJournalFab, setShowJournalFab] = useState(false);

  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem("ojtEntries");
    return saved ? JSON.parse(saved) : [];
  });

  const [activePage, setActivePage] = useState("dashboard");
  const [direction, setDirection] = useState(0);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    localStorage.setItem("ojtEntries", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem("ojtRequiredHours", requiredHours);
  }, [requiredHours]);

  const totalHours = entries.reduce(
    (sum, entry) => sum + calculateHours(entry),
    0,
  );

  const remainingHours = Math.max(requiredHours - totalHours, 0);
  const progressPercent =
    requiredHours > 0 ? Math.min((totalHours / requiredHours) * 100, 100) : 0;

  const handlePageChange = (newPage) => {
    const currentIndex = pageOrder.indexOf(activePage);
    const newIndex = pageOrder.indexOf(newPage);

    if (activePage === "journal" && newPage !== "journal") {
      setShowJournalFab(false);

      setTimeout(() => {
        setDirection(newIndex > currentIndex ? 1 : -1);
        setActivePage(newPage);
      }, 120);

      return;
    }

    setDirection(newIndex > currentIndex ? 1 : -1);
    setActivePage(newPage);
  };

  const confirmHours = () => {
    setRequiredHours(selectedHours);
    setShowSetupModal(false);
    showToast(`Required hours set to ${selectedHours} hrs`);
  };

  const applyCustomHours = () => {
    const safeValue = Math.max(100, Number(customHours) || 500);
    setSelectedHours(safeValue);
    setShowCustomModal(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* FIRST TIME SETUP */}
      <AnimatePresence>
        {showSetupModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl rounded-3xl border border-white/10 bg-neutral-950 p-6 shadow-2xl space-y-5"
            >
              <div>
                <h2 className="text-xl font-bold">Choose Required OJT Hours</h2>
                <p className="text-sm text-gray-400">
                  Select your internship target before starting.
                </p>
                <p className="text-xs text-cyan-300/80 m-2 flex items-center justify-center">
                  (You can change this later in the settings page.)
                </p>
              </div>

              {/* OPTIONS */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    value: 500,
                    label: "500 hrs",
                    icon: Clock3,
                    active:
                      "bg-cyan-500/10 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.28)]",
                    hover: "hover:border-cyan-400/40",
                  },
                  {
                    value: 600,
                    label: "600 hrs",
                    icon: TimerReset,
                    active:
                      "bg-violet-500/10 border-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.28)]",
                    hover: "hover:border-violet-400/40",
                  },
                  {
                    value: "custom",
                    label: "Custom",
                    icon: Settings2,
                    active:
                      "bg-orange-500/10 border-orange-400 shadow-[0_0_20px_rgba(251,146,60,0.28)]",
                    hover: "hover:border-orange-400/40",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected =
                    item.value === "custom"
                      ? ![500, 600].includes(selectedHours)
                      : selectedHours === item.value;

                  return (
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      whileHover={{ scale: 1.03 }}
                      key={item.label}
                      onClick={() =>
                        item.value === "custom"
                          ? setShowCustomModal(true)
                          : setSelectedHours(item.value)
                      }
                      className={`
                        relative overflow-hidden
                        flex flex-col items-center justify-center gap-2
                        py-4 rounded-2xl
                        border transition-all duration-300
                        ${
                          isSelected
                            ? item.active
                            : `bg-neutral-900 border-white/10 ${item.hover}`
                        }
                      `}
                    >
                      <Icon size={20} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* CONFIRM */}
              <div className="p-2 flex items-center justify-center">
                <button
                  onClick={confirmHours}
                  className="
                  w-[75%] rounded-2xl py-3
                  bg-gradient-to-r from-cyan-500 to-violet-500
                  font-semibold
                  shadow-[0_0_20px_rgba(34,211,238,0.25)]
                  hover:scale-[1.02]
                  transition-all
                  flex items-center justify-center gap-2
                "
                >
                  <CheckCircle2 size={18} />
                  Confirm Selection
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CUSTOM MODAL */}
      <AnimatePresence>
        {showCustomModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl border border-cyan-400/20 bg-neutral-950 p-6 shadow-[0_0_40px_rgba(34,211,238,0.15)] space-y-5"
            >
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold">Custom Hours</h2>
                  <p className="text-xs text-gray-400">
                    Set your preferred internship hours target
                  </p>
                </div>
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition"
                >
                  ✕
                </button>
              </div>

              {/* Input */}
              <div className="space-y-3">
                <div className="flex item-center justify-center">
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={customHours}
                    onChange={(e) => setCustomHours(Number(e.target.value))}
                    className="w-[40%] rounded-2xl border border-cyan-400/30 bg-black/30 px-4 py-3 outline-none transition-all focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(34,211,238,0.25)] text-center text-lg font-semibold"
                  />
                </div>

                {/* Increment / Decrement */}
                <div className="flex justify-center gap-8">
                  <button
                    onClick={() =>
                      setCustomHours((prev) => Math.max(100, prev - 100))
                    }
                    className="w-20 h-10 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center hover:border-cyan-400/40 hover:shadow-[0_0_12px_rgba(34,211,238,0.2)] transition"
                  >
                    <Minus size={16} />
                  </button>

                  <button
                    onClick={() => setCustomHours((prev) => prev + 100)}
                    className="w-20 h-10 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center hover:border-violet-400/40 hover:shadow-[0_0_12px_rgba(139,92,246,0.2)] transition"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Action */}
              <div className="p-2 flex items-center justify-center">
                <button
                  onClick={applyCustomHours}
                  className="w-[80%] rounded-2xl py-3 bg-gradient-to-r from-cyan-500 to-violet-500 font-semibold shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  Apply Custom Hours
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activePage}
            custom={direction}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
          >
            {activePage === "dashboard" && (
              <Dashboard
                entries={entries}
                totalHours={totalHours}
                remainingHours={remainingHours}
                progressPercent={progressPercent}
                setActivePage={handlePageChange}
                requiredHours={requiredHours}
              />
            )}

            {activePage === "journal" && (
              <Journal
                entries={entries}
                setEntries={setEntries}
                showToast={showToast}
                isActive={activePage === "journal"}
                showFab={showJournalFab}
                setShowFab={setShowJournalFab}
              />
            )}

            {activePage === "calendar" && <CalendarTracker entries={entries} />}

            {activePage === "settings" && (
              <Settings
                requiredHours={requiredHours}
                setRequiredHours={setRequiredHours}
                showToast={showToast}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <Sidebar activePage={activePage} setActivePage={handlePageChange} />
    </div>
  );
}

export default App;
