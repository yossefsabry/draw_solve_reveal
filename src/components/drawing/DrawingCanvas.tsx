
import React, { useState, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";
import { ShapeTool, DrawingMode, AnyDrawingObject } from "./types";
import ToolBar from "./ToolBar";
import DrawingArea from "./DrawingArea";
import CanvasFooter from "./CanvasFooter";

interface DrawingCanvasProps {
  className?: string;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ className }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [mode, setMode] = useState<DrawingMode>("draw");
  const [shapeTool, setShapeTool] = useState<ShapeTool>("none");
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [selectedShape, setSelectedShape] = useState<any>(null);
  const [objects, setObjects] = useState<AnyDrawingObject[]>([]);
  const [isShapesOpen, setIsShapesOpen] = useState(false);
  
  // For shape drawing preview
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const canvasStateRef = useRef<ImageData | null>(null);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  
  const isMobile = useIsMobile();

  // Find object at position
  const findObjectAtPosition = (x: number, y: number): number => {
    // Simple implementation - can be improved with proper hit detection
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      
      // Basic hit detection
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

  // Helper to get pointer position for both mouse and touch events
  const getPointerPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = e.currentTarget as HTMLCanvasElement;
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

  // Drawing functions
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    
    const { x, y } = getPointerPosition(e);
    lastMousePosRef.current = { x, y };
    
    if (mode === "shape") {
      // Save the start point for shape drawing
      startPointRef.current = { x, y };
      
      // Save canvas state for preview - we'll let the DrawingArea component handle this
      if (e.currentTarget instanceof HTMLCanvasElement) {
        const ctx = e.currentTarget.getContext('2d');
        if (ctx) {
          canvasStateRef.current = ctx.getImageData(
            0, 0, e.currentTarget.width, e.currentTarget.height
          );
        }
      }
    } else if (mode === "move") {
      // Check if we're clicking on a shape
      const clickedObjectIndex = findObjectAtPosition(x, y);
      if (clickedObjectIndex !== -1) {
        setSelectedShape({
          index: clickedObjectIndex,
          offsetX: x - (objects[clickedObjectIndex].type === 'rectangle' || 
                        objects[clickedObjectIndex].type === 'circle' || 
                        objects[clickedObjectIndex].type === 'text' 
                        ? objects[clickedObjectIndex].x 
                        : objects[clickedObjectIndex].x1),
          offsetY: y - (objects[clickedObjectIndex].type === 'rectangle' || 
                        objects[clickedObjectIndex].type === 'circle' || 
                        objects[clickedObjectIndex].type === 'text' 
                        ? objects[clickedObjectIndex].y 
                        : objects[clickedObjectIndex].y1),
        });
      }
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const { x, y } = getPointerPosition(e);
    
    if (mode === "shape" && startPointRef.current) {
      // Shape preview handled by the canvas component
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
    }
    
    lastMousePosRef.current = { x, y };
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    
    if (mode === "shape" && startPointRef.current && lastMousePosRef.current) {
      // Add the shape to objects array
      const { x: startX, y: startY } = startPointRef.current;
      const { x: endX, y: endY } = lastMousePosRef.current;
      
      let newObject: AnyDrawingObject | null = null;
      
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
  };

  // Function to clear the canvas
  const clearCanvas = () => {
    setObjects([]);
  };

  // Function to handle solve button click
  const handleSolve = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, generate a result
      const result = "42";
      setLastResult(result);
      
      // Add the result as text object to the canvas
      const newTextObject = {
        type: 'text',
        text: `= ${result}`,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
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

  // Shape tool selection handler
  const selectShapeTool = (shape: ShapeTool) => {
    setShapeTool(shape);
    setMode("shape");
    setIsShapesOpen(false); // Close the shapes menu after selection
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
      />
      
      <CanvasFooter
        isLoading={isLoading}
        onClear={clearCanvas}
        onSolve={handleSolve}
      />
    </div>
  );
};

export default DrawingCanvas;
