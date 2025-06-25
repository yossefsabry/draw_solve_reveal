import React, { useRef, useEffect, useState, useCallback } from "react";
import Rulers from "./Rulers";

interface AnyDrawingObject {
  type: string;
  points?: { x: number; y: number }[];
  color?: string;
  lineWidth?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  text?: string;
  fontSize?: number;
}

interface DrawingCanvasAreaProps {
  color: string;
  brushSize: number;
  mode: string;
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
}) => {
  const isDrawing = useRef(false);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [shapePreview, setShapePreview] = useState<AnyDrawingObject | null>(null);
  const drawingPath = useRef<{ x: number; y: number }[]>([]);
  const rulerSize = 16;
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSpaceDown, setIsSpaceDown] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ x: number; y: number } | null>(null);
  const offsetStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isTyping, setIsTyping] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);

  // Memoize getPos for stable reference
  const getPos = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / zoom) - offset.x,
      y: ((e.clientY - rect.top) / zoom) - offset.y,
    };
  }, [zoom, offset.x, offset.y]);

  // Memoize redraw to avoid unnecessary re-renders
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.setTransform(zoom, 0, 0, zoom, offset.x * zoom, offset.y * zoom);
    ctx.clearRect(0, 0, canvas.width / zoom, canvas.height / zoom);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width / zoom, canvas.height / zoom);
    // Draw grid
    if (showGrid) {
      ctx.save();
      ctx.globalAlpha = 0.5;
      const gridSize = 20;
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= canvas.width / zoom; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height / zoom);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height / zoom; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width / zoom, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;
      ctx.restore();
    }
    // Draw all objects
    objects.forEach(obj => {
      ctx.save();
      ctx.strokeStyle = obj.color || "#FFFFFF";
      ctx.lineWidth = obj.lineWidth || 2;
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
      } else if (obj.type === "text") {
        ctx.fillStyle = obj.color || "#FFFFFF";
        ctx.font = `${obj.fontSize || 16}px Arial`;
        ctx.textBaseline = "top";
        
        // Handle multi-line text
        const lines = (obj.text || "").split('\n');
        const lineHeight = (obj.fontSize || 16) * 1.2;
        
        lines.forEach((line, index) => {
          ctx.fillText(line, obj.x || 0, (obj.y || 0) + (index * lineHeight));
        });
      }
      ctx.restore();
    });
    // Draw current path (freehand or eraser)
    if (isDrawing.current && drawingPath.current.length > 1 && (mode === "draw" || mode === "erase")) {
      ctx.save();
      ctx.strokeStyle = mode === "erase" ? "#000000" : color;
      ctx.lineWidth = brushSize;
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
      ctx.lineWidth = brushSize;
      ctx.setLineDash([4, 4]);
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
    // Draw crosshair and eraser circle
    if (cursor) {
      ctx.save();
      ctx.strokeStyle = "#00BFFF";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cursor.x, 0);
      ctx.lineTo(cursor.x, canvas.height / zoom);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, cursor.y);
      ctx.lineTo(canvas.width / zoom, cursor.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      if (mode === "erase") {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cursor.x, cursor.y, brushSize * 1.5, 0, 2 * Math.PI);
        ctx.strokeStyle = "#00BFFF";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 2]);
        ctx.globalAlpha = 0.8;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
    }
    ctx.restore();
  }, [canvasRef, zoom, offset.x, offset.y, showGrid, objects, color, brushSize, mode, shapePreview, cursor]);

  // Redraw only when relevant state changes
  useEffect(() => {
    redraw();
    // eslint-disable-next-line
  }, [redraw]);

  // Resize canvas to fit parent (minus rulers)
  useEffect(() => {
    const handleResize = () => {
      const parent = containerRef.current;
      if (canvasRef.current && parent) {
        const width = parent.clientWidth - rulerSize;
        const height = parent.clientHeight - rulerSize;
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        setCanvasSize({ width, height });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [canvasRef]);

  // Pointer events
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isSpaceDown && e.button === 0) {
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY };
      offsetStart.current = { ...offset };
      // Add global listeners for mousemove/mouseup
      const handleMouseMove = (ev: MouseEvent) => {
        if (!isPanning || !panStart.current || !onOffsetChange) return;
        const dx = (ev.clientX - panStart.current.x) / zoom;
        const dy = (ev.clientY - panStart.current.y) / zoom;
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
    } else if (mode === "rectangle" || mode === "circle" || mode === "line") {
      setShapePreview(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPanning) return; // panning handled globally
    const pos = getPos(e);
    setCursor(pos);
    if (!isDrawing.current) return;
    if (mode === "draw" || mode === "erase") {
      drawingPath.current.push(pos);
    } else if (mode === "rectangle" && startPoint.current) {
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
    } else if (mode === "circle" && startPoint.current) {
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
    } else if (mode === "line" && startPoint.current) {
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
    if (isPanning) return; // handled globally
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
      // Use exponential zoom for smoothness
      const delta = -e.deltaY * 0.001;
      const zoomFactor = Math.exp(delta);
      let newZoom = Math.max(minZoom, Math.min(maxZoom, zoom * zoomFactor));
      // World coordinates under cursor before zoom
      const worldX = (mouseX / zoom) - offset.x;
      const worldY = (mouseY / zoom) - offset.y;
      // New offset so worldX stays under cursor
      let newOffsetX = (mouseX / newZoom) - worldX;
      let newOffsetY = (mouseY / newZoom) - worldY;
      // Clamp offset so the canvas origin (0,0) is always visible
      if (canvasRef.current) {
        const canvasW = canvasRef.current.width;
        const canvasH = canvasRef.current.height;
        // Minimum offset: don't allow panning past top/left
        newOffsetX = Math.min(newOffsetX, 0);
        newOffsetY = Math.min(newOffsetY, 0);
        // Maximum offset: don't allow panning past bottom/right
        newOffsetX = Math.max(newOffsetX, -(canvasW / newZoom - canvasW / zoom));
        newOffsetY = Math.max(newOffsetY, -(canvasH / newZoom - canvasH / zoom));
        // Prevent NaN
        if (isNaN(newOffsetX)) newOffsetX = 0;
        if (isNaN(newOffsetY)) newOffsetY = 0;
      }
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

  // Add useEffect to attach wheel event with passive: false
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    function wheelHandler(e) {
      handleWheel(e);
    }
    canvas.addEventListener('wheel', wheelHandler, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', wheelHandler);
    };
  }, [canvasRef, handleWheel]);

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
          cursor: isSpaceDown ? (isPanning ? "grabbing" : "grab") : (mode === "erase" ? "crosshair" : "crosshair")
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
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
              fontSize: `${brushSize * 2}px`,
              fontFamily: "Arial, sans-serif",
              resize: "both",
              outline: "none",
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
