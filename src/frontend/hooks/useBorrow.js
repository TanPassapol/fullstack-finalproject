import { useCallback, useState } from 'react';
import api from '../api';

/**
 * Manages the borrow action against the real backend API.
 * On success, re-fetches transactions to stay in sync with DB.
 */
export function useBorrow(fetchTransactions) {
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const handleBorrow = useCallback(async (book) => {
    if (book.available <= 0) {
      showToast('No copies available.');
      return;
    }
    try {
      await api.post('/transactions/borrow', { bookId: book._id });
      showToast(`✅ "${book.title}" borrowed! Due in 14 days.`);
      if (fetchTransactions) fetchTransactions();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to borrow book.');
    }
  }, [fetchTransactions]);

  return { handleBorrow, toast };
}