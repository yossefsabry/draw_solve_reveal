
import React, { useState } from 'react';
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
  const [isShapeSelectorOpen, setIsShapeSelectorOpen] = useState(false);

  const handleModeChange = (newMode: string) => {
    onModeChange(newMode);
    if (newMode === "shape") {
      setIsShapeSelectorOpen(true);
    } else {
      setIsShapeSelectorOpen(false);
    }
  };

  const handleShapeSelect = (shape: ShapeType) => {
    onShapeSelect(shape);
    setIsShapeSelectorOpen(false);
  };

  if (!show) return null;

  return (
    <div className="relative">
      <div className="flex flex-row md:flex-col items-center gap-2 w-full md:w-16 bg-[#1a1a1a] border-b md:border-b-0 md:border-r border-neutral-700 py-2 md:py-4 overflow-y-auto max-h-full">
        {/* Drawing tools */}
        <div className="flex flex-col items-center w-full mb-4">
          {tools.map(tool => (
            <Button
              key={tool.name}
              variant={mode === tool.mode ? "default" : "outline"}
              size="icon"
              className={`mb-3 transition-all duration-200 shadow-lg rounded-lg border-2 hover:scale-105 focus:scale-105 focus:ring-2 focus:ring-blue-400 ${
                mode === tool.mode 
                  ? "bg-blue-600 text-white border-blue-500 shadow-blue-500/25" 
                  : "bg-[#2a2a2a] text-gray-300 border-transparent hover:bg-[#333] hover:border-gray-500"
              }`}
              style={{ width: 48, height: 48 }}
              onClick={() => handleModeChange(tool.mode)}
              title={tool.name}
            >
              {tool.icon}
            </Button>
          ))}
        </div>

        {/* Grid and export controls */}
        <div className="flex flex-col items-center w-full">
          <Button
            variant={showGrid ? "default" : "outline"}
            size="icon"
            className={`mb-3 transition-all duration-200 shadow-lg rounded-lg border-2 hover:scale-105 ${
              showGrid 
                ? "bg-green-600 text-white border-green-500" 
                : "bg-[#2a2a2a] text-gray-300 border-transparent hover:bg-[#333]"
            }`}
            style={{ width: 48, height: 48 }}
            onClick={onToggleGrid}
            title="Toggle Grid"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="16" height="16" rx="2"/>
              <path d="M2 7h16M2 13h16M7 2v16M13 2v16"/>
            </svg>
          </Button>
          
          {is2D && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="mb-3 bg-[#2a2a2a] text-gray-300 border-transparent hover:bg-[#333] hover:scale-105 transition-all duration-200"
                style={{ width: 48, height: 48 }}
                onClick={onExport}
                title="Export as PDF"
              >
                <Download />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="mb-3 bg-[#2a2a2a] text-gray-300 border-transparent hover:bg-[#333] hover:scale-105 transition-all duration-200"
                style={{ width: 48, height: 48 }}
                onClick={onZoomIn}
                title="Zoom In"
              >
                <ZoomIn />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="bg-[#2a2a2a] text-gray-300 border-transparent hover:bg-[#333] hover:scale-105 transition-all duration-200"
                style={{ width: 48, height: 48 }}
                onClick={onZoomOut}
                title="Zoom Out"
              >
                <ZoomOut />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Shape selector dropdown */}
      <ShapeSelector
        selectedShape={selectedShape}
        onShapeSelect={handleShapeSelect}
        isOpen={isShapeSelectorOpen}
        onClose={() => setIsShapeSelectorOpen(false)}
      />
    </div>
  );
};

export default LeftSidebar;
