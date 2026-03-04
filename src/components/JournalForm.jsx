import { useState } from "react";
import { X } from "lucide-react";

function JournalForm({ entries, setEntries, onClose }) {

  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);
  const [timeIn, setTimeIn] = useState("08:00");

  const handleSubmit = (e) => {
    e.preventDefault();

    const exists = entries.some(
      (entry) => entry.date === date
    );

    if (exists) {
      alert(
        "An entry for this date already exists."
      );
      return;
    }

    const newEntry = {
      id: Date.now(),
      date,
      timeIn,
      timeOut: null,
      tasks: [
        { task: "", start: "", end: "", remarks: "" },
        { task: "", start: "", end: "", remarks: "" },
        { task: "", start: "", end: "", remarks: "" },
      ],
      notes: "",
    };

    setEntries([...entries, newEntry]);
    onClose();
  };

  return (

    /* Overlay */
    <div
      className="
        fixed inset-0
        bg-black/70
        backdrop-blur-sm
        flex items-center justify-center
        z-50
      "
    >

      {/* Modal Box */}
      <div
        className="
          bg-neutral-900
          border border-neutral-800
          w-full max-w-md
          p-6
          rounded-2xl
          space-y-5
          animate-fadeIn
        "
      >

        {/* Header */}
        <div className="flex justify-between items-center">

          <h3 className="text-lg font-semibold">
            New Journal Entry
          </h3>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X />
          </button>

        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="text-sm text-gray-400">
              Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-neutral-800 p-2 rounded-xl mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">
              Time In
            </label>

            <input
              type="time"
              value={timeIn}
              onChange={(e) => setTimeIn(e.target.value)}
              className="w-full bg-neutral-800 p-2 rounded-xl mt-1"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">

            <button
              type="submit"
              className="
                w-full
                bg-gradient-to-r
                from-blue-500 to-purple-500
                py-3
                rounded-xl
                font-medium
              "
            >
              Start Entry
            </button>

            <button
              type="button"
              onClick={onClose}
              className="
                w-full
                bg-neutral-700
                py-3
                rounded-xl
              "
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default JournalForm;