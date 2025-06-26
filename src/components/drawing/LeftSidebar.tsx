import React from 'react';
import { Button } from "@/components/ui/button";
import { Pencil, Eraser, Download, ZoomIn, ZoomOut, Type, Shapes } from "lucide-react";
import ShapeSelector, { ShapeType } from "./ShapeSelector";

const tools = [
  { name: "Draw", icon: <Pencil className="text-foreground" />, mode: "draw" },
  { name: "Erase", icon: <Eraser className="text-foreground" />, mode: "erase" },
  { name: "Text", icon: <Type className="text-foreground" />, mode: "text" },
  { name: "Shapes", icon: <Shapes className="text-foreground" />, mode: "shape" },
];

interface LeftSidebarProps {
  show: boolean;
  mode: string;
  onModeChange: (mode: string) => void;
  selectedShape: ShapeType;
  onShapeSelect: (shape: ShapeType) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  is2D: boolean;
  onExport: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  show,
  mode,
  onModeChange,
  selectedShape,
  onShapeSelect,
  showGrid,
  onToggleGrid,
  is2D,
  onExport,
  onZoomIn,
  onZoomOut
}) => {
  if (!show) return null;

  return (
    <div className="flex flex-row md:flex-col items-center gap-2 w-full md:w-16 bg-[#181818] border-b md:border-b-0 md:border-r border-neutral-800 py-2 md:py-4 overflow-y-auto max-h-full">
      {/* Drawing/Erase/Text tools */}
      <div className="flex flex-col items-center w-full mb-4">
        {tools.filter(tool => tool.mode !== "shape").map(tool => (
          <Button
            key={tool.name}
            variant={mode === tool.mode ? "default" : "outline"}
            size="icon"
            className={`mb-3 transition-all duration-150 shadow-md rounded-full border-2 border-transparent hover:border-primary hover:scale-110 focus:scale-110 focus:ring-2 focus:ring-primary/40 ${mode === tool.mode ? "bg-primary text-primary-foreground border-primary scale-110 ring-2 ring-primary" : "bg-background text-foreground"}`}
            style={{ width: 44, height: 44, fontSize: 22 }}
            onClick={() => onModeChange(tool.mode)}
            title={tool.name}
          >
            {tool.icon}
          </Button>
        ))}
      </div>

      {/* Shape tools group */}
      <div className="flex flex-col items-center w-full mb-4">
        <div className="text-xs text-muted-foreground mb-2 tracking-wide uppercase font-semibold">Shapes</div>
        <Button
          variant={mode === "shape" ? "default" : "outline"}
          size="icon"
          className={`transition-all duration-150 shadow-md rounded-full border-2 border-transparent hover:border-primary hover:scale-110 focus:scale-110 focus:ring-2 focus:ring-primary/40 ${mode === "shape" ? "bg-primary text-primary-foreground border-primary scale-110 ring-2 ring-primary" : "bg-background text-foreground"}`}
          style={{ width: 44, height: 44, fontSize: 22 }}
          onClick={() => onModeChange("shape")}
          title="Shapes"
        >
          <Shapes className="text-foreground" />
        </Button>
        {/* Shape selector dropdown, only show when shape mode is selected */}
        {mode === "shape" && (
          <div className="mt-4 w-full flex justify-center">
            <ShapeSelector
              selectedShape={selectedShape}
              onShapeSelect={onShapeSelect}
            />
          </div>
        )}
      </div>

      {/* Grid toggle and other controls */}
      <Button
        variant={showGrid ? "default" : "outline"}
        size="icon"
        className="mb-2"
        onClick={onToggleGrid}
        title="Toggle Grid"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground">
          <rect x="2" y="2" width="16" height="16" rx="2"/>
          <path d="M2 7h16M2 13h16M7 2v16M13 2v16"/>
        </svg>
      </Button>
      
      {is2D && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="mb-2"
            onClick={onExport}
            title="Export as PDF"
          >
            <Download className="text-foreground" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="mb-2"
            onClick={onZoomIn}
            title="Zoom In"
          >
            <ZoomIn className="text-foreground" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="mb-2"
            onClick={onZoomOut}
            title="Zoom Out"
          >
            <ZoomOut className="text-foreground" />
          </Button>
        </>
      )}
    </div>
  );
};

export default LeftSidebar;
