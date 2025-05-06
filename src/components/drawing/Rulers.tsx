
import React, { useEffect, useRef } from 'react';

interface RulersProps {
  scale: number;
  offset: { x: number; y: number };
  width: number;
  height: number;
}

const Rulers: React.FC<RulersProps> = ({ scale, offset, width, height }) => {
  const horizontalRulerRef = useRef<HTMLCanvasElement>(null);
  const verticalRulerRef = useRef<HTMLCanvasElement>(null);
  const cornerRef = useRef<HTMLDivElement>(null);
  
  const RULER_SIZE = 20; // Width/Height of rulers
  
  useEffect(() => {
    const drawHorizontalRuler = () => {
      const canvas = horizontalRulerRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = RULER_SIZE;
      
      // Clear the canvas
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw ticks and numbers
      ctx.fillStyle = '#333';
      ctx.font = '9px Arial';
      ctx.textAlign = 'center';
      
      // Calculate the starting position based on offset
      const startPos = offset.x % (100 * scale);
      const startUnit = Math.floor(-offset.x / (100 * scale)) * 100;
      
      // Draw medium ticks every 50 units
      const mediumTickInterval = 50 * scale;
      for (let i = startPos; i < width; i += mediumTickInterval) {
        const unit = startUnit + ((i - startPos) / scale);
        ctx.fillRect(i, RULER_SIZE - 10, 1, 10);
      }
      
      // Draw large ticks and numbers every 100 units
      const largeTickInterval = 100 * scale;
      for (let i = startPos; i < width; i += largeTickInterval) {
        const unit = startUnit + ((i - startPos) / scale);
        ctx.fillRect(i, RULER_SIZE - 15, 1, 15);
        ctx.fillText(Math.abs(unit).toString(), i, RULER_SIZE - 3);
      }
      
      // Draw small ticks every 10 units
      const smallTickInterval = 10 * scale;
      for (let i = startPos; i < width; i += smallTickInterval) {
        ctx.fillRect(i, RULER_SIZE - 5, 1, 5);
      }
    };
    
    const drawVerticalRuler = () => {
      const canvas = verticalRulerRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas dimensions
      canvas.width = RULER_SIZE;
      canvas.height = height;
      
      // Clear the canvas
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw ticks and numbers
      ctx.fillStyle = '#333';
      ctx.font = '9px Arial';
      ctx.textAlign = 'right';
      
      // Calculate the starting position based on offset
      const startPos = offset.y % (100 * scale);
      const startUnit = Math.floor(-offset.y / (100 * scale)) * 100;
      
      // Draw medium ticks every 50 units
      const mediumTickInterval = 50 * scale;
      for (let i = startPos; i < height; i += mediumTickInterval) {
        const unit = startUnit + ((i - startPos) / scale);
        ctx.fillRect(RULER_SIZE - 10, i, 10, 1);
      }
      
      // Draw large ticks and numbers every 100 units
      const largeTickInterval = 100 * scale;
      for (let i = startPos; i < height; i += largeTickInterval) {
        const unit = startUnit + ((i - startPos) / scale);
        ctx.fillRect(RULER_SIZE - 15, i, 15, 1);
        // Rotate text for vertical ruler
        ctx.save();
        ctx.translate(RULER_SIZE - 3, i);
        ctx.rotate(-Math.PI/2);
        ctx.fillText(Math.abs(unit).toString(), 0, 0);
        ctx.restore();
      }
      
      // Draw small ticks every 10 units
      const smallTickInterval = 10 * scale;
      for (let i = startPos; i < height; i += smallTickInterval) {
        ctx.fillRect(RULER_SIZE - 5, i, 5, 1);
      }
    };
    
    drawHorizontalRuler();
    drawVerticalRuler();
  }, [scale, offset, width, height]);
  
  return (
    <>
      {/* Corner square where rulers meet */}
      <div 
        ref={cornerRef}
        className="absolute top-0 left-0 z-20 bg-gray-100 border-r border-b border-gray-300"
        style={{ width: RULER_SIZE, height: RULER_SIZE }}
      />
      
      {/* Horizontal ruler */}
      <canvas
        ref={horizontalRulerRef}
        className="absolute top-0 left-0 z-10 border-b border-gray-300"
        style={{ marginLeft: RULER_SIZE, height: RULER_SIZE }}
      />
      
      {/* Vertical ruler */}
      <canvas
        ref={verticalRulerRef}
        className="absolute top-0 left-0 z-10 border-r border-gray-300"
        style={{ marginTop: RULER_SIZE, width: RULER_SIZE }}
      />
    </>
  );
};

export default Rulers;
