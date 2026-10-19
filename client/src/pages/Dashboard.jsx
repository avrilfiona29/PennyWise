import { useEffect, useState } from 'react';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import StatCard from '../components/StatCard.jsx';
import BudgetCard from '../components/BudgetCard.jsx';
import ExpenseChart from '../components/ExpenseChart.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import TransactionList from '../components/TransactionList.jsx';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { updateUser } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [summaryRefreshCount, setSummaryRefreshCount] = useState(0);
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadSummary = async () => {
      setIsLoading(true);
      setError('');

      try {
        const { data } = await api.get('/transactions/summary', {
          signal: controller.signal,
        });
        setSummary(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message || 'Unable to load your financial summary.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadSummary();
    return () => controller.abort();
  }, [retryCount, summaryRefreshCount]);

  const hasNoTransactions = summary
    && summary.allTime.income === 0
    && summary.allTime.expenses === 0;

  return (
    <>
      <Navbar />
      <main className="dashboard-page">
        <div className="dashboard-content">
          <header className="dashboard-header">
            <div>
              <p className="dashboard-eyebrow">Overview</p>
              <h1>Your finances at a glance</h1>
              <p className="dashboard-subtitle">
                A snapshot of your balance and this month&apos;s activity.
              </p>
            </div>
          </header>

          {isLoading && (
            <div className="dashboard-loading" role="status" aria-live="polite">
              <span className="dashboard-loading-spinner" aria-hidden="true" />
              <span>Loading your summary...</span>
            </div>
          )}

          {!isLoading && error && (
            <div className="dashboard-error alert alert-error" role="alert">
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

          {!isLoading && !error && summary && (
            <>
              <section className="stat-grid" aria-label="Financial summary">
                <StatCard
                  title="All-time balance"
                  value={summary.allTime.balance}
                  detail="Income minus expenses"
                  icon={<Wallet />}
                  tone="balance"
                />
                <StatCard
                  title="This month's income"
                  value={summary.monthly.income}
                  detail="Income recorded this month"
                  icon={<TrendingUp />}
                  tone="income"
                />
                <StatCard
                  title="This month's expenses"
                  value={summary.monthly.expenses}
                  detail="Expenses recorded this month"
                  icon={<TrendingDown />}
                  tone="expenses"
                />
              </section>

              {hasNoTransactions && (
                <div className="dashboard-empty" role="status">
                  <h2>No transactions yet</h2>
                  <p>
                    Your summary will show activity here once transactions have
                    been recorded.
                  </p>
                </div>
              )}
            </>
          )}

          <BudgetCard
            summary={summary}
            isLoading={isLoading}
            onBudgetUpdated={(monthlyBudget) => {
              updateUser({ monthlyBudget });
              setSummaryRefreshCount((count) => count + 1);
            }}
          />

          <ExpenseChart
            categoryBreakdown={summary?.monthly?.categoryBreakdown}
            isLoading={isLoading}
            error={!isLoading && error ? 'Category spending could not be loaded. Try refreshing the dashboard.' : ''}
          />

          <TransactionForm
            onCreated={() => setSummaryRefreshCount((count) => count + 1)}
          />
          {editingTransaction && (
            <TransactionForm
              key={editingTransaction._id}
              transaction={editingTransaction}
              onUpdated={() => setSummaryRefreshCount((count) => count + 1)}
              onCancel={() => setEditingTransaction(null)}
            />
          )}
          <TransactionList
            refreshKey={summaryRefreshCount}
            onEdit={setEditingTransaction}
            onChanged={(deletedTransaction) => {
              if (editingTransaction?._id === deletedTransaction._id) {
                setEditingTransaction(null);
              }
              setSummaryRefreshCount((count) => count + 1);
            }}
          />
        </div>
      </main>
    </>
  );
}
