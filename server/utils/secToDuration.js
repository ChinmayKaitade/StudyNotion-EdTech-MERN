/**
 * @function convertSecondsToDuration
 * @description Converts a total number of seconds into a human-readable string format,
 * showing the largest appropriate units (e.g., "1h 30m", "45m 15s", or "30s").
 * @param {number} totalSeconds - The total duration in seconds.
 * @returns {string} The formatted duration string.
 */
function convertSecondsToDuration(totalSeconds) {
  // 1. Calculate hours (3600 seconds/hour)
  const hours = Math.floor(totalSeconds / 3600); // 2. Calculate remaining minutes (seconds left after hours, divided by 60)
  const minutes = Math.floor((totalSeconds % 3600) / 60); // 3. Calculate remaining seconds (seconds left after hours, modulo 60)
  const seconds = Math.floor((totalSeconds % 3600) % 60); // 4. Format the output based on the largest unit present
  if (hours > 0) {
    // Format: "Xh Ym"
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    // Format: "Xm Ys"
    return `${minutes}m ${seconds}s`;
  } else {
    // Format: "Xs"
    return `${seconds}s`;
  }
}
module.exports = {
  convertSecondsToDuration,
};
