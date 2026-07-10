"use client";
import { useState } from 'react';
import { useDb, useUser, ProtectedRoute } from '@urbackend/react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';

export default function Submit() {
  const db = useDb();
  const { user } = useUser();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !title.trim() || !description.trim()) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('ur_auth_token');
      
      const featureData = {
        title,
        description,
        status: 'under_review',
        userId: user._id,
        userName: user.username || 'Anonymous',
        votes: [user._id], // upvote own feature by default
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        createdAt: new Date().toISOString()
      };

      await db.insert('features', featureData, token);
      router.push('/');
    } catch (err) {
      console.error(err);
      alert('Error submitting request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute redirectTo="/login">
      <div className="app-container" style={{ flexDirection: 'column' }}>
        <Navbar />
        <main className="content-area" style={{ maxWidth: '600px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1.5rem' }}>
            Submit a Feature Request
          </h1>
          
          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            backgroundColor: 'var(--color-surface)',
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Short, descriptive title"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is the feature and why do you need it?"
                required
                rows={5}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Tags (comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. ui, performance, api"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button 
                type="button" 
                onClick={() => router.back()}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting || !title.trim() || !description.trim()}
                className="btn btn-primary"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  );
}
