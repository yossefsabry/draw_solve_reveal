import React, { useState, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import DrawingCanvasArea from "./DrawingCanvasArea";
import { Button } from "@/components/ui/button";
import { Pencil, Eraser, Square, Circle, Minus, Palette, Download, ZoomIn, ZoomOut } from "lucide-react";

const tools = [
  { name: "Draw", icon: <Pencil />, mode: "draw" },
  { name: "Erase", icon: <Eraser />, mode: "erase" },
  { name: "Rectangle", icon: <Square />, mode: "rectangle" },
  { name: "Circle", icon: <Circle />, mode: "circle" },
  { name: "Line", icon: <Minus />, mode: "line" },
];

const DrawingCanvas: React.FC = () => {
  const [color, setColor] = useState("#FFFFFF");
  const [brushSize, setBrushSize] = useState(5);
  const [mode, setMode] = useState("draw");
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [objects, setObjects] = useState<any[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Export as image
  const handleExport = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 4.0));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.5));

  return (
    <div className="flex flex-col h-screen bg-[#232323] text-white">
      {/* Top Bar */}
      <div className="flex items-center h-10 bg-[#181818] border-b border-neutral-800 px-4">
        <span className="font-bold text-lg mr-8">Draw & Solve</span>
      </div>
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar */}
        <div className="flex flex-col items-center gap-2 w-16 bg-[#181818] border-r border-neutral-800 py-4">
          {tools.map(tool => (
            <Button
              key={tool.name}
              variant={mode === tool.mode ? "default" : "outline"}
              size="icon"
              className={`mb-2 ${mode === tool.mode ? "bg-primary text-primary-foreground ring-2 ring-primary" : ""}`}
              onClick={() => setMode(tool.mode)}
              title={tool.name}
            >
              {tool.icon}
            </Button>
          ))}
          <Button
            variant={showGrid ? "default" : "outline"}
            size="icon"
            className="mb-2"
            onClick={() => setShowGrid(g => !g)}
            title="Toggle Grid"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="16" height="16" rx="2"/><path d="M2 7h16M2 13h16M7 2v16M13 2v16"/></svg>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="mb-2"
            onClick={handleExport}
            title="Export as Image"
          >
            <Download />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="mb-2"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <ZoomIn />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="mb-2"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <ZoomOut />
          </Button>
        </div>
        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col items-center justify-center bg-[#232323] relative overflow-hidden">
          <DrawingCanvasArea
            color={color}
            brushSize={brushSize}
            mode={mode}
            showGrid={showGrid}
            objects={objects}
            setObjects={setObjects}
            canvasRef={canvasRef}
            zoom={zoom}
          />
        </div>
        {/* Right Sidebar */}
        <div className="flex flex-col w-56 bg-[#181818] border-l border-neutral-800 p-4 gap-6">
          <div>
            <label className="block mb-2 text-sm font-medium">Brush/Eraser Size</label>
            <input
              type="range"
              min={1}
              max={50}
              value={brushSize}
              onChange={e => setBrushSize(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs mt-1">{brushSize}px</div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">Color</label>
            <input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer"
              disabled={mode === "erase"}
            />
          </div>
        </div>
      </div>
      {/* Bottom Status Bar */}
      <div className="h-8 bg-[#181818] border-t border-neutral-800 flex items-center px-4 text-xs">
        <span>Mode: {mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
        <span className="ml-6">Brush Size: {brushSize}px</span>
        <span className="ml-6">Color: {color}</span>
        <span className="ml-6">Zoom: {Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
};

export default DrawingCanvas;
