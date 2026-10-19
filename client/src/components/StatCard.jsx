const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export default function StatCard({ title, value, detail, icon, tone = 'balance' }) {
  return (
    <article className={`stat-card stat-card-${tone}`}>
      <div className="stat-card-topline">
        <p className="stat-card-title">{title}</p>
        {icon && (
          <span className="stat-card-icon" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
      <p className="stat-card-value">{currencyFormatter.format(value)}</p>
      {detail && <p className="stat-card-detail">{detail}</p>}
    </article>
  );
}
