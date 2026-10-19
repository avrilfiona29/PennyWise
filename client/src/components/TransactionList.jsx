import { useEffect, useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import api from '../services/api.js';

const categoriesByType = {
  expense: [
    'Food',
    'Travel',
    'Shopping',
    'Education',
    'Bills',
    'Entertainment',
    'Health',
    'Other',
  ],
  income: ['Salary', 'Allowance', 'Other'],
};
const allCategories = [...new Set([...categoriesByType.expense, ...categoriesByType.income])];

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

const formatDate = (value) => {
  const dateValue = String(value).slice(0, 10);
  const date = new Date(`${dateValue}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? dateValue
    : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(date);
};

export default function TransactionList({ refreshKey, onEdit, onChanged }) {
  const [transactions, setTransactions] = useState([]);
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [deletingId, setDeletingId] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const params = {};
    if (type) params.type = type;
    if (category) params.category = category;

    const loadTransactions = async () => {
      setIsLoading(true);
      setError('');
      try {
        const { data } = await api.get('/transactions', {
          params,
          signal: controller.signal,
        });
        setTransactions(data.transactions);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message || 'Unable to load transactions.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadTransactions();
    return () => controller.abort();
  }, [type, category, refreshKey, retryCount]);

  const visibleTransactions = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return transactions;
    return transactions.filter((transaction) =>
      `${transaction.title} ${transaction.category}`.toLocaleLowerCase().includes(query),
    );
  }, [transactions, search]);

  const handleTypeChange = (event) => {
    setType(event.target.value);
    setCategory('');
  };

  const handleDelete = async (transaction) => {
    const confirmed = window.confirm(`Delete "${transaction.title}"? This cannot be undone.`);
    if (!confirmed || deletingId) return;

    setDeletingId(transaction._id);
    setError('');
    try {
      await api.delete(`/transactions/${transaction._id}`);
      onChanged(transaction);
    } catch (err) {
      setError(err.message || 'Unable to delete this transaction.');
    } finally {
      setDeletingId('');
    }
  };

  const categoryOptions = type ? categoriesByType[type] : allCategories;
  const hasActiveFilters = Boolean(type || category || search.trim());

  return (
    <section className="transaction-list-card" aria-labelledby="transaction-list-title">
      <header className="transaction-list-header">
        <div>
          <p className="dashboard-eyebrow">Your activity</p>
          <h2 id="transaction-list-title">Transaction history</h2>
        </div>
      </header>

      <div className="transaction-filters" aria-label="Filter transactions">
        <div className="form-group">
          <label className="form-label" htmlFor="transaction-filter-type">Type</label>
          <select
            className="form-input"
            id="transaction-filter-type"
            value={type}
            onChange={handleTypeChange}
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="transaction-filter-category">Category</label>
          <select
            className="form-input"
            id="transaction-filter-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All categories</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="form-group transaction-search-group">
          <label className="form-label" htmlFor="transaction-search">Search</label>
          <input
            className="form-input"
            id="transaction-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title or category"
          />
        </div>
      </div>

      {isLoading && (
        <div className="transaction-list-state" role="status" aria-live="polite">
          <span className="dashboard-loading-spinner" aria-hidden="true" />
          <span>Loading transactions...</span>
        </div>
      )}

      {!isLoading && error && (
        <div className="transaction-list-error alert alert-error" role="alert">
          <p>{error}</p>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && visibleTransactions.length === 0 && (
        <div className="transaction-list-empty">
          <h3>{hasActiveFilters ? 'No matching transactions' : 'No transactions yet'}</h3>
          <p>
            {hasActiveFilters
              ? 'Try changing or clearing your search and filters.'
              : 'Transactions you add will appear here.'}
          </p>
        </div>
      )}

      {!isLoading && !error && visibleTransactions.length > 0 && (
        <ul className="transaction-items">
          {visibleTransactions.map((transaction) => (
            <li className="transaction-item" key={transaction._id}>
              <div className="transaction-item-main">
                <div className="transaction-item-heading">
                  <h3>{transaction.title}</h3>
                  <span className={`transaction-type-badge transaction-type-${transaction.type}`}>
                    {transaction.type}
                  </span>
                </div>
                <p className="transaction-item-meta">
                  {transaction.category} <span aria-hidden="true">·</span> {formatDate(transaction.date)}
                </p>
                {transaction.notes && <p className="transaction-item-notes">{transaction.notes}</p>}
              </div>

              <div className="transaction-item-actions">
                <p className={`transaction-item-amount transaction-amount-${transaction.type}`}>
                  {transaction.type === 'expense' ? '−' : '+'}
                  {currencyFormatter.format(transaction.amount)}
                </p>
                <div className="transaction-action-buttons">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => onEdit(transaction)}
                    disabled={Boolean(deletingId)}
                    aria-label={`Edit ${transaction.title}`}
                  >
                    <Pencil size={15} aria-hidden="true" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm transaction-delete-button"
                    onClick={() => handleDelete(transaction)}
                    disabled={Boolean(deletingId)}
                    aria-label={`Delete ${transaction.title}`}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    <span>{deletingId === transaction._id ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
