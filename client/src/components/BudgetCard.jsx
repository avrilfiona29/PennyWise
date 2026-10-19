import { useEffect, useRef, useState } from 'react';
import { Pencil, Wallet } from 'lucide-react';
import api from '../services/api.js';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export default function BudgetCard({
  summary,
  isLoading,
  onBudgetUpdated,
}) {
  const budget = summary?.monthly.budget ?? 0;
  const expenses = summary?.monthly.expenses ?? 0;
  const remaining = summary?.monthly.remaining ?? budget - expenses;
  const [isEditing, setIsEditing] = useState(false);
  const [budgetInput, setBudgetInput] = useState(String(budget));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const savingRef = useRef(false);

  useEffect(() => {
    if (!isEditing) setBudgetInput(String(budget));
  }, [budget, isEditing]);

  const hasBudget = budget > 0;
  const isOverspent = hasBudget ? expenses > budget : expenses > 0;
  const isFullyUsed = hasBudget && expenses === budget;
  const rawProgress = hasBudget ? (expenses / budget) * 100 : 0;
  const progress = Math.min(rawProgress, 100);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (savingRef.current) return;

    const nextBudget = Number(budgetInput);
    if (budgetInput.trim() === '' || !Number.isFinite(nextBudget) || nextBudget < 0) {
      setError('Enter a valid budget amount of ₹0 or more.');
      setSuccessMessage('');
      return;
    }

    savingRef.current = true;
    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const { data } = await api.put('/transactions/budget', {
        monthlyBudget: nextBudget,
      });
      setBudgetInput(String(data.monthlyBudget));
      setIsEditing(false);
      setSuccessMessage('Monthly budget updated successfully.');
      onBudgetUpdated(data.monthlyBudget);
    } catch (err) {
      setError(err.message || 'Unable to update your monthly budget.');
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  return (
    <section className="budget-card" aria-labelledby="budget-card-title">
      <header className="budget-card-header">
        <div className="budget-card-heading">
          <span className="budget-card-icon" aria-hidden="true"><Wallet /></span>
          <div>
            <p className="dashboard-eyebrow">Monthly plan</p>
            <h2 id="budget-card-title">Spending budget</h2>
          </div>
        </div>
        {summary && !isEditing && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setBudgetInput(String(budget));
              setError('');
              setSuccessMessage('');
              setIsEditing(true);
            }}
          >
            <Pencil size={15} aria-hidden="true" />
            <span>Edit budget</span>
          </button>
        )}
      </header>

      {isLoading && !summary ? (
        <div className="budget-state" role="status" aria-live="polite">
          <span className="dashboard-loading-spinner" aria-hidden="true" />
          <span>Loading budget...</span>
        </div>
      ) : summary ? (
        <>
          {isEditing ? (
            <form className="budget-edit-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="monthly-budget">Monthly limit (INR)</label>
                <input
                  className="form-input"
                  id="monthly-budget"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={budgetInput}
                  onChange={(event) => {
                    setBudgetInput(event.target.value);
                    setError('');
                    setSuccessMessage('');
                  }}
                  disabled={isSaving}
                  required
                />
              </div>
              <div className="budget-edit-actions">
                <button className="btn btn-primary" type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save budget'}
                </button>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => {
                    setBudgetInput(String(budget));
                    setError('');
                    setIsEditing(false);
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="budget-values">
              <div className="budget-value">
                <span>Monthly budget</span>
                <strong>{currencyFormatter.format(budget)}</strong>
              </div>
              <div className="budget-value">
                <span>This month's expenses</span>
                <strong>{currencyFormatter.format(expenses)}</strong>
              </div>
              <div className={`budget-value budget-remaining${isOverspent ? ' is-overspent' : ''}`}>
                <span>{isOverspent ? 'Over budget by' : 'Remaining'}</span>
                <strong>
                  {currencyFormatter.format(isOverspent ? Math.abs(remaining) : remaining)}
                </strong>
              </div>
            </div>
          )}

          <div className="budget-progress-section">
            {hasBudget ? (
              <>
                <div className="budget-progress-label">
                  <span>
                    {isOverspent
                      ? `${rawProgress.toFixed(1)}% of budget`
                      : isFullyUsed
                        ? 'Budget fully used'
                        : `${rawProgress.toFixed(1)}% used`}
                  </span>
                  {isOverspent && <span className="budget-warning">Over budget</span>}
                </div>
                <div
                  className="budget-progress-track"
                  role="progressbar"
                  aria-label="Monthly budget used"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow={progress}
                >
                  <div
                    className={`budget-progress-fill${isOverspent ? ' is-overspent' : ''}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </>
            ) : (
              <p className={`budget-zero-message${isOverspent ? ' budget-warning' : ''}`}>
                {isOverspent
                  ? `No budget is set; ${currencyFormatter.format(expenses)} has been spent this month.`
                  : 'No monthly budget is set. Set one to track your spending progress.'}
              </p>
            )}
          </div>

          {error && <p className="alert alert-error budget-feedback" role="alert">{error}</p>}
          {successMessage && (
            <p className="alert alert-success budget-feedback" role="status">{successMessage}</p>
          )}
        </>
      ) : (
        <div className="budget-error alert alert-error" role="alert">
          <p>Budget details are unavailable until the dashboard summary loads.</p>
        </div>
      )}
    </section>
  );
}
