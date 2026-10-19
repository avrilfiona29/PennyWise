import { useEffect, useState } from 'react';
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

const getLocalDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

export default function TransactionForm({
  transaction = null,
  onCreated,
  onUpdated,
  onCancel,
}) {
  const isEditing = Boolean(transaction?._id);
  const fieldId = isEditing ? `transaction-${transaction._id}` : 'new-transaction';
  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categoriesByType.expense[0]);
  const [date, setDate] = useState(getLocalDate);
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState('');
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!transaction) return;
    setType(transaction.type);
    setTitle(transaction.title);
    setAmount(String(transaction.amount));
    setCategory(transaction.category);
    setDate(String(transaction.date).slice(0, 10));
    setNotes(transaction.notes || '');
    clearFeedback();
  }, [transaction]);

  const clearFeedback = () => {
    setValidationError('');
    setApiError('');
    setSuccessMessage('');
  };

  const handleTypeChange = (event) => {
    const nextType = event.target.value;
    setType(nextType);
    setCategory(categoriesByType[nextType][0]);
    clearFeedback();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    clearFeedback();

    const trimmedTitle = title.trim();
    const parsedAmount = Number(amount);

    if (!trimmedTitle) {
      setValidationError('Enter a title for this transaction.');
      return;
    }
    if (trimmedTitle.length > 100) {
      setValidationError('Title must be 100 characters or fewer.');
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setValidationError('Enter an amount greater than ₹0.');
      return;
    }
    if (!categoriesByType[type].includes(category)) {
      setValidationError('Choose a valid category for this transaction type.');
      return;
    }
    if (!date || Number.isNaN(new Date(date).getTime())) {
      setValidationError('Choose a valid transaction date.');
      return;
    }
    if (notes.length > 500) {
      setValidationError('Notes must be 500 characters or fewer.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        type,
        title: trimmedTitle,
        amount: parsedAmount,
        category,
        date,
        notes: notes.trim(),
      };

      if (isEditing) {
        await api.put(`/transactions/${transaction._id}`, payload);
        setSuccessMessage('Transaction updated successfully.');
        onUpdated?.();
        return;
      }

      await api.post('/transactions', payload);

      setTitle('');
      setAmount('');
      setNotes('');
      setSuccessMessage('Transaction added successfully.');
      onCreated?.();
    } catch (err) {
      setApiError(err.message || 'Unable to save this transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="transaction-form-card" aria-labelledby={`${fieldId}-heading`}>
      <header className="transaction-form-header">
        <div>
          <p className="dashboard-eyebrow">{isEditing ? 'Edit transaction' : 'Add transaction'}</p>
          <h2 id={`${fieldId}-heading`}>
            {isEditing ? 'Update transaction details' : 'Record income or expense'}
          </h2>
        </div>
      </header>

      <form className="transaction-form" onSubmit={handleSubmit} noValidate>
        <fieldset className="transaction-form-fields" disabled={isSubmitting}>
          <div className="transaction-form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor={`${fieldId}-type`}>Type</label>
              <select
                className="form-input"
                id={`${fieldId}-type`}
                value={type}
                onChange={handleTypeChange}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor={`${fieldId}-title`}>Title</label>
              <input
                className="form-input"
                id={`${fieldId}-title`}
                type="text"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  clearFeedback();
                }}
                maxLength={100}
                required
                placeholder="e.g. Groceries"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor={`${fieldId}-amount`}>
                Amount <span className="form-hint">(INR)</span>
              </label>
              <input
                className="form-input"
                id={`${fieldId}-amount`}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                  clearFeedback();
                }}
                required
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor={`${fieldId}-category`}>Category</label>
              <select
                className="form-input"
                id={`${fieldId}-category`}
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  clearFeedback();
                }}
              >
                {categoriesByType[type].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor={`${fieldId}-date`}>Date</label>
              <input
                className="form-input"
                id={`${fieldId}-date`}
                type="date"
                value={date}
                onChange={(event) => {
                  setDate(event.target.value);
                  clearFeedback();
                }}
                required
              />
            </div>

            <div className="form-group transaction-notes-group">
              <label className="form-label" htmlFor={`${fieldId}-notes`}>
                Notes <span className="form-hint">(optional)</span>
              </label>
              <textarea
                className="form-input transaction-notes"
                id={`${fieldId}-notes`}
                value={notes}
                onChange={(event) => {
                  setNotes(event.target.value);
                  clearFeedback();
                }}
                maxLength={500}
                rows={3}
                placeholder="Add any details you want to remember"
              />
              <span className="form-hint transaction-notes-count">{notes.length}/500</span>
            </div>
          </div>
        </fieldset>

        {validationError && <p className="alert alert-error" role="alert">{validationError}</p>}
        {apiError && <p className="alert alert-error" role="alert">{apiError}</p>}
        {successMessage && <p className="alert alert-success" role="status">{successMessage}</p>}

        <div className="transaction-form-actions">
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving transaction...' : isEditing ? 'Save changes' : 'Add transaction'}
          </button>
          {isEditing && (
            <button
              className="btn btn-ghost"
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
