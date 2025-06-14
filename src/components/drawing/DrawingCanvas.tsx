import React, { useState, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import DrawingCanvasArea from "./DrawingCanvasArea";
import { Button } from "@/components/ui/button";
import { Pencil, Eraser, Square, Circle, Minus, Palette, Download, ZoomIn, ZoomOut } from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";
import axios from "axios";

const tools = [
  { name: "Draw", icon: <Pencil className="text-foreground" />, mode: "draw" },
  { name: "Erase", icon: <Eraser className="text-foreground" />, mode: "erase" },
  { name: "Rectangle", icon: <Square className="text-foreground" />, mode: "rectangle" },
  { name: "Circle", icon: <Circle className="text-foreground" />, mode: "circle" },
  { name: "Line", icon: <Minus className="text-foreground" />, mode: "line" },
];

const DrawingCanvas: React.FC = () => {
  const [color, setColor] = useState("#FFFFFF");
  const [brushSize, setBrushSize] = useState(5);
  const [mode, setMode] = useState("draw");
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(3.0);
  const [zoomInput, setZoomInput] = useState('300');
  const minZoom = 0.5;
  const maxZoom = 4.0;
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [objects, setObjects] = useState<any[]>([]);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [undoStack, setUndoStack] = useState<any[][]>([]);
  const [redoStack, setRedoStack] = useState<any[][]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();

  // Helper: push current objects to undo stack
  const pushToUndo = (objs: any[]) => {
    setUndoStack((prev) => [...prev, objs]);
    setRedoStack([]); // clear redo stack on new action
  };

  // Undo
  const handlePrev = () => {
    setUndoStack((prevUndo) => {
      if (prevUndo.length === 0) return prevUndo;
      setRedoStack((prevRedo) => [objects, ...prevRedo]);
      const last = prevUndo[prevUndo.length - 1];
      setObjects(last);
      return prevUndo.slice(0, -1);
    });
  };

  // Redo
  const handleNext = () => {
    setRedoStack((prevRedo) => {
      if (prevRedo.length === 0) return prevRedo;
      setUndoStack((prevUndo) => [...prevUndo, objects]);
      const next = prevRedo[0];
      setObjects(next);
      return prevRedo.slice(1);
    });
  };

  // Clear All
  const handleClearAll = () => {
    pushToUndo(objects);
    setObjects([]);
  };

  // Export as PDF
  const handleExport = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'l' : 'p',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('drawing.pdf');
    toast.success("PDF downloaded successfully!", { duration: 3000 });
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoom(z => {
      const newZoom = Math.min(z + 0.1, maxZoom);
      setZoomInput(Math.round(newZoom * 100).toString());
      return newZoom;
    });
  };
  const handleZoomOut = () => {
    setZoom(z => {
      const newZoom = Math.max(z - 0.1, minZoom);
      setZoomInput(Math.round(newZoom * 100).toString());
      return newZoom;
    });
  };

  return (
    <div className="flex flex-col h-screen bg-[#232323] text-white">
      {/* Toggle button for right sidebar (visible on mobile) */}
      {isMobile && (
        <div className="flex justify-end p-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRightSidebar((v) => !v)}
            className="ml-auto"
          >
            {showRightSidebar ? "Hide Options" : "Show Options"}
          </Button>
        </div>
      )}
      <div className="flex-1 flex min-h-0 flex-col md:flex-row">
        {/* Left Sidebar */}
        <div className="flex flex-row md:flex-col items-center gap-2 w-full md:w-16 bg-[#181818] border-b md:border-b-0 md:border-r border-neutral-800 py-2 md:py-4 overflow-y-auto max-h-full">
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
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground"><rect x="2" y="2" width="16" height="16" rx="2"/><path d="M2 7h16M2 13h16M7 2v16M13 2v16"/></svg>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="mb-2"
            onClick={handleExport}
            title="Export as PDF"
          >
            <Download className="text-foreground" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="mb-2"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <ZoomIn className="text-foreground" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="mb-2"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <ZoomOut className="text-foreground" />
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
            setObjects={(newObjs) => {
              pushToUndo(objects);
              setObjects(newObjs);
            }}
            canvasRef={canvasRef}
            zoom={zoom}
            minZoom={minZoom}
            maxZoom={maxZoom}
            onZoomChange={z => {
              setZoom(z);
              setZoomInput(Math.round(z * 100).toString());
            }}
            offset={offset}
            onOffsetChange={setOffset}
          />
        </div>
        {/* Right Sidebar - responsive and toggleable */}
        {/* On desktop: always visible. On mobile: toggled. */}
        {(isMobile ? showRightSidebar : true) && (
          <div className="flex flex-col w-full md:w-56 bg-[#181818] border-t md:border-t-0 md:border-l border-neutral-800 p-4 gap-6 overflow-y-auto max-h-full">
            {/* Action Buttons */}
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                className={`flex-1 ${undoStack.length === 0 ? 'bg-muted text-muted-foreground' : 'bg-foreground text-background'}`}
                onClick={handlePrev}
                disabled={undoStack.length === 0}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`flex-1 ${redoStack.length === 0 ? 'bg-muted text-muted-foreground' : 'bg-foreground text-background'}`}
                onClick={handleNext}
                disabled={redoStack.length === 0}
              >
                Next
              </Button>
            </div>
            <div className="flex gap-2 mb-4">
              <Button variant="destructive" size="sm" className="flex-1" onClick={handleClearAll} disabled={objects.length === 0}>Clear All</Button>
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={async () => {
                  try {
                    const response = await axios.post("http://localhost:8000/calculate/your-endpoint", {
                      // TODO: Replace with actual payload
                      data: objects
                    });
                    console.log("Result:", response.data);
                    toast.success("Calculation successful!", { duration: 3000 });
                  } catch (error) {
                    console.error("Error:", error);
                    toast.error("Calculation failed!", { duration: 3000 });
                  }
                }}
              >
                Solve
              </Button>
            </div>
            {/* Zoom Control */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">Zoom</label>
              <input
                type="text"
                value={zoomInput}
                onChange={e => {
                  setZoomInput(e.target.value);
                }}
                onBlur={() => {
                  let val = Number(zoomInput);
                  if (isNaN(val)) val = Math.round(zoom * 100);
                  val = Math.max(minZoom * 100, Math.min(maxZoom * 100, val));
                  setZoom(val / 100);
                  setZoomInput(val.toString());
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    let val = Number(zoomInput);
                    if (isNaN(val)) val = Math.round(zoom * 100);
                    val = Math.max(minZoom * 100, Math.min(maxZoom * 100, val));
                    setZoom(val / 100);
                    setZoomInput(val.toString());
                  }
                }}
                className="w-full px-2 py-1 rounded bg-background text-foreground border border-border"
              />
              <div className="text-xs mt-1">{Math.round(zoom * 100)}%</div>
            </div>
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
        )}
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
