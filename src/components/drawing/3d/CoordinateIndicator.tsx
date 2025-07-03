
import React from 'react';
import { Html } from '@react-three/drei';

const CoordinateIndicator: React.FC = () => {
  return (
    <Html
      position={[0, 0, 0]}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 text-white text-sm font-mono">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400/60 rounded"></div>
            <span className="opacity-80">X Axis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400/60 rounded"></div>
            <span className="opacity-80">Y Axis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400/60 rounded"></div>
            <span className="opacity-80">Z Axis</span>
          </div>
        </div>
      </div>
    </Html>
  );
};

export default CoordinateIndicator;
