export default function SortBar({ currentSort, setSort }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
      <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Sort by:</span>
      <select 
        value={currentSort}
        onChange={(e) => setSort(e.target.value)}
        style={{
          padding: '0.5rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          fontSize: '0.875rem',
          cursor: 'pointer'
        }}
      >
        <option value="votes">Most Voted</option>
        <option value="newest">Newest</option>
      </select>
    </div>
  );
}
