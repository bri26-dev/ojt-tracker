import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Check,
  X,
  Clock,
  Plus,
  Minus,
  Save,
} from "lucide-react";

const MIN_TASKS = 3;

function EntryPage({ entry, setEntries, goBack }) {
  const [isEditing, setIsEditing] = useState(false);

  const ensureMinimumTasks = (tasks = []) => {
    const safeTasks = [...tasks];
    while (safeTasks.length < MIN_TASKS) {
      safeTasks.push({
        task: "",
        start: "",
        end: "",
        remarks: "",
      });
    }
    return safeTasks;
  };

  const [localEntry, setLocalEntry] = useState({
    ...entry,
    tasks: ensureMinimumTasks(entry.tasks),
    notes: entry.notes || "",
  });

  useEffect(() => {
    setLocalEntry({
      ...entry,
      tasks: ensureMinimumTasks(entry.tasks),
      notes: entry.notes || "",
    });
  }, [entry]);

  /* ================= HOURS ================= */

  const calculateHours = () => {
    if (!localEntry.timeIn || !localEntry.timeOut) return "0h";

    const [inH, inM] = localEntry.timeIn.split(":").map(Number);
    const [outH, outM] = localEntry.timeOut.split(":").map(Number);

    const start = inH + inM / 60;
    const end = outH + outM / 60;

    let hours = end - start;
    if (start < 13 && end > 12) hours -= 1;

    return `${Math.max(hours, 0).toFixed(1)}h`;
  };

  /* ================= TASK CONTROLS ================= */

  const handleTaskChange = (i, field, value) => {
    const updated = [...localEntry.tasks];
    updated[i] = { ...updated[i], [field]: value };
    setLocalEntry({ ...localEntry, tasks: updated });
  };

  const addTask = () => {
    setLocalEntry({
      ...localEntry,
      tasks: [
        ...localEntry.tasks,
        { task: "", start: "", end: "", remarks: "" },
      ],
    });
  };

  const removeTask = (index) => {
    if (localEntry.tasks.length <= MIN_TASKS) return;
    const updated = localEntry.tasks.filter((_, i) => i !== index);
    setLocalEntry({ ...localEntry, tasks: updated });
  };

  /* ================= ACTIONS ================= */

  const handleSave = () => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === localEntry.id ? localEntry : e
      )
    );
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalEntry({
      ...entry,
      tasks: ensureMinimumTasks(entry.tasks),
      notes: entry.notes || "",
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!window.confirm("Delete this entry?")) return;
    setEntries((prev) =>
      prev.filter((e) => e.id !== localEntry.id)
    );
    goBack();
  };

  const status = localEntry.timeOut ? "Completed" : "Active";

  return (
    <div className="pb-16 space-y-4 px-3 sm:px-4">

      {/* ================= HEADER ================= */}
      <div className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-800 py-3 flex justify-between items-center">

        <button
          onClick={goBack}
          className="flex items-center gap-2 text-gray-300 text-sm"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="flex items-center gap-4">

          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-green-400"
              >
                <Edit3 size={18} />
              </button>

              <button
                onClick={handleDelete}
                className="text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="text-blue-400"
              >
                <Save size={18} />
              </button>

              <button
                onClick={handleCancel}
                className="text-gray-300"
              >
                <X size={20} />
              </button>
            </>
          )}

        </div>
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="bg-neutral-900 rounded-xl p-4 space-y-3">

        <div className="flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-semibold">
            {new Date(localEntry.date).toLocaleDateString("default", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </h2>

          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              status === "Completed"
                ? "bg-green-500/10 text-green-400"
                : "bg-yellow-500/10 text-yellow-400"
            }`}
          >
            {status}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {isEditing ? (
            <>
              <input
                type="time"
                value={localEntry.timeIn || ""}
                onChange={(e) =>
                  setLocalEntry({ ...localEntry, timeIn: e.target.value })
                }
                className="bg-neutral-800 p-2 rounded-lg text-sm text-center"
              />

              <input
                type="time"
                value={localEntry.timeOut || ""}
                onChange={(e) =>
                  setLocalEntry({ ...localEntry, timeOut: e.target.value })
                }
                className="bg-neutral-800 p-2 rounded-lg text-sm text-center"
              />

              <InfoBox
                label="Worked"
                value={calculateHours()}
                icon={<Clock size={12} />}
              />
            </>
          ) : (
            <>
              <InfoBox label="In" value={formatTo12Hour(localEntry.timeIn)} />
              <InfoBox
                label="Out"
                value={
                  localEntry.timeOut
                    ? formatTo12Hour(localEntry.timeOut)
                    : "—"
                }
              />
              <InfoBox
                label="Worked"
                value={calculateHours()}
                icon={<Clock size={12} />}
              />
            </>
          )}
        </div>
      </div>

      {/* ================= TASKS ================= */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-semibold">Tasks</h3>

          {isEditing && (
            <button
              onClick={addTask}
              className="flex items-center gap-1 text-blue-400 text-xs"
            >
              <Plus size={14} /> Add
            </button>
          )}
        </div>

        {localEntry.tasks.map((task, i) => (
          <div
            key={i}
            className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 space-y-2 relative"
          >
            {isEditing && localEntry.tasks.length > MIN_TASKS && (
              <button
                onClick={() => removeTask(i)}
                className="absolute top-2 right-2 text-red-400"
              >
                <Minus size={14} />
              </button>
            )}

            {isEditing ? (
              <>
                <input
                  placeholder="Task name"
                  value={task.task || ""}
                  onChange={(e) =>
                    handleTaskChange(i, "task", e.target.value)
                  }
                  className="w-full bg-neutral-800 p-2 rounded-lg text-sm"
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    value={task.start || ""}
                    onChange={(e) =>
                      handleTaskChange(i, "start", e.target.value)
                    }
                    className="bg-neutral-800 p-2 rounded-lg text-sm"
                  />
                  <input
                    type="time"
                    value={task.end || ""}
                    onChange={(e) =>
                      handleTaskChange(i, "end", e.target.value)
                    }
                    className="bg-neutral-800 p-2 rounded-lg text-sm"
                  />
                </div>

                <input
                  placeholder="Remarks"
                  value={task.remarks || ""}
                  onChange={(e) =>
                    handleTaskChange(i, "remarks", e.target.value)
                  }
                  className="w-full bg-neutral-800 p-2 rounded-lg text-sm"
                />
              </>
            ) : (
              <>
                <p className="font-medium text-sm">
                    {task.task || "No Task"}
                </p>

                <p className="text-xs text-gray-400">
                    {task.start && task.end
                    ? `${formatTo12Hour(task.start)} - ${formatTo12Hour(task.end)}`
                    : "-:--"}
                </p>

                <p className="text-xs text-gray-300">
                    {task.remarks || "No remarks"}
                </p>
            </>
            )}
          </div>
        ))}
      </div>

      {/* ================= NOTES ================= */}
      <h3 className="text-sm font-semibold">Notes</h3>
      <div className="bg-neutral-900 rounded-xl p-4">
        {isEditing ? (
          <textarea
            value={localEntry.notes || ""}
            onChange={(e) =>
              setLocalEntry({ ...localEntry, notes: e.target.value })
            }
            className="w-full bg-neutral-800 p-2 rounded-lg resize-none min-h-[100px] text-sm"
          />
        ) : (
          <p className="text-sm text-gray-300 whitespace-pre-wrap">
            {localEntry.notes || "No notes yet."}
          </p>
        )}
      </div>
    </div>
  );
}

/* INFO BOX */
const InfoBox = ({ label, value, icon }) => (
  <div className="bg-neutral-800 rounded-lg p-2 text-center space-y-1">
    <p className="text-[12px] text-gray-400 flex justify-center items-center gap-1">
      {icon}
      {label}
    </p>
    <p className="text-sm font-semibold">{value}</p>
  </div>
);

const formatTo12Hour = (time) => {
  if (!time) return "";
  const [hour, minute] = time.split(":").map(Number);
  const ampm = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minute.toString().padStart(2, "0")} ${ampm}`;
};

export default EntryPage;