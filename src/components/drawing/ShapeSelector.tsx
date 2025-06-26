
import React from 'react';
import { Button } from '@/components/ui/button';

export type ShapeType = 'rectangle' | 'circle' | 'line' | 'arrow' | 'triangle' | 'person' | 'house' | 'star';

interface ShapeSelectorProps {
  selectedShape: ShapeType;
  onShapeSelect: (shape: ShapeType) => void;
  isOpen: boolean;
  onClose: () => void;
}

const shapes: { type: ShapeType; name: string; preview: React.ReactNode }[] = [
  { 
    type: 'rectangle', 
    name: 'Rectangle', 
    preview: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="14" rx="2"/>
      </svg>
    )
  },
  { 
    type: 'circle', 
    name: 'Circle', 
    preview: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="8"/>
      </svg>
    )
  },
  { 
    type: 'line', 
    name: 'Line', 
    preview: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="4" y1="20" x2="20" y2="4"/>
      </svg>
    )
  },
  { 
    type: 'arrow', 
    name: 'Arrow', 
    preview: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="4" y1="12" x2="20" y2="12"/>
        <polyline points="14,6 20,12 14,18"/>
      </svg>
    )
  },
  { 
    type: 'triangle', 
    name: 'Triangle', 
    preview: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12,2 22,20 2,20"/>
      </svg>
    )
  },
  { 
    type: 'person', 
    name: 'Person', 
    preview: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="6" r="3"/>
        <line x1="12" y1="9" x2="12" y2="16"/>
        <line x1="8" y1="13" x2="16" y2="13"/>
        <line x1="12" y1="16" x2="8" y2="21"/>
        <line x1="12" y1="16" x2="16" y2="21"/>
      </svg>
    )
  },
  { 
    type: 'house', 
    name: 'House', 
    preview: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="3,12 12,3 21,12"/>
        <path d="M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
        <path d="M9 21v-6a2 2 0 012-2h2a2 2 0 012 2v6"/>
      </svg>
    )
  },
  { 
    type: 'star', 
    name: 'Star', 
    preview: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
      </svg>
    )
  },
];

const ShapeSelector: React.FC<ShapeSelectorProps> = ({
  selectedShape,
  onShapeSelect,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const handleShapeSelect = (shape: ShapeType) => {
    onShapeSelect(shape);
    onClose();
  };

  return (
    <>
      {/* Backdrop to close menu when clicking outside */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Shape selector menu */}
      <div className="absolute top-20 left-2 z-50 bg-[#2a2a2a] border border-neutral-600 rounded-lg shadow-xl p-3 min-w-[280px]">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-200">Select Shape</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {shapes.map((shape) => (
            <button
              key={shape.type}
              onClick={() => handleShapeSelect(shape.type)}
              className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-200 border-2 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400
                ${selectedShape === shape.type
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                  : 'bg-[#1a1a1a] text-gray-300 border-transparent hover:bg-[#333] hover:border-gray-500'}
              `}
              title={shape.name}
            >
              <div className="mb-2 text-blue-400">
                {shape.preview}
              </div>
              <span className="text-xs font-medium">{shape.name}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default ShapeSelector;
