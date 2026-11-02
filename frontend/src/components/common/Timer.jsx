// src/components/common/Timer.jsx

import { useEffect, useRef, useState } from "react";

export default function Timer({
  duration = 60 * 60,
  onTimeUp,
}) {
  // ==================================================
  // TIMER STATE
  // ==================================================

  const [timeLeft, setTimeLeft] = useState(
    Math.max(0, Number(duration) || 0)
  );

  // ==================================================
  // TIME-UP CONTROL
  // ==================================================

  const timeUpCalledRef = useRef(false);

  // ==================================================
  // RESET TIMER WHEN DURATION CHANGES
  // ==================================================

  useEffect(() => {
    const newDuration = Math.max(
      0,
      Number(duration) || 0
    );

    setTimeLeft(newDuration);

    // Allow onTimeUp to run again for new section
    timeUpCalledRef.current = false;
  }, [duration]);

  // ==================================================
  // COUNTDOWN
  // ==================================================

  useEffect(() => {
    // If timer already finished
    if (timeLeft <= 0) {
      if (!timeUpCalledRef.current) {
        timeUpCalledRef.current = true;

        if (typeof onTimeUp === "function") {
          onTimeUp();
        }
      }

      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((previousTime) => {
        if (previousTime <= 1) {
          return 0;
        }

        return previousTime - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [timeLeft, onTimeUp]);

  // ==================================================
  // FORMAT TIME
  // ==================================================

  const formatTime = (seconds) => {
    const safeSeconds = Math.max(
      0,
      Number(seconds) || 0
    );

    const hours = Math.floor(
      safeSeconds / 3600
    );

    const minutes = Math.floor(
      (safeSeconds % 3600) / 60
    );

    const remainingSeconds =
      safeSeconds % 60;

    return [
      String(hours).padStart(2, "0"),
      String(minutes).padStart(2, "0"),
      String(remainingSeconds).padStart(2, "0"),
    ].join(":");
  };

  // ==================================================
  // TIMER STATUS
  // ==================================================

  const isCritical = timeLeft <= 60;
  const isWarning = timeLeft <= 300;

  // ==================================================
  // UI
  // ==================================================

  return (
    <div
      className={`
        flex items-center gap-2
        font-mono
        text-sm md:text-base
        font-semibold
        tabular-nums
        transition-all duration-200
        ${
          isCritical
            ? "text-red-300 animate-pulse"
            : isWarning
            ? "text-yellow-300"
            : "text-white"
        }
      `}
    >
      {/* CLOCK ICON */}

      <span
        className={`
          flex items-center justify-center
          w-5 h-5
          ${
            isCritical
              ? "text-red-300"
              : isWarning
              ? "text-yellow-300"
              : "text-white/80"
          }
        `}
      >
        ⏱
      </span>

      {/* TIME */}

      <span>
        {formatTime(timeLeft)}
      </span>

    </div>
  );
}