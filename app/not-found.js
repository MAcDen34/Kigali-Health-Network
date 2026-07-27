'use client';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Compass } from 'lucide-react';

export default function NotFound() {
  const { state } = useApp();
  const href = state.user ? '/dashboard' : '/login';

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 animate-fade-in">
      <Compass className="w-12 h-12 text-h-text-light mb-4" />
      <p className="text-6xl font-bold text-h-text mb-2">404</p>
      <h1 className="text-lg font-semibold text-h-text mb-1">Page not found</h1>
      <p className="text-sm text-h-text-muted max-w-sm mb-6">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
      </p>
      <Link href={href} className="btn-primary">
        {state.user ? 'Back to dashboard' : 'Back to sign in'}
      </Link>
    </div>
  );
}
