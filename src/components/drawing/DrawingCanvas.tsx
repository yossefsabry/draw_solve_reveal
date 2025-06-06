
import React, { useState, useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { DrawingMode } from "./types";
import ToolBar from "./ToolBar";
import DrawingArea from "./DrawingArea";
import CanvasFooter from "./CanvasFooter";
import MathResults from "./MathResults";
import { useCanvasDrawing } from "@/hooks/use-canvas-drawing";
import { useMathSolver } from "@/hooks/use-math-solver";
import { useHistoryState } from "@/hooks/use-history-state";
import UndoRedoToolbar from "./UndoRedoToolbar";
import GridToggle from "./GridToggle";

interface DrawingCanvasProps {
  className?: string;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ className }) => {
  const [color, setColor] = useState("#FFFFFF"); // White by default
  const [brushSize, setBrushSize] = useState(5);
  const [mode, setMode] = useState<DrawingMode>("draw");
  const [showGrid, setShowGrid] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();

  // Use history hook for objects
  const {
    state: objects,
    setState: setObjectsWithHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistoryState<any[]>([]);

  // Use our custom hooks
  const {
    isDrawing,
    selectedShape,
    drawingLayerRef,
    startDrawing,
    stopDrawing,
    handleMove,
    handleWheel,
    handleMouseLeave,
    setSelectedShape,
    scale,
    offset,
    isPanning,
    keyPressed,
    setDirectScale,
    cursorPosition
  } = useCanvasDrawing({
    mode,
    color,
    brushSize,
    objects,
    setObjects: setObjectsWithHistory
  });

  const {
    isLoading,
    mathEquations,
    handleSolve,
    clearMathResults
  } = useMathSolver();

  // Load MathJax script for rendering LaTeX
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.MathJax) {
        window.MathJax.Hub.Config({
          tex2jax: {inlineMath: [['$', '$'], ['\\(', '\\)']]},
        });
      }
    };

    return () => {
      if (script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Function to clear the canvas - now properly clears all objects
  const clearCanvas = () => {
    setObjectsWithHistory([]);
    clearMathResults();
    
    // Also clear the canvas visually
    if (drawingLayerRef.current) {
      const ctx = drawingLayerRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, drawingLayerRef.current.width, drawingLayerRef.current.height);
        // Set black background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, drawingLayerRef.current.width, drawingLayerRef.current.height);
      }
    }
  };

  // Set canvas reference for the DrawingArea component
  const setCanvasRef = (ref: HTMLCanvasElement | null) => {
    drawingLayerRef.current = ref;
    canvasRef.current = ref;
  };

  // Handle solve button click
  const onSolve = () => {
    if (drawingLayerRef.current) {
      handleSolve(drawingLayerRef.current, setObjectsWithHistory);
    }
  };

  // Add keyboard shortcuts hint on component mount
  useEffect(() => {
    const hint = "Drawing Canvas Shortcuts:\n" +
      "- Zoom: Ctrl + Scroll\n" +
      "- Pan: Space + Drag\n" +
      "- Undo: Ctrl + Z\n" +
      "- Redo: Ctrl + Shift + Z or Ctrl + Y";
    console.info(hint);
  }, []);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className={`flex ${isMobile ? 'justify-between items-center' : 'flex-wrap items-center justify-between'} gap-2 p-2 border-b`}>
        <ToolBar
          color={color}
          brushSize={brushSize}
          mode={mode}
          isMobile={isMobile}
          onColorChange={setColor}
          onBrushSizeChange={setBrushSize}
          onModeChange={setMode}
        />
        
        <div className="flex items-center gap-2">
          <GridToggle showGrid={showGrid} onToggle={setShowGrid} />
          <UndoRedoToolbar
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
            isMobile={isMobile}
          />
        </div>
      </div>
      
      <DrawingArea
        isDrawing={isDrawing}
        mode={mode}
        color={color}
        brushSize={brushSize}
        objects={objects}
        selectedShape={selectedShape}
        showGrid={showGrid}
        onObjectsChange={setObjectsWithHistory}
        onSelectedShapeChange={setSelectedShape}
        onDrawingStart={startDrawing}
        onDrawingEnd={stopDrawing}
        onCanvasRef={setCanvasRef}
        handleWheel={handleWheel}
        handleMove={handleMove}
        handleMouseLeave={handleMouseLeave}
        scale={scale}
        offset={offset}
        isPanning={isPanning}
        onSetScale={setDirectScale}
        cursorPosition={cursorPosition}
      />
      
      <MathResults mathEquations={mathEquations} />
      
      <CanvasFooter
        isLoading={isLoading}
        onClear={clearCanvas}
        onSolve={onSolve}
        canvasRef={canvasRef}
      />
    </div>
  );
};

export default DrawingCanvas;
