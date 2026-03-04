import { useState } from "react";
import { FiX, FiEdit3, FiSave, FiTrash2 } from "react-icons/fi";

function JournalList({ entries, setEntries }) {
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const calculateHours = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return 0;

    const start = new Date(`1970-01-01T${timeIn}:00`);
    const end = new Date(`1970-01-01T${timeOut}:00`);

    let diff = (end - start) / (1000 * 60 * 60);

    if (diff <= 0) return 0;

    // Lunch break: 12:00–13:00
    const lunchStart = new Date("1970-01-01T12:00:00");
    const lunchEnd = new Date("1970-01-01T13:00:00");

    // Check overlap with lunch
    if (start < lunchEnd && end > lunchStart) {
      diff -= 1;
    }

    // Max 8 hrs per day
    return Math.min(diff, 8);
  };

  const formatTime = (time) => {
    if (!time) return "";
    let [h, m] = time.split(":").map(Number);

    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;

    return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  const sortedEntries = [...entries].reverse();

  const handleDelete = (id) => {
    const updated = entries.filter((e) => e.id !== id);

    setEntries(updated);
    setSelectedEntry(null);
    setIsEditing(false);
  };

  const handleEdit = (entry) => {
    setIsEditing(true);
    setEditData({ ...entry });
  };

  const handleSave = () => {
    const updatedEntry = {
      ...editData,
      hours: calculateHours(editData.timeIn, editData.timeOut),
    };

    const updated = entries.map((e) =>
      e.id === updatedEntry.id ? updatedEntry : e
    );

    setEntries(updated);
    setSelectedEntry(updatedEntry);
    setIsEditing(false);
  };

  if (entries.length === 0) {
    return (
      <div className="bg-neutral-900 p-6 rounded-xl text-center text-gray-400">
        No journal entries yet.
      </div>
    );
  }

  return (
    <>
      <div className="bg-neutral-900 p-6 rounded-xl">
        <h3 className="text-xl font-semibold mb-4">Entries</h3>

        <div className="space-y-3">

          {sortedEntries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => {
                setSelectedEntry(entry);
                setIsEditing(false);
              }}
              className="border border-neutral-800 p-4 rounded-xl cursor-pointer hover:bg-neutral-800 flex justify-between"
            >
              <div>
                <p className="font-semibold">{entry.date}</p>
                <p className="text-sm text-gray-400">
                  {formatTime(entry.timeIn)} – {formatTime(entry.timeOut)}
                </p>
              </div>

              <p className="text-blue-400">
                {entry.hours.toFixed(2)}h
              </p>
            </div>
          ))}

        </div>
      </div>

      {selectedEntry && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

          <div className="bg-neutral-900 p-6 rounded-2xl w-[90%] max-w-md relative">

            <button
              onClick={() => setSelectedEntry(null)}
              className="absolute top-4 right-4"
            >
              <FiX size={22} />
            </button>

            <h3 className="text-xl font-semibold mb-4">
              Entry Details
            </h3>

            {!isEditing ? (
              <>
                <Detail label="Date" value={selectedEntry.date} />
                <Detail
                  label="Time"
                  value={`${formatTime(selectedEntry.timeIn)} – ${formatTime(
                    selectedEntry.timeOut
                  )}`}
                />
                <Detail
                  label="Description"
                  value={selectedEntry.description || "—"}
                />
                <Detail
                  label="Notes"
                  value={selectedEntry.notes || "—"}
                />

                <div className="flex gap-3 mt-6">
                  <ActionButton color="blue" onClick={() => handleEdit(selectedEntry)}>
                    <FiEdit3 /> Edit
                  </ActionButton>

                  <ActionButton color="red" onClick={() => handleDelete(selectedEntry.id)}>
                    <FiTrash2 /> Delete
                  </ActionButton>
                </div>
              </>
            ) : (
              <>
                <Input
                  label="Date"
                  type="date"
                  value={editData.date}
                  onChange={(e) =>
                    setEditData({ ...editData, date: e.target.value })
                  }
                />

                <Input
                  label="Time In"
                  type="time"
                  value={editData.timeIn}
                  onChange={(e) =>
                    setEditData({ ...editData, timeIn: e.target.value })
                  }
                />

                <Input
                  label="Time Out"
                  type="time"
                  value={editData.timeOut}
                  onChange={(e) =>
                    setEditData({ ...editData, timeOut: e.target.value })
                  }
                />

                <Input
                  label="Description"
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                />

                <Textarea
                  label="Notes"
                  value={editData.notes}
                  onChange={(e) =>
                    setEditData({ ...editData, notes: e.target.value })
                  }
                />

                <div className="flex gap-3 mt-6">
                  <ActionButton color="green" onClick={handleSave}>
                    <FiSave /> Save
                  </ActionButton>

                  <ActionButton color="gray" onClick={() => setIsEditing(false)}>
                    Cancel
                  </ActionButton>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </>
  );
}

/* UI */

const Detail = ({ label, value }) => (
  <div className="mb-3">
    <p className="text-sm text-gray-400">{label}</p>
    <div className="bg-neutral-800 rounded-lg p-2">
      {value}
    </div>
  </div>
);

const Input = ({ label, ...props }) => (
  <div className="mb-3">
    <p className="text-sm text-gray-400">{label}</p>
    <input
      {...props}
      className="w-full bg-neutral-800 rounded-lg p-2"
    />
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div className="mb-3">
    <p className="text-sm text-gray-400">{label}</p>
    <textarea
      {...props}
      rows={3}
      className="w-full bg-neutral-800 rounded-lg p-2 resize-none"
    />
  </div>
);

const ActionButton = ({ children, color, ...props }) => {
  const colors = {
    blue: "bg-blue-500",
    red: "bg-red-500",
    green: "bg-green-500",
    gray: "bg-neutral-700",
  };

  return (
    <button
      {...props}
      className={`flex-1 py-2 rounded-xl text-white flex justify-center items-center gap-2 ${colors[color]}`}
    >
      {children}
    </button>
  );
};

export default JournalList;