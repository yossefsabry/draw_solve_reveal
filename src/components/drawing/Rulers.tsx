import React from "react";

interface RulersProps {
  width: number;
  height: number;
  zoom: number;
  rulerSize?: number; // thickness of the ruler in px
  gridSize?: number; // base grid size in px
}

const RULER_BG = "#18181b";
const RULER_FG = "#27272a";
const RULER_TEXT = "#fafafa";
const RULER_MAJOR = "#52525b";

export const Rulers: React.FC<RulersProps> = ({
  width,
  height,
  zoom,
  rulerSize = 16,
  gridSize = 20,
}) => {
  // Calculate tick intervals based on zoom
  const scaledGrid = gridSize * zoom;
  // Major tick every 5 grid lines
  const majorTick = scaledGrid * 5;

  // Helper to render ticks and labels
  const renderHorizontalTicks = () => {
    const ticks = [];
    for (let x = 0; x < width; x += scaledGrid) {
      const isMajor = Math.round(x / scaledGrid) % 5 === 0;
      ticks.push(
        <g key={x}>
          <line
            x1={x}
            y1={rulerSize}
            x2={x}
            y2={isMajor ? 0 : rulerSize * 0.5}
            stroke={isMajor ? RULER_MAJOR : RULER_FG}
            strokeWidth={1}
          />
          {isMajor && x > 0 && (
            <text
              x={x + 2}
              y={rulerSize - 4}
              fontSize={11}
              fill={RULER_TEXT}
              fontWeight="bold"
              style={{ userSelect: "none" }}
            >
              {Math.round(x / zoom)}
            </text>
          )}
        </g>
      );
    }
    return ticks;
  };

  const renderVerticalTicks = () => {
    const ticks = [];
    for (let y = 0; y < height; y += scaledGrid) {
      const isMajor = Math.round(y / scaledGrid) % 5 === 0;
      ticks.push(
        <g key={y}>
          <line
            x1={rulerSize}
            y1={y}
            x2={isMajor ? 0 : rulerSize * 0.5}
            y2={y}
            stroke={isMajor ? RULER_MAJOR : RULER_FG}
            strokeWidth={1}
          />
          {isMajor && y > 0 && (
            <text
              x={4}
              y={y - 2}
              fontSize={11}
              fill={RULER_TEXT}
              fontWeight="bold"
              style={{ userSelect: "none" }}
            >
              {Math.round(y / zoom)}
            </text>
          )}
        </g>
      );
    }
    return ticks;
  };

  return (
    <>
      {/* Top ruler */}
      <svg
        width={width}
        height={rulerSize}
        style={{ position: "absolute", top: 0, left: rulerSize, zIndex: 10, background: RULER_BG, pointerEvents: "none" }}
      >
        <rect width={width} height={rulerSize} fill={RULER_BG} />
        {renderHorizontalTicks()}
      </svg>
      {/* Left ruler */}
      <svg
        width={rulerSize}
        height={height}
        style={{ position: "absolute", top: rulerSize, left: 0, zIndex: 10, background: RULER_BG, pointerEvents: "none" }}
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