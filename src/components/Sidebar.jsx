import { FiHome, FiBook, FiCalendar } from "react-icons/fi";

function Sidebar({ activePage, setActivePage }) {
  return (
    <div className="fixed bottom-6 left-0 w-full flex justify-center z-1">
      {/* Floating Glass Container */}
      <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 shadow-2xl rounded-2xl px-12 py-4 flex justify-between w-[96%] max-w-lg">
        <NavButton
          icon={FiHome}
          label="Dashboard"
          active={activePage === "dashboard"}
          onClick={() => setActivePage("dashboard")}
        />

        <NavButton
          icon={FiCalendar}
          label="Calendar"
          active={activePage === "calendar"}
          onClick={() => setActivePage("calendar")}
        />

        <NavButton
          icon={FiBook}
          label="Journal"
          active={activePage === "journal"}
          onClick={() => setActivePage("journal")}
        />
      </div>
    </div>
  );
}

function NavButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center group transition-all duration-300"
    >
      {/* Active Background Pill */}
      <div
        className={`absolute -inset-2 rounded-xl transition-all duration-300 ${
          active
            ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-md"
            : "opacity-0"
        }`}
      />

      {/* Icon */}
      <Icon
        size={22}
        className={`relative z-10 transition-all duration-300 ${
          active
            ? "text-white scale-110"
            : "text-gray-500 group-hover:text-gray-300"
        }`}
      />

      {/* Label */}
      <span
        className={`relative z-10 mt-1 text-[11px] tracking-wide transition-all duration-300 ${
          active ? "text-white" : "text-gray-500 group-hover:text-gray-300"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

export default Sidebar;
