import React, { useRef, useEffect, useState, useCallback } from "react";
import Rulers from "./Rulers";
import { AnyDrawingObject, DrawingMode } from "./types";

interface DrawingCanvasAreaProps {
  color: string;
  brushSize: number;
  mode: DrawingMode;
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
  onClear?: () => void;
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
  onClear,
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
  const [isTyping, setIsTyping] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);

  // Optimized grid rendering function
  const drawOptimizedGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!showGrid) return;
    
    ctx.save();
    ctx.strokeStyle = '#444444'; // Made lighter for better visibility
    ctx.lineWidth = 0.5 / zoom;
    ctx.globalAlpha = 0.6; // Increased opacity for better visibility
    
    // Calculate grid size based on zoom for better performance
    let gridSize = 20;
    if (zoom < 0.5) gridSize = 100;
    else if (zoom < 1) gridSize = 50;
    else if (zoom > 2) gridSize = 10;
    
    // Calculate visible bounds with padding
    const padding = gridSize * 2;
    const startX = Math.floor((-offset.x - padding) / zoom / gridSize) * gridSize;
    const startY = Math.floor((-offset.y - padding) / zoom / gridSize) * gridSize;
    const endX = startX + Math.ceil((canvasSize.width + padding * 2) / zoom / gridSize) * gridSize;
    const endY = startY + Math.ceil((canvasSize.height + padding * 2) / zoom / gridSize) * gridSize;
    
    // Draw vertical lines
    ctx.beginPath();
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    ctx.stroke();
    
    // Draw horizontal lines
    ctx.beginPath();
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }
    ctx.stroke();
    
    ctx.restore();
  }, [showGrid, zoom, offset.x, offset.y, canvasSize.width, canvasSize.height]);

  // Memoize getPos for stable reference
  const getPos = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - offset.x) / zoom,
      y: (e.clientY - rect.top - offset.y) / zoom,
    };
  }, [zoom, offset.x, offset.y]);

  // Memoize redraw to avoid unnecessary re-renders
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // Clear and fill with black background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan transformations
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    // Draw optimized grid
    drawOptimizedGrid(ctx);

    // Draw all objects
    objects.forEach(obj => {
      ctx.save();
      ctx.strokeStyle = obj.color || "#FFFFFF";
      ctx.lineWidth = (obj.lineWidth || 2) / zoom;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      if (obj.type === "draw") {
        if (obj.points && obj.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(obj.points[0].x, obj.points[0].y);
          obj.points.forEach(pt => ctx.lineTo(pt.x, pt.y));
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
      } else if (obj.type === "text" || obj.type === "math") {
        ctx.fillStyle = obj.color || "#FFFFFF";
        ctx.font = `${(obj.fontSize || 16) / zoom}px Arial`;
        ctx.textBaseline = "top";
        
        // Handle multi-line text properly
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
      ctx.strokeStyle = mode === "erase" ? "#000000" : color;
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
      } else if (shapePreview.type === "line") {
        ctx.beginPath();
        ctx.moveTo(shapePreview.x1!, shapePreview.y1!);
        ctx.lineTo(shapePreview.x2!, shapePreview.y2!);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Draw crosshair cursor only when NOT typing and not in text mode
    if (cursor && !isTyping && mode !== "text") {
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
      ctx.restore();

      // Draw eraser circle
      if (mode === "erase") {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cursor.x, cursor.y, brushSize, 0, 2 * Math.PI);
        ctx.strokeStyle = "#00BFFF";
        ctx.lineWidth = 1.5 / zoom;
        ctx.setLineDash([2 / zoom, 2 / zoom]);
        ctx.globalAlpha = 0.8;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
    }

    ctx.restore();
  }, [canvasRef, zoom, offset.x, offset.y, showGrid, objects, color, brushSize, mode, shapePreview, cursor, isTyping, canvasSize]);

  // Redraw when relevant state changes
  useEffect(() => {
    redraw();
  }, [redraw]);

  // Resize canvas to fit parent (minus rulers)
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

  // Handle clear functionality
  useEffect(() => {
    if (onClear) {
      // Clear all objects when clear is called
      setObjects([]);
    }
  }, [onClear, setObjects]);

  // Pointer events
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isSpaceDown && e.button === 0) {
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY };
      offsetStart.current = { ...offset };
      
      const handleMouseMove = (ev: MouseEvent) => {
        if (!isPanning || !panStart.current || !onOffsetChange) return;
        const dx = ev.clientX - panStart.current.x;
        const dy = ev.clientY - panStart.current.y;
        onOffsetChange({ x: offsetStart.current.x + dx, y: offsetStart.current.y + dy });
      };
      
      const handleMouseUp = () => {
        setIsPanning(false);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
      
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return;
    }
    
    const pos = getPos(e);
    
    if (mode === "text") {
      setIsTyping(true);
      setTextPosition(pos);
      setTextInput("");
      return;
    }
    
    isDrawing.current = true;
    startPoint.current = pos;
    if (mode === "draw" || mode === "erase") {
      drawingPath.current = [pos];
    } else if ((mode as any) === "rectangle" && startPoint.current) {
      setShapePreview(null);
    } else if ((mode as any) === "circle" && startPoint.current) {
      setShapePreview(null);
    } else if ((mode as any) === "line" && startPoint.current) {
      setShapePreview(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPanning) return;
    
    const pos = getPos(e);
    setCursor(pos);
    
    if (!isDrawing.current) return;
    
    if (mode === "draw" || mode === "erase") {
      drawingPath.current.push(pos);
    } else if ((mode as any) === "rectangle" && startPoint.current) {
      const width = pos.x - startPoint.current.x;
      const height = pos.y - startPoint.current.y;
      setShapePreview({
        type: "rectangle",
        x: startPoint.current.x,
        y: startPoint.current.y,
        width,
        height,
        color,
        lineWidth: brushSize,
      });
    } else if ((mode as any) === "circle" && startPoint.current) {
      const radius = Math.sqrt(
        Math.pow(pos.x - startPoint.current.x, 2) +
          Math.pow(pos.y - startPoint.current.y, 2)
      );
      setShapePreview({
        type: "circle",
        x: startPoint.current.x,
        y: startPoint.current.y,
        radius,
        color,
        lineWidth: brushSize,
      });
    } else if ((mode as any) === "line" && startPoint.current) {
      setShapePreview({
        type: "line",
        x1: startPoint.current.x,
        y1: startPoint.current.y,
        x2: pos.x,
        y2: pos.y,
        color,
        lineWidth: brushSize,
      });
    }
  };

  const handlePointerUp = () => {
    if (isPanning) return;
    if (!isDrawing.current) return;
    
    if (mode === "draw" || mode === "erase") {
      if (drawingPath.current.length > 1) {
        setObjects([
          ...objects,
          {
            type: "draw",
            points: [...drawingPath.current],
            color: mode === "erase" ? "#000000" : color,
            lineWidth: brushSize,
          },
        ]);
      }
    } else if (shapePreview) {
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

  // Mouse wheel zoom
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

  // Keyboard events for spacebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") setIsSpaceDown(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setIsSpaceDown(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Handle text input
  const handleTextSubmit = () => {
    if (textInput.trim() && textPosition) {
      setObjects([
        ...objects,
        {
          type: "text",
          x: textPosition.x,
          y: textPosition.y,
          text: textInput,
          color: color,
          fontSize: brushSize * 2,
        },
      ]);
    }
    
    setIsTyping(false);
    setTextInput("");
    setTextPosition(null);
  };

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
                 isTyping ? "text" : 
                 mode === "erase" ? "crosshair" : "crosshair"
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
      
      {/* Text input overlay */}
      {isTyping && textPosition && (
        <div
          style={{
            position: "absolute",
            left: rulerSize + textPosition.x * zoom + offset.x,
            top: rulerSize + textPosition.y * zoom + offset.y,
            zIndex: 20,
          }}
        >
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                handleTextSubmit();
              } else if (e.key === "Escape") {
                setIsTyping(false);
                setTextInput("");
                setTextPosition(null);
              }
            }}
            placeholder="Type your text... (Ctrl+Enter to submit, Esc to cancel)"
            style={{
              minWidth: "200px",
              minHeight: "60px",
              maxWidth: "400px",
              padding: "8px",
              border: "2px solid #00BFFF",
              borderRadius: "4px",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              color: color,
              fontSize: `${Math.max(12, brushSize * 2)}px`,
              fontFamily: "Arial, sans-serif",
              resize: "both",
              outline: "none",
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
            }}
            autoFocus
          />
          <div style={{ marginTop: "4px", fontSize: "12px", color: "#ccc" }}>
            Ctrl+Enter to submit • Esc to cancel
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawingCanvasArea;
