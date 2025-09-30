import { useState } from 'react';
import { Server } from '../types/build';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://test-backend.suntrap.workers.dev';
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

interface AssignPayload {
  serial_number: string;
  hostname: string;
  dbid: string;
}

export type AssignmentStatus = 'idle' | 'loading' | 'success' | 'failed';

interface AssignmentState {
  [dbid: string]: AssignmentStatus;
}

export const useAssignServers = () => {
  const [assignmentStates, setAssignmentStates] = useState<AssignmentState>({});
  const [error, setError] = useState<string | null>(null);

  const assignSingleServer = async (payload: AssignPayload): Promise<boolean> => {
    if (DEV_MODE) {
      // Simulate API delay and random success/failure
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      const success = Math.random() > 0.3; // 70% success rate
      console.log('Dev mode: Would assign server:', payload, success ? 'SUCCESS' : 'FAILED');
      return success;
    }

    try {
      setError(null);
      
      const response = await fetch(`${BACKEND_URL}/api/assign`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      return result.status === 'success';
    } catch (err) {
      console.error('Assignment failed:', err);
      return false;
    }
  };

  const assignServers = async (servers: Server[]) => {
    setError(null);
    
    // Initialize all servers to loading state
    const initialStates: AssignmentState = {};
    servers.forEach(server => {
      initialStates[server.dbid] = 'loading';
    });
    setAssignmentStates(initialStates);

    // Process each server sequentially
    for (const server of servers) {
      try {
        const payload = {
          serial_number: server.serial_number,
          hostname: server.hostname,
          dbid: server.dbid,
        };

        const success = await assignSingleServer(payload);
        
        setAssignmentStates(prev => ({
          ...prev,
          [server.dbid]: success ? 'success' : 'failed'
        }));
      } catch (err) {
        setAssignmentStates(prev => ({
          ...prev,
          [server.dbid]: 'failed'
        }));
      }
    }

    // Clear states after a delay to allow user to see results
    setTimeout(() => {
      setAssignmentStates({});
    }, 3000);
  };

  return {
    assignServers,
    assignmentStates,
    error,
  };
};