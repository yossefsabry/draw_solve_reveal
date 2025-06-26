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
    <div className="w-full flex flex-col items-center">
      <div className="grid grid-cols-4 grid-rows-2 gap-4 p-4 bg-gradient-to-br from-background/90 to-primary/10 rounded-2xl shadow-2xl border border-primary/30 max-w-sm">
        {shapes.map((shape) => (
          <button
            key={shape.type}
            onClick={() => onShapeSelect(shape.type)}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-150 text-2xl font-bold border-2 focus:outline-none focus:ring-2 focus:ring-primary/40
              ${selectedShape === shape.type
                ? 'bg-primary text-primary-foreground border-primary scale-110 shadow-lg font-extrabold'
                : 'bg-background text-foreground border-transparent hover:bg-primary/10 hover:border-primary'}
            `}
            title={shape.name}
            tabIndex={0}
          >
            <span className="mb-1" style={{fontSize: '2.2rem', lineHeight: 1}}>{shape.icon}</span>
            <span className={`text-xs font-semibold leading-tight mt-1 ${selectedShape === shape.type ? 'font-bold' : 'font-normal'}`}>{shape.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ShapeSelector;
