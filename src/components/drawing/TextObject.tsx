
import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface TextObjectProps {
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
  zoom: number;
  offset: { x: number; y: number };
  isSelected: boolean;
  onMove: (deltaX: number, deltaY: number) => void;
  onResize: (newFontSize: number) => void;
  onDelete: () => void;
  onSelect: () => void;
}

const TextObject: React.FC<TextObjectProps> = ({
  x,
  y,
  text,
  fontSize,
  color,
  zoom,
  offset,
  isSelected,
  onMove,
  onResize,
  onDelete,
  onSelect
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ y: 0, fontSize: fontSize });
  const textRef = useRef<HTMLDivElement>(null);

  const screenX = x * zoom + offset.x;
  const screenY = y * zoom + offset.y;
  const scaledFontSize = (fontSize * zoom);

  const handleTextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  const handleControlMouseDown = (e: React.MouseEvent, type: 'move' | 'resize' | 'delete') => {
    e.stopPropagation();
    
    if (type === 'delete') {
      onDelete();
      return;
    }

    if (type === 'move') {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (type === 'resize') {
      setIsResizing(true);
      setResizeStart({ y: e.clientY, fontSize });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = (e.clientX - dragStart.x) / zoom;
        const deltaY = (e.clientY - dragStart.y) / zoom;
        onMove(deltaX, deltaY);
        setDragStart({ x: e.clientX, y: e.clientY });
      } else if (isResizing) {
        const deltaY = resizeStart.y - e.clientY;
        const newFontSize = Math.max(8, Math.min(72, resizeStart.fontSize + deltaY * 0.5));
        onResize(newFontSize);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, zoom, onMove, onResize]);

  const lines = text.split('\n');
  const lineHeight = scaledFontSize * 1.2;

  return (
    <div
      style={{
        position: 'absolute',
        left: screenX,
        top: screenY,
        fontSize: `${scaledFontSize}px`,
        color: color,
        fontFamily: 'Arial, sans-serif',
        userSelect: 'none',
        cursor: isSelected ? 'move' : 'pointer',
        pointerEvents: 'auto',
        zIndex: isSelected ? 1000 : 100
      }}
      onClick={handleTextClick}
      ref={textRef}
    >
      {lines.map((line, index) => (
        <div key={index} style={{ lineHeight: `${lineHeight}px` }}>
          {line}
        </div>
      ))}
      
      {isSelected && (
        <>
          {/* Move handle */}
          <div
            className="absolute w-2 h-2 bg-blue-500 rounded-full cursor-move border border-white shadow-md"
            style={{
              left: -6,
              top: -6,
            }}
            onMouseDown={(e) => handleControlMouseDown(e, 'move')}
            title="Drag to move"
          />
          
          {/* Resize handle */}
          <div
            className="absolute w-2 h-2 bg-green-500 rounded-full cursor-ns-resize border border-white shadow-md"
            style={{
              right: -6,
              top: -6,
            }}
            onMouseDown={(e) => handleControlMouseDown(e, 'resize')}
            title="Drag to resize"
          />
          
          {/* Delete handle */}
          <div
            className="absolute w-4 h-4 bg-red-500 rounded-full cursor-pointer border border-white shadow-md flex items-center justify-center hover:bg-red-600"
            style={{
              right: -8,
              bottom: -8,
            }}
            onMouseDown={(e) => handleControlMouseDown(e, 'delete')}
            title="Click to delete"
          >
            <X className="w-2 h-2 text-white" />
          </div>
        </>
      )}
    </div>
  );
};

export default TextObject;
