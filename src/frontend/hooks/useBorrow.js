import { useCallback, useState } from 'react';

/**
 * Manages the borrow action and toast notification state.
 * Can be wired to the real API by replacing the mock logic inside handleBorrow.
 */
export function useBorrow(transactions, setTransactions) {
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const handleBorrow = useCallback((book) => {
    const alreadyBorrowed = transactions.some(
      (t) => t.book._id === book._id && t.status === 'borrowed'
    );
    if (alreadyBorrowed) {
      showToast('You already have this book borrowed!');
      return;
    }
    if (book.available <= 0) {
      showToast('No copies available.');
      return;
    }

    const newTx = {
      _id:        'tx_' + Date.now(),
      book,
      status:     'borrowed',
      borrowedAt: new Date(),
      dueDate:    new Date(Date.now() + 14 * 86400000),
      renewCount: 0,
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`✅ "${book.title}" borrowed! Due in 14 days.`);
  }, [transactions, setTransactions]);

  return { handleBorrow, toast };
}
