import { useEffect } from "react";

function Toast({ message, type = "success", onClose }) {

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  // Auto close after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose && onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-24 right-6 z-[999] animate-toastIn">
      <div
        className={`
          ${colors[type]}
          text-white
          px-5 py-3
          rounded-xl
          shadow-xl
          text-sm
          font-medium
          animate-toastOut
        `}
      >
        {message}
      </div>
    </div>
  );
}

export default Toast;