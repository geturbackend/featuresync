"use client";
import { UrAuth, GuestRoute } from '@urbackend/react';
import Navbar from '../../components/Navbar';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  
  return (
    <GuestRoute redirectTo="/">
      <div className="app-container" style={{ flexDirection: 'column' }}>
        <Navbar />
        <main className="content-area" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, padding: '2rem' }}>
          <div style={{ width: '100%', maxWidth: '420px' }}>
            <UrAuth 
              providers={[]} 
              theme="light"
              branding={{
                appName: 'FeatureSync',
                title: 'Welcome to FeatureSync',
                subtitle: 'Log in to vote on your favorite features',
                primaryColor: '#5B4FFF'
              }}
              colors={{
                primary: '#5B4FFF',
                primaryText: '#ffffff'
              }}
              onSuccess={() => router.push('/')}
            />
          </div>
        </main>
      </div>
    </GuestRoute>
  );
}
