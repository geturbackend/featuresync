"use client";
import { useState } from 'react';
import { useUser, useDb } from '@urbackend/react';
import { useRouter } from 'next/navigation';

export default function CommentBox({ featureId, initialComments = [] }) {
  const { user, isAuthenticated } = useUser();
  const db = useDb();
  const router = useRouter();
  
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (!newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('ur_auth_token');
      
      const commentData = {
        featureId,
        userId: user._id,
        userName: user.username || 'Anonymous',
        content: newComment,
        createdAt: new Date().toISOString()
      };

      const insertedComment = await db.insert('comments', commentData, token);
      setComments([...comments, insertedComment]);
      setNewComment('');
    } catch (err) {
      console.error(err);
      alert('Error posting comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
        Comments ({comments.length})
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        {comments.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>No comments yet. Be the first to share your thoughts!</p>
        ) : (
          comments.map((comment, idx) => (
            <div key={comment._id || idx} style={{
              padding: '1rem',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '500' }}>{comment.userName}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p style={{ color: 'var(--color-text)' }}>{comment.content}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Leave a comment..."
          rows={3}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            marginBottom: '1rem',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
        <button 
          type="submit" 
          disabled={isSubmitting || !newComment.trim()}
          className="btn btn-primary"
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>
    </div>
  );
}
