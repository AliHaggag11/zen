'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreditsPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to dashboard since credits functionality has been removed
    router.replace('/dashboard');
  }, [router]);
  
  return null;
} 