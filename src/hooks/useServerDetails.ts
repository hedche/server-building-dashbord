import React, { useState } from 'react';
import { fetchWithFallback } from '../utils/api';

interface ServerDetails {
  hostname: string;
  dbid: string;
  serial_number: string;
  rackID: string;
  percent_built: number;
  assigned_status: string;
  machine_type: string;
  status: string;
  // Additional details from API
  ip_address?: string;
  mac_address?: string;
  cpu_model?: string;
  ram_gb?: number;
  storage_gb?: number;
  install_start_time?: string;
  estimated_completion?: string;
  last_heartbeat?: string;
}

// Mock detailed data for dev mode
const mockServerDetails: ServerDetails = {
  hostname: "th-12345-45",
  dbid: "305589",
  serial_number: "483446357",
  rackID: "1-E",
  percent_built: 55,
  assigned_status: "not assigned",
  machine_type: "Server",
  status: "installing",
  ip_address: "192.168.1.100",
  mac_address: "00:1B:44:11:3A:B7",
  cpu_model: "Intel Xeon E5-2680 v4",
  ram_gb: 64,
  storage_gb: 2000,
  install_start_time: "2025-01-15T10:30:00Z",
  estimated_completion: "2025-01-15T14:45:00Z",
  last_heartbeat: "2025-01-15T12:15:30Z"
};

export const useServerDetails = () => {
  const [serverDetails, setServerDetails] = useState<ServerDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServerDetails = React.useCallback(async (hostname: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Try backend first, fall back to mock data in dev mode if unreachable
      const data = await fetchWithFallback<ServerDetails>(
        `/api/server-details?hostname=${encodeURIComponent(hostname)}`,
        { credentials: 'include' },
        { ...mockServerDetails, hostname }
      );

      setServerDetails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch server details');
      setServerDetails(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearServerDetails = () => {
    setServerDetails(null);
    setError(null);
  };

  return {
    serverDetails,
    isLoading,
    error,
    fetchServerDetails,
    clearServerDetails,
  };
};