import React, { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import DrawingCanvasArea from "./DrawingCanvasArea";
import { Button } from "@/components/ui/button";
import { Pencil, Eraser, Download, ZoomIn, ZoomOut, Loader2, Type } from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const tools = [
  { name: "Draw", icon: <Pencil className="text-foreground" />, mode: "draw" },
  { name: "Erase", icon: <Eraser className="text-foreground" />, mode: "erase" },
  { name: "Text", icon: <Type className="text-foreground" />, mode: "text" },
];

// Add a type for result labels
function uuid() {
  return Math.random().toString(36).substring(2, 9) + Date.now();
}

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
  const [showWelcome, setShowWelcome] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [results, setResults] = useState([]); // [{id, expr, value, x, y, width, height, handwriting, handwritingVisible}]
  const [handwritingRegions, setHandwritingRegions] = useState([]); // [{expr, bbox: {minX, minY, maxX, maxY}, imageData}]
  const [customTexts, setCustomTexts] = useState([]); // [{id, text, x, y, width, height, editing}]

  React.useEffect(() => {
    if (!localStorage.getItem("dsr-welcome-shown")) {
      setShowWelcome(true);
      localStorage.setItem("dsr-welcome-shown", "1");
    }
  }, []);

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
      {/* Welcome/Help Modal */}
      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welcome to Draw & Solve!</DialogTitle>
            <DialogDescription>
              <div className="mb-2">Draw & Solve lets you sketch math problems, diagrams, or notes, and solve or export them instantly.</div>
              <ul className="list-disc pl-5 mb-2 text-left">
                <li>🖊️ Draw or erase with adjustable brush size and color</li>
                <li>🔍 Zoom and pan for precision</li>
                <li>📐 Grid and rulers for alignment</li>
                <li>⬅️ Undo/Redo and Clear All</li>
                <li>📤 Export your drawing as PDF</li>
                <li>🧮 Click "Solve" to send your drawing to the AI solver</li>
              </ul>
              <div className="text-xs text-muted-foreground">Tip: Use your mouse, touch, or stylus. Hold <b>Space</b> to pan. Use the sidebar for tools and options.</div>
            </DialogDescription>
          </DialogHeader>
          <button className="mt-4 w-full bg-primary text-primary-foreground py-2 rounded" onClick={() => setShowWelcome(false)}>
            Got it!
          </button>
        </DialogContent>
      </Dialog>
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
        <div
          className="flex-1 flex flex-col items-center justify-center bg-[#232323] relative overflow-hidden"
          onClick={e => {
            if (mode === "text") {
              const rect = e.currentTarget.getBoundingClientRect();
              // Convert click to canvas coordinates
              const x = (e.clientX - rect.left) / zoom - offset.x;
              const y = (e.clientY - rect.top) / zoom - offset.y;
              setCustomTexts(prev => [
                ...prev,
                {
                  id: uuid(),
                  text: "",
                  x,
                  y,
                  width: 120,
                  height: 40,
                  editing: true
                }
              ]);
            }
          }}
        >
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
          {/* Render result labels as draggable overlays */}
          {results.map((label) => (
            <DraggableLabel
              key={label.id}
              label={label}
              onMove={(x, y) => {
                setResults(results => results.map(l => l.id === label.id ? { ...l, x, y } : l));
              }}
              onResize={(width, height) => {
                setResults(results => results.map(l => l.id === label.id ? { ...l, width, height } : l));
              }}
              onRemove={id => {
                setResults(results => results.filter(l => l.id !== id));
              }}
              zoom={zoom}
              offset={offset}
            />
          ))}
          {/* Render custom text overlays */}
          {customTexts.map((label) => (
            (label.text.trim() !== '' || label.editing) && (
              <DraggableTextLabel
                key={label.id}
                label={label}
                onMove={(x, y) => {
                  setCustomTexts(texts => texts.map(l => l.id === label.id ? { ...l, x, y } : l));
                }}
                onResize={(width, height) => {
                  setCustomTexts(texts => texts.map(l => l.id === label.id ? { ...l, width, height } : l));
                }}
                onEdit={text => {
                  setCustomTexts(texts => texts.map(l => l.id === label.id ? { ...l, text, editing: false } : l));
                }}
                onStartEdit={() => {
                  setCustomTexts(texts => texts.map(l => l.id === label.id ? { ...l, editing: true } : l));
                }}
                onAutoSize={(width, height) => {
                  setCustomTexts(texts => texts.map(l => l.id === label.id ? { ...l, width, height } : l));
                }}
                zoom={zoom}
                offset={offset}
              />
            )
          ))}
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
                disabled={isSolving}
                onClick={async () => {
                  setIsSolving(true);
                  try {
                    let dictOfVars = {};
                    const canvas = canvasRef.current;
                    if (!canvas) throw new Error("Canvas not available");
                    const ctx = canvas.getContext('2d');
                    // --- Step 1: Detect handwriting regions for each variable ---
                    // For demo: assume each drawing object is a variable (real code would use OCR or segmentation)
                    const regions = objects.map((obj, idx) => {
                      // Find bounding box for points
                      if (!obj.points || obj.points.length === 0) return null;
                      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                      obj.points.forEach(pt => {
                        minX = Math.min(minX, pt.x);
                        minY = Math.min(minY, pt.y);
                        maxX = Math.max(maxX, pt.x);
                        maxY = Math.max(maxY, pt.y);
                      });
                      // Add some padding
                      minX = Math.max(0, minX - 5);
                      minY = Math.max(0, minY - 5);
                      maxX = Math.min(canvas.width, maxX + 5);
                      maxY = Math.min(canvas.height, maxY + 5);
                      // Get image data for this region
                      const imageData = ctx.getImageData(minX, minY, maxX - minX, maxY - minY);
                      // For demo, assign a fake variable name (real code would use OCR)
                      const expr = String.fromCharCode(120 + idx); // x, y, z, ...
                      return { expr, bbox: { minX, minY, maxX, maxY }, imageData };
                    }).filter(Boolean);
                    setHandwritingRegions(regions);
                    // --- End Step 1 ---
                    const response = await axios({
                      method: 'post',
                      url: 'http://localhost:8900/calculate',
                      data: {
                        image: canvas.toDataURL('image/png'),
                        dict_of_vars: dictOfVars
                      }
                    });
                    const resp = response.data;
                    console.log("Solve result:", resp);
                    // --- Step 2: Erase handwriting and add result label ---
                    let newResults = [];
                    (resp.data || []).forEach((data) => {
                      // Find the handwriting region for this variable
                      const region = regions.find(r => r.expr === data.expr);
                      let x = canvas.width / 2, y = canvas.height / 2, width = 80, height = 32, handwriting = null;
                      if (region) {
                        // Erase the handwriting region
                        ctx.clearRect(region.bbox.minX, region.bbox.minY, region.bbox.maxX - region.bbox.minX, region.bbox.maxY - region.bbox.minY);
                        x = region.bbox.minX;
                        y = region.bbox.minY;
                        width = region.bbox.maxX - region.bbox.minX;
                        height = region.bbox.maxY - region.bbox.minY;
                        handwriting = region.imageData;
                      }
                      newResults.push({
                        id: uuid(),
                        expr: data.expr,
                        value: data.result,
                        x,
                        y,
                        width,
                        height,
                        handwriting,
                        handwritingVisible: false
                      });
                    });
                    setResults(prev => [...prev, ...newResults]);
                    toast.success("Calculation successful!", { duration: 3000 });
                    // --- End Step 2 ---
                  } catch (error) {
                    console.error("Error:", error);
                    toast.error("Calculation failed!", { duration: 3000 });
                  } finally {
                    setIsSolving(false);
                  }
                }}
              >
                {isSolving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin w-4 h-4" /> Solving...
                  </span>
                ) : (
                  "Solve"
                )}
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

