import Link from 'next/link';
import VoteButton from './VoteButton';
import StatusBadge from './StatusBadge';
import TagBadge from './TagBadge';

export default function FeatureCard({ feature }) {
  return (
    <Link href={`/feature/${feature._id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      <div className="feature-card" style={{
        display: 'flex',
        gap: '1.25rem',
        padding: '1.5rem',
        cursor: 'pointer'
      }}>
        <div>
          <VoteButton featureId={feature._id} initialVotes={feature.votes} />
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              {feature.title}
            </h3>
            <StatusBadge status={feature.status} />
          </div>
          
          <p style={{ 
            color: 'var(--color-text-muted)', 
            marginBottom: '1rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {feature.description}
          </p>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {feature.tags?.map(tag => (
              <TagBadge key={tag} tag={tag} />
            ))}
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginLeft: 'auto' }}>
              by {feature.userName || 'Anonymous'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
