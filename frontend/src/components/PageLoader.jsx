/* Full-page skeleton loader shown during initial data fetch */
export default function PageLoader({ rows = 5 }) {
  return (
    <div className="page-loader" aria-busy="true" aria-label="Loading…">
      <div className="pl-header">
        <div className="sk sk-h1" />
        <div className="sk sk-h2" />
      </div>
      <div className="pl-rows">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="pl-row" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="sk sk-avatar-lg" />
            <div className="pl-lines">
              <div className="sk sk-line sk-line--lg" />
              <div className="sk sk-line sk-line--sm" />
            </div>
            <div className="sk sk-line sk-line--md" />
            <div className="sk sk-badge" />
          </div>
        ))}
      </div>
    </div>
  );
}
