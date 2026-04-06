import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Journal from "./components/Journal";
import CalendarTracker from "./components/CalendarTracker";
import Toast from "./components/Toast";
import { calculateHours } from "./utils/calculateHours";

/* ================= PAGE ORDER ================= */
const pageOrder = ["dashboard", "calendar", "journal"];

/* ================= ANIMATION ================= */
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

  const totalHours = entries.reduce(
    (sum, entry) => sum + calculateHours(entry),
    0,
  );

  const remainingHours = 500 - totalHours;
  const progressPercent = Math.min((totalHours / 500) * 100, 100);

  /* 🔥 FIXED PAGE CHANGE */
  const handlePageChange = (newPage) => {
    const currentIndex = pageOrder.indexOf(activePage);
    const newIndex = pageOrder.indexOf(newPage);

    // 👉 If leaving Journal, hide FAB FIRST
    if (activePage === "journal" && newPage !== "journal") {
      setShowJournalFab(false);

      setTimeout(() => {
        setDirection(newIndex > currentIndex ? 1 : -1);
        setActivePage(newPage);
      }, 120); // delay BEFORE slide-out

      return;
    }

    setDirection(newIndex > currentIndex ? 1 : -1);
    setActivePage(newPage);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
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
          </motion.div>
        </AnimatePresence>
      </div>

      <Sidebar activePage={activePage} setActivePage={handlePageChange} />
    </div>
  );
}

export default App;
