import { useState, useEffect } from 'react';
import { fetchWithFallback } from '../utils/api';

interface PushedPreconfig {
  id: string;
  depot: number;
  config: Record<string, any>;
  pushed_at: string;
}

const mockPushedPreconfigs: PushedPreconfig[] = [
  {
    id: 'p1',
    depot: 1,
    config: { os: 'ubuntu-20.04', ram: '64GB', storage: '2TB' },
    pushed_at: '2025-01-14T15:30:00Z'
  },
  {
    id: 'p2',
    depot: 1,
    config: { os: 'centos-8', ram: '32GB', storage: '1TB' },
    pushed_at: '2025-01-14T14:20:00Z'
  },
  {
    id: 'p3',
    depot: 2,
    config: { os: 'ubuntu-22.04', ram: '128GB', storage: '4TB' },
    pushed_at: '2025-01-13T09:15:00Z'
  },
  {
    id: 'p4',
    depot: 4,
    config: { os: 'debian-11', ram: '64GB', storage: '2TB' },
    pushed_at: '2025-01-12T16:45:00Z'
  },
];

export const usePushedPreconfigs = () => {
  const [pushedPreconfigs, setPushedPreconfigs] = useState<PushedPreconfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPushedPreconfigs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try backend first, fall back to mock data in dev mode if unreachable
      const data = await fetchWithFallback<PushedPreconfig[]>(
        '/api/preconfigs/pushed',
        { credentials: 'include' },
        mockPushedPreconfigs
      );

      setPushedPreconfigs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pushed preconfigs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPushedPreconfigs();
  }, []);

  return {
    pushedPreconfigs,
    isLoading,
    error,
    refetch: fetchPushedPreconfigs,
  };
};
