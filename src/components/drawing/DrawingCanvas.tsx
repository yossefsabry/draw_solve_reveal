
import React, { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import DrawingCanvasArea from "./DrawingCanvasArea";
import Canvas3D from "./Canvas3D";
import WelcomeModal from "./WelcomeModal";
import TopBar from "./TopBar";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import BottomStatusBar from "./BottomStatusBar";
import CanvasOverlays from "./CanvasOverlays";
import { ShapeType } from "./ShapeSelector";
import { useClearCanvas } from "@/hooks/use-canvas-clearing";
import { useDrawingMode } from "@/hooks/use-drawing-mode";
import jsPDF from "jspdf";
import { toast } from "sonner";
import axios from "axios";

function uuid() {
  return Math.random().toString(36).substring(2, 9) + Date.now();
}

const DrawingCanvas: React.FC = () => {
  const [color, setColor] = useState("#FFFFFF");
  const [brushSize, setBrushSize] = useState(5);
  const [mode, setMode] = useState("draw");
  const [selectedShape, setSelectedShape] = useState<ShapeType>("rectangle");
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(3.0);
  const [zoomInput, setZoomInput] = useState('300');
  const minZoom = 0.5;
  const maxZoom = 4.0;
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [objects, setObjects] = useState<any[]>([]);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [undoStack, setUndoStack] = useState<any[][]>([]);
  const [redoStack, setRedoStack] = useState<any[][]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();
  const [showWelcome, setShowWelcome] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [results, setResults] = useState([]);
  const [handwritingRegions, setHandwritingRegions] = useState([]);
  const [customTexts, setCustomTexts] = useState([]);
  
  // Drawing mode hook
  const { mode: drawingMode, toggle2D3D, is2D, is3D } = useDrawingMode();
  
  useEffect(() => {
    if (!localStorage.getItem("dsr-welcome-shown")) {
      setShowWelcome(true);
      localStorage.setItem("dsr-welcome-shown", "1");
    }
  }, []);

  // Helper: push current objects to undo stack
  const pushToUndo = (objs: any[]) => {
    setUndoStack((prev) => [...prev, objs]);
    setRedoStack([]);
  };

  // Clear canvas hook
  const { clearAll } = useClearCanvas({
    setObjects,
    canvasRef,
    pushToUndo: () => pushToUndo(objects),
    resetOtherStates: () => {
      setResults([]);
      setHandwritingRegions([]);
      setCustomTexts([]);
      setUndoStack([]);
      setRedoStack([]);
    }
  });

  // Undo/Redo handlers
  const handlePrev = () => {
    setUndoStack((prevUndo) => {
      if (prevUndo.length === 0) return prevUndo;
      setRedoStack((prevRedo) => [objects, ...prevRedo]);
      const last = prevUndo[prevUndo.length - 1];
      setObjects(last);
      return prevUndo.slice(0, -1);
    });
  };

  const handleNext = () => {
    setRedoStack((prevRedo) => {
      if (prevRedo.length === 0) return prevRedo;
      setUndoStack((prevUndo) => [...prevUndo, objects]);
      const next = prevRedo[0];
      setObjects(next);
      return prevRedo.slice(1);
    });
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

  const handleZoomInputBlur = () => {
    let val = Number(zoomInput);
    if (isNaN(val)) val = Math.round(zoom * 100);
    val = Math.max(minZoom * 100, Math.min(maxZoom * 100, val));
    setZoom(val / 100);
    setZoomInput(val.toString());
  };

  const handleZoomInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      let val = Number(zoomInput);
      if (isNaN(val)) val = Math.round(zoom * 100);
      val = Math.max(minZoom * 100, Math.min(maxZoom * 100, val));
      setZoom(val / 100);
      setZoomInput(val.toString());
    }
  };

  // Solve functionality
  const handleSolve = async () => {
    setIsSolving(true);
    try {
      let dictOfVars = {};
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas not available");
      const ctx = canvas.getContext('2d');
      
      // Detect handwriting regions for each variable
      const regions = objects.map((obj, idx) => {
        if (!obj.points || obj.points.length === 0) return null;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        obj.points.forEach(pt => {
          minX = Math.min(minX, pt.x);
          minY = Math.min(minY, pt.y);
          maxX = Math.max(maxX, pt.x);
          maxY = Math.max(maxY, pt.y);
        });
        minX = Math.max(0, minX - 5);
        minY = Math.max(0, minY - 5);
        maxX = Math.min(canvas.width, maxX + 5);
        maxY = Math.min(canvas.height, maxY + 5);
        const imageData = ctx.getImageData(minX, minY, maxX - minX, maxY - minY);
        const expr = String.fromCharCode(120 + idx);
        return { expr, bbox: { minX, minY, maxX, maxY }, imageData };
      }).filter(Boolean);
      
      setHandwritingRegions(regions);
      
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
      
      let newResults = [];
      (resp.data || []).forEach((data) => {
        const region = regions.find(r => r.expr === data.expr);
        let x = canvas.width / 2, y = canvas.height / 2, width = 80, height = 32, handwriting = null;
        if (region) {
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
    } catch (error) {
      console.error("Error:", error);
      toast.error("Calculation failed!", { duration: 3000 });
    } finally {
      setIsSolving(false);
    }
  };

  // Text click handler for text mode
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (mode === "text") {
      const rect = e.currentTarget.getBoundingClientRect();
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
  };

  // Overlay handlers
  const handleResultMove = (id: string, x: number, y: number) => {
    setResults(results => results.map(l => l.id === id ? { ...l, x, y } : l));
  };

  const handleResultResize = (id: string, width: number, height: number) => {
    setResults(results => results.map(l => l.id === id ? { ...l, width, height } : l));
  };

  const handleResultRemove = (id: string) => {
    setResults(results => results.filter(l => l.id !== id));
  };

  const handleTextMove = (id: string, x: number, y: number) => {
    setCustomTexts(texts => texts.map(l => l.id === id ? { ...l, x, y } : l));
  };

  const handleTextResize = (id: string, width: number, height: number) => {
    setCustomTexts(texts => texts.map(l => l.id === id ? { ...l, width, height } : l));
  };

  const handleTextEdit = (id: string, text: string) => {
    setCustomTexts(texts => texts.map(l => l.id === id ? { ...l, text, editing: false } : l));
  };

  const handleTextStartEdit = (id: string) => {
    setCustomTexts(texts => texts.map(l => l.id === id ? { ...l, editing: true } : l));
  };

  const handleTextAutoSize = (id: string, width: number, height: number) => {
    setCustomTexts(texts => texts.map(l => l.id === id ? { ...l, width, height } : l));
  };

  return (
    <div className="flex flex-col h-screen bg-[#232323] text-white">
      <WelcomeModal open={showWelcome} onOpenChange={setShowWelcome} />
      
      <TopBar
        is3D={is3D}
        onToggle2D3D={toggle2D3D}
        showLeftSidebar={showLeftSidebar}
        onToggleLeftSidebar={() => setShowLeftSidebar(!showLeftSidebar)}
        showRightSidebar={showRightSidebar}
        onToggleRightSidebar={() => setShowRightSidebar(!showRightSidebar)}
        isMobile={isMobile}
      />

      <div className="flex-1 flex min-h-0 flex-col md:flex-row">
        <LeftSidebar
          show={showLeftSidebar}
          mode={mode}
          onModeChange={setMode}
          selectedShape={selectedShape}
          onShapeSelect={setSelectedShape}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(g => !g)}
          is2D={is2D}
          onExport={handleExport}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col items-center justify-center bg-[#232323] relative overflow-hidden" onClick={handleCanvasClick}>
          {is2D ? (
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
          ) : (
            <Canvas3D
              color={color}
              brushSize={brushSize}
              mode={mode}
              objects={objects}
              setObjects={setObjects}
            />
          )}
          
          <CanvasOverlays
            is2D={is2D}
            results={results}
            customTexts={customTexts}
            zoom={zoom}
            offset={offset}
            onResultMove={handleResultMove}
            onResultResize={handleResultResize}
            onResultRemove={handleResultRemove}
            onTextMove={handleTextMove}
            onTextResize={handleTextResize}
            onTextEdit={handleTextEdit}
            onTextStartEdit={handleTextStartEdit}
            onTextAutoSize={handleTextAutoSize}
          />
        </div>

        <RightSidebar
          show={showRightSidebar}
          isMobile={isMobile}
          undoStack={undoStack}
          redoStack={redoStack}
          onPrev={handlePrev}
          onNext={handleNext}
          onClearAll={clearAll}
          objects={objects}
          results={results}
          customTexts={customTexts}
          is2D={is2D}
          isSolving={isSolving}
          onSolve={handleSolve}
          zoom={zoom}
          zoomInput={zoomInput}
          onZoomInputChange={setZoomInput}
          onZoomInputBlur={handleZoomInputBlur}
          onZoomInputKeyDown={handleZoomInputKeyDown}
          minZoom={minZoom}
          maxZoom={maxZoom}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
          color={color}
          onColorChange={setColor}
          mode={mode}
        />
      </div>
      
      <BottomStatusBar
        drawingMode={drawingMode}
        mode={mode}
        brushSize={brushSize}
        color={color}
        is2D={is2D}
        zoom={zoom}
        selectedShape={selectedShape}
      />
    </div>
  );
};

export default DrawingCanvas;
