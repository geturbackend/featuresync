"use client";
import { useState, useEffect } from 'react';
import { useDb, useUser } from '@urbackend/react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import VoteButton from '../../../components/VoteButton';
import StatusBadge from '../../../components/StatusBadge';
import TagBadge from '../../../components/TagBadge';
import CommentBox from '../../../components/CommentBox';
import LoadingSkeleton from '../../../components/LoadingSkeleton';

export default function FeatureDetail() {
  const { id } = useParams();
  const db = useDb();
  const { user } = useUser();
  const router = useRouter();

  const [feature, setFeature] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [featureData, commentsData] = await Promise.all([
        db.getOne('features', id),
        db.getAll('comments', { filter: { featureId: id } })
      ]);

      if (featureData) setFeature(featureData);
      if (commentsData) {
        const sortedComments = (commentsData || []).sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
        setComments(sortedComments);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this feature?')) return;
    
    try {
      const token = localStorage.getItem('ur_auth_token');
      const res = await db.delete('features', id, token);
      if (res.success) {
        router.push('/');
      } else {
        alert(res.message || 'Failed to delete');
      }
    } catch (error) {
      console.error(error);
      alert('Error deleting feature');
    }
  };

  if (isLoading) {
    return (
      <div className="app-container" style={{ flexDirection: 'column' }}>
        <Navbar />
        <main className="content-area">
          <LoadingSkeleton />
        </main>
      </div>
    );
  }

  if (!feature) {
    return (
      <div className="app-container" style={{ flexDirection: 'column' }}>
        <Navbar />
        <main className="content-area" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <h2>Feature not found</h2>
        </main>
      </div>
    );
  }

  const isOwner = user && user._id === feature.userId;

  return (
    <div className="app-container" style={{ flexDirection: 'column' }}>
      <Navbar />
      <main className="content-area" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
          <div style={{ marginTop: '0.25rem' }}>
            <VoteButton featureId={feature._id} initialVotes={feature.votes} />
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: '800', lineHeight: 1.2 }}>
                {feature.title}
              </h1>
              <StatusBadge status={feature.status} />
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
              {feature.tags?.map(tag => (
                <TagBadge key={tag} tag={tag} />
              ))}
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginLeft: 'auto' }}>
                Suggested by {feature.userName || 'Anonymous'} on {new Date(feature.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div style={{ 
              marginTop: '1.5rem', 
              paddingTop: '1.5rem', 
              borderTop: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              lineHeight: 1.6
            }}>
              {feature.description.split('\n').map((line, i) => (
                <p key={i} style={{ marginBottom: '1rem' }}>{line}</p>
              ))}
            </div>

            {isOwner && (
              <div style={{ marginTop: '1rem' }}>
                <button 
                  onClick={handleDelete}
                  style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: '500', textDecoration: 'underline' }}
                >
                  Delete Feature Request
                </button>
              </div>
            )}

            <CommentBox featureId={feature._id} initialComments={comments} />
          </div>
        </div>
      </main>
    </div>
  );
}
