import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Journal from "./components/Journal";
import CalendarTracker from "./components/CalendarTracker";
import { calculateHours } from "./utils/calculateHours";

function App() {

  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem("ojtEntries");
    return saved ? JSON.parse(saved) : [];
  });

  const [activePage, setActivePage] = useState("dashboard");

  useEffect(() => {
    localStorage.setItem("ojtEntries", JSON.stringify(entries));
  }, [entries]);

  const totalHours = entries.reduce(
    (sum, entry) => sum + calculateHours(entry),
    0
  );

  const remainingHours = 500 - totalHours;
  const progressPercent = (totalHours / 500) * 100;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      <div className="flex-1 overflow-y-auto p-4 pb-24">

        {activePage === "dashboard" && (
          <Dashboard
            totalHours={totalHours}
            remainingHours={remainingHours}
            progressPercent={progressPercent}
            setActivePage={setActivePage}
          />
        )}

        {activePage === "journal" && (
          <Journal entries={entries} setEntries={setEntries} />
        )}

        {activePage === "calendar" && (
          <CalendarTracker entries={entries} />
        )}

      </div>

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

    </div>
  );
}

export default App;