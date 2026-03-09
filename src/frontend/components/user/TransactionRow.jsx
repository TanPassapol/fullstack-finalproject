import BookCover from '../shared/BookCover';
import Badge from '../shared/Badge';
import { formatDate, daysUntil } from '../../shared/utils';

/**
 * Displays a single borrow transaction as a card row.
 * Used in the Bookshelf page for both active and overdue items.
 */
export default function TransactionRow({ tx, onReturn, onRenew, isOverdue }) {
  const days = daysUntil(tx.dueDate);

  return (
    <div
      className={`bg-vault-card border rounded-xl p-4 flex gap-4 items-center ${
        isOverdue ? 'border-red-800/50' : 'border-vault-border'
      }`}
    >
      <BookCover book={tx.book} className="w-16 h-20 flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-vault-cream truncate">{tx.book.title}</h3>
        <p className="text-sm text-gray-400">{tx.book.author}</p>

        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="text-xs text-gray-400">
            Due: <span className="text-vault-amber">{formatDate(tx.dueDate)}</span>
          </span>
          <span className={`text-xs font-medium ${isOverdue ? 'text-red-400' : days <= 3 ? 'text-orange-400' : 'text-green-400'}`}>
            {isOverdue
              ? `${Math.abs(days)} days overdue · Fine: $${(Math.abs(days) * 0.5).toFixed(2)}`
              : `${days} days left`}
          </span>
          <span className="text-xs text-gray-500">Renewals: {tx.renewCount}/2</span>
        </div>

        {/* Due-date progress bar */}
        {!isOverdue && (
          <div className="mt-2 h-1.5 bg-vault-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-vault-amber rounded-full"
              style={{ width: `${Math.max(0, Math.min(100, (days / 14) * 100))}%` }}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <button className={`btn btn-sm ${isOverdue ? 'btn-danger' : 'btn-primary'}`} onClick={() => onReturn(tx)}>
          Return
        </button>
        {!isOverdue && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onRenew(tx)}
            disabled={tx.renewCount >= 2}
          >
            Renew
          </button>
        )}
      </div>
    </div>
  );
}
