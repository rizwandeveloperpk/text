'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Conversion } from '@/types';

export function useConversions(userId: string | undefined) {
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setConversions([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, 'conversions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Conversion);
      setConversions(rows);
      setLoading(false);
    });
    return unsubscribe;
  }, [userId]);

  const toggleFavorite = useCallback(async (id: string, favorite: boolean) => {
    await updateDoc(doc(db, 'conversions', id), { favorite });
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'conversions', id));
  }, []);

  return { conversions, loading, toggleFavorite, remove };
}
