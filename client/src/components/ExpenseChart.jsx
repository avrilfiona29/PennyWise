import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

const compactCurrencyFormatter = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const formatAxisCurrency = (value) => `₹${compactCurrencyFormatter.format(value)}`;

const formatTooltipCurrency = (value) => currencyFormatter.format(value);

export default function ExpenseChart({ categoryBreakdown, isLoading, error }) {
  const data = Array.isArray(categoryBreakdown)
    ? categoryBreakdown.filter(
      (item) => item
        && typeof item.category === 'string'
        && Number.isFinite(item.total)
        && item.total >= 0,
    )
    : [];

  return (
    <section className="expense-chart-card" aria-labelledby="expense-chart-title">
      <header className="expense-chart-header">
        <div>
          <p className="dashboard-eyebrow">Spending breakdown</p>
          <h2 id="expense-chart-title">Expenses by category</h2>
          <p className="expense-chart-subtitle">Current month</p>
        </div>
      </header>

      {isLoading && (
        <div className="expense-chart-state" role="status" aria-live="polite">
          <span className="dashboard-loading-spinner" aria-hidden="true" />
          <span>Loading category spending...</span>
        </div>
      )}

      {!isLoading && error && (
        <div className="expense-chart-state alert alert-error" role="alert">
          {error}
        </div>
      )}

      {!isLoading && !error && data.length === 0 && (
        <div className="expense-chart-empty">
          <h3>No category spending yet</h3>
          <p>Current-month expense totals by category will appear here.</p>
        </div>
      )}

      {!isLoading && !error && data.length > 0 && (
        <div
          className="expense-chart-plot"
          role="img"
          aria-label={`Current-month expenses by category: ${data
            .map(({ category, total }) => `${category}, ${formatTooltipCurrency(total)}`)
            .join('; ')}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 20, bottom: 4, left: 4 }}
              barCategoryGap="22%"
            >
              <CartesianGrid stroke="var(--color-border)" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={formatAxisCurrency}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis
                type="category"
                dataKey="category"
                width={112}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#1e1e1e', fontSize: 12 }}
              />
              <Tooltip
                formatter={formatTooltipCurrency}
                cursor={{ fill: 'rgba(45, 106, 79, 0.08)' }}
                contentStyle={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.625rem',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                }}
                labelStyle={{ color: '#1e1e1e', fontWeight: 600 }}
              />
              <Bar
                dataKey="total"
                name="Expenses"
                fill="#2d6a4f"
                radius={[0, 5, 5, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
