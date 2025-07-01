
import React from 'react';

interface PositionIndicatorProps {
  position: { x: number; y: number; z: number };
}

const PositionIndicator: React.FC<PositionIndicatorProps> = ({ position }) => {
  return (
    <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white p-2 rounded text-sm font-mono">
      X: {position.x.toFixed(1)} Y: {position.y.toFixed(1)} Z: {position.z.toFixed(1)}
    </div>
  );
};

export default PositionIndicator;
