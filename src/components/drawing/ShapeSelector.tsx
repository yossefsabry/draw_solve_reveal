
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const selectedShapeData = shapes.find(s => s.type === selectedShape);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <span>{selectedShapeData?.icon}</span>
          <span>{selectedShapeData?.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {shapes.map((shape) => (
          <DropdownMenuItem
            key={shape.type}
            onClick={() => onShapeSelect(shape.type)}
            className="flex items-center gap-2"
          >
            <span>{shape.icon}</span>
            <span>{shape.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShapeSelector;
