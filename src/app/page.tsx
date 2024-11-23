'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /consumer when the root page is accessed
    router.push('/consumer');
  }, [router]);

  return null; // Render nothing since it's only a redirect
}
