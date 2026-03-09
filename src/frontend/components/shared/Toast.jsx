/** Fixed-position toast that slides in from the top-right. */
export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed top-16 right-4 bg-green-900/90 border border-green-600 text-green-300 text-sm px-4 py-3 rounded-lg shadow-xl z-50 animate-slide-up max-w-sm">
      {message}
    </div>
  );
}
