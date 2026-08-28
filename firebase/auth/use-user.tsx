'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';

/**
 * useUser - Hook to track the current Firebase auth session.
 * Resilience added: Handles cases where Firebase is not yet configured or auth is null.
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If auth is null (unconfigured), stop loading and exit early to prevent crash
    if (!auth) {
      setLoading(false);
      return;
    }

    // Listen for changes on auth state
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}
