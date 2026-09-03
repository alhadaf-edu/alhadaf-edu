'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/select-curriculum'
];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (loading || !mounted) return;

    // Check if current path is public
    const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));
    if (isPublic) return;

    // If user is not logged in
    if (!user) {
      const remembered = typeof window !== 'undefined' ? localStorage.getItem('alhadaf_remember_me') : null;
      
      // If NOT logged in and NOT remembered, redirect to login
      if (remembered !== 'true') {
        router.replace('/auth/login');
      }
    }
  }, [user, loading, mounted, pathname, router]);

  // If page is public, render immediately
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));
  if (isPublic) {
    return <>{children}</>;
  }

  // Show quick smooth splash while redirecting unauthenticated visitor
  if (!loading && mounted && !user) {
    const remembered = typeof window !== 'undefined' ? localStorage.getItem('alhadaf_remember_me') : null;
    if (remembered !== 'true') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-4">
          <div className="flex flex-col items-center gap-4 text-center animate-fade-in">
            <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border-2 border-gold-500/50 bg-slate-900 p-2 shadow-glow animate-pulse">
              <Image src="/logo.png" alt="منصة الهَدَّاف" width={68} height={68} className="object-contain" priority />
            </div>
            <h2 className="text-xl font-black font-heading text-white">منصة الهَدَّاف التعليمية</h2>
            <p className="text-xs text-slate-400">جاري توجيهك لصفحة تسجيل الدخول...</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
