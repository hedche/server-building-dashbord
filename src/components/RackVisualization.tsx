import React from 'react';
import { Server } from '../types/build';

interface RackVisualizationProps {
  servers: Server[];
}

const RackVisualization: React.FC<RackVisualizationProps> = ({ servers }) => {
  // Separate normal racks from small racks and group by rack identifier
  const rackGroups = servers.reduce((acc, server) => {
    const rackIdentifier = server.rackID.split('-')[0];
    if (!acc[rackIdentifier]) {
      acc[rackIdentifier] = [];
    }
    acc[rackIdentifier].push(server);
    return acc;
  }, {} as Record<string, Server[]>);

  // Separate normal racks (1-8) from small racks (S1, S2, etc.)
  const normalRacks: string[] = [];
  const smallRacks: string[] = [];
  
  Object.keys(rackGroups).forEach(rackId => {
    if (rackId.startsWith('S')) {
      smallRacks.push(rackId);
    } else {
      normalRacks.push(rackId);
    }
  });
  
  // Sort normal racks numerically (1-8)
  normalRacks.sort((a, b) => parseInt(a) - parseInt(b));
  
  // Sort small racks by number (S1, S2, etc.)
  smallRacks.sort((a, b) => {
    const aNum = parseInt(a.substring(1));
    const bNum = parseInt(b.substring(1));
    return aNum - bNum;
  });
  
  // Combine normal racks first, then small racks
  const orderedRacks = [...normalRacks, ...smallRacks];

  // Sort rack positions: 1-8, then A-G
  const sortRackPosition = (a: string, b: string) => {
    const getPositionValue = (pos: string) => {
      if (/^\d+$/.test(pos)) return parseInt(pos);
      return pos.charCodeAt(0) - 'A'.charCodeAt(0) + 9;
    };
    return getPositionValue(a) - getPositionValue(b);
  };

  const getProgressColor = (percent: number) => {
    if (percent === 100) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getProgressColorForServer = (server: Server) => {
    if (server.status === 'failed') return 'bg-red-500';
    if (server.percent_built === 100) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getRackTitle = (rackId: string) => {
    if (rackId.startsWith('S')) {
      const rackNumber = rackId.substring(1);
      return `Small Rack ${rackNumber}`;
    }
    return `Rack ${rackId}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {orderedRacks.map(rackId => {
        const rackServers = rackGroups[rackId] || [];
        const slotGroups = rackServers.reduce((acc, server) => {
          const slot = server.rackID.split('-')[1];
          if (!acc[slot]) {
            acc[slot] = [];
          }
          acc[slot].push(server);
          return acc;
        }, {} as Record<string, Server[]>);

        const sortedSlots = Object.keys(slotGroups).sort(sortRackPosition);

        return (
          <div key={rackId} className="bg-gray-800 rounded-lg border border-gray-700 p-3">
            <h3 className="text-green-400 font-mono font-bold mb-3 text-center">
              {getRackTitle(rackId)}
            </h3>
            
            <div className="space-y-2">
                {sortedSlots.map(slot => (
                  <div key={slot} className="space-y-1">
                    <div className="text-xs text-gray-400 font-mono">
                      Slot {slot}
                    </div>
                    {slotGroups[slot].map(server => (
                      <div
                        key={server.dbid}
                        className="bg-gray-700 rounded p-2 border-l-4 border-gray-600"
                        style={{
                          borderLeftColor: `var(--progress-color-${Math.floor(server.percent_built / 10)})`
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-xs text-white font-medium">
                            {server.hostname}
                          </span>
                          <span className="text-xs text-gray-300">
                            {server.percent_built}%
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-600 rounded-full h-1.5 mb-2">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColorForServer(server)}`}
                            style={{ width: `${server.percent_built}%` }}
                          />
                        </div>
                        
                        <div className="text-xs text-gray-400 space-y-0.5">
                          <div>Type: {server.machine_type}</div>
                          <div>DBID: {server.dbid}</div>
                          <div>S/N: {server.serial_number}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RackVisualization;