"use client";
import { useState, useEffect } from 'react';
import { useDb } from '@urbackend/react';
import Navbar from '../components/Navbar';
import FeatureCard from '../components/FeatureCard';
import FilterBar from '../components/FilterBar';
import SortBar from '../components/SortBar';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function Home() {
  const db = useDb();
  const [features, setFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('votes');

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    setIsLoading(true);
    try {
      const data = await db.getAll('features');
      setFeatures(data || []);
    } catch (error) {
      console.error('Failed to fetch features', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFeatures = features.filter(f => filter === 'all' || f.status === filter);
  
  const sortedFeatures = [...filteredFeatures].sort((a, b) => {
    if (sort === 'votes') {
      return (b.votes?.length || 0) - (a.votes?.length || 0);
    } else {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  return (
    <div className="app-container" style={{ flexDirection: 'column' }}>
      <Navbar />
      <main className="content-area">
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
            Feature Request Board <span style={{fontWeight: '400', color: 'var(--color-text-muted)'}}>for</span> <a href="https://github.com/yash-pouranik/urBackend" target="_blank" rel="noopener noreferrer" style={{color: 'var(--color-accent)', textDecoration: 'none'}}>urBackend</a>
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem' }}>
            Help us shape the future of our product by submitting and voting on ideas.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <FilterBar currentFilter={filter} setFilter={setFilter} />
          <SortBar currentSort={sort} setSort={setSort} />
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sortedFeatures.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px dashed var(--color-border)'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>No features found</h3>
                <p style={{ color: 'var(--color-text-muted)' }}>
                  Be the first to suggest a new feature!
                </p>
              </div>
            ) : (
              sortedFeatures.map(feature => (
                <FeatureCard key={feature._id} feature={feature} />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
