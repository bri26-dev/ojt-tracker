// src/utils/calculateHours.js

export function calculateHours(entry) {
  if (!entry.timeIn || !entry.timeOut) return 0;

  const [inH, inM] = entry.timeIn.split(":").map(Number);
  const [outH, outM] = entry.timeOut.split(":").map(Number);

  const start = new Date();
  start.setHours(inH, inM, 0, 0);

  const end = new Date();
  end.setHours(outH, outM, 0, 0);

  let diff = (end - start) / (1000 * 60 * 60);

  // Lunch Break (12:00–1:00)
  const lunchStart = new Date();
  lunchStart.setHours(12, 0, 0, 0);

  const lunchEnd = new Date();
  lunchEnd.setHours(13, 0, 0, 0);

  const overlapStart = Math.max(start, lunchStart);
  const overlapEnd = Math.min(end, lunchEnd);

  if (overlapStart < overlapEnd) {
    diff -= 1;
  }

  return Math.max(diff, 0);
}
