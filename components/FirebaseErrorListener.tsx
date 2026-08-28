'use client';

import React, { useEffect } from 'react';
import { errorEmitter } from '@/lib/error-emitter';
import type { DataPermissionError } from '@/lib/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * Listens for app-wide data/permission errors (e.g. Supabase RLS policy violations
 * surfaced by services) and shows a toast. Framework-agnostic: not tied to Firebase.
 */
export function AppErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: DataPermissionError) => {
      toast({
        variant: 'destructive',
        title: 'Security Permission Denied',
        description: `You don't have permission to ${error.operation} at ${error.path}. Please check your access rights.`,
      });

      if (process.env.NODE_ENV === 'development') {
        console.error('Contextual Security Error:', error);
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}

// Backwards-compatible alias for existing imports.
export const FirebaseErrorListener = AppErrorListener;