// Update DraggableLabel to support toggle and resize
function DraggableLabel({ label, onMove, onResize, onRemove, zoom, offset }) {
  const ref = useRef(null);
  const minSize = 20;
  // Store drag state locally to avoid excessive re-renders
  const dragState = useRef({ dragging: false, resizing: false, startX: 0, startY: 0, origX: 0, origY: 0, origW: 0, origH: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function onMouseDown(e) {
      if (e.target.classList.contains('resize-handle')) {
        dragState.current.resizing = true;
        dragState.current.startX = e.clientX;
        dragState.current.startY = e.clientY;
        dragState.current.origW = label.width;
        dragState.current.origH = label.height;
        document.addEventListener('mousemove', onResizeMove);
        document.addEventListener('mouseup', onResizeUp);
      } else {
        dragState.current.dragging = true;
        dragState.current.startX = e.clientX;
        dragState.current.startY = e.clientY;
        dragState.current.origX = label.x;
        dragState.current.origY = label.y;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      }
    }
    function onMouseMove(e) {
      if (!dragState.current.dragging) return;
      // Convert mouse movement to canvas coordinates
      const dx = (e.clientX - dragState.current.startX) / zoom;
      const dy = (e.clientY - dragState.current.startY) / zoom;
      // Update DOM position for smoothness
      el.style.left = `${((dragState.current.origX + dx + offset.x) * zoom)}px`;
      el.style.top = `${((dragState.current.origY + dy + offset.y) * zoom)}px`;
    }
    function onMouseUp(e) {
      if (!dragState.current.dragging) return;
      dragState.current.dragging = false;
      // Finalize position in canvas coordinates
      const dx = (e.clientX - dragState.current.startX) / zoom;
      const dy = (e.clientY - dragState.current.startY) / zoom;
      onMove(dragState.current.origX + dx, dragState.current.origY + dy);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
    function onResizeMove(e) {
      if (!dragState.current.resizing) return;
      let newW = Math.max(minSize, dragState.current.origW + (e.clientX - dragState.current.startX) / zoom);
      let newH = Math.max(minSize, dragState.current.origH + (e.clientY - dragState.current.startY) / zoom);
      // Update DOM size for smoothness
      el.style.width = `${newW * zoom}px`;
      el.style.height = `${newH * zoom}px`;
    }
    function onResizeUp(e) {
      if (!dragState.current.resizing) return;
      dragState.current.resizing = false;
      let newW = Math.max(minSize, dragState.current.origW + (e.clientX - dragState.current.startX) / zoom);
      let newH = Math.max(minSize, dragState.current.origH + (e.clientY - dragState.current.startY) / zoom);
      onResize(newW, newH);
      document.removeEventListener('mousemove', onResizeMove);
      document.removeEventListener('mouseup', onResizeUp);
    }
    el.addEventListener('mousedown', onMouseDown);
    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousemove', onResizeMove);
      document.removeEventListener('mouseup', onResizeUp);
    };
  }, [label, onMove, onResize, zoom, offset]);
  // Convert canvas coordinates to screen coordinates for rendering
  const screenX = (label.x + offset.x) * zoom;
  const screenY = (label.y + offset.y) * zoom;
  const width = (isNaN(label.width) || label.width < minSize ? minSize : label.width) * zoom;
  const height = (isNaN(label.height) || label.height < minSize ? minSize : label.height) * zoom;
  // Double-click handler for resize handle
  const handleResizeDoubleClick = (e) => {
    e.stopPropagation();
    if (onRemove) onRemove(label.id);
  };
  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        left: screenX,
        top: screenY,
        width,
        height,
        color: '#fff',
        fontWeight: 'bold',
        fontSize: Math.max(16, height * 0.7),
        cursor: 'move',
        zIndex: 20,
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        border: 'none',
        boxShadow: 'none',
        padding: 0,
        overflow: 'visible',
        pointerEvents: 'auto',
      }}
    >
      <span style={{ pointerEvents: 'none', width: '100%', textAlign: 'center', whiteSpace: 'pre' }}>{label.expr} = {label.value}</span>
      <span
        className="resize-handle"
        style={{
          width: 12,
          height: 12,
          background: '#fff',
          borderRadius: '50%',
          cursor: 'nwse-resize',
          marginLeft: 8,
          position: 'absolute',
          right: -6,
          bottom: -6,
          zIndex: 21,
        }}
        onDoubleClick={handleResizeDoubleClick}
      />
    </div>
  );
}

