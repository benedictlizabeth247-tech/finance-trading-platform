'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  type DocumentData,
  type QueryConstraint
} from 'firebase/firestore';

/**
 * useCollection - Real-time Cloud Firestore Collection Subscriber
 */
export function useCollection<T = DocumentData>(config: { 
  table: string; 
  userId?: string; 
  order?: string; 
  limit?: number;
  filter?: { column: string; value: any };
  filters?: { column: string; value: any }[];
} | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!config) {
      setLoading(false);
      return;
    }

    const constraints: QueryConstraint[] = [];

    // Support for single or multiple filters
    if (config.userId) {
      constraints.push(where('userId', '==', config.userId));
    }

    if (config.filters && config.filters.length > 0) {
      config.filters.forEach(f => {
        if (f.value !== undefined && f.value !== null) {
          constraints.push(where(f.column, '==', f.value));
        }
      });
    } else if (config.filter) {
      constraints.push(where(config.filter.column, '==', config.filter.value));
    }

    if (config.order) {
      constraints.push(orderBy(config.order, 'desc'));
    }

    if (config.limit) {
      constraints.push(limit(config.limit));
    }

    try {
      const q = query(collection(db, config.table), ...constraints);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items: T[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(items);
        setLoading(false);
      }, (err) => {
        console.error(`[Firestore Error] Fetching ${config.table}:`, err);
        setError(err);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      console.error("Query creation failed", e);
      setLoading(false);
    }
  }, [
    config?.table, 
    config?.userId, 
    config?.order, 
    config?.limit, 
    JSON.stringify(config?.filter),
    JSON.stringify(config?.filters)
  ]);

  return { data, loading, error };
}
