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
    <main
      className="flex items-center justify-center h-screen bg-background px-4 overflow-hidden"
      role="main"
      aria-label="Splash screen"
    >
      <h1 className="w-full max-w-3xl text-center text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-bold text-accent tracking-wide uppercase animate-netflix-intro drop-shadow-[0_0_10px_hsl(var(--accent))] leading-tight break-words">
        Level Up Fitness
      </h1>
    </main>
  );
}
