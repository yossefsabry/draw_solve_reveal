import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Eraser, Play, Circle, Square, Triangle, RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Available colors for the color picker
const COLORS = [
  "#000000", // Black
  "#FF0000", // Red
  "#00FF00", // Green
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#FF8000", // Orange
  "#8000FF", // Purple
  "#0080FF", // Light Blue
];

// Available shape tools
type ShapeTool = "rectangle" | "circle" | "triangle" | "line" | "none";

// Available drawing modes
type DrawingMode = "draw" | "erase" | "shape";

interface DrawingCanvasProps {
  className?: string;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(5);
  const [mode, setMode] = useState<DrawingMode>("draw");
  const [shapeTool, setShapeTool] = useState<ShapeTool>("none");
  const [isLoading, setIsLoading] = useState(false);
  
  // For shape drawing
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  
  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext("2d");
    if (!context) return;
    
    // Set canvas size to match its display size
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      const { width, height } = parent.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      
      // Restore context settings after resize
      if (context) {
        context.lineCap = "round";
        context.lineJoin = "round";
        context.strokeStyle = color;
        context.lineWidth = brushSize;
      }
    };
    
    resizeCanvas();
    setCtx(context);
    
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);
  
  // Update context when color or brush size changes
  useEffect(() => {
    if (!ctx) return;
    ctx.strokeStyle = mode === "erase" ? "#FFFFFF" : color;
    ctx.lineWidth = brushSize;
  }, [ctx, color, brushSize, mode]);

  // Drawing functions
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!ctx) return;
    
    setIsDrawing(true);
    
    const { x, y } = getPointerPosition(e);
    
    if (mode === "shape") {
      startPointRef.current = { x, y };
    } else {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !ctx) return;
    
    const { x, y } = getPointerPosition(e);
    
    if (mode === "shape") {
      // For shape preview, we'll need to clear and redraw
      if (!startPointRef.current) return;
      
      // In a real implementation, you'd draw a preview here
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !ctx) return;
    
    if (mode === "shape" && startPointRef.current) {
      const { x: startX, y: startY } = startPointRef.current;
      const { x: endX, y: endY } = getPointerPosition(e);
      
      // Draw the shape based on start and end points
      switch (shapeTool) {
        case "rectangle":
          ctx.beginPath();
          ctx.rect(startX, startY, endX - startX, endY - startY);
          ctx.stroke();
          break;
        case "circle":
          ctx.beginPath();
          const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
          ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
          ctx.stroke();
          break;
        case "triangle":
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.lineTo(startX - (endX - startX), endY);
          ctx.closePath();
          ctx.stroke();
          break;
        case "line":
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
          break;
      }
      
      startPointRef.current = null;
    }
    
    setIsDrawing(false);
    ctx.beginPath(); // Reset path
  };

  // Helper to get pointer position for both mouse and touch events
  const getPointerPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  // Function to clear the canvas
  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  // Function to handle solve button click
  const handleSolve = async () => {
    if (!canvasRef.current) return;
    
    setIsLoading(true);
    
    try {
      // Convert canvas to image data
      const imageData = canvasRef.current.toDataURL("image/png");
      
      // In a real implementation, you would send this to your server
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // For demo purposes, just show a success message
      toast({
        title: "Calculation Result",
        description: "The drawn equation evaluates to 42",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process the drawn content",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Tool selection handlers
  const toggleEraserMode = () => {
    setMode(mode === "erase" ? "draw" : "erase");
    setShapeTool("none");
  };

  const selectShapeTool = (shape: ShapeTool) => {
    setShapeTool(shape);
    setMode("shape");
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex flex-wrap gap-2 p-4 border-b">
        <div className="flex gap-2 mr-4">
          {COLORS.map((colorOption) => (
            <button
              key={colorOption}
              className={`color-swatch ${color === colorOption && mode !== "erase" ? "selected" : ""}`}
              style={{ backgroundColor: colorOption }}
              onClick={() => {
                setColor(colorOption);
                setMode("draw");
              }}
              aria-label={`Select ${colorOption} color`}
            />
          ))}
        </div>
        
        <div className="flex items-center gap-2 mr-4">
          <span className="text-sm">Size:</span>
          <Slider
            value={[brushSize]}
            min={1}
            max={20}
            step={1}
            onValueChange={(value) => setBrushSize(value[0])}
            className="w-32"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={mode === "erase" ? "default" : "outline"}
            size="icon"
            onClick={toggleEraserMode}
            className={mode === "erase" ? "tool-active" : ""}
          >
            <Eraser className="h-5 w-5" />
          </Button>
          
          <Button
            variant={shapeTool === "rectangle" ? "default" : "outline"}
            size="icon"
            onClick={() => selectShapeTool("rectangle")}
            className={shapeTool === "rectangle" ? "tool-active" : ""}
          >
            <Square className="h-5 w-5" />
          </Button>
          
          <Button
            variant={shapeTool === "circle" ? "default" : "outline"}
            size="icon"
            onClick={() => selectShapeTool("circle")}
            className={shapeTool === "circle" ? "tool-active" : ""}
          >
            <Circle className="h-5 w-5" />
          </Button>
          
          <Button
            variant={shapeTool === "triangle" ? "default" : "outline"}
            size="icon"
            onClick={() => selectShapeTool("triangle")}
            className={shapeTool === "triangle" ? "tool-active" : ""}
          >
            <Triangle className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className="flex-grow relative">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 bg-white dark:bg-gray-800 canvas-container"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      
      <div className="flex justify-between p-4 border-t">
        <Button 
          variant="outline" 
          onClick={clearCanvas}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Clear
        </Button>
        
        <Button 
          disabled={isLoading} 
          onClick={handleSolve}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="loading-spinner h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              Solving...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Solve
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default DrawingCanvas;
