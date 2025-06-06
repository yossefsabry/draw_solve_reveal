
import React, { useEffect, useRef } from 'react';

interface RulersProps {
  scale: number;
  offset: { x: number; y: number };
  width: number;
  height: number;
  cursorPosition: { x: number; y: number } | null;
}

const Rulers: React.FC<RulersProps> = ({ 
  scale, 
  offset, 
  width, 
  height, 
  cursorPosition 
}) => {
  const horizontalRulerRef = useRef<HTMLCanvasElement>(null);
  const verticalRulerRef = useRef<HTMLDivElement>(null);
  const cornerRef = useRef<HTMLDivElement>(null);
  const horizontalCursorRef = useRef<HTMLDivElement>(null);
  const verticalCursorRef = useRef<HTMLDivElement>(null);
  
  const RULER_SIZE = 26; // Ruler size for better visibility
  const RULER_BG_COLOR = '#000000'; // Black background for rulers
  const RULER_TEXT_COLOR = '#ffffff'; // White text for better visibility
  const RULER_LINE_COLOR = '#555555'; // Light gray lines
  const RULER_BORDER_COLOR = '#333333'; // Darker border
  const CURSOR_MARKER_COLOR = '#ff5555'; // Red marker for cursor position
  
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
      ctx.font = '11px Arial'; // Font size for better visibility
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
        // Round to integer
        const unitInt = Math.round(unit);
        ctx.fillText(unitInt.toString(), i, RULER_SIZE - 5);
      }
      
      // Draw small ticks every 10 units
      const smallTickInterval = 10 * scale;
      for (let i = startPos; i < width; i += smallTickInterval) {
        ctx.fillStyle = RULER_LINE_COLOR;
        ctx.fillRect(i, RULER_SIZE - 8, 1, 8);
      }
    };
    
    const drawVerticalRuler = () => {
      const rulerDiv = verticalRulerRef.current;
      if (!rulerDiv) return;
      
      // Clear previous content
      while (rulerDiv.firstChild) {
        rulerDiv.removeChild(rulerDiv.firstChild);
      }
      
      // Set dimensions
      rulerDiv.style.height = `${height}px`;
      rulerDiv.style.width = `${RULER_SIZE}px`;
      rulerDiv.style.backgroundColor = RULER_BG_COLOR;
      rulerDiv.style.position = "absolute";
      rulerDiv.style.top = '0';
      rulerDiv.style.left = '0';
      rulerDiv.style.borderRight = `1px solid ${RULER_BORDER_COLOR}`;
      rulerDiv.style.overflow = 'hidden';
      
      // Calculate the starting position based on offset
      const startPos = offset.y % (100 * scale);
      const startUnit = Math.floor(-offset.y / (100 * scale)) * 100;
      
      // Draw large ticks and numbers every 100 units
      const largeTickInterval = 100 * scale;
      for (let i = startPos; i < height; i += largeTickInterval) {
        const unit = startUnit + ((i - startPos) / scale);
        
        // Create tick mark
        const tick = document.createElement('div');
        tick.style.position = 'absolute';
        tick.style.top = `${i}px`;
        tick.style.right = '0';
        tick.style.width = '20px';
        tick.style.height = '1px';
        tick.style.backgroundColor = RULER_LINE_COLOR;
        rulerDiv.appendChild(tick);
        
        // Create text label
        const label = document.createElement('div');
        label.style.position = 'absolute';
        label.style.top = `${i - 7}px`;
        label.style.right = '8px';
        label.style.color = RULER_TEXT_COLOR;
        label.style.fontSize = '10px';
        label.style.transform = 'rotate(-90deg)';
        label.style.transformOrigin = 'center right';
        // Round to integer
        const unitInt = Math.round(unit);
        label.textContent = unitInt.toString();
        rulerDiv.appendChild(label);
      }
      
      // Draw medium ticks every 50 units
      const mediumTickInterval = 50 * scale;
      for (let i = startPos; i < height; i += mediumTickInterval) {
        if (i % largeTickInterval !== 0) { // Skip where we already drew large ticks
          const tick = document.createElement('div');
          tick.style.position = 'absolute';
          tick.style.top = `${i}px`;
          tick.style.right = '0';
          tick.style.width = '12px';
          tick.style.height = '1px';
          tick.style.backgroundColor = RULER_LINE_COLOR;
          rulerDiv.appendChild(tick);
        }
      }
      
      // Draw small ticks every 10 units
      const smallTickInterval = 10 * scale;
      for (let i = startPos; i < height; i += smallTickInterval) {
        if (i % mediumTickInterval !== 0) { // Skip where we already drew medium/large ticks
          const tick = document.createElement('div');
          tick.style.position = 'absolute';
          tick.style.top = `${i}px`;
          tick.style.right = '0';
          tick.style.width = '8px';
          tick.style.height = '1px';
          tick.style.backgroundColor = RULER_LINE_COLOR;
          rulerDiv.appendChild(tick);
        }
      }
    };
    
    drawHorizontalRuler();
    drawVerticalRuler();
  }, [scale, offset, width, height]);

  // Update cursor position markers
  useEffect(() => {
    if (cursorPosition) {
      // Calculate the actual position with transform
      const actualX = cursorPosition.x * scale + offset.x;
      const actualY = cursorPosition.y * scale + offset.y;

      // Update horizontal ruler cursor marker
      if (horizontalCursorRef.current) {
        horizontalCursorRef.current.style.left = `${actualX}px`;
        horizontalCursorRef.current.style.display = 'block';
      }

      // Update vertical ruler cursor marker
      if (verticalCursorRef.current) {
        verticalCursorRef.current.style.top = `${actualY}px`;
        verticalCursorRef.current.style.display = 'block';
      }
    } else {
      // Hide markers if no cursor position
      if (horizontalCursorRef.current) {
        horizontalCursorRef.current.style.display = 'none';
      }
      if (verticalCursorRef.current) {
        verticalCursorRef.current.style.display = 'none';
      }
    }
  }, [cursorPosition, scale, offset]);
  
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
      <div
        ref={verticalRulerRef}
        className="absolute top-0 left-0 z-10"
      />

      {/* Cursor position markers on rulers */}
      <div
        ref={horizontalCursorRef}
        className="absolute z-25"
        style={{
          top: 0,
          height: RULER_SIZE,
          width: '2px',
          background: CURSOR_MARKER_COLOR,
          pointerEvents: 'none',
          display: 'none'
        }}
      />
      
      <div
        ref={verticalCursorRef}
        className="absolute z-25"
        style={{
          left: 0,
          width: RULER_SIZE,
          height: '2px',
          background: CURSOR_MARKER_COLOR,
          pointerEvents: 'none',
          display: 'none'
        }}
      />
    </>
  );
};

export default Rulers;
