export const getRemainingMilliseconds = (endTime) => {
  if (!endTime) return 0;

  return Math.max(
    0,
    new Date(endTime).getTime() - Date.now()
  );
};

export const formatTime = (milliseconds) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
};

export const hasExamStarted = (startTime) => {
  if (!startTime) return false;
  return Date.now() >= new Date(startTime).getTime();
};

export const hasExamEnded = (endTime) => {
  if (!endTime) return false;
  return Date.now() >= new Date(endTime).getTime();
};
