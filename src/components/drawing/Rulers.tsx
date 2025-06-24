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
  // Calculate the start position based on offset and zoom
  const startX = Math.floor(-offset.x / zoom / gridSize) * gridSize;
  const startY = Math.floor(-offset.y / zoom / gridSize) * gridSize;

  // Helper to render horizontal ruler ticks and labels
  const renderHorizontalTicks = () => {
    const ticks = [];
    const step = gridSize;
    const majorStep = step * 5; // Major tick every 5 grid units
    const labelStep = step; // Show label at every grid line
    for (let x = startX; x <= startX + width / zoom + step; x += step) {
      const screenX = x * zoom + offset.x;
      if (screenX < 0 || screenX > width) continue;
      const isMajor = Math.abs(x % majorStep) < 0.01;
      const tickHeight = isMajor ? rulerSize * 0.6 : rulerSize * 0.3;
      ticks.push(
        <g key={x}>
          <line
            x1={screenX}
            y1={rulerSize}
            x2={screenX}
            y2={rulerSize - tickHeight}
            stroke={isMajor ? RULER_MAJOR : RULER_FG}
            strokeWidth={isMajor ? 1 : 0.5}
          />
          {/* Always show label at every grid line */}
          {Math.abs(x % labelStep) < 0.01 && (
            <text
              x={screenX}
              y={rulerSize - tickHeight}
              fontSize={10}
              fill={RULER_TEXT}
              textAnchor="middle"
              style={{ userSelect: "none" }}
            >
              {Math.round(x)}
            </text>
          )}
        </g>
      );
    }
    // Draw cursor indicator if present
    if (cursor) {
      const cursorScreenX = (cursor.x + offset.x) * zoom;
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
      }
    }
    return ticks;
  };

  // Helper to render vertical ruler ticks and labels
  const renderVerticalTicks = () => {
    const ticks = [];
    const step = gridSize;
    const majorStep = step * 5; // Major tick every 5 grid units
    const labelStep = step; // Show label at every grid line
    for (let y = startY; y <= startY + height / zoom + step; y += step) {
      const screenY = y * zoom + offset.y;
      if (screenY < 0 || screenY > height) continue;
      const isMajor = Math.abs(y % majorStep) < 0.01;
      const tickWidth = isMajor ? rulerSize * 0.6 : rulerSize * 0.3;
      ticks.push(
        <g key={y}>
          <line
            x1={rulerSize}
            y1={screenY}
            x2={rulerSize - tickWidth}
            y2={screenY}
            stroke={isMajor ? RULER_MAJOR : RULER_FG}
            strokeWidth={isMajor ? 1 : 0.5}
          />
          {/* Always show label at every grid line */}
          {Math.abs(y % labelStep) < 0.01 && (
            <text
              x={rulerSize - tickWidth + 40}
              y={screenY}
              fontSize={10}
              fill={RULER_TEXT}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(-90, ${rulerSize - tickWidth - 4}, ${screenY})`}
              style={{ userSelect: "none" }}
            >
              {Math.round(y)}
            </text>
          )}
        </g>
      );
    }
    // Draw cursor indicator if present
    if (cursor) {
      const cursorScreenY = (cursor.y + offset.y) * zoom;
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
