"use client";
import { useState, useEffect } from 'react';
import { useDb, useUser, ProtectedRoute } from '@urbackend/react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';

export default function AdminDashboard() {
  const { user, isInitializing } = useUser();
  const db = useDb();
  const router = useRouter();
  
  const [features, setFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(null);

  useEffect(() => {
    if (!isInitializing && user) {
      if (user.role !== 'admin') {
        router.push('/');
      } else {
        fetchFeatures();
      }
    }
  }, [user, isInitializing]);

  const fetchFeatures = async () => {
    setIsLoading(true);
    try {
      const data = await db.getAll('features');
      setFeatures((data || []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (featureId, newStatus) => {
    setIsUpdating(featureId);
    try {
      const token = localStorage.getItem('ur_auth_token');
      const res = await fetch('/api/admin/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featureId, status: newStatus, token })
      });
      if (res.ok) {
        setFeatures(features.map(f => f._id === featureId ? { ...f, status: newStatus } : f));
      } else {
        const error = await res.json();
        alert(error.message || 'Update failed');
      }
    } catch (error) {
      console.error(error);
      alert('Error updating status');
    } finally {
      setIsUpdating(null);
    }
  };

  const deleteFeature = async (featureId) => {
    if (!confirm('Are you sure? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('ur_auth_token');
      const res = await fetch('/api/admin/delete-feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featureId, token })
      });
      if (res.ok) {
        setFeatures(features.filter(f => f._id !== featureId));
      } else {
        const error = await res.json();
        alert(error.message || 'Delete failed');
      }
    } catch (error) {
      console.error(error);
      alert('Error deleting feature');
    }
  };

  if (isInitializing || !user || user.role !== 'admin') return null;

  return (
    <ProtectedRoute redirectTo="/login">
      <div className="app-container" style={{ flexDirection: 'column' }}>
        <Navbar />
        <main className="content-area">
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '2rem' }}>
            Admin Dashboard
          </h1>

          {isLoading ? (
            <p>Loading features...</p>
          ) : (
            <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '1rem', fontWeight: '600' }}>Title</th>
                    <th style={{ padding: '1rem', fontWeight: '600' }}>Votes</th>
                    <th style={{ padding: '1rem', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '1rem', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map(feature => (
                    <tr key={feature._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '500' }}>{feature.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>by {feature.userName}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>{feature.votes?.length || 0}</td>
                      <td style={{ padding: '1rem' }}>
                        <StatusBadge status={feature.status} />
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <select 
                          value={feature.status}
                          onChange={(e) => updateStatus(feature._id, e.target.value)}
                          disabled={isUpdating === feature._id}
                          style={{ 
                            marginRight: '1rem', 
                            padding: '0.4rem 0.75rem', 
                            borderRadius: '4px',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-surface)',
                            color: 'var(--color-text)',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          <option value="under_review">Under Review</option>
                          <option value="planned">Planned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                        <button 
                          onClick={() => deleteFeature(feature._id)}
                          style={{ 
                            color: '#ef4444', 
                            fontSize: '0.875rem', 
                            fontWeight: '500', 
                            cursor: 'pointer', 
                            background: '#fef2f2', 
                            border: '1px solid #fca5a5',
                            padding: '0.4rem 0.75rem',
                            borderRadius: '4px'
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
