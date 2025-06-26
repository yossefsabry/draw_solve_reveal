import React, { useRef, useEffect, useState, useCallback } from "react";
import Rulers from "./Rulers";
import TextInputBox from "./TextInputBox";
import { AnyDrawingObject, DrawingMode, ShapeTool } from "./types";
import { createShapeObject } from "./ShapeDrawingUtils";
import { ShapeType } from "./ShapeSelector";

interface DrawingCanvasAreaProps {
  color: string;
  brushSize: number;
  mode: DrawingMode | "shape";
  showGrid: boolean;
  objects: AnyDrawingObject[];
  setObjects: (objs: AnyDrawingObject[]) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  onZoomChange?: (z: number) => void;
  offset?: { x: number; y: number };
  onOffsetChange?: (o: { x: number; y: number }) => void;
  selectedShape?: ShapeType;
}

const DrawingCanvasArea: React.FC<DrawingCanvasAreaProps> = ({
  color,
  brushSize,
  mode,
  showGrid,
  objects,
  setObjects,
  canvasRef,
  zoom,
  minZoom = 0.1,
  maxZoom = 5.0,
  onZoomChange,
  offset = { x: 0, y: 0 },
  onOffsetChange,
  selectedShape,
}) => {
  const isDrawing = useRef(false);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [shapePreview, setShapePreview] = useState<AnyDrawingObject | null>(null);
  const drawingPath = useRef<{ x: number; y: number }[]>([]);
  const rulerSize = 20;
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSpaceDown, setIsSpaceDown] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ x: number; y: number } | null>(null);
  const offsetStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Text input state
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInputPosition, setTextInputPosition] = useState({ x: 0, y: 0 });

  // Optimized grid rendering - separated from main canvas
  const drawOptimizedGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!showGrid) return;
    
    ctx.save();
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 0.5 / zoom;
    ctx.globalAlpha = 0.8;
    ctx.globalCompositeOperation = "source-over"; // Ensure grid is always drawn normally
    
    let gridSize = 20;
    if (zoom < 0.5) gridSize = 100;
    else if (zoom < 1) gridSize = 50;
    else if (zoom > 2) gridSize = 10;
    
    const padding = gridSize * 2;
    const startX = Math.floor((-offset.x - padding) / zoom / gridSize) * gridSize;
    const startY = Math.floor((-offset.y - padding) / zoom / gridSize) * gridSize;
    const endX = startX + Math.ceil((canvasSize.width + padding * 2) / zoom / gridSize) * gridSize;
    const endY = startY + Math.ceil((canvasSize.height + padding * 2) / zoom / gridSize) * gridSize;
    
    ctx.beginPath();
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    ctx.stroke();
    
    ctx.beginPath();
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }
    ctx.stroke();
    
    ctx.restore();
  }, [showGrid, zoom, offset.x, offset.y, canvasSize.width, canvasSize.height]);

  // Helper function to check if a point intersects with an object
  const isPointInObject = useCallback((point: { x: number; y: number }, obj: AnyDrawingObject): boolean => {
    const tolerance = Math.max(15, brushSize * 2) / zoom;
    
    switch (obj.type) {
      case "text":
      case "math":
        const lines = (obj.text || "").split('\n');
        const lineHeight = (obj.fontSize || 16) * 1.2;
        const totalHeight = lines.length * lineHeight;
        const maxLineWidth = Math.max(...lines.map(line => line.length * (obj.fontSize || 16) * 0.6));
        
        return point.x >= (obj.x || 0) - tolerance &&
               point.x <= (obj.x || 0) + maxLineWidth + tolerance &&
               point.y >= (obj.y || 0) - tolerance &&
               point.y <= (obj.y || 0) + totalHeight + tolerance;
      
      case "rectangle":
        return point.x >= (obj.x || 0) - tolerance &&
               point.x <= (obj.x || 0) + (obj.width || 0) + tolerance &&
               point.y >= (obj.y || 0) - tolerance &&
               point.y <= (obj.y || 0) + (obj.height || 0) + tolerance;
      
      case "circle":
        const dx = point.x - (obj.x || 0);
        const dy = point.y - (obj.y || 0);
        return Math.sqrt(dx * dx + dy * dy) <= (obj.radius || 0) + tolerance;
      
      case "draw":
        if (!obj.points || obj.points.length === 0) return false;
        return obj.points.some(p => {
          const dx = point.x - p.x;
          const dy = point.y - p.y;
          return Math.sqrt(dx * dx + dy * dy) <= tolerance;
        });
      
      case "line":
      case "arrow":
        // Check if point is near the line
        const x1 = obj.x1 || 0;
        const y1 = obj.y1 || 0;
        const x2 = obj.x2 || 0;
        const y2 = obj.y2 || 0;
        
        const A = point.x - x1;
        const B = point.y - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        const param = lenSq !== 0 ? dot / lenSq : -1;
        
        let xx, yy;
        if (param < 0) {
          xx = x1;
          yy = y1;
        } else if (param > 1) {
          xx = x2;
          yy = y2;
        } else {
          xx = x1 + param * C;
          yy = y1 + param * D;
        }
        
        const dx2 = point.x - xx;
        const dy2 = point.y - yy;
        return Math.sqrt(dx2 * dx2 + dy2 * dy2) <= tolerance;
      
      default:
        // For complex shapes like person, house, star, etc.
        const bounds = getObjectBounds(obj);
        return point.x >= bounds.minX - tolerance &&
               point.x <= bounds.maxX + tolerance &&
               point.y >= bounds.minY - tolerance &&
               point.y <= bounds.maxY + tolerance;
    }
  }, [brushSize, zoom]);

  // Helper function to get object bounds
  const getObjectBounds = useCallback((obj: AnyDrawingObject) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    if ('x1' in obj && 'y1' in obj && 'x2' in obj && 'y2' in obj) {
      minX = Math.min(obj.x1 || 0, obj.x2 || 0);
      maxX = Math.max(obj.x1 || 0, obj.x2 || 0);
      minY = Math.min(obj.y1 || 0, obj.y2 || 0);
      maxY = Math.max(obj.y1 || 0, obj.y2 || 0);
    } else if ('x' in obj && 'y' in obj) {
      minX = obj.x || 0;
      maxX = obj.x || 0;
      minY = obj.y || 0;
      maxY = obj.y || 0;
      
      if ('width' in obj && 'height' in obj) {
        maxX += obj.width || 0;
        maxY += obj.height || 0;
      }
    }
    
    return { minX, minY, maxX, maxY };
  }, []);

  const getPos = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - offset.x) / zoom,
      y: (e.clientY - rect.top - offset.y) / zoom,
    };
  }, [zoom, offset.x, offset.y]);

  // Enhanced redraw function with proper layering
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // Clear with black background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    // Draw grid first (always preserved)
    drawOptimizedGrid(ctx);

    // Draw all objects with improved rendering
    objects.forEach(obj => {
      ctx.save();
      ctx.strokeStyle = obj.color || "#FFFFFF";
      ctx.lineWidth = (obj.lineWidth || 2) / zoom;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalCompositeOperation = "source-over";
      
      if (obj.type === "draw") {
        if (obj.points && obj.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(obj.points[0].x, obj.points[0].y);
          for (let i = 1; i < obj.points.length; i++) {
            ctx.lineTo(obj.points[i].x, obj.points[i].y);
          }
          ctx.stroke();
        }
      } else if (obj.type === "rectangle") {
        ctx.beginPath();
        ctx.rect(obj.x!, obj.y!, obj.width!, obj.height!);
        ctx.stroke();
      } else if (obj.type === "circle") {
        ctx.beginPath();
        ctx.arc(obj.x!, obj.y!, obj.radius!, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (obj.type === "line") {
        ctx.beginPath();
        ctx.moveTo(obj.x1!, obj.y1!);
        ctx.lineTo(obj.x2!, obj.y2!);
        ctx.stroke();
      } else if (obj.type === "arrow") {
        // Draw arrow line
        ctx.beginPath();
        ctx.moveTo(obj.x1!, obj.y1!);
        ctx.lineTo(obj.x2!, obj.y2!);
        ctx.stroke();
        
        // Draw arrowhead
        const angle = Math.atan2(obj.y2! - obj.y1!, obj.x2! - obj.x1!);
        const headLength = 15 / zoom;
        ctx.beginPath();
        ctx.moveTo(obj.x2!, obj.y2!);
        ctx.lineTo(
          obj.x2! - headLength * Math.cos(angle - Math.PI / 6),
          obj.y2! - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(obj.x2!, obj.y2!);
        ctx.lineTo(
          obj.x2! - headLength * Math.cos(angle + Math.PI / 6),
          obj.y2! - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      } else if (obj.type === "triangle") {
        ctx.beginPath();
        ctx.moveTo(obj.x1!, obj.y1!);
        ctx.lineTo(obj.x2!, obj.y2!);
        ctx.lineTo(obj.x3!, obj.y3!);
        ctx.closePath();
        ctx.stroke();
      } else if (obj.type === "person") {
        // Draw stick figure
        const centerX = obj.x1!;
        const centerY = obj.y1!;
        const size = Math.abs(obj.x2! - obj.x1!) / 2;
        
        ctx.beginPath();
        // Head
        ctx.arc(centerX, centerY - size * 0.7, size * 0.2, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Body
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - size * 0.5);
        ctx.lineTo(centerX, centerY + size * 0.2);
        ctx.stroke();
        
        // Arms
        ctx.beginPath();
        ctx.moveTo(centerX - size * 0.3, centerY - size * 0.2);
        ctx.lineTo(centerX + size * 0.3, centerY - size * 0.2);
        ctx.stroke();
        
        // Legs
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + size * 0.2);
        ctx.lineTo(centerX - size * 0.3, centerY + size * 0.6);
        ctx.moveTo(centerX, centerY + size * 0.2);
        ctx.lineTo(centerX + size * 0.3, centerY + size * 0.6);
        ctx.stroke();
      } else if (obj.type === "house") {
        // Draw house
        const x = Math.min(obj.x1!, obj.x2!);
        const y = Math.min(obj.y1!, obj.y2!);
        const width = Math.abs(obj.x2! - obj.x1!);
        const height = Math.abs(obj.y2! - obj.y1!);
        
        // Base
        ctx.beginPath();
        ctx.rect(x, y + height * 0.3, width, height * 0.7);
        ctx.stroke();
        
        // Roof
        ctx.beginPath();
        ctx.moveTo(x, y + height * 0.3);
        ctx.lineTo(x + width / 2, y);
        ctx.lineTo(x + width, y + height * 0.3);
        ctx.closePath();
        ctx.stroke();
        
        // Door
        ctx.beginPath();
        ctx.rect(x + width * 0.4, y + height * 0.5, width * 0.2, height * 0.5);
        ctx.stroke();
      } else if (obj.type === "star") {
        // Draw star
        const centerX = (obj.x1! + obj.x2!) / 2;
        const centerY = (obj.y1! + obj.y2!) / 2;
        const size = Math.abs(obj.x2! - obj.x1!) / 4;
        
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const angle = (i * Math.PI) / 5;
          const radius = i % 2 === 0 ? size : size * 0.5;
          const x = centerX + Math.cos(angle - Math.PI / 2) * radius;
          const y = centerY + Math.sin(angle - Math.PI / 2) * radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      } else if (obj.type === "text" || obj.type === "math") {
        ctx.fillStyle = obj.color || "#FFFFFF";
        ctx.font = `${(obj.fontSize || 16) / zoom}px Arial`;
        ctx.textBaseline = "top";
        
        const lines = (obj.text || "").split('\n');
        const lineHeight = (obj.fontSize || 16) * 1.2 / zoom;
        
        lines.forEach((line, index) => {
          ctx.fillText(line, obj.x || 0, (obj.y || 0) + (index * lineHeight));
        });
      }
      ctx.restore();
    });

    // Draw current drawing path
    if (isDrawing.current && drawingPath.current.length > 1 && (mode === "draw" || mode === "erase")) {
      ctx.save();
      if (mode === "erase") {
        // For eraser preview, show a red path
        ctx.strokeStyle = "#FF6B6B";
        ctx.globalAlpha = 0.8;
      } else {
        ctx.strokeStyle = color;
      }
      ctx.lineWidth = brushSize / zoom;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(drawingPath.current[0].x, drawingPath.current[0].y);
      drawingPath.current.forEach((pt) => ctx.lineTo(pt.x, pt.y));
      ctx.stroke();
      ctx.restore();
    }

    // Draw shape preview
    if (shapePreview) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize / zoom;
      ctx.setLineDash([4 / zoom, 4 / zoom]);
      
      if (shapePreview.type === "rectangle") {
        ctx.strokeRect(shapePreview.x!, shapePreview.y!, shapePreview.width!, shapePreview.height!);
      } else if (shapePreview.type === "circle") {
        ctx.beginPath();
        ctx.arc(shapePreview.x!, shapePreview.y!, shapePreview.radius!, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (shapePreview.type === "line" || shapePreview.type === "arrow") {
        ctx.beginPath();
        ctx.moveTo(shapePreview.x1!, shapePreview.y1!);
        ctx.lineTo(shapePreview.x2!, shapePreview.y2!);
        ctx.stroke();
      }
      
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Draw crosshair cursor
    if (cursor && mode !== "text") {
      ctx.save();
      ctx.strokeStyle = "#00BFFF";
      ctx.lineWidth = 1 / zoom;
      ctx.setLineDash([4 / zoom, 4 / zoom]);
      
      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(-offset.x / zoom, cursor.y);
      ctx.lineTo((-offset.x + canvas.width) / zoom, cursor.y);
      ctx.stroke();
      
      // Vertical line
      ctx.beginPath();
      ctx.moveTo(cursor.x, -offset.y / zoom);
      ctx.lineTo(cursor.x, (-offset.y + canvas.height) / zoom);
      ctx.stroke();
      
      ctx.setLineDash([]);
      
      // Draw eraser circle
      if (mode === "erase") {
        ctx.beginPath();
        ctx.arc(cursor.x, cursor.y, brushSize / 2, 0, 2 * Math.PI);
        ctx.strokeStyle = "#FF6B6B";
        ctx.lineWidth = 2 / zoom;
        ctx.globalAlpha = 0.8;
        ctx.stroke();
      }
      
      ctx.restore();
    }

    ctx.restore();
  }, [canvasRef, zoom, offset.x, offset.y, showGrid, objects, color, brushSize, mode, shapePreview, cursor, canvasSize, drawOptimizedGrid]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  useEffect(() => {
    const handleResize = () => {
      const parent = containerRef.current;
      if (canvasRef.current && parent) {
        const width = parent.clientWidth - rulerSize;
        const height = parent.clientHeight - rulerSize;
        setCanvasSize({ width, height });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [canvasRef, rulerSize]);

  // Enhanced pointer events with improved panning
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Handle text mode
    if (mode === "text") {
      if (!showTextInput) {
        const pos = getPos(e);
        setTextInputPosition(pos);
        setShowTextInput(true);
      }
      return;
    }

    // Handle space key panning with improved logic
    if (isSpaceDown) {
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY };
      offsetStart.current = { ...offset };
      e.preventDefault();
      return;
    }
    
    const pos = getPos(e);
    isDrawing.current = true;
    startPoint.current = pos;
    
    if (mode === "draw" || mode === "erase") {
      drawingPath.current = [pos];
    } else if (mode === "shape" && selectedShape) {
      setShapePreview(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pos = getPos(e);
    setCursor(pos);
    
    // Improved panning logic
    if (isPanning && panStart.current && onOffsetChange) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      onOffsetChange({ 
        x: offsetStart.current.x + dx, 
        y: offsetStart.current.y + dy 
      });
      return;
    }
    
    if (!isDrawing.current || mode === "text") return;
    
    if (mode === "draw" || mode === "erase") {
      drawingPath.current.push(pos);
    } else if (mode === "shape" && startPoint.current && selectedShape) {
      const preview = createShapeObject(
        selectedShape as ShapeTool,
        startPoint.current.x,
        startPoint.current.y,
        pos.x,
        pos.y,
        color,
        brushSize
      );
      setShapePreview(preview);
    }
  };

  const handlePointerUp = () => {
    if (isPanning) {
      setIsPanning(false);
      panStart.current = null;
      return;
    }
    
    if (!isDrawing.current) return;
    
    if (mode === "draw") {
      if (drawingPath.current.length > 1) {
        const newObject: AnyDrawingObject = {
          type: "draw",
          points: [...drawingPath.current],
          color: color,
          lineWidth: brushSize,
        };
        setObjects([...objects, newObject]);
      }
    } else if (mode === "erase") {
      if (drawingPath.current.length > 1) {
        // Enhanced eraser logic - remove objects that intersect with eraser path
        const filteredObjects = objects.filter(obj => {
          // Check if any point in the eraser path intersects with this object
          const shouldErase = drawingPath.current.some(point => isPointInObject(point, obj));
          return !shouldErase;
        });
        
        setObjects(filteredObjects);
      }
    } else if (mode === "shape" && shapePreview) {
      setObjects([...objects, shapePreview]);
      setShapePreview(null);
    }
    
    isDrawing.current = false;
    drawingPath.current = [];
    startPoint.current = null;
  };

  const handlePointerLeave = () => {
    setCursor(null);
    handlePointerUp();
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (onZoomChange && onOffsetChange && canvasRef.current) {
      e.preventDefault();
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const delta = -e.deltaY * 0.001;
      const zoomFactor = Math.exp(delta);
      let newZoom = Math.max(minZoom, Math.min(maxZoom, zoom * zoomFactor));
      
      const worldX = (mouseX - offset.x) / zoom;
      const worldY = (mouseY - offset.y) / zoom;
      
      let newOffsetX = mouseX - worldX * newZoom;
      let newOffsetY = mouseY - worldY * newZoom;
      
      if (isNaN(newOffsetX)) newOffsetX = 0;
      if (isNaN(newOffsetY)) newOffsetY = 0;
      
      onZoomChange(newZoom);
      onOffsetChange({ x: newOffsetX, y: newOffsetY });
    }
  };

  // Text input handlers
  const handleTextSubmit = (text: string) => {
    const newTextObject: AnyDrawingObject = {
      type: "text",
      x: textInputPosition.x,
      y: textInputPosition.y,
      text: text,
      color: color,
      fontSize: Math.max(16, brushSize * 2),
    };
    
    setObjects([...objects, newTextObject]);
    setShowTextInput(false);
  };

  const handleTextCancel = () => {
    setShowTextInput(false);
  };

  // Improved keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !showTextInput) {
        e.preventDefault();
        setIsSpaceDown(true);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsSpaceDown(false);
        setIsPanning(false);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [showTextInput]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative" }}>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: rulerSize,
          left: rulerSize,
          width: `calc(100% - ${rulerSize}px)`,
          height: `calc(100% - ${rulerSize}px)`,
          touchAction: "none",
          cursor: isSpaceDown ? (isPanning ? "grabbing" : "grab") : 
                 mode === "erase" ? "crosshair" : 
                 mode === "text" ? "text" : "crosshair"
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onWheel={handleWheel}
      />
      
      <Rulers 
        width={canvasSize.width} 
        height={canvasSize.height} 
        zoom={zoom} 
        offset={offset}
        rulerSize={rulerSize} 
        cursor={cursor}
      />

      {showTextInput && (
        <TextInputBox
          x={textInputPosition.x}
          y={textInputPosition.y}
          zoom={zoom}
          offset={offset}
          onSubmit={handleTextSubmit}
          onCancel={handleTextCancel}
        />
      )}
    </div>
  );
};

export default DrawingCanvasArea;
