import { useState, useCallback, useEffect } from 'react';

const KEY = 'finfeed_read';

function loadIds(): Set<number> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) || '[]'));
  } catch {
    return new Set();
  }
}

export function useReadArticles() {
  const [readIds, setReadIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setReadIds(loadIds());
  }, []);

  const markRead = useCallback((id: number) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem(KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }, []);

  return { readIds, markRead };
}
