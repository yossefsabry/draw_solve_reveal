import { useState, useRef, useEffect } from "react";
import { AnyDrawingObject, DrawingMode, ShapeTool } from "@/components/drawing/types";
import { findObjectAtPosition, createShapeObject, drawShapePreview } from "@/components/drawing/ShapeDrawingUtils";

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
  const [drawingPath, setDrawingPath] = useState<{ x: number; y: number }[]>([]);
  
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
  
  // Handle wheel for zooming - no Ctrl key required
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(scale + delta, 0.1), 10);
    
    // Get the mouse position relative to the canvas
    const rect = e.currentTarget.getBoundingClientRect();
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
      if (e.touches.length === 0) return lastMousePosRef.current || { x: 0, y: 0 };
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
    
    const pos = getPointerPosition(e);
    lastMousePosRef.current = pos;
    
    if (mode === "draw") {
      setDrawingPath([pos]);
    } else if (mode === "shape") {
      // Save the start point for shape drawing
      startPointRef.current = pos;
      
      // Save canvas state for preview
      if (drawingLayerRef.current) {
        const ctx = drawingLayerRef.current.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvasStateRef.current = ctx.getImageData(
            0, 0, drawingLayerRef.current.width, drawingLayerRef.current.height
          );
        }
      }
    } else if (mode === "move") {
      // Check if we're clicking on a shape
      const clickedObjectIndex = findObjectAtPosition(objects, pos.x, pos.y);
      if (clickedObjectIndex !== -1) {
        const obj = objects[clickedObjectIndex];
        
        // Handle different object types
        if (obj.type === 'triangle' || obj.type === 'line' || obj.type === 'arrow') {
          setSelectedShape({
            index: clickedObjectIndex,
            offsetX: pos.x - obj.x1,
            offsetY: pos.y - obj.y1,
          });
        } else if (obj.type === 'draw') {
          setSelectedShape({
            index: clickedObjectIndex,
            offsetX: pos.x - obj.points[0].x,
            offsetY: pos.y - obj.points[0].y,
          });
        } else {
          setSelectedShape({
            index: clickedObjectIndex,
            offsetX: pos.x - obj.x,
            offsetY: pos.y - obj.y,
          });
        }
      }
    }
  };
  
  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    // Handle panning when space is pressed and mouse is moving
    if (isPanning && lastMousePosRef.current) {
      const clientX = 'touches' in e ? 
        (e.touches.length > 0 ? e.touches[0].clientX : lastMousePosRef.current.x) : 
        e.clientX;
      const clientY = 'touches' in e ? 
        (e.touches.length > 0 ? e.touches[0].clientY : lastMousePosRef.current.y) : 
        e.clientY;
      
      const deltaX = clientX - lastMousePosRef.current.x;
      const deltaY = clientY - lastMousePosRef.current.y;
      
      setOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      lastMousePosRef.current = { x: clientX, y: clientY };
      return;
    }
    
    if (!isDrawing) return;
    
    const pos = getPointerPosition(e);
    
    if (mode === "draw") {
      // Add to drawing path
      setDrawingPath(prev => [...prev, pos]);
      
      // Draw directly to canvas
      if (drawingLayerRef.current && lastMousePosRef.current) {
        const ctx = drawingLayerRef.current.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.translate(offset.x, offset.y);
          ctx.scale(scale, scale);
          ctx.strokeStyle = color;
          ctx.lineWidth = brushSize;
          ctx.beginPath();
          ctx.moveTo(lastMousePosRef.current.x, lastMousePosRef.current.y);
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
          ctx.restore();
        }
      }
    } else if (mode === "shape" && startPointRef.current) {
      // Preview shape drawing
      const ctx = drawingLayerRef.current?.getContext('2d');
      if (ctx && canvasStateRef.current) {
        // Restore the original canvas state
        ctx.putImageData(canvasStateRef.current, 0, 0);
        
        // Draw the shape preview
        ctx.save();
        ctx.translate(offset.x, offset.y);
        ctx.scale(scale, scale);
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        
        drawShapePreview(ctx, shapeTool, startPointRef.current.x, startPointRef.current.y, pos.x, pos.y);
        
        ctx.restore();
      }
    } else if (mode === "move" && selectedShape) {
      // Handle moving objects
      const obj = {...objects[selectedShape.index]};
      const deltaX = pos.x - selectedShape.offsetX;
      const deltaY = pos.y - selectedShape.offsetY;
      
      const updatedObjects = [...objects];
      
      if (obj.type === 'rectangle' || obj.type === 'circle') {
        updatedObjects[selectedShape.index] = {
          ...obj,
          x: deltaX,
          y: deltaY
        };
      } else if (obj.type === 'triangle') {
        const width = obj.x2 - obj.x1;
        const height = obj.y2 - obj.y1;
        
        updatedObjects[selectedShape.index] = {
          ...obj,
          x1: deltaX,
          y1: deltaY,
          x2: deltaX + width,
          y2: deltaY + height,
          x3: deltaX - width,
          y3: deltaY + height
        };
      } else if (obj.type === 'line' || obj.type === 'arrow') {
        const width = obj.x2 - obj.x1;
        const height = obj.y2 - obj.y1;
        
        updatedObjects[selectedShape.index] = {
          ...obj,
          x1: deltaX,
          y1: deltaY,
          x2: deltaX + width,
          y2: deltaY + height
        };
      } else if (obj.type === 'draw' && obj.points && obj.points.length > 0) {
        const offsetX = deltaX - obj.points[0].x;
        const offsetY = deltaY - obj.points[0].y;
        
        updatedObjects[selectedShape.index] = {
          ...obj,
          points: obj.points.map(p => ({
            x: p.x + offsetX,
            y: p.y + offsetY
          }))
        };
      }
      
      setObjects(updatedObjects);
    }
    
    lastMousePosRef.current = pos;
  };

  const stopDrawing = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    
    if (!isDrawing) return;
    
    if (mode === "draw" && drawingPath.length > 1) {
      // Add free-hand drawing to objects
      const newObject = {
        type: 'draw' as const,
        points: drawingPath,
        color,
        lineWidth: brushSize
      };
      
      setObjects([...objects, newObject]);
      setDrawingPath([]);
    } else if (mode === "shape" && startPointRef.current && lastMousePosRef.current) {
      // Add the shape to objects array
      const { x: startX, y: startY } = startPointRef.current;
      const { x: endX, y: endY } = lastMousePosRef.current;
      
      const newObject = createShapeObject(shapeTool, startX, startY, endX, endY, color, brushSize);
      
      if (newObject) {
        setObjects([...objects, newObject]);
      }
    }
    
    // Clear saved canvas state and start point
    canvasStateRef.current = null;
    startPointRef.current = null;
    lastMousePosRef.current = null;
    
    setIsDrawing(false);
    setSelectedShape(null);
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
    keyPressed,
    drawingPath
  };
};
