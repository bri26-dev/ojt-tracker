import { motion, AnimatePresence } from "framer-motion";

function ConfirmModal({ show, onClose, onConfirm, title, message }) {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 w-[90%] max-w-sm space-y-4"
          >
            <h3 className="text-lg font-semibold text-center">
              {title || "Confirm Action"}
            </h3>

            <p className="text-sm text-gray-400 text-center">
              {message || "Are you sure?"}
            </p>

            <div className="flex gap-2 mt-4">
              <button
                onClick={onConfirm}
                className="flex-1 bg-red-500 hover:bg-red-600 transition rounded-lg py-2 text-sm font-medium"
              >
                Confirm
              </button>

              <button
                onClick={onClose}
                className="flex-1 bg-neutral-700 hover:bg-neutral-600 transition rounded-lg py-2 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ConfirmModal;
