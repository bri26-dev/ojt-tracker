function JournalList({ entries, onOpenEntry }) {

  /* Calculate Hours (for summary) */
  const calculateHours = (entry) => {
    if (!entry.timeIn || !entry.timeOut) return 0;

    const [inH, inM] = entry.timeIn.split(":").map(Number);
    const [outH, outM] = entry.timeOut.split(":").map(Number);

    const start = new Date();
    start.setHours(inH, inM, 0);

    const end = new Date();
    end.setHours(outH, outM, 0);

    let hours = (end - start) / (1000 * 60 * 60);

    /* Lunch Break (12–1 PM) */
    const lunchStart = new Date();
    lunchStart.setHours(12, 0, 0);

    const lunchEnd = new Date();
    lunchEnd.setHours(13, 0, 0);

    if (start < lunchEnd && end > lunchStart) {
      hours -= 1;
    }

    return Math.max(hours, 0);
  };

  /* Sort Desc */
  const sorted = [...entries].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  /* Group By Month */
  const grouped = {};

  sorted.forEach((entry) => {
    const date = new Date(entry.date);

    const monthKey = date.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }

    grouped[monthKey].push(entry);
  });

  /* Summary */
  const totalEntries = entries.length;

  const completedDays = entries.filter(
    (e) => e.timeOut
  ).length;

  const totalHours = entries.reduce(
    (s, e) => s + calculateHours(e),
    0
  );

  if (!entries.length) {
    return (
      <div className="text-gray-400 text-center mt-10">
        No entries yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-3 gap-3">

        <SummaryCard
          label="Entries"
          value={totalEntries}
        />

        <SummaryCard
          label="Completed"
          value={completedDays}
        />

        <SummaryCard
          label="Total Hours"
          value={`${totalHours.toFixed(1)}h`}
        />

      </div>

      {/* GROUPED LIST */}
      <div className="space-y-8">

        {Object.entries(grouped).map(
          ([month, list]) => (
            <div key={month} className="space-y-3">

              {/* Month Header */}
              <h3 className="text-lg font-semibold text-gray-300">
                {month}
              </h3>

              {/* Entries */}
              {list.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => onOpenEntry(entry)}
                  className="
                    bg-neutral-900
                    border border-neutral-800
                    p-4
                    rounded-xl
                    cursor-pointer
                    hover:bg-neutral-800
                    transition
                    flex justify-between items-center
                  "
                >
                  {/* Left */}
                  <div>
                    <p className="font-medium">
                      {new Date(entry.date).toLocaleDateString("default", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>

                    <p className="text-sm text-gray-400">
                      {new Date(entry.date).toLocaleDateString("default", {
                        weekday: "short",
                      })}
                    </p>
                    <p className="text-sm text-gray-400">
                      {formatTo12Hour(entry.timeIn)} –{" "}
                      {entry.timeOut
                        ? formatTo12Hour(entry.timeOut)
                        : "Ongoing"}
                    </p>
                  </div>

                  {/* Status */}
                  <StatusBadge entry={entry} />
                </div>
              ))}

            </div>
          )
        )}

      </div>
    </div>
  );
}

/* Components */

const SummaryCard = ({ label, value }) => (
  <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl text-center">

    <p className="text-xs text-gray-400">
      {label}
    </p>

    <p className="text-xl font-bold mt-1">
      {value}
    </p>

  </div>
);

const StatusBadge = ({ entry }) => {

  if (!entry.timeOut) {
    return (
      <span className="text-yellow-400 text-sm font-medium">
        Active
      </span>
    );
  }

  return (
    <span className="text-green-400 text-sm font-medium">
      Completed
    </span>
  );
};

const formatTo12Hour = (time) => {
  if (!time) return "";

  const [hour, minute] = time.split(":").map(Number);
  const ampm = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;

  return `${formattedHour}:${minute
    .toString()
    .padStart(2, "0")} ${ampm}`;
};

export default JournalList;