import { useState, useEffect } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://test-backend.suntrap.workers.dev';
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

interface Preconfig {
  id: string;
  depot: number;
  config: Record<string, any>;
  created_at: string;
}

// Mock data for dev mode
const mockPreconfigs: Preconfig[] = [
  {
    id: '1',
    depot: 1,
    config: { os: 'ubuntu-20.04', ram: '64GB', storage: '2TB' },
    created_at: '2025-01-15T10:00:00Z'
  },
  {
    id: '2',
    depot: 1,
    config: { os: 'centos-8', ram: '32GB', storage: '1TB' },
    created_at: '2025-01-15T11:00:00Z'
  },
  {
    id: '3',
    depot: 2,
    config: { os: 'ubuntu-22.04', ram: '128GB', storage: '4TB' },
    created_at: '2025-01-15T12:00:00Z'
  },
  {
    id: '4',
    depot: 4,
    config: { os: 'debian-11', ram: '64GB', storage: '2TB' },
    created_at: '2025-01-15T13:00:00Z'
  },
  {
    id: '5',
    depot: 4,
    config: { os: 'ubuntu-20.04', ram: '32GB', storage: '1TB' },
    created_at: '2025-01-15T14:00:00Z'
  }
];

export const usePreconfigs = () => {
  const [preconfigs, setPreconfigs] = useState<Preconfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreconfigs = async () => {
    if (DEV_MODE) {
      setIsLoading(true);
      // Simulate API delay
      setTimeout(() => {
        setPreconfigs(mockPreconfigs);
        setIsLoading(false);
      }, 1000);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${BACKEND_URL}/api/preconfigs`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPreconfigs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch preconfigs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPreconfigs();
  }, []);

  return {
    preconfigs,
    isLoading,
    error,
    refetch: fetchPreconfigs,
  };
};