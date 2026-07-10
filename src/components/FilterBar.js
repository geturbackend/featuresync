export default function FilterBar({ currentFilter, setFilter }) {
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'under_review', label: 'Under Review' },
    { id: 'planned', label: 'Planned' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'done', label: 'Done' }
  ];

  return (
    <div style={{ 
      display: 'flex', 
      gap: '0.5rem',
      overflowX: 'auto',
      paddingBottom: '0.5rem',
      borderBottom: '1px solid var(--color-border)',
      marginBottom: '1.5rem'
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setFilter(tab.id)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: '500',
            backgroundColor: currentFilter === tab.id ? 'var(--color-accent)' : 'transparent',
            color: currentFilter === tab.id ? '#ffffff' : 'var(--color-text-muted)',
            boxShadow: 'none'
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
