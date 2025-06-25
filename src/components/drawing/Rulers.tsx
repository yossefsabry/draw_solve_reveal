
import React from "react";

interface RulersProps {
  width: number;
  height: number;
  zoom: number;
  offset: { x: number; y: number };
  rulerSize?: number;
  gridSize?: number;
  cursor?: { x: number; y: number } | null;
}

const RULER_BG = "#2a2a2a";
const RULER_FG = "#666666";
const RULER_MAJOR = "#ffffff";
const RULER_TEXT = "#cccccc";

export const Rulers: React.FC<RulersProps> = ({
  width,
  height,
  zoom,
  offset,
  rulerSize = 30,
  gridSize = 20,
  cursor = null,
}) => {
  // Calculate visible range in world coordinates
  const worldStartX = -offset.x / zoom;
  const worldStartY = -offset.y / zoom;
  const worldEndX = worldStartX + width / zoom;
  const worldEndY = worldStartY + height / zoom;

  // Calculate tick spacing based on zoom level
  const getTickSpacing = () => {
    const minPixelSpacing = 40; // Minimum pixels between major ticks
    const worldSpacing = minPixelSpacing / zoom;
    
    // Find appropriate spacing (powers of 10, 20, 50)
    const magnitude = Math.pow(10, Math.floor(Math.log10(worldSpacing)));
    const normalized = worldSpacing / magnitude;
    
    let spacing;
    if (normalized <= 1) spacing = magnitude;
    else if (normalized <= 2) spacing = 2 * magnitude;
    else if (normalized <= 5) spacing = 5 * magnitude;
    else spacing = 10 * magnitude;
    
    return spacing;
  };

  const tickSpacing = getTickSpacing();
  const minorTickSpacing = tickSpacing / 5;

  // Render horizontal ruler ticks
  const renderHorizontalTicks = () => {
    const ticks = [];
    
    // Start from first major tick before visible area
    const startTick = Math.floor(worldStartX / tickSpacing) * tickSpacing;
    
    for (let worldX = startTick; worldX <= worldEndX + tickSpacing; worldX += minorTickSpacing) {
      const screenX = worldX * zoom + offset.x;
      if (screenX < -20 || screenX > width + 20) continue;
      
      const isMajor = Math.abs(worldX % tickSpacing) < 0.001;
      const tickHeight = isMajor ? rulerSize * 0.6 : rulerSize * 0.3;
      
      ticks.push(
        <line
          key={`h-${worldX}`}
          x1={screenX}
          y1={rulerSize}
          x2={screenX}
          y2={rulerSize - tickHeight}
          stroke={isMajor ? RULER_MAJOR : RULER_FG}
          strokeWidth={isMajor ? 1 : 0.5}
        />
      );
      
      // Add labels for major ticks
      if (isMajor) {
        ticks.push(
          <text
            key={`h-label-${worldX}`}
            x={screenX}
            y={rulerSize - tickHeight - 2}
            fontSize={10}
            fill={RULER_TEXT}
            textAnchor="middle"
            style={{ userSelect: "none" }}
          >
            {Math.round(worldX)}
          </text>
        );
      }
    }
    
    // Cursor indicator
    if (cursor) {
      const cursorScreenX = cursor.x * zoom + offset.x;
      if (cursorScreenX >= 0 && cursorScreenX <= width) {
        ticks.push(
          <line
            key="cursor-x"
            x1={cursorScreenX}
            y1={0}
            x2={cursorScreenX}
            y2={rulerSize}
            stroke="#00BFFF"
            strokeWidth={2}
          />
        );
        
        // Cursor position label
        ticks.push(
          <text
            key="cursor-x-label"
            x={cursorScreenX}
            y={12}
            fontSize={10}
            fill="#00BFFF"
            textAnchor="middle"
            style={{ userSelect: "none" }}
          >
            {Math.round(cursor.x)}
          </text>
        );
      }
    }
    
    return ticks;
  };

  // Render vertical ruler ticks
  const renderVerticalTicks = () => {
    const ticks = [];
    
    // Start from first major tick before visible area
    const startTick = Math.floor(worldStartY / tickSpacing) * tickSpacing;
    
    for (let worldY = startTick; worldY <= worldEndY + tickSpacing; worldY += minorTickSpacing) {
      const screenY = worldY * zoom + offset.y;
      if (screenY < -20 || screenY > height + 20) continue;
      
      const isMajor = Math.abs(worldY % tickSpacing) < 0.001;
      const tickWidth = isMajor ? rulerSize * 0.6 : rulerSize * 0.3;
      
      ticks.push(
        <line
          key={`v-${worldY}`}
          x1={rulerSize}
          y1={screenY}
          x2={rulerSize - tickWidth}
          y2={screenY}
          stroke={isMajor ? RULER_MAJOR : RULER_FG}
          strokeWidth={isMajor ? 1 : 0.5}
        />
      );
      
      // Add labels for major ticks
      if (isMajor) {
        ticks.push(
          <text
            key={`v-label-${worldY}`}
            x={rulerSize - tickWidth - 2}
            y={screenY}
            fontSize={10}
            fill={RULER_TEXT}
            textAnchor="end"
            dominantBaseline="middle"
            style={{ userSelect: "none" }}
          >
            {Math.round(worldY)}
          </text>
        );
      }
    }
    
    // Cursor indicator
    if (cursor) {
      const cursorScreenY = cursor.y * zoom + offset.y;
      if (cursorScreenY >= 0 && cursorScreenY <= height) {
        ticks.push(
          <line
            key="cursor-y"
            x1={0}
            y1={cursorScreenY}
            x2={rulerSize}
            y2={cursorScreenY}
            stroke="#00BFFF"
            strokeWidth={2}
          />
        );
        
        // Cursor position label
        ticks.push(
          <text
            key="cursor-y-label"
            x={12}
            y={cursorScreenY}
            fontSize={10}
            fill="#00BFFF"
            textAnchor="start"
            dominantBaseline="middle"
            style={{ userSelect: "none" }}
          >
            {Math.round(cursor.y)}
          </text>
        );
      }
    }
    
    return ticks;
  };

  return (
    <>
      {/* Top ruler */}
      <svg
        width={width}
        height={rulerSize}
        style={{ 
          position: "absolute", 
          top: 0, 
          left: rulerSize, 
          zIndex: 10, 
          background: RULER_BG,
          pointerEvents: "none" 
        }}
      >
        <rect width={width} height={rulerSize} fill={RULER_BG} />
        {renderHorizontalTicks()}
      </svg>
      
      {/* Left ruler */}
      <svg
        width={rulerSize}
        height={height}
        style={{ 
          position: "absolute", 
          top: rulerSize, 
          left: 0, 
          zIndex: 10, 
          background: RULER_BG,
          pointerEvents: "none" 
        }}
      >
        <rect width={rulerSize} height={height} fill={RULER_BG} />
        {renderVerticalTicks()}
      </svg>
      
      {/* Corner square */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: rulerSize,
          height: rulerSize,
          background: RULER_BG,
          zIndex: 11,
          borderRight: `1px solid ${RULER_FG}`,
          borderBottom: `1px solid ${RULER_FG}`,
        }}
      />
    </>
  );
};

export default Rulers;
