import React, { useEffect, useMemo, useRef, useState } from "react";

const ExamTimer = ({ endTime, onTimeUp, disabled = false }) => {
  const firedRef = useRef(false);

  const getRemaining = () => {
    if (!endTime) return 0;
    return Math.max(0, new Date(endTime).getTime() - Date.now());
  };

  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    firedRef.current = false;
    setRemaining(getRemaining());

    if (!endTime || disabled) return undefined;

    const timer = setInterval(() => {
      const value = getRemaining();
      setRemaining(value);

      if (value <= 0 && !firedRef.current) {
        firedRef.current = true;
        clearInterval(timer);
        onTimeUp?.();
      }
    }, 250);

    return () => clearInterval(timer);
  }, [endTime, disabled]);

  const { hours, minutes, seconds } = useMemo(() => {
    const totalSeconds = Math.ceil(remaining / 1000);
    return {
      hours: Math.floor(totalSeconds / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    };
  }, [remaining]);

  const isCritical = remaining <= 60 * 1000;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 shadow-sm ${
        isCritical
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-gray-200 bg-white text-gray-900"
      }`}
    >
      <div className="text-right">
        <p className="text-[10px] uppercase tracking-wider text-gray-500">
          Section Time Remaining
        </p>
        <p className="font-bold text-xl tabular-nums leading-tight">
          {String(hours).padStart(2, "0")}:
          {String(minutes).padStart(2, "0")}:
          {String(seconds).padStart(2, "0")}
        </p>
      </div>
    </div>
  );
};

export default ExamTimer;
