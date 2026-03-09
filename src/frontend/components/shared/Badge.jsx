const CLASS_MAP = {
  available: 'badge-available',
  borrowed:  'badge-borrowed',
  overdue:   'badge-overdue',
  returned:  'badge-returned',
};

/** Small coloured pill showing a transaction or availability status. */
export default function Badge({ status }) {
  return (
    <span className={`badge ${CLASS_MAP[status] || 'badge-returned'}`}>
      {status}
    </span>
  );
}
