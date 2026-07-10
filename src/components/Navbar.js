"use client";
import Link from 'next/link';
import { UrUserButton, useUser, useAuth } from '@urbackend/react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, isAuthenticated, isInitializing } = useUser();
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link href="/" style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-text)', letterSpacing: '-0.5px' }}>
          Feature<span style={{ color: 'var(--color-accent)' }}>Sync</span>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {!isInitializing && (
          isAuthenticated ? (
            <>
              {user?.role === 'admin' && (
                <Link href="/admin" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                  Admin
                </Link>
              )}
              <Link href="/submit" className="btn btn-primary">
                Submit Request
              </Link>
              <UrUserButton 
                position="inline" 
                shape="circle" 
              />
            </>
          ) : (
            <Link href="/login" className="btn btn-primary">
              Log In
            </Link>
          )
        )}
      </div>
    </nav>
  );
}
