
import React from 'react';
import { Button } from '@/components/ui/button';

export type ShapeType = 'rectangle' | 'circle' | 'line' | 'arrow' | 'triangle' | 'person' | 'house' | 'star';

interface ShapeSelectorProps {
  selectedShape: ShapeType;
  onShapeSelect: (shape: ShapeType) => void;
}

const shapes: { type: ShapeType; name: string; icon: string }[] = [
  { type: 'rectangle', name: 'Rectangle', icon: '⬜' },
  { type: 'circle', name: 'Circle', icon: '⭕' },
  { type: 'line', name: 'Line', icon: '📏' },
  { type: 'arrow', name: 'Arrow', icon: '➡️' },
  { type: 'triangle', name: 'Triangle', icon: '🔺' },
  { type: 'person', name: 'Person', icon: '🚶' },
  { type: 'house', name: 'House', icon: '🏠' },
  { type: 'star', name: 'Star', icon: '⭐' },
];

const ShapeSelector: React.FC<ShapeSelectorProps> = ({
  selectedShape,
  onShapeSelect
}) => {
  return (
    <div className="absolute top-16 left-2 z-50 bg-[#2a2a2a] border border-neutral-600 rounded-lg shadow-xl p-3">
      <div className="grid grid-cols-2 gap-2 min-w-[200px]">
        {shapes.map((shape) => (
          <button
            key={shape.type}
            onClick={() => onShapeSelect(shape.type)}
            className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 border-2 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400
              ${selectedShape === shape.type
                ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                : 'bg-[#1a1a1a] text-gray-300 border-transparent hover:bg-[#333] hover:border-gray-500'}
            `}
            title={shape.name}
          >
            <span className="text-2xl mb-1">{shape.icon}</span>
            <span className="text-xs font-medium">{shape.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ShapeSelector;
