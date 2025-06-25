
import React from "react";

interface RulersProps {
  width: number;
  height: number;
  zoom: number;
  offset: { x: number; y: number };
  rulerSize?: number;
  cursor?: { x: number; y: number } | null;
}

const RULER_BG = "#1a1a1a";
const RULER_FG = "#555555";
const RULER_MAJOR = "#ffffff";
const RULER_TEXT = "#cccccc";

export const Rulers: React.FC<RulersProps> = ({
  width,
  height,
  zoom,
  offset,
  rulerSize = 20,
  cursor = null,
}) => {
  // Calculate visible range in world coordinates
  const worldStartX = -offset.x / zoom;
  const worldStartY = -offset.y / zoom;
  const worldEndX = worldStartX + width / zoom;
  const worldEndY = worldStartY + height / zoom;

  // Calculate appropriate tick spacing based on zoom level
  const getTickSpacing = () => {
    const minPixelSpacing = 60; // Increased for better readability
    const worldSpacing = minPixelSpacing / zoom;
    
    // Find appropriate spacing (1, 2, 5, 10, 20, 50, 100, etc.)
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

  // Render horizontal ruler
  const renderHorizontalRuler = () => {
    const ticks = [];
    
    // Start from first tick before visible area
    const startTick = Math.floor(worldStartX / minorTickSpacing) * minorTickSpacing;
    
    for (let worldX = startTick; worldX <= worldEndX + minorTickSpacing; worldX += minorTickSpacing) {
      const screenX = worldX * zoom + offset.x;
      if (screenX < -20 || screenX > width + 20) continue;
      
      const isMajor = Math.abs(worldX % tickSpacing) < 0.01;
      const tickHeight = isMajor ? rulerSize * 0.7 : rulerSize * 0.3;
      
      ticks.push(
        <line
          key={`h-${worldX.toFixed(2)}`}
          x1={screenX}
          y1={rulerSize}
          x2={screenX}
          y2={rulerSize - tickHeight}
          stroke={isMajor ? RULER_MAJOR : RULER_FG}
          strokeWidth={isMajor ? 0.2 : 0.5}
        />
      );
      
      // Add labels for major ticks with better positioning
      if (isMajor && screenX >= 20 && screenX <= width - 20) {
        ticks.push(
          <text
            key={`h-label-${worldX.toFixed(2)}`}
            x={screenX }
            y={rulerSize - tickHeight + 4} // Moved down slightly
            fontSize={8}
            fill={RULER_TEXT}
            textAnchor="middle"
            dominantBaseline="bottom"
            style={{ userSelect: "none", fontWeight: "500" }}
          >
            {Math.round(worldX)}
          </text>
        );
      }
    }
    
    return ticks;
  };

  // Render vertical ruler
  const renderVerticalRuler = () => {
    const ticks = [];
    
    // Start from first tick before visible area
    const startTick = Math.floor(worldStartY / minorTickSpacing) * minorTickSpacing;
    
    for (let worldY = startTick; worldY <= worldEndY + minorTickSpacing; worldY += minorTickSpacing) {
      const screenY = worldY * zoom + offset.y;
      if (screenY < -20 || screenY > height + 20) continue;
      
      const isMajor = Math.abs(worldY % tickSpacing) < 0.01;
      const tickWidth = isMajor ? rulerSize * 0.7 : rulerSize * 0.3;
      
      ticks.push(
        <line
          key={`v-${worldY.toFixed(2)}`}
          x1={rulerSize + 10}
          y1={screenY}
          x2={rulerSize - tickWidth + 5}
          y2={screenY}
          stroke={isMajor ? RULER_MAJOR : RULER_FG}
          strokeWidth={isMajor ? 0.2 : 0.5}
        />
      );
      
      // Add labels for major ticks with better positioning
      if (isMajor && screenY >= 20 && screenY <= height - 20) {
        ticks.push(
          <text
            key={`v-label-${worldY.toFixed(2)}`}
            x={rulerSize - tickWidth + 15} // Moved right for better readability
            y={screenY}
            fontSize={8}
            fill={RULER_TEXT}
            textAnchor="end"
            dominantBaseline="left"
            style={{ userSelect: "none", fontWeight: "500" }}
          >
            {Math.round(worldY)}
          </text>
        );
      }
    }
    
    return ticks;
  };

  // Render cursor indicators
  const renderCursorIndicators = () => {
    if (!cursor) return [];
    
    const indicators = [];
    const cursorScreenX = cursor.x * zoom + offset.x;
    const cursorScreenY = cursor.y * zoom + offset.y;
    
    // Horizontal cursor line
    if (cursorScreenX >= 0 && cursorScreenX <= width) {
      indicators.push(
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
      
      // Position label with better positioning
      indicators.push(
        <rect
          key="cursor-x-bg"
          x={Math.max(2, Math.min(width - 52, cursorScreenX - 25))}
          y={2}
          width={50}
          height={12}
          fill="rgba(0, 191, 255, 0.9)"
          rx={2}
        />
      );
      
      indicators.push(
        <text
          key="cursor-x-label"
          x={Math.max(27, Math.min(width - 27, cursorScreenX))}
          y={8}
          fontSize={9}
          fill="#000"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ userSelect: "none", fontWeight: "bold" }}
        >
          {Math.round(cursor.x)}
        </text>
      );
    }
    
    // Vertical cursor line
    if (cursorScreenY >= 0 && cursorScreenY <= height) {
      indicators.push(
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
      
      // Position label with better positioning
      indicators.push(
        <rect
          key="cursor-y-bg"
          x={2}
          y={Math.max(2, Math.min(height - 14, cursorScreenY - 6))}
          width={35}
          height={12}
          fill="rgba(0, 191, 255, 0.9)"
          rx={2}
        />
      );
      
      indicators.push(
        <text
          key="cursor-y-label"
          x={19}
          y={Math.max(8, Math.min(height - 8, cursorScreenY))}
          fontSize={9}
          fill="#000"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ userSelect: "none", fontWeight: "bold" }}
        >
          {Math.round(cursor.y)}
        </text>
      );
    }
    
    return indicators;
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
          pointerEvents: "none",
          borderBottom: `1px solid ${RULER_FG}`
        }}
      >
        <rect width={width + 10} height={rulerSize} fill={RULER_BG} />
        {renderHorizontalRuler()}
        {renderCursorIndicators().filter(item => item.key?.toString().includes('cursor-x'))}
      </svg>
      
      {/* Left ruler */}
      <svg
        width={rulerSize + 10}
        height={height}
        style={{ 
          position: "absolute", 
          top: rulerSize, 
          left: 0, 
          zIndex: 10, 
          background: RULER_BG,
          pointerEvents: "none",
          borderRight: `1px solid ${RULER_FG}`
        }}
      >
        <rect width={rulerSize + 10} height={height} fill={RULER_BG} />
        {renderVerticalRuler()}
        {renderCursorIndicators().filter(item => item.key?.toString().includes('cursor-y'))}
      </svg>
      
      {/* Corner square */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: rulerSize + 10,
          height: rulerSize,
          background: RULER_BG,
          zIndex: 11,
          borderRight: `1px solid ${RULER_FG}`,
          borderBottom: `1px solid ${RULER_FG}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "8px",
          color: RULER_TEXT,
          fontWeight: "bold"
        }}
      >
        {Math.round(zoom * 100)}%
      </div>
    </>
  );
};

export default Rulers;
