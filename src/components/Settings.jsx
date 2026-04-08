import { useState, useEffect, useRef } from "react";
import {
  FiSettings,
  FiChevronRight,
  FiArrowLeft,
  FiClock,
} from "react-icons/fi";
import { CheckCircle2, Settings2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function Settings({ requiredHours, setRequiredHours, showToast }) {
  const [selectedHours, setSelectedHours] = useState(requiredHours);
  const [activeView, setActiveView] = useState("list");
  const inputRef = useRef(null);

  useEffect(() => {
    setSelectedHours(requiredHours);
  }, [requiredHours]);

  const options = [
    {
      value: 500,
      label: "500",
      active:
        "bg-cyan-500/10 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.25)]",
      hover: "hover:border-cyan-400/40",
    },
    {
      value: 600,
      label: "600",
      active:
        "bg-violet-500/10 border-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.25)]",
      hover: "hover:border-violet-400/40",
    },
    {
      value: "custom",
      label: "Custom",
      icon: Settings2,
      active:
        "bg-orange-500/10 border-orange-400 shadow-[0_0_20px_rgba(251,146,60,0.25)]",
      hover: "hover:border-orange-400/40",
    },
  ];

  const saveHours = () => {
    const safeValue = Math.max(100, Number(selectedHours) || 500);
    setRequiredHours(safeValue);
    showToast?.(`Required OJT hours updated to ${safeValue}`);
    setActiveView("list");
  };

  const selectCustom = () => {
    if ([500, 600].includes(Number(selectedHours))) {
      setSelectedHours("");
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="space-y-6 overflow-hidden">
      <AnimatePresence mode="wait">
        {activeView === "list" ? (
          <motion.div
            key="settings-list"
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <FiSettings /> Settings
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Manage your internship tracker preferences
              </p>
            </div>

            {/* Settings List Group */}
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden divide-y divide-white/5">
              {/* OJT Hours Setting Item */}
              <button
                onClick={() => setActiveView("hours")}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.03] transition-all"
              >
                {/* Left Section */}
                <div className="flex items-center gap-2">
                  {/* Icon */}
                  <div className="w-10 h-10 flex items-center justify-center">
                    <FiClock size={24} />
                  </div>

                  {/* Text */}
                  <div className="text-left">
                    <p className="font-semibold">Internship Hours Goal</p>
                    <p className="text-xs text-gray-400">
                      Set your required OJT hours target
                    </p>
                  </div>
                </div>

                {/* Right Arrow */}
                <FiChevronRight className="text-gray-400" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="settings-hours"
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 60, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <div className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-800 py-3 flex justify-between items-center">
              <button
                onClick={() => setActiveView("list")}
                className="flex items-center gap-2 text-gray-300 text-sm"
              >
                <FiArrowLeft /> Back
              </button>
            </div>

            {/* Facebook settings content card */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl space-y-4">
              <div>
                <h2 className="text-2xl font-bold">Required Hours</h2>
                <p className="text-sm text-gray-400">
                  Update your school internship target
                </p>
              </div>
              <input
                ref={inputRef}
                type="number"
                min="100"
                step="100"
                value={selectedHours}
                onFocus={() => {
                  // switch to custom when user interacts
                  if ([500, 600].includes(Number(selectedHours))) {
                    setSelectedHours("");
                  }
                }}
                onChange={(e) => setSelectedHours(e.target.value)}
                className="w-full rounded-2xl border border-cyan-400/30 bg-black/30 px-4 py-3 outline-none transition-all focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(34,211,238,0.18)]"
                placeholder="Enter custom hours"
              />

              <div className="grid grid-cols-3 gap-3">
                {options.map((item) => {
                  const Icon = item.icon; // 👈 get icon

                  const isSelected =
                    item.value === "custom"
                      ? ![500, 600].includes(Number(selectedHours))
                      : Number(selectedHours) === item.value;

                  return (
                    <button
                      key={item.label}
                      onClick={() =>
                        item.value === "custom"
                          ? selectCustom()
                          : setSelectedHours(item.value)
                      }
                      className={`
          rounded-2xl border py-3 text-sm font-medium
          flex flex-col items-center justify-center gap-1
          transition-all duration-300
          ${
            isSelected
              ? item.active
              : `bg-neutral-900 border-white/10 ${item.hover}`
          }
        `}
                    >
                      {/* ICON (only if exists) */}
                      {Icon && <Icon size={16} />}

                      {/* LABEL */}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="p-2 flex items-center justify-center">
                <button
                  onClick={saveHours}
                  className="w-[60%] rounded-2xl py-3 bg-gradient-to-r from-cyan-500 to-violet-500 font-semibold shadow-[0_0_20px_rgba(34,211,238,0.18)] hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Settings;
