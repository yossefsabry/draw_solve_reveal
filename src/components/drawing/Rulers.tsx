import React from "react";
import DrawingCanvasArea from "./DrawingCanvasArea";

interface RulersProps {
  width: number;
  height: number;
  zoom: number;
  rulerSize?: number; // thickness of the ruler in px
  gridSize?: number; // base grid size in px
}

const RULER_BG = "000000"; // light blue-gray for high contrast
const RULER_FG = "#acacac"; // cyan-300 for minor ticks
const RULER_MAJOR = "#ffffff"; // sky-700 for major ticks

export const Rulers: React.FC<RulersProps> = ({
  width,
  height,
  zoom,
  rulerSize = 48, // much larger for clarity
  gridSize = 10,
}) => {
  // Calculate tick intervals based on zoom
  const scaledGrid = gridSize * zoom;
  // Major tick every 5 grid lines
  const majorTick = scaledGrid * 5;

  // Helper to render ticks and labels
  const renderHorizontalTicks = () => {
    const ticks = [];
    const showLabels = (scaledGrid * 5) >= 30;
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
            strokeWidth={isMajor ? 3 : 1}
          />
          {isMajor && x > 0 && showLabels && (
            <text
              x={x + 4}
              y={rulerSize / 2 + 7}
              fontSize={20}
              fill={RULER_MAJOR}
              fontWeight="bold"
              textAnchor="middle"
              alignmentBaseline="middle"
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
    const showLabels = (scaledGrid * 5) >= 30;
    for (let y = 0; y < height; y += scaledGrid) {
      const isMajor = Math.round(y / scaledGrid) % 5 === 0;
      ticks.push(
        <g key={y}>
          <line
            x1={isMajor ? rulerSize : rulerSize * 0.5}
            y1={y}
            x2={0}
            y2={y}
            stroke={isMajor ? RULER_MAJOR : RULER_FG}
            strokeWidth={isMajor ? 3 : 1}
          />
          {isMajor && y > 0 && showLabels && (
            <text
              x={rulerSize / 2}
              y={y + 7}
              fontSize={20}
              fill={RULER_MAJOR}
              fontWeight="bold"
              textAnchor="middle"
              alignmentBaseline="middle"
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
        width={width * 20}
        height={rulerSize * 50}
        style={{ position: "absolute", top: 0, left: rulerSize, zIndex: 10, background: RULER_BG, pointerEvents: "none" }}
      >
        <rect width={width} height={rulerSize} fill={RULER_BG} />
        {renderHorizontalTicks()}
      </svg>
      {/* Left ruler */}
      <svg
        width={rulerSize * 80}
        height={height * 20}
        style={{ position: "absolute", top: rulerSize, left: 0, zIndex: 10, background: RULER_BG, pointerEvents: "none", textAlign: "center" }}
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
