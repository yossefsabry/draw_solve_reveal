
import React, { useRef, useEffect, useState } from "react";
import { AnyDrawingObject, DrawingMode, ShapeTool } from "./types";
import { drawShapePreview } from "./ShapeDrawingUtils";
import Rulers from "./Rulers";
import { ZoomIn, ZoomOut, Move } from "lucide-react";

interface DrawingAreaProps {
  isDrawing: boolean;
  mode: DrawingMode;
  color: string;
  brushSize: number;
  objects: AnyDrawingObject[];
  selectedShape: any;
  shapeTool: ShapeTool;
  onObjectsChange: (objects: AnyDrawingObject[]) => void;
  onSelectedShapeChange: (shape: any) => void;
  onDrawingStart: (e: React.MouseEvent | React.TouchEvent) => void;
  onDrawingEnd: () => void;
  onCanvasRef?: (ref: HTMLCanvasElement | null) => void;
  handleWheel?: (e: React.WheelEvent) => void;
  handleMove?: (e: React.MouseEvent | React.TouchEvent) => void;
  scale?: number;
  offset?: { x: number; y: number };
  isPanning?: boolean;
}

const DrawingArea: React.FC<DrawingAreaProps> = ({
  isDrawing,
  mode,
  color,
  brushSize,
  objects,
  selectedShape,
  shapeTool,
  onObjectsChange,
  onSelectedShapeChange,
  onDrawingStart,
  onDrawingEnd,
  onCanvasRef,
  handleWheel,
  handleMove,
  scale = 1,
  offset = { x: 0, y: 0 },
  isPanning = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingLayerRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [drawingCtx, setDrawingCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [bgPattern, setBgPattern] = useState<HTMLImageElement | null>(null);
  const [drawingPath, setDrawingPath] = useState<{ x: number; y: number }[]>([]);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // Store the start point and current mouse position for shape drawing
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const canvasStateRef = useRef<ImageData | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const drawingLayer = drawingLayerRef.current;
    const container = containerRef.current;
    
    if (!canvas || !drawingLayer || !container) return;
    
    const context = canvas.getContext("2d");
    const drawingContext = drawingLayer.getContext("2d");
    if (!context || !drawingContext) return;
    
    // Set canvas size to match its display size
    const resizeCanvas = () => {
      if (!container) return;
      
      const { width, height } = container.getBoundingClientRect();
      setContainerSize({ width, height });
      
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
        
        // Apply the current zoom and pan settings
        if (scale !== 1 || offset.x !== 0 || offset.y !== 0) {
          drawingContext.save();
          drawingContext.translate(offset.x, offset.y);
          drawingContext.scale(scale, scale);
          drawingContext.restore();
        }
        
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
    
    // Pass the canvas reference to the parent if callback provided
    if (onCanvasRef) {
      onCanvasRef(drawingLayer);
    }
    
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  // Update drawing context when color or brush size changes
  useEffect(() => {
    if (!drawingCtx) return;
    drawingCtx.strokeStyle = color;
    drawingCtx.lineWidth = brushSize;
  }, [drawingCtx, color, brushSize]);
  
  // Update the canvas when scale or offset changes
  useEffect(() => {
    if (!ctx || !drawingCtx) return;
    redrawObjects();
  }, [scale, offset]);

  // Additional event handlers for improved drawing
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (isPanning) {
      e.preventDefault();
      return;
    }
    
    if (drawingCtx) {
      if (mode === "draw") {
        drawingCtx.beginPath();
        drawingCtx.globalCompositeOperation = "source-over";
        
        const pos = getPointerPosition(e);
        drawingCtx.moveTo(pos.x, pos.y);
        startPointRef.current = pos;
      } else if (mode === "erase") {
        drawingCtx.globalCompositeOperation = "destination-out";
        drawingCtx.beginPath();
        
        const pos = getPointerPosition(e);
        drawingCtx.moveTo(pos.x, pos.y);
      } else if (mode === "shape") {
        const pos = getPointerPosition(e);
        startPointRef.current = pos;
        
        // Save the current canvas state for shape preview
        if (drawingLayerRef.current) {
          canvasStateRef.current = drawingCtx.getImageData(
            0, 0, drawingLayerRef.current.width, drawingLayerRef.current.height
          );
        }
      }
    }
    onDrawingStart(e);
  };

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

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    // Call parent handler for panning
    if (handleMove) {
      handleMove(e);
    }
    
    const pos = getPointerPosition(e);
    lastMousePosRef.current = pos;
    
    if (isDrawing && drawingCtx && !isPanning) {
      if (mode === "draw") {
        drawingCtx.save();
        drawingCtx.translate(offset.x, offset.y);
        drawingCtx.scale(scale, scale);
        
        drawingCtx.lineTo(pos.x, pos.y);
        drawingCtx.stroke();
        
        drawingCtx.restore();
        
        const paths = [...drawingPath, pos];
        setDrawingPath(paths);
        
        // Store the free-hand drawing
        if (paths.length > 5) { // Wait until we have enough points to represent a meaningful stroke
          const newPath = {
            type: "draw" as const, // Fix: use "as const" to ensure type is specifically "draw"
            points: [...paths],
            color: color,
            lineWidth: brushSize
          };
          
          // We'll update the objects at the end of the drawing to avoid unnecessary state updates
          if (!startPointRef.current) {
            startPointRef.current = paths[0];
          }
        }
      } else if (mode === "erase") {
        drawingCtx.save();
        drawingCtx.translate(offset.x, offset.y);
        drawingCtx.scale(scale, scale);
        
        drawingCtx.lineTo(pos.x, pos.y);
        drawingCtx.stroke();
        
        drawingCtx.restore();
      } else if (mode === "shape" && startPointRef.current && canvasStateRef.current) {
        // Restore the saved canvas state before drawing the preview
        drawingCtx.putImageData(canvasStateRef.current, 0, 0);
        
        // Draw the shape preview
        drawingCtx.save();
        drawingCtx.translate(offset.x, offset.y);
        drawingCtx.scale(scale, scale);
        
        drawingCtx.strokeStyle = color;
        drawingCtx.lineWidth = brushSize;
        drawingCtx.globalCompositeOperation = "source-over";
        
        const { x: startX, y: startY } = startPointRef.current;
        drawShapePreview(drawingCtx, shapeTool, startX, startY, pos.x, pos.y);
        
        drawingCtx.restore();
      } else if (mode === "move" && selectedShape) {
        const { index, offsetX, offsetY } = selectedShape;
        const obj = { ...objects[index] };
        const dx = pos.x - offsetX;
        const dy = pos.y - offsetY;
        
        // Update object position based on its type
        if (obj.type === 'rectangle' || obj.type === 'circle' || obj.type === 'text') {
          obj.x = dx;
          obj.y = dy;
        } else if (obj.type === 'line' || obj.type === 'arrow') {
          const width = obj.x2 - obj.x1;
          const height = obj.y2 - obj.y1;
          obj.x1 = dx;
          obj.y1 = dy;
          obj.x2 = dx + width;
          obj.y2 = dy + height;
        } else if (obj.type === 'triangle') {
          // Calculate the center of the triangle
          const centerX = (obj.x1 + obj.x2 + obj.x3) / 3;
          const centerY = (obj.y1 + obj.y2 + obj.y3) / 3;
          
          // Calculate the offsets from center for each point
          const offset1X = obj.x1 - centerX;
          const offset1Y = obj.y1 - centerY;
          const offset2X = obj.x2 - centerX;
          const offset2Y = obj.y2 - centerY;
          const offset3X = obj.x3 - centerX;
          const offset3Y = obj.y3 - centerY;
          
          // Apply the new center
          const newCenterX = dx + (offset1X + offset2X + offset3X) / 3;
          const newCenterY = dy + (offset1Y + offset2Y + offset3Y) / 3;
          
          // Update the triangle points
          obj.x1 = newCenterX + offset1X;
          obj.y1 = newCenterY + offset1Y;
          obj.x2 = newCenterX + offset2X;
          obj.y2 = newCenterY + offset2Y;
          obj.x3 = newCenterX + offset3X;
          obj.y3 = newCenterY + offset3Y;
        }
        
        // Update the objects array with the modified object
        const updatedObjects = [...objects];
        updatedObjects[index] = obj;
        onObjectsChange(updatedObjects);
        
        // Update the selected shape with the new offset
        onSelectedShapeChange({
          ...selectedShape,
          offsetX: pos.x - dx,
          offsetY: pos.y - dy
        });
      }
    }
  };

  const handlePointerUp = () => {
    if (drawingCtx) {
      drawingCtx.closePath();
      if (mode === "draw" && drawingPath.length > 1) {
        // Save the free-hand drawing to objects
        const newPath = {
          type: "draw" as const, // Fix: use "as const" to ensure type is specifically "draw"
          points: [...drawingPath],
          color: color,
          lineWidth: brushSize
        };
        
        if (drawingPath.length > 5) {
          onObjectsChange([...objects, newPath]);
        }
      } else if (mode === "erase") {
        drawingCtx.globalCompositeOperation = "source-over";
      }
    }
    
    // Clear temp references
    startPointRef.current = null;
    canvasStateRef.current = null;
    
    onDrawingEnd();
    setDrawingPath([]);
  };

  // Draw background pattern
  const drawBackground = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !bgPattern) return;
    
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save context state
    context.save();
    
    // Apply transformations for zoom/pan
    context.translate(offset.x, offset.y);
    context.scale(scale, scale);
    
    // Create pattern and fill
    const pattern = context.createPattern(bgPattern, "repeat");
    if (pattern) {
      context.fillStyle = pattern;
      // Fill a large area to ensure the pattern covers the viewport even when panned
      const width = canvas.width / scale;
      const height = canvas.height / scale;
      context.fillRect(-width, -height, width * 3, height * 3);
    }
    
    // Restore context state
    context.restore();
  };

  // Redraw all objects on the canvas
  const redrawObjects = () => {
    if (!drawingCtx || !drawingLayerRef.current) return;
    
    // Don't clear when redrawing objects if we're in the middle of drawing
    if (!isDrawing) {
      drawingCtx.clearRect(0, 0, drawingLayerRef.current.width, drawingLayerRef.current.height);
    }
    
    // Apply zoom and pan transformations
    drawingCtx.save();
    drawingCtx.translate(offset.x, offset.y);
    drawingCtx.scale(scale, scale);
    
    objects.forEach(obj => {
      drawingCtx.save();
      drawingCtx.strokeStyle = obj.color;
      drawingCtx.lineWidth = obj.lineWidth;
      drawingCtx.globalCompositeOperation = "source-over"; // Ensure all objects draw normally
      
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
        case 'draw':
          // Draw free-hand paths
          if (obj.points && obj.points.length > 1) {
            drawingCtx.beginPath();
            drawingCtx.moveTo(obj.points[0].x, obj.points[0].y);
            
            for (let i = 1; i < obj.points.length; i++) {
              drawingCtx.lineTo(obj.points[i].x, obj.points[i].y);
            }
            
            drawingCtx.stroke();
          }
          break;
      }
      
      drawingCtx.restore();
    });
    
    // Restore the context to its original state
    drawingCtx.restore();
  };

  // Call redrawObjects whenever objects change
  useEffect(() => {
    redrawObjects();
  }, [objects]);

  // Pass canvas ref to parent
  useEffect(() => {
    if (onCanvasRef && drawingLayerRef.current) {
      onCanvasRef(drawingLayerRef.current);
    }
  }, [drawingLayerRef.current, onCanvasRef]);

  // Add zoom controls
  const zoomIn = () => {
    const newScale = Math.min(scale * 1.2, 10);
    if (scale !== newScale) {
      // Zoom around the center of the viewport
      const centerX = containerSize.width / 2;
      const centerY = containerSize.height / 2;
      
      const newOffset = {
        x: offset.x - (centerX / scale - centerX / newScale) * newScale,
        y: offset.y - (centerY / scale - centerY / newScale) * newScale
      };
      
      if (drawingCtx) {
        drawingCtx.scale(newScale / scale, newScale / scale);
        redrawObjects();
      }
    }
  };
  
  const zoomOut = () => {
    const newScale = Math.max(scale / 1.2, 0.1);
    if (scale !== newScale) {
      // Zoom around the center of the viewport
      const centerX = containerSize.width / 2;
      const centerY = containerSize.height / 2;
      
      const newOffset = {
        x: offset.x - (centerX / scale - centerX / newScale) * newScale,
        y: offset.y - (centerY / scale - centerY / newScale) * newScale
      };
      
      if (drawingCtx) {
        drawingCtx.scale(newScale / scale, newScale / scale);
        redrawObjects();
      }
    }
  };

  return (
    <div className="flex-grow relative" ref={containerRef}>
      {/* Zoom/Pan info tooltip */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 p-2 rounded-md shadow-md text-xs z-30 opacity-70 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1 mb-1">
          <span className="font-semibold">Zoom:</span> Ctrl + Scroll
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold">Pan:</span> Space + Drag
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span className="font-semibold">Current zoom:</span> {Math.round(scale * 100)}%
        </div>
      </div>
      
      {/* Zoom controls */}
      <div className="absolute top-24 right-4 flex flex-col gap-2 z-30">
        <button 
          className="bg-white dark:bg-gray-700 p-2 rounded-md shadow-md text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
          onClick={zoomIn}
          aria-label="Zoom in"
        >
          <ZoomIn size={18} />
        </button>
        <button 
          className="bg-white dark:bg-gray-700 p-2 rounded-md shadow-md text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
          onClick={zoomOut}
          aria-label="Zoom out"
        >
          <ZoomOut size={18} />
        </button>
        <div className="text-center bg-white dark:bg-gray-700 p-2 rounded-md shadow-md text-xs font-mono">
          {Math.round(scale * 100)}%
        </div>
      </div>
      
      {/* Show panning indicator when space is pressed */}
      {isPanning && (
        <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 p-2 rounded-md shadow-md z-30 flex items-center gap-2">
          <Move size={16} />
          <span className="text-sm">Panning</span>
        </div>
      )}
      
      {/* Rulers */}
      <Rulers 
        scale={scale}
        offset={offset}
        width={containerSize.width}
        height={containerSize.height}
      />
      
      {/* Background canvas (fixed pattern) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 bg-white dark:bg-gray-800 canvas-container"
        style={{ marginTop: '20px', marginLeft: '20px' }}
      />
      
      {/* Drawing layer (for actual drawing) */}
      <canvas
        ref={drawingLayerRef}
        className="absolute inset-0 z-10 canvas-container"
        style={{ marginTop: '20px', marginLeft: '20px', cursor: isPanning ? 'grab' : 'crosshair' }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        onWheel={handleWheel}
      />
    </div>
  );
};

export default DrawingArea;
