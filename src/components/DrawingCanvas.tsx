import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Eraser, 
  Play, 
  Circle, 
  Square, 
  Triangle, 
  RotateCcw, 
  Move, 
  Shapes,
  ArrowRight,
  LineHorizontal,
  Palette
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

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

// Gradient colors
const GRADIENT_COLORS = [
  "linear-gradient(to right, #ee9ca7, #ffdde1)",
  "linear-gradient(to right, #c1c161, #d4d4b1)",
  "linear-gradient(to right, #243949, #517fa4)",
  "linear-gradient(to top, #e6b980, #eacda3)",
  "linear-gradient(to top, #d299c2, #fef9d7)",
  "linear-gradient(to top, #accbee, #e7f0fd)",
];

// Available shape tools
type ShapeTool = "rectangle" | "circle" | "triangle" | "line" | "arrow" | "none";

// Available drawing modes
type DrawingMode = "draw" | "erase" | "shape" | "move";

interface DrawingCanvasProps {
  className?: string;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingLayerRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [drawingCtx, setDrawingCtx] = useState<CanvasRenderingContext2D | null>(null);
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
  const [isShapesOpen, setIsShapesOpen] = useState(false);
  
  // For shape drawing preview
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const canvasStateRef = useRef<ImageData | null>(null);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  
  // Background pattern image
  const [bgPattern, setBgPattern] = useState<HTMLImageElement | null>(null);
  
  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const drawingLayer = drawingLayerRef.current;
    if (!canvas || !drawingLayer) return;
    
    const context = canvas.getContext("2d");
    const drawingContext = drawingLayer.getContext("2d");
    if (!context || !drawingContext) return;
    
    // Set canvas size to match its display size
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      const { width, height } = parent.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      drawingLayer.width = width;
      drawingLayer.height = height;
      
      // Restore context settings after resize
      if (context && drawingContext) {
        context.lineCap = "round";
        context.lineJoin = "round";
        drawingContext.lineCap = "round";
        drawingContext.lineJoin = "round";
        drawingContext.strokeStyle = color;
        drawingContext.lineWidth = brushSize;
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
    setDrawingCtx(drawingContext);
    
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
    if (!drawingCtx || !drawingLayerRef.current) return;
    
    // Clear drawing layer
    drawingCtx.clearRect(0, 0, drawingLayerRef.current.width, drawingLayerRef.current.height);
    
    objects.forEach(obj => {
      drawingCtx.save();
      drawingCtx.strokeStyle = obj.color;
      drawingCtx.lineWidth = obj.lineWidth;
      
      switch (obj.type) {
        case 'rectangle':
          drawingCtx.beginPath();
          drawingCtx.rect(obj.x, obj.y, obj.width, obj.height);
          drawingCtx.stroke();
          break;
        case 'circle':
          drawingCtx.beginPath();
          drawingCtx.arc(obj.x, obj.y, obj.radius, 0, 2 * Math.PI);
          drawingCtx.stroke();
          break;
        case 'triangle':
          drawingCtx.beginPath();
          drawingCtx.moveTo(obj.x1, obj.y1);
          drawingCtx.lineTo(obj.x2, obj.y2);
          drawingCtx.lineTo(obj.x3, obj.y3);
          drawingCtx.closePath();
          drawingCtx.stroke();
          break;
        case 'line':
          drawingCtx.beginPath();
          drawingCtx.moveTo(obj.x1, obj.y1);
          drawingCtx.lineTo(obj.x2, obj.y2);
          drawingCtx.stroke();
          break;
        case 'arrow':
          // Draw the line
          drawingCtx.beginPath();
          drawingCtx.moveTo(obj.x1, obj.y1);
          drawingCtx.lineTo(obj.x2, obj.y2);
          drawingCtx.stroke();
          
          // Calculate the arrow head
          const angle = Math.atan2(obj.y2 - obj.y1, obj.x2 - obj.x1);
          const headLength = 15; // Length of arrow head
          
          // Draw the arrow head
          drawingCtx.beginPath();
          drawingCtx.moveTo(obj.x2, obj.y2);
          drawingCtx.lineTo(
            obj.x2 - headLength * Math.cos(angle - Math.PI / 6),
            obj.y2 - headLength * Math.sin(angle - Math.PI / 6)
          );
          drawingCtx.moveTo(obj.x2, obj.y2);
          drawingCtx.lineTo(
            obj.x2 - headLength * Math.cos(angle + Math.PI / 6),
            obj.y2 - headLength * Math.sin(angle + Math.PI / 6)
          );
          drawingCtx.stroke();
          break;
        case 'text':
          drawingCtx.font = '24px Arial';
          drawingCtx.fillStyle = obj.color;
          drawingCtx.fillText(obj.text, obj.x, obj.y);
          break;
      }
      
      drawingCtx.restore();
    });
  };
  
