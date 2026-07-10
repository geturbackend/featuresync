export default function TagBadge({ tag }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: '500',
      color: 'var(--color-text-muted)',
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }}>
      {tag}
    </span>
  );
}
