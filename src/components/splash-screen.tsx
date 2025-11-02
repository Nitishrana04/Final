'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 3500); // This timeout matches the animation duration

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex items-center justify-center h-screen bg-background">
      <h1 className="text-5xl md:text-8xl font-bold text-accent tracking-widest uppercase animate-netflix-intro drop-shadow-[0_0_10px_hsl(var(--accent))]">
        Level Up Fitness
      </h1>
    </main>
  );
}