  // Update context when color or brush size changes
  useEffect(() => {
    if (!drawingCtx) return;
    drawingCtx.strokeStyle = color;
    drawingCtx.lineWidth = brushSize;
  }, [drawingCtx, color, brushSize]);

  // Drawing functions
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawingCtx || !drawingLayerRef.current) return;
    
    setIsDrawing(true);
    
    const { x, y } = getPointerPosition(e);
    lastMousePosRef.current = { x, y };
    
    if (mode === "shape") {
      // Save the current state of the canvas for shape preview
      canvasStateRef.current = drawingCtx.getImageData(
        0, 0, drawingLayerRef.current.width, drawingLayerRef.current.height
      );
      startPointRef.current = { x, y };
    } else if (mode === "draw") {
      drawingCtx.beginPath();
      drawingCtx.moveTo(x, y);
    } else if (mode === "erase") {
      drawingCtx.globalCompositeOperation = "destination-out";
      drawingCtx.beginPath();
      drawingCtx.moveTo(x, y);
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
    if (!isDrawing || !drawingCtx || !drawingLayerRef.current) return;
    
    const { x, y } = getPointerPosition(e);
    
    if (mode === "shape" && startPointRef.current && canvasStateRef.current) {
      // Restore canvas state before drawing preview
      drawingCtx.putImageData(canvasStateRef.current, 0, 0);
      
      const { x: startX, y: startY } = startPointRef.current;
      
      // Set correct drawing style for preview
      drawingCtx.strokeStyle = color;
      drawingCtx.globalCompositeOperation = "source-over";
      
      // Draw shape preview
      switch (shapeTool) {
        case "rectangle":
          drawingCtx.beginPath();
          drawingCtx.rect(startX, startY, x - startX, y - startY);
          drawingCtx.stroke();
          break;
        case "circle":
          drawingCtx.beginPath();
          const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
          drawingCtx.arc(startX, startY, radius, 0, 2 * Math.PI);
          drawingCtx.stroke();
          break;
        case "triangle":
          drawingCtx.beginPath();
          drawingCtx.moveTo(startX, startY);
          drawingCtx.lineTo(x, y);
          drawingCtx.lineTo(startX - (x - startX), y);
          drawingCtx.closePath();
          drawingCtx.stroke();
          break;
        case "line":
          drawingCtx.beginPath();
          drawingCtx.moveTo(startX, startY);
          drawingCtx.lineTo(x, y);
          drawingCtx.stroke();
          break;
        case "arrow":
          // Draw the line part
          drawingCtx.beginPath();
          drawingCtx.moveTo(startX, startY);
          drawingCtx.lineTo(x, y);
          drawingCtx.stroke();
          
          // Calculate the arrow head
          const angle = Math.atan2(y - startY, x - startX);
          const headLength = 15; // Length of arrow head
          
          // Draw the arrow head
          drawingCtx.beginPath();
          drawingCtx.moveTo(x, y);
          drawingCtx.lineTo(
            x - headLength * Math.cos(angle - Math.PI / 6),
            y - headLength * Math.sin(angle - Math.PI / 6)
          );
          drawingCtx.moveTo(x, y);
          drawingCtx.lineTo(
            x - headLength * Math.cos(angle + Math.PI / 6),
            y - headLength * Math.sin(angle + Math.PI / 6)
          );
          drawingCtx.stroke();
          break;
      }
    } else if (mode === "draw") {
      drawingCtx.lineTo(x, y);
      drawingCtx.stroke();
    } else if (mode === "erase") {
      // Draw eraser preview (semi-transparent circle)
      if (lastMousePosRef.current) {
        // First erase the line being drawn
        drawingCtx.globalCompositeOperation = "destination-out";
        drawingCtx.lineTo(x, y);
        drawingCtx.stroke();
        
        // Draw the eraser preview circle
        drawingCtx.save();
        drawingCtx.globalCompositeOperation = "source-over";
        drawingCtx.strokeStyle = "rgba(0, 0, 0, 0.3)";
        drawingCtx.beginPath();
        drawingCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        drawingCtx.stroke();
        drawingCtx.restore();
        
        // Reset to erase mode
        drawingCtx.globalCompositeOperation = "destination-out";
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
      } else if (obj.type === 'line' || obj.type === 'arrow') {
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
      redrawObjects();
    }
    
    lastMousePosRef.current = { x, y };
  };

  const stopDrawing = () => {
    if (!isDrawing || !drawingCtx || !drawingLayerRef.current) return;
    
    // Reset composite operation after erasing
    if (mode === "erase") {
      drawingCtx.globalCompositeOperation = "source-over";
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
        case "arrow":
          newObject = {
            type: 'arrow',
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
    drawingCtx.beginPath(); // Reset path
  };

  // Helper to get pointer position for both mouse and touch events
  const getPointerPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = drawingLayerRef.current;
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
    if (!drawingCtx || !drawingLayerRef.current) return;
    setObjects([]);
    // Only clear the drawing layer, not the background
    drawingCtx.clearRect(0, 0, drawingLayerRef.current.width, drawingLayerRef.current.height);
  };

  // Function to handle solve button click
  const handleSolve = async () => {
    if (!drawingLayerRef.current) return;
    
    setIsLoading(true);
    
    try {
      // Convert canvas to image data
      const imageData = drawingLayerRef.current.toDataURL("image/png");
      
      // In a real implementation, you would send this to your server
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // For demo purposes, generate a result
      const result = "42";
      setLastResult(result);
      
      // Add the result as text object to the canvas
      const newTextObject = {
        type: 'text',
        text: `= ${result}`,
        x: drawingLayerRef.current.width / 2,
        y: drawingLayerRef.current.height / 2,
        color: '#FF0000',
        lineWidth: 2
      };
      
      setObjects([...objects, newTextObject]);
      redrawObjects(); // Make sure to redraw to show the result
      
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
    setIsShapesOpen(false); // Close the shapes menu after selection
  };

  const toggleMoveMode = () => {
    setMode(mode === "move" ? "draw" : "move");
    setShapeTool("none");
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className={`flex flex-wrap gap-2 p-4 border-b ${isMobile ? 'overflow-x-auto pb-6' : ''}`}>
        {/* Color selector with popover for gradient colors */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "icon"}
              className="relative"
            >
              <Palette className="h-5 w-5" />
              <div 
                className="absolute bottom-0 right-0 w-3 h-3 rounded-full" 
                style={{ backgroundColor: color }}
              />
              {isMobile && <span className="ml-1">Colors</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Basic Colors</h4>
                <div className="flex flex-wrap gap-2">
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
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Gradient Palettes</h4>
                <div className="flex flex-wrap gap-2">
                  {/* We can't actually use gradients as stroke styles, but showing as options */}
                  {GRADIENT_COLORS.map((gradientColor, index) => (
                    <button
                      key={index}
                      className="w-full h-8 rounded cursor-pointer transition-transform hover:scale-105"
                      style={{ background: gradientColor }}
                      onClick={() => {
                        // Just use a fixed color for each gradient
                        const gradientBaseColors = ["#ee9ca7", "#c1c161", "#243949", "#e6b980", "#d299c2", "#accbee"];
                        setColor(gradientBaseColors[index % gradientBaseColors.length]);
                        setMode("draw");
                      }}
                      aria-label={`Select gradient color ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
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
          
          {/* Shape toggle button that opens the shape menu */}
          <Popover open={isShapesOpen} onOpenChange={setIsShapesOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={mode === "shape" ? "default" : "outline"}
                size={isMobile ? "sm" : "icon"}
                className={mode === "shape" ? "tool-active" : ""}
              >
                <Shapes className="h-5 w-5" />
                {isMobile && <span className="ml-1">Shapes</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <ToggleGroup type="single" variant="outline">
                <ToggleGroupItem 
                  value="rectangle" 
                  onClick={() => selectShapeTool("rectangle")}
                  aria-label="Rectangle shape"
                >
                  <Square className="h-5 w-5" />
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="circle" 
                  onClick={() => selectShapeTool("circle")}
                  aria-label="Circle shape"
                >
                  <Circle className="h-5 w-5" />
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="triangle" 
                  onClick={() => selectShapeTool("triangle")}
                  aria-label="Triangle shape"
                >
                  <Triangle className="h-5 w-5" />
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="line" 
                  onClick={() => selectShapeTool("line")}
                  aria-label="Line shape"
                >
                  <LineHorizontal className="h-5 w-5" />
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="arrow" 
                  onClick={() => selectShapeTool("arrow")}
                  aria-label="Arrow shape"
                >
                  <ArrowRight className="h-5 w-5" />
                </ToggleGroupItem>
              </ToggleGroup>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="flex-grow relative">
        {/* Background canvas (fixed pattern) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 bg-white dark:bg-gray-800 canvas-container"
        />
        {/* Drawing layer (for actual drawing) */}
        <canvas
          ref={drawingLayerRef}
          className="absolute inset-0 z-10 canvas-container"
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
