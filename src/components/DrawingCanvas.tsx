
import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Eraser, Play, Circle, Square, Triangle, RotateCcw, Move } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

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
type DrawingMode = "draw" | "erase" | "shape" | "move";

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
  const isMobile = useIsMobile();
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [selectedShape, setSelectedShape] = useState<any>(null);
  const [objects, setObjects] = useState<any[]>([]);
  
  // For shape drawing preview
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const canvasStateRef = useRef<ImageData | null>(null);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  
  // Background pattern image
  const [bgPattern, setBgPattern] = useState<HTMLImageElement | null>(null);
  
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
        drawBackground();
        redrawObjects();
      }
    };
    
    // Create an enhanced background pattern
    const pattern = new Image();
    pattern.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CiAgPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjhmOGZiIiAvPgogIDxwYXRoIGQ9Ik0gMCAwIEwgNDAgNDAiIHN0cm9rZT0iI2UwZTBlOCIgc3Ryb2tlLXdpZHRoPSIxIiAvPgogIDxwYXRoIGQ9Ik0gNDAgMCBMIDAgNDAiIHN0cm9rZT0iI2UwZTBlOCIgc3Ryb2tlLXdpZHRoPSIxIiAvPgogIDxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9IiNjY2NjZGQiIC8+Cjwvc3ZnPg==";
    
    pattern.onload = () => {
      setBgPattern(pattern);
      drawBackground();
    };
    
    resizeCanvas();
    setCtx(context);
    
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);
  
  // Draw background pattern
  const drawBackground = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !bgPattern) return;
    
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create pattern and fill
    const pattern = context.createPattern(bgPattern, "repeat");
    if (pattern) {
      context.fillStyle = pattern;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Redraw all objects on the canvas
  const redrawObjects = () => {
    if (!ctx) return;
    
    objects.forEach(obj => {
      ctx.save();
      ctx.strokeStyle = obj.color;
      ctx.lineWidth = obj.lineWidth;
      
      switch (obj.type) {
        case 'rectangle':
          ctx.beginPath();
          ctx.rect(obj.x, obj.y, obj.width, obj.height);
          ctx.stroke();
          break;
        case 'circle':
          ctx.beginPath();
          ctx.arc(obj.x, obj.y, obj.radius, 0, 2 * Math.PI);
          ctx.stroke();
          break;
        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(obj.x1, obj.y1);
          ctx.lineTo(obj.x2, obj.y2);
          ctx.lineTo(obj.x3, obj.y3);
          ctx.closePath();
          ctx.stroke();
          break;
        case 'line':
          ctx.beginPath();
          ctx.moveTo(obj.x1, obj.y1);
          ctx.lineTo(obj.x2, obj.y2);
          ctx.stroke();
          break;
        case 'text':
          ctx.font = '24px Arial';
          ctx.fillStyle = obj.color;
          ctx.fillText(obj.text, obj.x, obj.y);
          break;
      }
      
      ctx.restore();
    });
  };
  
  // Update context when color or brush size changes
  useEffect(() => {
    if (!ctx) return;
    ctx.strokeStyle = mode === "erase" ? "#FFFFFF" : color;
    ctx.lineWidth = brushSize;
  }, [ctx, color, brushSize, mode]);

  // Drawing functions
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!ctx || !canvasRef.current) return;
    
    setIsDrawing(true);
    
    const { x, y } = getPointerPosition(e);
    lastMousePosRef.current = { x, y };
    
    if (mode === "shape") {
      // Save the current state of the canvas for shape preview
      canvasStateRef.current = ctx.getImageData(
        0, 0, canvasRef.current.width, canvasRef.current.height
      );
      startPointRef.current = { x, y };
    } else if (mode === "draw") {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (mode === "erase") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (mode === "move") {
      // Check if we're clicking on a shape
      const clickedObjectIndex = findObjectAtPosition(x, y);
      if (clickedObjectIndex !== -1) {
        setSelectedShape({
          index: clickedObjectIndex,
          offsetX: x - objects[clickedObjectIndex].x,
          offsetY: y - objects[clickedObjectIndex].y,
        });
      }
    }
  };

  // Find object at position
  const findObjectAtPosition = (x: number, y: number): number => {
    // Simple implementation - can be improved with proper hit detection
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      
      // Very basic hit detection - can be improved
      if (obj.type === 'rectangle') {
        if (x >= obj.x && x <= obj.x + obj.width && 
            y >= obj.y && y <= obj.y + obj.height) {
          return i;
        }
      } else if (obj.type === 'circle') {
        const distance = Math.sqrt(Math.pow(x - obj.x, 2) + Math.pow(y - obj.y, 2));
        if (distance <= obj.radius) {
          return i;
        }
      } else if (obj.type === 'text') {
        // Simple rectangle hit box for text
        if (x >= obj.x && x <= obj.x + 100 && // Approximate text width
            y >= obj.y - 24 && y <= obj.y) {  // Approximate text height
          return i;
        }
      }
    }
    return -1;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !ctx || !canvasRef.current) return;
    
    const { x, y } = getPointerPosition(e);
    
    if (mode === "shape" && startPointRef.current && canvasStateRef.current) {
      // Restore canvas state before drawing preview
      ctx.putImageData(canvasStateRef.current, 0, 0);
      
      const { x: startX, y: startY } = startPointRef.current;
      
      // Set correct drawing style for preview
      ctx.strokeStyle = color;
      ctx.globalCompositeOperation = "source-over";
      
      // Draw shape preview
      switch (shapeTool) {
        case "rectangle":
          ctx.beginPath();
          ctx.rect(startX, startY, x - startX, y - startY);
          ctx.stroke();
          break;
        case "circle":
          ctx.beginPath();
          const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
          ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
          ctx.stroke();
          break;
        case "triangle":
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(x, y);
          ctx.lineTo(startX - (x - startX), y);
          ctx.closePath();
          ctx.stroke();
          break;
        case "line":
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(x, y);
          ctx.stroke();
          break;
      }
    } else if (mode === "draw") {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (mode === "erase") {
      // Draw eraser preview (semi-transparent circle)
      if (lastMousePosRef.current) {
        // First erase the previous eraser preview by redrawing background and objects
        drawBackground();
        redrawObjects();
        
        // Draw the path being erased
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineTo(x, y);
        ctx.stroke();
        
        // Draw the eraser preview circle
        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
        ctx.beginPath();
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        
        // Reset to erase mode
        ctx.globalCompositeOperation = "destination-out";
      }
    } else if (mode === "move" && selectedShape !== null) {
      // Move the selected shape
      const newX = x - selectedShape.offsetX;
      const newY = y - selectedShape.offsetY;
      
      const updatedObjects = [...objects];
      const obj = updatedObjects[selectedShape.index];
      
      // Update object position based on type
      if (obj.type === 'rectangle' || obj.type === 'circle' || obj.type === 'text') {
        obj.x = newX;
        obj.y = newY;
      } else if (obj.type === 'line') {
        const dx = newX - obj.x1;
        const dy = newY - obj.y1;
        obj.x1 = newX;
        obj.y1 = newY;
        obj.x2 += dx;
        obj.y2 += dy;
      } else if (obj.type === 'triangle') {
        const dx = newX - obj.x1;
        const dy = newY - obj.y1;
        obj.x1 = newX;
        obj.y1 = newY;
        obj.x2 += dx;
        obj.y2 += dy;
        obj.x3 += dx;
        obj.y3 += dy;
      }
      
      setObjects(updatedObjects);
      
      // Redraw everything
      drawBackground();
      redrawObjects();
    }
    
    lastMousePosRef.current = { x, y };
  };

  const stopDrawing = () => {
    if (!isDrawing || !ctx || !canvasRef.current) return;
    
    // Reset composite operation after erasing
    if (mode === "erase") {
      ctx.globalCompositeOperation = "source-over";
    } else if (mode === "shape" && startPointRef.current) {
      // Add the shape to objects array
      const { x: startX, y: startY } = startPointRef.current;
      const { x: endX, y: endY } = lastMousePosRef.current || { x: 0, y: 0 };
      
      let newObject;
      
      switch (shapeTool) {
        case "rectangle":
          newObject = {
            type: 'rectangle',
            x: startX,
            y: startY,
            width: endX - startX,
            height: endY - startY,
            color,
            lineWidth: brushSize
          };
          break;
        case "circle":
          newObject = {
            type: 'circle',
            x: startX,
            y: startY,
            radius: Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)),
            color,
            lineWidth: brushSize
          };
          break;
        case "triangle":
          newObject = {
            type: 'triangle',
            x1: startX,
            y1: startY,
            x2: endX,
            y2: endY,
            x3: startX - (endX - startX),
            y3: endY,
            color,
            lineWidth: brushSize
          };
          break;
        case "line":
          newObject = {
            type: 'line',
            x1: startX,
            y1: startY,
            x2: endX,
            y2: endY,
            color,
            lineWidth: brushSize
          };
          break;
      }
      
      if (newObject) {
        setObjects([...objects, newObject]);
      }
    } else if (mode === "move") {
      setSelectedShape(null);
    }
    
    // Clear saved canvas state and start point
    canvasStateRef.current = null;
    startPointRef.current = null;
    lastMousePosRef.current = null;
    
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

  // Function to clear the canvas - now properly redraws the background
  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return;
    setObjects([]);
    drawBackground();
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
      
      // For demo purposes, generate a result
      const result = "42";
      setLastResult(result);
      
      // Add the result as text object to the canvas
      const newTextObject = {
        type: 'text',
        text: `= ${result}`,
        x: canvasRef.current.width / 2,
        y: canvasRef.current.height / 2,
        color: '#FF0000',
        lineWidth: 2
      };
      
      setObjects([...objects, newTextObject]);
      
      // Show toast with result
      toast({
        title: "Calculation Result",
        description: `The drawn equation evaluates to ${result}`,
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

  const toggleMoveMode = () => {
    setMode(mode === "move" ? "draw" : "move");
    setShapeTool("none");
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className={`flex flex-wrap gap-2 p-4 border-b ${isMobile ? 'overflow-x-auto pb-6' : ''}`}>
        <div className="flex gap-2 mr-4 flex-wrap">
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
          <span className="text-sm whitespace-nowrap">Size:</span>
          <Slider
            value={[brushSize]}
            min={1}
            max={20}
            step={1}
            onValueChange={(value) => setBrushSize(value[0])}
            className="w-28 md:w-32"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={mode === "erase" ? "default" : "outline"}
            size={isMobile ? "sm" : "icon"}
            onClick={toggleEraserMode}
            className={mode === "erase" ? "tool-active" : ""}
          >
            <Eraser className="h-5 w-5" />
            {isMobile && <span className="ml-1">Erase</span>}
          </Button>
          
          <Button
            variant={mode === "move" ? "default" : "outline"}
            size={isMobile ? "sm" : "icon"}
            onClick={toggleMoveMode}
            className={mode === "move" ? "tool-active" : ""}
          >
            <Move className="h-5 w-5" />
            {isMobile && <span className="ml-1">Move</span>}
          </Button>
          
          <Button
            variant={shapeTool === "rectangle" ? "default" : "outline"}
            size={isMobile ? "sm" : "icon"}
            onClick={() => selectShapeTool("rectangle")}
            className={shapeTool === "rectangle" ? "tool-active" : ""}
          >
            <Square className="h-5 w-5" />
            {isMobile && <span className="ml-1">Rect</span>}
          </Button>
          
          <Button
            variant={shapeTool === "circle" ? "default" : "outline"}
            size={isMobile ? "sm" : "icon"}
            onClick={() => selectShapeTool("circle")}
            className={shapeTool === "circle" ? "tool-active" : ""}
          >
            <Circle className="h-5 w-5" />
            {isMobile && <span className="ml-1">Circle</span>}
          </Button>
          
          <Button
            variant={shapeTool === "triangle" ? "default" : "outline"}
            size={isMobile ? "sm" : "icon"}
            onClick={() => selectShapeTool("triangle")}
            className={shapeTool === "triangle" ? "tool-active" : ""}
          >
            <Triangle className="h-5 w-5" />
            {isMobile && <span className="ml-1">Triangle</span>}
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
