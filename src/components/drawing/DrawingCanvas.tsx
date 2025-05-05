
import React, { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ShapeTool, DrawingMode } from "./types";
import ToolBar from "./ToolBar";
import DrawingArea from "./DrawingArea";
import CanvasFooter from "./CanvasFooter";
import MathResults from "./MathResults";
import { useCanvasDrawing } from "@/hooks/use-canvas-drawing";
import { useMathSolver } from "@/hooks/use-math-solver";
import { SWATCHES } from "@/constants";

interface DrawingCanvasProps {
  className?: string;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ className }) => {
  const [color, setColor] = useState(SWATCHES[0]);
  const [brushSize, setBrushSize] = useState(5);
  const [mode, setMode] = useState<DrawingMode>("draw");
  const [shapeTool, setShapeTool] = useState<ShapeTool>("none");
  const [isShapesOpen, setIsShapesOpen] = useState(false);
  
  const isMobile = useIsMobile();

  // Use our custom hooks
  const {
    isDrawing,
    objects,
    selectedShape,
    drawingLayerRef,
    startDrawing,
    stopDrawing,
    setObjects,
    setSelectedShape,
  } = useCanvasDrawing({
    mode,
    color,
    brushSize,
    shapeTool
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

  // Function to clear the canvas
  const clearCanvas = () => {
    setObjects([]);
    clearMathResults();
  };

  // Shape tool selection handler
  const selectShapeTool = (shape: ShapeTool) => {
    setShapeTool(shape);
    setMode("shape");
    setIsShapesOpen(false); // Close the shapes menu after selection
  };

  // Set canvas reference for the DrawingArea component
  const setCanvasRef = (ref: HTMLCanvasElement | null) => {
    drawingLayerRef.current = ref;
  };

  // Handle solve button click
  const onSolve = () => {
    if (drawingLayerRef.current) {
      handleSolve(drawingLayerRef.current, setObjects);
    }
  };

  // Handle drawing move
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    // We pass this directly to DrawingArea now
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <ToolBar
        color={color}
        brushSize={brushSize}
        mode={mode}
        isMobile={isMobile}
        isShapesOpen={isShapesOpen}
        onColorChange={setColor}
        onBrushSizeChange={setBrushSize}
        onModeChange={setMode}
        onShapesOpenChange={setIsShapesOpen}
        onShapeSelect={selectShapeTool}
      />
      
      <DrawingArea
        isDrawing={isDrawing}
        mode={mode}
        color={color}
        brushSize={brushSize}
        objects={objects}
        selectedShape={selectedShape}
        shapeTool={shapeTool}
        onObjectsChange={setObjects}
        onSelectedShapeChange={setSelectedShape}
        onDrawingStart={startDrawing}
        onDrawingMove={draw}
        onDrawingEnd={stopDrawing}
        onCanvasRef={setCanvasRef}
      />
      
      <MathResults mathEquations={mathEquations} />
      
      <CanvasFooter
        isLoading={isLoading}
        onClear={clearCanvas}
        onSolve={onSolve}
      />
    </div>
  );
};

export default DrawingCanvas;
