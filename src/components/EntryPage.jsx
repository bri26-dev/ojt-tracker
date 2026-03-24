import { useState, useEffect, useRef } from "react";
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

const AutoResizeTextarea = ({ value, onChange, placeholder }) => {
  const ref = useRef(null);

  const resize = () => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  };

  useEffect(() => {
    resize(); // 🔥 runs when component loads / edit mode opens
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => {
        onChange(e);
        resize(); // 🔥 resize while typing
      }}
      placeholder={placeholder}
      rows={1}
      className="w-full bg-transparent outline-none resize-none overflow-hidden leading-tight break-words text-gray-300 placeholder:text-gray-500"
    />
  );
};

const MIN_TASKS = 3;

function EntryPage({ entry, setEntries, goBack, showToast }) {
  const [isEditing, setIsEditing] = useState(false);

  /* NEW STATES */
  const [showTimeOutModal, setShowTimeOutModal] = useState(false);
  const [timeOutValue, setTimeOutValue] = useState("17:00");

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
      prev.map((e) => (e.id === localEntry.id ? localEntry : e)),
    );

    showToast("Entry Saved.", "info");

    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalEntry((prev) => ({
      ...prev,
      tasks: ensureMinimumTasks(prev.tasks),
      notes: prev.notes || "",
    }));
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!window.confirm("Delete this entry?")) return;

    setEntries((prev) => prev.filter((e) => e.id !== localEntry.id));

    showToast("Entry Deleted.", "error");

    goBack();
  };

  /* NEW QUICK TIME OUT */
  const handleQuickTimeOut = () => {
    const updated = { ...localEntry, timeOut: timeOutValue };

    setLocalEntry(updated);

    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));

    setShowTimeOutModal(false);

    /* 🔥 ADD THIS */
    showToast("Timed out successfully.", "success");
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

              <button onClick={handleDelete} className="text-red-500">
                <Trash2 size={18} />
              </button>
            </>
          ) : (
            <>
              <button onClick={handleSave} className="text-blue-400">
                <Save size={18} />
              </button>

              <button onClick={handleCancel} className="text-gray-300">
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
              {/* TIME IN */}
              <div className="bg-neutral-800 rounded-lg p-2 text-center space-y-1">
                <p className="text-[12px] text-gray-400">In</p>
                <input
                  type="time"
                  value={localEntry.timeIn || ""}
                  onChange={(e) =>
                    setLocalEntry({ ...localEntry, timeIn: e.target.value })
                  }
                  className="bg-transparent text-sm text-center font-semibold w-full outline-none"
                />
              </div>

              {/* TIME OUT */}
              <div className="bg-neutral-800 rounded-lg p-2 text-center space-y-1">
                <p className="text-[12px] text-gray-400">Out</p>
                <input
                  type="time"
                  value={localEntry.timeOut || ""}
                  onChange={(e) =>
                    setLocalEntry({ ...localEntry, timeOut: e.target.value })
                  }
                  className="bg-transparent text-sm text-center font-semibold w-full outline-none"
                />
              </div>

              {/* WORKED */}
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
                  localEntry.timeOut ? formatTo12Hour(localEntry.timeOut) : "—"
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

        {/* NEW TIME OUT BUTTON */}
        {!localEntry.timeOut && !isEditing && (
          <button
            onClick={() => setShowTimeOutModal(true)}
            className="w-full mt-3 bg-red-500 hover:bg-red-600 transition rounded-lg py-2 text-sm font-medium"
          >
            Time Out
          </button>
        )}
      </div>

      {/* ================= TASKS (GRID STYLE + HEADER) ================= */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-semibold">Tasks</h3>

          {isEditing && (
            <button
              onClick={addTask}
              className="flex items-center gap-1 text-blue-400 text-xs"
            >
              <Plus size={14} /> Add Row
            </button>
          )}
        </div>

        {/* CARD */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 space-y-1 relative">
          {/* 🔷 HEADER ROW (ALIGNED WITH ROWS) */}
          <div className="flex items-center gap-2">
            <div className="grid grid-cols-4 gap-1 flex-1">
              <div className="bg-neutral-800 border border-neutral-700 p-2 text-sm font-semibold text-center">
                Task
              </div>

              <div className="bg-neutral-800 border border-neutral-700 p-2 text-sm font-semibold text-center">
                Start
              </div>

              <div className="bg-neutral-800 border border-neutral-700 p-2 text-sm font-semibold text-center">
                End
              </div>

              <div className="bg-neutral-800 border border-neutral-700 p-2 text-sm font-semibold text-center">
                Remarks
              </div>
            </div>
          </div>

          {/* 🔷 ROWS */}
          {localEntry.tasks.map((task, i) => (
            <div key={i} className="flex items-center gap-2 relative">
              {/* GRID CELLS */}
              <div className="grid grid-cols-4 gap-1 flex-1">
                {/* TASK */}
                <div className="bg-neutral-800 border border-neutral-700 p-2 text-sm">
                  {isEditing ? (
                    <AutoResizeTextarea
                      value={task.task || ""}
                      onChange={(e) =>
                        handleTaskChange(i, "task", e.target.value)
                      }
                      placeholder="No task"
                    />
                  ) : (
                    <p className="text-gray-300 leading-tight break-words">
                      {task.task || (
                        <span className="text-gray-500">No task</span>
                      )}
                    </p>
                  )}
                </div>

                {/* START */}
                <div className="bg-neutral-800 border border-neutral-700 p-2 text-center text-sm">
                  {isEditing ? (
                    <input
                      type="time"
                      value={task.start || ""}
                      onChange={(e) =>
                        handleTaskChange(i, "start", e.target.value)
                      }
                      className="bg-transparent text-center outline-none w-full"
                    />
                  ) : (
                    <p className="text-gray-300">
                      {task.start ? (
                        formatTo12Hour(task.start)
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </p>
                  )}
                </div>

                {/* END */}
                <div className="bg-neutral-800 border border-neutral-700 p-2 text-center text-sm">
                  {isEditing ? (
                    <input
                      type="time"
                      value={task.end || ""}
                      onChange={(e) =>
                        handleTaskChange(i, "end", e.target.value)
                      }
                      className="bg-transparent text-center outline-none w-full"
                    />
                  ) : (
                    <p className="text-gray-300">
                      {task.end ? (
                        formatTo12Hour(task.end)
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </p>
                  )}
                </div>

                {/* REMARKS */}
                <div className="bg-neutral-800 border border-neutral-700 p-2 text-sm">
                  {isEditing ? (
                    <AutoResizeTextarea
                      value={task.remarks || ""}
                      onChange={(e) =>
                        handleTaskChange(i, "remarks", e.target.value)
                      }
                      placeholder="No remarks"
                    />
                  ) : (
                    <p className="text-gray-300 leading-right break-words">
                      {task.remarks || (
                        <span className="text-gray-500 break-words">
                          No remarks
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* DELETE BUTTON */}
              {isEditing && localEntry.tasks.length > MIN_TASKS && (
                <button
                  onClick={() => removeTask(i)}
                  className="
                  absolute 
                  right-0 
                  top-1/2 -translate-y-1/2 
                  translate-x-1/2
                  w-6 h-6 
                  flex items-center justify-center 
                  rounded-lg 
                  bg-red-500/20 
                  text-red-400 
                  hover:bg-red-500/40 
                  transition-all 
                  active:scale-95
                "
                >
                  <Minus size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ================= NOTES ================= */}
      <h3 className="text-sm font-semibold">Notes</h3>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
        <div className="bg-neutral-800 border border-neutral-700 p-3 min-h-[160px] text-sm">
          {isEditing ? (
            <textarea
              value={localEntry.notes || ""}
              onChange={(e) =>
                setLocalEntry({ ...localEntry, notes: e.target.value })
              }
              placeholder="No notes"
              className="w-full h-full bg-transparent outline-none resize-none text-gray-300 placeholder:text-gray-500"
            />
          ) : (
            <p className="text-gray-300 whitespace-pre-wrap break-words">
              {localEntry.notes || (
                <span className="text-gray-500">No notes</span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* ================= TIME OUT MODAL ================= */}
      {showTimeOutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-neutral-900 rounded-xl p-5 w-[90%] max-w-sm space-y-4 border border-neutral-800">
            <h3 className="text-lg font-semibold text-center">
              Confirm Time Out
            </h3>

            <input
              type="time"
              value={timeOutValue}
              onChange={(e) => setTimeOutValue(e.target.value)}
              className="w-full bg-neutral-800 p-2 rounded-lg text-center"
            />

            <div className="flex gap-2">
              <button
                onClick={handleQuickTimeOut}
                className="flex-1 bg-green-500 hover:bg-green-600 transition rounded-lg py-2 text-sm font-medium"
              >
                Confirm
              </button>

              <button
                onClick={() => setShowTimeOutModal(false)}
                className="flex-1 bg-neutral-700 hover:bg-neutral-600 transition rounded-lg py-2 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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
