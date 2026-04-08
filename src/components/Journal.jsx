import { useState, useEffect, useRef } from "react";
import JournalForm from "./JournalForm";
import JournalList from "./JournalList";
import EntryPage from "./EntryPage";
import { FiBook } from "react-icons/fi";
import { Plus } from "lucide-react";
import "../styles/FireButton.css";
import { motion } from "framer-motion";

function Journal({
  entries,
  setEntries,
  showToast,
  isActive,
  showFab,
  setShowFab,
}) {
  const [activeEntry, setActiveEntry] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fabTimerRef = useRef(null);

  useEffect(() => {
    // ✅ always clear old timer first
    if (fabTimerRef.current) {
      clearTimeout(fabTimerRef.current);
    }

    if (isActive) {
      fabTimerRef.current = setTimeout(() => {
        setShowFab(true);
      }, 500);
    } else {
      setShowFab(false);
    }

    return () => {
      if (fabTimerRef.current) {
        clearTimeout(fabTimerRef.current);
      }
    };
  }, [isActive, setShowFab]);

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
      <div>
        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
          <FiBook />
          Journal
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Start and manage your daily internship logs
        </p>
      </div>

      <JournalList
        entries={entries}
        onOpenEntry={(entry) => setActiveEntry(entry)}
      />

      {showFab && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.35,
            ease: [0.25, 0.8, 0.25, 1],
          }}
          onClick={() => setShowModal(true)}
          className="
            fixed 
            bottom-[calc(5rem+1.5rem)] 
            right-6 
            w-16 h-16 
            rounded-full 
            flex items-center justify-center 
            text-white 
            text-2xl
            bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500
            shadow-[0_0_20px_rgba(59,130,246,0.6),0_0_40px_rgba(99,102,241,0.4),0_0_60px_rgba(139,92,246,0.2)]
            hover:scale-110
            animate-[fire-pulse_1.5s_infinite_alternate]
            z-10
          "
        >
          <Plus size={28} />
        </motion.button>
      )}

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
