import React from 'react';
import { DrawingMode } from './types';

interface BottomStatusBarProps {
  mode: DrawingMode;
  color: string;
  brushSize: number;
  position?: { x: number; y: number; z?: number };
  is3D?: boolean;
}

const BottomStatusBar: React.FC<BottomStatusBarProps> = ({ 
  mode, 
  color, 
  brushSize, 
  position,
  is3D = false
}) => {
  const getModeDisplayName = (mode: DrawingMode) => {
    switch (mode) {
      case 'draw':
        return 'Draw';
      case 'erase':
        return 'Erase';
      case 'text':
        return 'Text';
      case 'move':
        return 'Move (Hand)';
      default:
        return mode;
    }
  };

  return (
    <div className="flex justify-between items-center px-4 py-2 bg-gray-900 text-white text-sm border-t border-gray-700">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Mode:</span>
          <span className="font-medium">{getModeDisplayName(mode)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Color:</span>
          <div 
            className="w-4 h-4 rounded border border-gray-600" 
            style={{ backgroundColor: color }}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Size:</span>
          <span className="font-medium">{brushSize}px</span>
        </div>
      </div>
      
      {position && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">X:</span>
            <span className="font-mono">{Math.round(position.x)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Y:</span>
            <span className="font-mono">{Math.round(position.y)}</span>
          </div>
          {is3D && position.z !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Z:</span>
              <span className="font-mono">{Math.round(position.z)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BottomStatusBar;
