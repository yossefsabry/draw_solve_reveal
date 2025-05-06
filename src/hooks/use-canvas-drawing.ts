
import { useState, useRef, useEffect } from "react";
import { AnyDrawingObject, DrawingMode, ShapeTool } from "@/components/drawing/types";
import { findObjectAtPosition, createShapeObject } from "@/components/drawing/ShapeDrawingUtils";

interface UseCanvasDrawingProps {
  mode: DrawingMode;
  color: string;
  brushSize: number;
  shapeTool: ShapeTool;
  objects: AnyDrawingObject[];
  setObjects: (objects: AnyDrawingObject[]) => void;
}

export const useCanvasDrawing = ({ 
  mode, 
  color, 
  brushSize, 
  shapeTool,
  objects,
  setObjects
}: UseCanvasDrawingProps) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedShape, setSelectedShape] = useState<any>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [keyPressed, setKeyPressed] = useState<{ [key: string]: boolean }>({});
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingLayerRef = useRef<HTMLCanvasElement | null>(null);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const canvasStateRef = useRef<ImageData | null>(null);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);

  // Set up key listeners for handling space+mouse panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setKeyPressed(prev => ({ ...prev, space: true }));
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setKeyPressed(prev => ({ ...prev, space: false }));
        setIsPanning(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  // Handle wheel for zooming - now without requiring the Ctrl key
  const handleWheel = (e: React.WheelEvent) => {
    // Only prevent default if we're zooming
    e.preventDefault();
    
    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(scale + delta, 0.1), 10);
    
    // Get the mouse position relative to the canvas
    const rect = drawingLayerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Adjust offset to zoom toward mouse position
    const newOffset = {
      x: offset.x - (mouseX / scale - mouseX / newScale) * newScale,
      y: offset.y - (mouseY / scale - mouseY / newScale) * newScale
    };
    
    setScale(newScale);
    setOffset(newOffset);
  };

  // Helper to get pointer position for both mouse and touch events with zoom/pan adjustments
  const getPointerPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = e.currentTarget as HTMLCanvasElement;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      const touch = e.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Adjust for zoom and pan
    const x = (clientX - rect.left - offset.x) / scale;
    const y = (clientY - rect.top - offset.y) / scale;
    
    return { x, y };
  };

  // Drawing functions
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    // If space key is pressed, start panning instead of drawing
    if (keyPressed.space) {
      setIsPanning(true);
      lastMousePosRef.current = {
        x: 'touches' in e ? e.touches[0].clientX : e.clientX,
        y: 'touches' in e ? e.touches[0].clientY : e.clientY
      };
      return;
    }
    
    setIsDrawing(true);
    
    const { x, y } = getPointerPosition(e);
    lastMousePosRef.current = { x, y };
    
    if (mode === "shape") {
      // Save the start point for shape drawing
      startPointRef.current = { x, y };
      
      // Save canvas state for preview
      if (drawingLayerRef.current) {
        const ctx = drawingLayerRef.current.getContext('2d');
        if (ctx) {
          canvasStateRef.current = ctx.getImageData(
            0, 0, drawingLayerRef.current.width, drawingLayerRef.current.height
          );
        }
      }
    } else if (mode === "move") {
      // Check if we're clicking on a shape
      const clickedObjectIndex = findObjectAtPosition(objects, x, y);
      if (clickedObjectIndex !== -1) {
        const obj = objects[clickedObjectIndex];
        
        // Handle different object types
        if (obj.type === 'triangle' || obj.type === 'line' || obj.type === 'arrow') {
          setSelectedShape({
            index: clickedObjectIndex,
            offsetX: x - obj.x1,
            offsetY: y - obj.y1,
          });
        } else if (obj.type === 'draw') {
          setSelectedShape({
            index: clickedObjectIndex,
            offsetX: x - obj.points[0].x,
            offsetY: y - obj.points[0].y,
          });
        } else {
          setSelectedShape({
            index: clickedObjectIndex,
            offsetX: x - obj.x,
            offsetY: y - obj.y,
          });
        }
      }
    }
  };
  
  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    // Handle panning when space is pressed and mouse is moving
    if (isPanning && lastMousePosRef.current) {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      const deltaX = clientX - lastMousePosRef.current.x;
      const deltaY = clientY - lastMousePosRef.current.y;
      
      setOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      lastMousePosRef.current = { x: clientX, y: clientY };
      return;
    }
    
    // Regular drawing handling continues...
  };

  const stopDrawing = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    
    if (!isDrawing) return;
    
    if (mode === "shape" && startPointRef.current && lastMousePosRef.current) {
      // Add the shape to objects array
      const { x: startX, y: startY } = startPointRef.current;
      const { x: endX, y: endY } = lastMousePosRef.current;
      
      const newObject = createShapeObject(shapeTool, startX, startY, endX, endY, color, brushSize);
      
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

  return {
    isDrawing,
    selectedShape,
    canvasRef,
    drawingLayerRef,
    startPointRef,
    canvasStateRef,
    lastMousePosRef,
    getPointerPosition,
    startDrawing,
    stopDrawing,
    handleMove,
    handleWheel,
    setSelectedShape,
    setIsDrawing,
    scale,
    offset,
    isPanning,
    keyPressed
  };
};
