/** Format a date to "Jan 1, 2025" style */
export function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

/** Days remaining until a date (negative = overdue) */
export function daysUntil(d) {
  return Math.ceil((new Date(d) - Date.now()) / 86400000);
}

/** Convert bytes to "X.X GB" string */
export function formatBytes(bytes) {
  return (bytes / 1024 / 1024 / 1024).toFixed(1) + ' GB';
}
