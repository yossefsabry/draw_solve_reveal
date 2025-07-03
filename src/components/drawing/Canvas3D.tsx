import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnyDrawingObject, DrawingMode } from './types';
import { useKeyboardControl } from '@/hooks/canvas/use-keyboard-control';
import Scene3D from './3d/Scene3D';

interface Canvas3DProps {
  color: string;
  brushSize: number;
  mode: DrawingMode;
  objects: AnyDrawingObject[];
  setObjects: (objects: AnyDrawingObject[]) => void;
  showGrid?: boolean;
  selectedShape?: string;
}

const Canvas3D: React.FC<Canvas3DProps> = ({ 
  color, 
  brushSize, 
  mode, 
  objects, 
  setObjects,
  showGrid = true,
  selectedShape
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number, y: number }[]>([]);
  const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);
  const [previewEndPoint, setPreviewEndPoint] = useState<{ x: number, y: number } | null>(null);
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0, z: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const { keyPressed } = useKeyboardControl();
  
  const handlePointerDown = (e: any) => {
    if (keyPressed.space) return;
    e.stopPropagation();
    const point = e.point;
    // Convert 3D intersection to 2D coordinates
    const worldPoint = { x: point.x * 50, y: -point.z * 50 };
    setIsDrawing(true);
    setStartPoint(worldPoint);
    if (mode === 'draw') {
      setCurrentPath([worldPoint]);
    }
  };
  
  const handlePointerMove = (e: any) => {
    if (keyPressed.space) return;
    const point = e.point;
    // Convert 3D intersection to 2D coordinates
    const worldPoint = { x: point.x * 50, y: -point.z * 50 };
    setCurrentPosition({
      x: worldPoint.x,
      y: worldPoint.y,
      z: point.y * 50
    });
    if (!isDrawing) return;
    e.stopPropagation();
    if (mode === 'draw') {
      // Handle straight line drawing with Shift
      let finalPoint = worldPoint;
      if (keyPressed.shift && startPoint) {
        const deltaX = Math.abs(worldPoint.x - startPoint.x);
        const deltaY = Math.abs(worldPoint.y - startPoint.y);
        if (keyPressed.ctrl) {
          // Snap to 90-degree increments
          const angle = Math.atan2(worldPoint.y - startPoint.y, worldPoint.x - startPoint.x);
          const snapAngle = Math.round(angle / (Math.PI / 2)) * (Math.PI / 2);
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          finalPoint = {
            x: startPoint.x + Math.cos(snapAngle) * distance,
            y: startPoint.y + Math.sin(snapAngle) * distance
          };
        } else {
          // Straight horizontal or vertical line
          if (deltaX >= deltaY) {
            finalPoint = { x: worldPoint.x, y: startPoint.y };
          } else {
            finalPoint = { x: startPoint.x, y: worldPoint.y };
          }
        }
      }
      setCurrentPath(prev => [...prev.slice(0, 1), finalPoint]);
    } else {
      // For shapes, just update the preview end point
      setPreviewEndPoint(worldPoint);
    }
  };
  
  const handlePointerUp = (e: any) => {
    if (keyPressed.space) return;
    if (!isDrawing) return;
    e.stopPropagation();
    const point = e.point;
    const endPoint = { x: point.x * 50, y: -point.z * 50 };
    if (mode === 'draw' && currentPath.length > 1) {
      const newObject: AnyDrawingObject = {
        type: 'draw',
        points: currentPath,
        color: color,
        lineWidth: brushSize
      };
      setObjects([...objects, newObject]);
    } else if (selectedShape && startPoint) {
      let newObject: AnyDrawingObject | null = null;
      const minX = Math.min(startPoint.x, endPoint.x);
      const minY = Math.min(startPoint.y, endPoint.y);
      const maxX = Math.max(startPoint.x, endPoint.x);
      const maxY = Math.max(startPoint.y, endPoint.y);
      const width = Math.abs(endPoint.x - startPoint.x);
      const height = Math.abs(endPoint.y - startPoint.y);
      
      switch (selectedShape) {
        case 'rectangle':
          newObject = {
            type: 'rectangle',
            x: minX,
            y: minY,
            width,
            height,
            color,
            lineWidth: brushSize
          };
          break;
        case 'circle':
          newObject = {
            type: 'circle',
            x: startPoint.x,
            y: startPoint.y,
            radius: Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)),
            color,
            lineWidth: brushSize
          };
          break;
        case 'line':
          newObject = {
            type: 'line',
            x1: startPoint.x,
            y1: startPoint.y,
            x2: endPoint.x,
            y2: endPoint.y,
            color,
            lineWidth: brushSize
          };
          break;
        case 'arrow':
          newObject = {
            type: 'arrow',
            x1: startPoint.x,
            y1: startPoint.y,
            x2: endPoint.x,
            y2: endPoint.y,
            color,
            lineWidth: brushSize
          };
          break;
        case 'triangle':
          newObject = {
            type: 'triangle',
            x1: startPoint.x,
            y1: startPoint.y,
            x2: endPoint.x,
            y2: endPoint.y,
            x3: (startPoint.x + endPoint.x) / 2,
            y3: startPoint.y - height,
            color,
            lineWidth: brushSize
          };
          break;
        case 'star':
          newObject = {
            type: 'star',
            x1: startPoint.x,
            y1: startPoint.y,
            x2: endPoint.x,
            y2: endPoint.y,
            color,
            lineWidth: brushSize
          };
          break;
        case 'person':
          newObject = {
            type: 'person',
            x1: startPoint.x,
            y1: startPoint.y,
            x2: endPoint.x,
            y2: endPoint.y,
            color,
            lineWidth: brushSize
          };
          break;
        case 'house':
          newObject = {
            type: 'house',
            x1: startPoint.x,
            y1: startPoint.y,
            x2: endPoint.x,
            y2: endPoint.y,
            color,
            lineWidth: brushSize
          };
          break;
        case 'cube':
          newObject = {
            type: 'cube',
            x: minX,
            y: minY,
            size: Math.max(width, height),
            color,
            lineWidth: brushSize
          };
          break;
        case 'cylinder':
          newObject = {
            type: 'cylinder',
            x: (startPoint.x + endPoint.x) / 2,
            y: (startPoint.y + endPoint.y) / 2,
            radius: width / 2,
            height: height,
            color,
            lineWidth: brushSize
          };
          break;
        case 'pyramid':
          newObject = {
            type: 'pyramid',
            x: (startPoint.x + endPoint.x) / 2,
            y: (startPoint.y + endPoint.y) / 2,
            size: width,
            height: height,
            color,
            lineWidth: brushSize
          };
          break;
        case 'cone':
          newObject = {
            type: 'cone',
            x: (startPoint.x + endPoint.x) / 2,
            y: (startPoint.y + endPoint.y) / 2,
            radius: width / 2,
            height: height,
            color,
            lineWidth: brushSize
          };
          break;
        case 'cuboid':
          newObject = {
            type: 'cuboid',
            x: minX,
            y: minY,
            width,
            height,
            depth: width * 0.5,
            color,
            lineWidth: brushSize
          };
          break;
        case 'hexagonalPrism':
          newObject = {
            type: 'hexagonalPrism',
            x: (startPoint.x + endPoint.x) / 2,
            y: (startPoint.y + endPoint.y) / 2,
            radius: width / 2,
            height: height,
            color,
            lineWidth: brushSize
          };
          break;
        case 'sphere':
          newObject = {
            type: 'sphere',
            x: (startPoint.x + endPoint.x) / 2,
            y: (startPoint.y + endPoint.y) / 2,
            radius: width / 2,
            color,
            lineWidth: brushSize
          };
          break;
        case 'hemisphere':
          newObject = {
            type: 'hemisphere',
            x: (startPoint.x + endPoint.x) / 2,
            y: (startPoint.y + endPoint.y) / 2,
            radius: width / 2,
            color,
            lineWidth: brushSize
          };
          break;
        case 'triangularPrism':
          newObject = {
            type: 'triangularPrism',
            x: minX,
            y: minY,
            width,
            height,
            depth: width * 0.5,
            color,
            lineWidth: brushSize
          };
          break;
      }
      
      if (newObject) {
        setObjects([...objects, newObject]);
      }
    }
    setIsDrawing(false);
    setCurrentPath([]);
    setStartPoint(null);
    setPreviewEndPoint(null);
  };
  
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [8, 8, 8], fov: 60 }}
        style={{ background: '#1a1a1a' }}
      >
        <Scene3D 
          objects={objects} 
          showGrid={showGrid}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          currentPath={currentPath}
          previewStartPoint={startPoint}
          previewEndPoint={previewEndPoint}
          color={color}
          brushSize={brushSize}
          isDrawing={isDrawing}
          selectedShape={selectedShape}
          mode={mode}
        />
      </Canvas>
    </div>
  );
};

export default Canvas3D;
