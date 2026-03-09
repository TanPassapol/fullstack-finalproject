/** Simple amber spinner used during loading states. */
export default function Spinner({ size = 'md' }) {
  const sz = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  return (
    <div className={`${sz} border-2 border-vault-amber border-t-transparent rounded-full animate-spin`} />
  );
}
