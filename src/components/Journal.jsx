import { useState } from "react";
import JournalForm from "./JournalForm";
import JournalList from "./JournalList";
import EntryPage from "./EntryPage";
import { Plus } from "lucide-react";
import "../styles/FireButton.css";

function Journal({ entries, setEntries, showToast }) {

  const [activeEntry, setActiveEntry] = useState(null);
  const [showModal, setShowModal] = useState(false);

  if (activeEntry) {
    return (
      <EntryPage
        entry={activeEntry}
        setEntries={setEntries}
        showToast={showToast}
        goBack={() => setActiveEntry(null)}
      />
    );
  }

  return (
    <div className="space-y-6 pb-28 relative">

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white">Journal</h2>
        <p className="text-gray-400 text-sm mt-1">
          Start and manage your daily internship logs
        </p>
      </div>

      {/* Entry List */}
      <JournalList
        entries={entries}
        onOpenEntry={(entry) => setActiveEntry(entry)}
      />

      {/* Floating Add Button */}
      <button
        onClick={() => setShowModal(true)}
        className="
          fixed 
          bottom-[calc(6rem+1.5rem)] 
          right-6 
          w-16 h-16 
          rounded-full 
          flex items-center justify-center 
          text-white 
          text-2xl
          bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500
          shadow-[0_0_20px_rgba(59,130,246,0.6),0_0_40px_rgba(99,102,241,0.4),0_0_60px_rgba(139,92,246,0.2)]
          transform transition-transform duration-300 ease-in-out
          hover:scale-115
          animate-[fire-pulse_1.5s_infinite_alternate]
          z-50
        "
      >
        <Plus size={28} />
      </button>

      {/* Modal */}
      {showModal && (
        <JournalForm
          entries={entries}
          setEntries={setEntries}
          showToast={showToast}
          onClose={() => setShowModal(false)}
        />
      )}

    </div>
  );
}

export default Journal;