// Update DraggableTextLabel to auto-size as you type
function DraggableTextLabel({ label, onMove, onResize, onEdit, onStartEdit, onAutoSize, zoom, offset }) {
  const ref = useRef(null);
  const measureRef = useRef(null);
  const minSize = 20;
  const dragState = useRef({ dragging: false, resizing: false, startX: 0, startY: 0, origX: 0, origY: 0, origW: 0, origH: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function onMouseDown(e) {
      if (e.target.classList.contains('resize-handle')) {
        dragState.current.resizing = true;
        dragState.current.startX = e.clientX;
        dragState.current.startY = e.clientY;
        dragState.current.origW = label.width;
        dragState.current.origH = label.height;
        document.addEventListener('mousemove', onResizeMove);
        document.addEventListener('mouseup', onResizeUp);
      } else {
        dragState.current.dragging = true;
        dragState.current.startX = e.clientX;
        dragState.current.startY = e.clientY;
        dragState.current.origX = label.x;
        dragState.current.origY = label.y;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      }
    }
    function onMouseMove(e) {
      if (!dragState.current.dragging) return;
      const dx = (e.clientX - dragState.current.startX) / zoom;
      const dy = (e.clientY - dragState.current.startY) / zoom;
      el.style.left = `${((dragState.current.origX + dx + offset.x) * zoom)}px`;
      el.style.top = `${((dragState.current.origY + dy + offset.y) * zoom)}px`;
    }
    function onMouseUp(e) {
      if (!dragState.current.dragging) return;
      dragState.current.dragging = false;
      const dx = (e.clientX - dragState.current.startX) / zoom;
      const dy = (e.clientY - dragState.current.startY) / zoom;
      onMove(dragState.current.origX + dx, dragState.current.origY + dy);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
    function onResizeMove(e) {
      if (!dragState.current.resizing) return;
      let newW = Math.max(minSize, dragState.current.origW + (e.clientX - dragState.current.startX) / zoom);
      let newH = Math.max(minSize, dragState.current.origH + (e.clientY - dragState.current.startY) / zoom);
      el.style.width = `${newW * zoom}px`;
      el.style.height = `${newH * zoom}px`;
    }
    function onResizeUp(e) {
      if (!dragState.current.resizing) return;
      dragState.current.resizing = false;
      let newW = Math.max(minSize, dragState.current.origW + (e.clientX - dragState.current.startX) / zoom);
      let newH = Math.max(minSize, dragState.current.origH + (e.clientY - dragState.current.startY) / zoom);
      onResize(newW, newH);
      document.removeEventListener('mousemove', onResizeMove);
      document.removeEventListener('mouseup', onResizeUp);
    }
    el.addEventListener('mousedown', onMouseDown);
    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousemove', onResizeMove);
      document.removeEventListener('mouseup', onResizeUp);
    };
  }, [label, onMove, onResize, zoom, offset]);
  // Auto-size logic
  useEffect(() => {
    if (label.editing && measureRef.current && onAutoSize) {
      const span = measureRef.current;
      const rect = span.getBoundingClientRect();
      const width = Math.max(minSize, rect.width / zoom);
      const height = Math.max(minSize, rect.height / zoom);
      if (Math.abs(width - label.width) > 2 || Math.abs(height - label.height) > 2) {
        onAutoSize(width, height);
      }
    }
  }, [label.text, label.editing, zoom]);
  const screenX = (label.x + offset.x) * zoom;
  const screenY = (label.y + offset.y) * zoom;
  const width = (isNaN(label.width) || label.width < minSize ? minSize : label.width) * zoom;
  const height = (isNaN(label.height) || label.height < minSize ? minSize : label.height) * zoom;
  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        left: screenX,
        top: screenY,
        width,
        height,
        color: '#fff',
        fontWeight: 'bold',
        fontSize: Math.max(16, height * 0.7),
        cursor: 'move',
        zIndex: 20,
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        border: 'none',
        boxShadow: 'none',
        padding: 0,
        overflow: 'visible',
        pointerEvents: 'auto',
      }}
      onDoubleClick={onStartEdit}
    >
      {label.editing ? (
        <>
          <textarea
            autoFocus
            style={{
              width: '100%',
              height: '100%',
              fontSize: Math.max(16, height * 0.7),
              color: '#fff',
              background: 'rgba(0,0,0,0.7)',
              border: 'none',
              outline: 'none',
              textAlign: 'center',
              resize: 'none',
              overflow: 'auto',
              padding: 0,
            }}
            value={label.text}
            onChange={e => onEdit((e.target as HTMLTextAreaElement).value)}
            onBlur={e => onEdit((e.target as HTMLTextAreaElement).value)}
            rows={Math.max(1, Math.round(height / (Math.max(16, height * 0.7)) ))}
          />
          {/* Hidden span for measuring text size */}
          <span
            ref={measureRef}
            style={{
              position: 'absolute',
              left: -9999,
              top: -9999,
              whiteSpace: 'pre-wrap',
              fontWeight: 'bold',
              fontSize: Math.max(16, height * 0.7),
              fontFamily: 'inherit',
              visibility: 'hidden',
              pointerEvents: 'none',
              width: 'auto',
              minWidth: minSize,
              maxWidth: 600,
            }}
          >
            {label.text || ' '}
          </span>
        </>
      ) : (
        <span style={{ pointerEvents: 'none', width: '100%', textAlign: 'center', whiteSpace: 'pre-wrap' }}>{label.text}</span>
      )}
      <span
        className="resize-handle"
        style={{
          width: 12,
          height: 12,
          background: '#fff',
          borderRadius: '50%',
          cursor: 'nwse-resize',
          marginLeft: 8,
          position: 'absolute',
          right: -6,
          bottom: -6,
          zIndex: 21,
        }}
      />
    </div>
  );
}

export default DrawingCanvas;
