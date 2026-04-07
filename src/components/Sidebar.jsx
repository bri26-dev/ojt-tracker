import { useRef, useEffect, useState } from "react";
import { FiHome, FiCalendar, FiBook } from "react-icons/fi";

function Sidebar({ activePage, setActivePage }) {
  const items = [
    { key: "dashboard", label: "Dashboard", icon: FiHome, color: "cyan" },
    { key: "calendar", label: "Calendar", icon: FiCalendar, color: "blue" },
    { key: "journal", label: "Journal", icon: FiBook, color: "violet" },
  ];

  const [indicatorStyle, setIndicatorStyle] = useState({});
  const refs = useRef({});

  useEffect(() => {
    const el = refs.current[activePage];
    if (el) {
      setIndicatorStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
      });
    }
  }, [activePage]);

  return (
    <div className="fixed bottom-2 left-0 w-full h-[9%] flex justify-center z-50">
      <div className="relative flex w-[95%] max-w-md px-2 py-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* subtle ambient glow */}
        <div className="absolute inset-0 opacity-20 blur-2xl bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-blue-500/10" />

        {items.map((item) => (
          <NavButton
            key={item.key}
            innerRef={(el) => (refs.current[item.key] = el)}
            icon={item.icon}
            label={item.label}
            active={activePage === item.key}
            onClick={() => setActivePage(item.key)}
            color={item.color}
          />
        ))}
      </div>
    </div>
  );
}

function NavButton({ icon: Icon, label, active, onClick, color, innerRef }) {
  const colorGlow = {
    cyan: "rgba(34,211,238,0.5)",
    blue: "rgba(59,130,246,0.5)",
    violet: "rgba(139,92,246,0.5)",
  };

  const glow = colorGlow[color];

  return (
    <button
      ref={innerRef}
      onClick={onClick}
      className="
        relative flex-1 flex flex-col items-center justify-center
        py-2 rounded-xl
        transition-all duration-300 group
      "
    >
      {/* 🧊 BORDER ONLY (NO FILL) */}
      <div className="absolute inset-0 rounded-xl border border-white/10" />

      {/* 🌟 ACTIVE GLOW (clean minimal) */}
      {active && (
        <div
          className="absolute -inset-[1px] rounded-xl"
          style={{
            boxShadow: `0 0 12px ${glow}`,
          }}
        />
      )}

      {/* ⚡ ICON */}
      <Icon
        size={20}
        className={`
          relative z-10 transition-all duration-300
          ${
            active
              ? "text-white scale-110"
              : "text-gray-500 group-hover:text-gray-300"
          }
        `}
      />

      {/* 📝 LABEL */}
      <span
        className={`
          relative z-10 text-[10px] mt-1 tracking-wide
          ${active ? "text-white" : "text-gray-500 group-hover:text-gray-400"}
        `}
      >
        {label}
      </span>

      {/* ✨ HOVER GLOW (very subtle) */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-md"
        style={{
          background: `radial-gradient(circle, ${glow}, transparent 70%)`,
        }}
      />
    </button>
  );
}

export default Sidebar;
