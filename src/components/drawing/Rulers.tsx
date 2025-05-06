
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
  
  const RULER_SIZE = 26; // Increased ruler size for better visibility
  const RULER_BG_COLOR = '#f1f1f1';
  const RULER_TEXT_COLOR = '#333333';
  const RULER_LINE_COLOR = '#555555';
  const RULER_BORDER_COLOR = '#aaaaaa';
  
  useEffect(() => {
    const drawHorizontalRuler = () => {
      const canvas = horizontalRulerRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      
      // Set canvas dimensions
      const devicePixelRatio = window.devicePixelRatio || 1;
      canvas.width = width * devicePixelRatio;
      canvas.height = RULER_SIZE * devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${RULER_SIZE}px`;
      
      ctx.scale(devicePixelRatio, devicePixelRatio);
      
      // Clear the canvas
      ctx.fillStyle = RULER_BG_COLOR;
      ctx.fillRect(0, 0, width, RULER_SIZE);
      
      // Draw ticks and numbers
      ctx.fillStyle = RULER_TEXT_COLOR;
      ctx.font = '11px Arial'; // Increased font size for better visibility
      ctx.textAlign = 'center';
      
      // Calculate the starting position based on offset
      const startPos = offset.x % (100 * scale);
      const startUnit = Math.floor(-offset.x / (100 * scale)) * 100;
      
      // Draw medium ticks every 50 units
      const mediumTickInterval = 50 * scale;
      for (let i = startPos; i < width; i += mediumTickInterval) {
        const unit = startUnit + ((i - startPos) / scale);
        ctx.fillStyle = RULER_LINE_COLOR;
        ctx.fillRect(i, RULER_SIZE - 12, 1, 12);
      }
      
      // Draw large ticks and numbers every 100 units
      const largeTickInterval = 100 * scale;
      for (let i = startPos; i < width; i += largeTickInterval) {
        const unit = startUnit + ((i - startPos) / scale);
        ctx.fillStyle = RULER_LINE_COLOR;
        ctx.fillRect(i, RULER_SIZE - 20, 1, 20);
        ctx.fillStyle = RULER_TEXT_COLOR;
        ctx.fillText(Math.abs(unit).toString(), i, RULER_SIZE - 5);
      }
      
      // Draw small ticks every 10 units
      const smallTickInterval = 10 * scale;
      for (let i = startPos; i < width; i += smallTickInterval) {
        ctx.fillStyle = RULER_LINE_COLOR;
        ctx.fillRect(i, RULER_SIZE - 8, 1, 8);
      }
    };
    
    const drawVerticalRuler = () => {
      const canvas = verticalRulerRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      
      // Set canvas dimensions
      const devicePixelRatio = window.devicePixelRatio || 1;
      canvas.width = RULER_SIZE * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      canvas.style.width = `${RULER_SIZE}px`;
      canvas.style.height = `${height}px`;
      
      ctx.scale(devicePixelRatio, devicePixelRatio);
      
      // Clear the canvas
      ctx.fillStyle = RULER_BG_COLOR;
      ctx.fillRect(0, 0, RULER_SIZE, height);
      
      // Draw ticks and numbers
      ctx.fillStyle = RULER_TEXT_COLOR;
      ctx.font = '11px Arial'; // Increased font size for better visibility
      ctx.textAlign = 'right';
      
      // Calculate the starting position based on offset
      const startPos = offset.y % (100 * scale);
      const startUnit = Math.floor(-offset.y / (100 * scale)) * 100;
      
      // Draw medium ticks every 50 units
      const mediumTickInterval = 50 * scale;
      for (let i = startPos; i < height; i += mediumTickInterval) {
        const unit = startUnit + ((i - startPos) / scale);
        ctx.fillStyle = RULER_LINE_COLOR;
        ctx.fillRect(RULER_SIZE - 12, i, 12, 1);
      }
      
      // Draw large ticks and numbers every 100 units
      const largeTickInterval = 100 * scale;
      for (let i = startPos; i < height; i += largeTickInterval) {
        const unit = startUnit + ((i - startPos) / scale);
        ctx.fillStyle = RULER_LINE_COLOR;
        ctx.fillRect(RULER_SIZE - 20, i, 20, 1);
        ctx.fillStyle = RULER_TEXT_COLOR;
        // Rotate text for vertical ruler
        ctx.save();
        ctx.translate(RULER_SIZE - 5, i);
        ctx.rotate(-Math.PI/2);
        ctx.fillText(Math.abs(unit).toString(), 0, 0);
        ctx.restore();
      }
      
      // Draw small ticks every 10 units
      const smallTickInterval = 10 * scale;
      for (let i = startPos; i < height; i += smallTickInterval) {
        ctx.fillStyle = RULER_LINE_COLOR;
        ctx.fillRect(RULER_SIZE - 8, i, 8, 1);
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
        className="absolute top-0 left-0 z-20"
        style={{ 
          width: RULER_SIZE, 
          height: RULER_SIZE,
          borderRight: `1px solid ${RULER_BORDER_COLOR}`,
          borderBottom: `1px solid ${RULER_BORDER_COLOR}`,
          background: RULER_BG_COLOR
        }}
      />
      
      {/* Horizontal ruler */}
      <canvas
        ref={horizontalRulerRef}
        className="absolute top-0 left-0 z-10"
        style={{ 
          marginLeft: RULER_SIZE, 
          height: RULER_SIZE,
          borderBottom: `1px solid ${RULER_BORDER_COLOR}`
        }}
      />
      
      {/* Vertical ruler */}
      <canvas
        ref={verticalRulerRef}
        className="absolute top-0 left-0 z-10"
        style={{ 
          marginTop: RULER_SIZE, 
          width: RULER_SIZE,
          borderRight: `1px solid ${RULER_BORDER_COLOR}`
        }}
      />
    </>
  );
};

export default Rulers;
