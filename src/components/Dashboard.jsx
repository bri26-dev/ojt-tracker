import ProgressBar from "./ProgressBar";

function Dashboard({
  totalHours,
  remainingHours,
  progressPercent,
  setActivePage,
}) {
  const goal = totalHours + remainingHours;
  const isNew = totalHours === 0;

  return (
    <div className="max-h-screen text-white px-2 pt-2">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white">OJT Tracker</h2>
        <p className="text-gray-400 text-sm mt-1 mb-8">
          Monitor your internship journey
        </p>
      </div>

      {/* Progress Container */}
      <div className="flex flex-col items-center shadow-xl backdrop-blur-xl">
        <ProgressBar
          progress={progressPercent}
          totalHours={totalHours}
          goalHours={goal}
        />
      </div>

      {/* CTA Section */}
      <div className="p-6 text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-bold">
            {isNew ? "Start Logging Your Hours" : "Keep The Momentum"}
          </h2>

          <p className="text-sm text-neutral-500">
            {isNew
              ? "Add your first journal entry to begin tracking."
              : "Continue adding daily logs to reach your goal."}
          </p>
        </div>

        <button
          onClick={() => setActivePage("journal")}
          className="relative px-10 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium text-sm tracking-wide transition-all duration-300 hover:scale-[1.04] shadow-lg"
        >
          {isNew ? "Get Started" : "Add Entry"}
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
