import { useEffect, useState } from "react";

function ProgressBar({ progress, totalHours, goalHours }) {
  const size = 300;
  const stroke = 20;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 150);
    return () => clearTimeout(timeout);
  }, [progress]);

  const safeProgress = Math.min(animatedProgress, 100);

  const strokeDashoffset = circumference - (safeProgress / 100) * circumference;

  const remaining = Math.max(goalHours - totalHours, 0);

  const getColor = () => {
    if (progress >= 100) return "#22c55e";
    if (progress >= 70) return "#3b82f6";
    if (progress >= 40) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative flex items-center justify-center">
        {/* Soft Glow */}
        <div
          className="absolute rounded-full blur-2xl opacity-15"
          style={{
            width: size * 0.75,
            height: size * 0.75,
            backgroundColor: getColor(),
          }}
        />

        <svg height={size} width={size} className="rotate-[-90deg]">
          {/* Track */}
          <circle
            stroke="#1f2937"
            fill="transparent"
            strokeWidth={stroke}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />

          {/* Progress */}
          <circle
            stroke={getColor()}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute flex flex-col items-center text-center">
          <span className="text-4xl font-bold tracking-tight">
            {safeProgress.toFixed(0)}%
          </span>

          <span className="text-m font-semibold text-neutral-400 mt-1">
            {totalHours} / {goalHours} hours
          </span>
        </div>
      </div>

      <div className="text-lg font-semibold text-neutral-400">
        {remaining} hours remaining
      </div>
    </div>
  );
}

export default ProgressBar;
