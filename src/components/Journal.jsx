import { useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import JournalForm from "./JournalForm";
import JournalList from "./JournalList";

function Journal({ entries, setEntries }) {
  const [showForm, setShowForm] = useState(false);

  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);

  return (
    <div className="space-y-4 pb-28 relative">

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white">Journal</h2>
        <p className="text-gray-400 text-sm mt-1">
          Track your daily OJT activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">

        <StatCard
          label="Total Entries"
          value={entries.length}
        />

        <StatCard
          label="Total Hours"
          value={`${totalHours.toFixed(0)}h`}
        />

      </div>

      {/* Journal List */}
      <JournalList entries={entries} setEntries={setEntries} />

      {/* Floating Add Button */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-28 right-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 transition text-white rounded-full p-4 shadow-xl"
      >
        <FiPlus size={22} />
      </button>

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-[92%] max-w-lg shadow-2xl relative p-6 animate-fadeIn">

            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <FiX size={22} />
            </button>

            <JournalForm
              entries={entries}
              setEntries={setEntries}
              closeModal={() => setShowForm(false)}
            />

          </div>
        </div>
      )}
    </div>
  );
}

/* UI */

const StatCard = ({ label, value }) => (
  <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-xl font-semibold text-white">
      {value}
    </p>
  </div>
);

export default Journal;