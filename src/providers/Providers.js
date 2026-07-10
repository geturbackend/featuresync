"use client";
import { UrProvider } from '@urbackend/react';

export function Providers({ children }) {
  return (
    <UrProvider apiKey={process.env.NEXT_PUBLIC_URBACKEND_API_KEY}>
      {children}
    </UrProvider>
  );
}
