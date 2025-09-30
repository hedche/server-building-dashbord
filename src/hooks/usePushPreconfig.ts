import { useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://test-backend.suntrap.workers.dev';
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

export type PushStatus = 'idle' | 'pushing' | 'success' | 'failed';

export const usePushPreconfig = () => {
  const [pushStatus, setPushStatus] = useState<PushStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const pushPreconfig = async (depot: number): Promise<boolean> => {
    if (DEV_MODE) {
      // Simulate API delay and random success/failure
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
      const success = Math.random() > 0.2; // 80% success rate
      console.log('Dev mode: Would push preconfig for depot:', depot, success ? 'SUCCESS' : 'FAILED');
      return success;
    }

    try {
      setError(null);
      
      const response = await fetch(`${BACKEND_URL}/api/push-preconfig`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ depot }),
      });
      
      const result = await response.json();
      return result.status === 'success';
    } catch (err) {
      console.error('Push preconfig failed:', err);
      return false;
    }
  };

  const handlePushPreconfig = async (depot: number) => {
    setPushStatus('pushing');
    setError(null);

    try {
      const success = await pushPreconfig(depot);
      setPushStatus(success ? 'success' : 'failed');
      
      if (!success) {
        setError('Failed to push preconfig');
      }
    } catch (err) {
      setPushStatus('failed');
      setError(err instanceof Error ? err.message : 'Failed to push preconfig');
    }

    // Reset status after delay
    setTimeout(() => {
      setPushStatus('idle');
      setError(null);
    }, 3000);
  };

  return {
    pushStatus,
    error,
    pushPreconfig: handlePushPreconfig,
  };
};