
import React from 'react';

interface PositionIndicatorProps {
  position: { x: number; y: number; z: number };
  isPanning?: boolean;
}

const PositionIndicator: React.FC<PositionIndicatorProps> = ({ position, isPanning = false }) => {
  return (
    <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white p-2 rounded text-sm font-mono">
      <div>X: {position.x.toFixed(1)} Y: {position.y.toFixed(1)} Z: {position.z.toFixed(1)}</div>
      {isPanning && (
        <div className="text-yellow-400 text-xs mt-1">
          Alt+Pan Mode Active
        </div>
      )}
    </div>
  );
};

export default PositionIndicator;
