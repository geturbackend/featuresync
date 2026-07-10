export default function StatusBadge({ status }) {
  const statusMap = {
    under_review: { label: 'Under Review', color: '#9ca3af', bg: '#f3f4f6' },
    planned: { label: 'Planned', color: '#3b82f6', bg: '#eff6ff' },
    in_progress: { label: 'In Progress', color: '#f59e0b', bg: '#fffbeb' },
    done: { label: 'Done', color: '#22c55e', bg: '#f0fdf4' }
  };

  const config = statusMap[status] || statusMap.under_review;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      color: config.color,
      backgroundColor: config.bg,
      border: `1px solid ${config.color}33`
    }}>
      {config.label}
    </span>
  );
}
