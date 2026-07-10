export default function LoadingSkeleton() {
  return (
    <div className="skeleton-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="skeleton-card" style={{
          height: '120px',
          backgroundColor: '#e5e7eb',
          borderRadius: 'var(--radius-md)',
          animation: 'pulse 1.5s infinite ease-in-out'
        }} />
      ))}
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
