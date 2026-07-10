"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@urbackend/react';

export default function VoteButton({ featureId, initialVotes = [] }) {
  const { user, isAuthenticated } = useUser();
  const router = useRouter();
  
  const [votes, setVotes] = useState(initialVotes);
  const [isVoting, setIsVoting] = useState(false);

  const hasVoted = user ? votes.includes(user._id) : false;
  const voteCount = votes.length;

  const handleVote = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isVoting) return;
    setIsVoting(true);

    try {
      // Optimistic update
      const newVotes = hasVoted 
        ? votes.filter(id => id !== user._id)
        : [...votes, user._id];
      
      setVotes(newVotes);

      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featureId, userId: user._id, action: 'toggle' })
      });

      if (!res.ok) {
        // Revert on failure
        setVotes(initialVotes);
      }
    } catch (error) {
      console.error('Failed to vote', error);
      setVotes(initialVotes);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <button 
      className={`vote-btn ${hasVoted ? 'voted' : ''}`}
      onClick={handleVote}
      disabled={isVoting}
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill={hasVoted ? "currentColor" : "none"} 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M12 19V5M5 12l7-7 7 7"/>
      </svg>
      <span style={{ fontWeight: '600', fontSize: '0.875rem', marginTop: '0.25rem' }}>
        {voteCount}
      </span>
    </button>
  );
}
