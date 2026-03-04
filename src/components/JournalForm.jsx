import { useState } from "react";

function JournalForm({ entries, setEntries, closeModal }) {
  const [formData, setFormData] = useState({
    date: "",
    timeIn: "",
    timeOut: "",
    description: "",
    notes: "",
  });

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

  const previewHours =
    formData.timeIn && formData.timeOut
      ? calculateHours(formData.timeIn, formData.timeOut)
      : 0;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.date || !formData.timeIn || !formData.timeOut) {
      alert("Please fill required fields");
      return;
    }

    const newEntry = {
      id: Date.now(),
      ...formData,
      hours: Math.min(previewHours, 8),
    };

    setEntries([...entries, newEntry]);
    closeModal();
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">New Journal Entry</h3>

      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Date"
            type="date"
            value={formData.date}
            onChange={(v) => setFormData({ ...formData, date: v })}
          />

          <InputField
            label="Description"
            value={formData.description}
            onChange={(v) =>
              setFormData({ ...formData, description: v })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Time In"
            type="time"
            value={formData.timeIn}
            onChange={(v) => setFormData({ ...formData, timeIn: v })}
          />

          <InputField
            label="Time Out"
            type="time"
            value={formData.timeOut}
            onChange={(v) => setFormData({ ...formData, timeOut: v })}
          />
        </div>

        {previewHours > 0 && (
          <p className="text-sm text-blue-400">
            Calculated: {previewHours.toFixed(2)} hrs
          </p>
        )}

        <TextareaField
          label="Notes"
          value={formData.notes}
          onChange={(v) =>
            setFormData({ ...formData, notes: v })
          }
        />

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl"
        >
          Save Entry
        </button>

      </form>
    </div>
  );
}

const InputField = ({ label, onChange, ...props }) => (
  <div>
    <p className="text-sm text-gray-400 mb-1">{label}</p>
    <input
      {...props}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2"
    />
  </div>
);

const TextareaField = ({ label, onChange, ...props }) => (
  <div>
    <p className="text-sm text-gray-400 mb-1">{label}</p>
    <textarea
      {...props}
      rows={3}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 resize-none"
    />
  </div>
);

export default JournalForm;