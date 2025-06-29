
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { AnyDrawingObject, DrawingMode } from './types';
import { useKeyboardControl } from '@/hooks/canvas/use-keyboard-control';

interface Canvas3DProps {
  color: string;
  brushSize: number;
  mode: DrawingMode;
  objects: AnyDrawingObject[];
  setObjects: (objects: AnyDrawingObject[]) => void;
  showGrid?: boolean;
  selectedShape?: string;
}

// 3D Drawing Path Component
const DrawingPath = ({ points, color, lineWidth }: { points: any[], color: string, lineWidth: number }) => {
  if (!points || points.length < 2) return null;
  
  const linePoints = points.map(p => new THREE.Vector3(p.x / 50, p.y / 50, 0.1));
  
  return (
    <Line
      points={linePoints}
      color={color}
      lineWidth={lineWidth}
    />
  );
};

// Preview Components
const DrawingPreview = ({ points, color, lineWidth }: { points: any[], color: string, lineWidth: number }) => {
  if (!points || points.length < 1) return null;
  
  const linePoints = points.map(p => new THREE.Vector3(p.x / 50, p.y / 50, 0.1));
  
  return (
    <Line
      points={linePoints}
      color={color}
      lineWidth={lineWidth}
      opacity={0.7}
      transparent
    />
  );
};

const ShapePreview = ({ 
  startPoint, 
  endPoint, 
  shapeType, 
  color, 
  lineWidth 
}: { 
  startPoint: any, 
  endPoint: any, 
  shapeType: string, 
  color: string, 
  lineWidth: number 
}) => {
  if (!startPoint || !endPoint) return null;
  
  const meshRef = useRef<THREE.Mesh>(null);
  
  if (shapeType === 'rectangle') {
    const width = Math.abs(endPoint.x - startPoint.x) / 50;
    const height = Math.abs(endPoint.y - startPoint.y) / 50;
    const centerX = (startPoint.x + endPoint.x) / 2 / 50;
    const centerY = -(startPoint.y + endPoint.y) / 2 / 50;
    
    return (
      <mesh position={[centerX, centerY, 0.1]}>
        <boxGeometry args={[width, height, 0.1]} />
        <meshStandardMaterial color={color} transparent opacity={0.7} />
      </mesh>
    );
  }
  
  if (shapeType === 'circle') {
    const radius = Math.sqrt(
      Math.pow(endPoint.x - startPoint.x, 2) + 
      Math.pow(endPoint.y - startPoint.y, 2)
    ) / 50;
    
    return (
      <mesh position={[startPoint.x / 50, -startPoint.y / 50, 0.1]}>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshStandardMaterial color={color} transparent opacity={0.7} />
      </mesh>
    );
  }
  
  if (shapeType === 'line') {
    const points = [
      new THREE.Vector3(startPoint.x / 50, -startPoint.y / 50, 0.1),
      new THREE.Vector3(endPoint.x / 50, -endPoint.y / 50, 0.1)
    ];
    
    return (
      <Line
        points={points}
        color={color}
        lineWidth={lineWidth}
        transparent
        opacity={0.7}
      />
    );
  }
  
  return null;
};

// Position indicator component
const PositionIndicator = ({ position }: { position: { x: number, y: number, z: number } }) => {
  return (
    <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white p-2 rounded text-sm font-mono">
      X: {position.x.toFixed(1)} Y: {position.y.toFixed(1)} Z: {position.z.toFixed(1)}
    </div>
  );
};

// 3D Shape Components
const Shape3D = ({ obj }: { obj: AnyDrawingObject }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });
  
  if (obj.type === 'rectangle') {
    return (
      <mesh 
        ref={meshRef}
        position={[(obj.x || 0) / 50, -(obj.y || 0) / 50, 0.5]}
      >
        <boxGeometry args={[(obj.width || 0) / 50, (obj.height || 0) / 50, 1]} />
        <meshStandardMaterial color={obj.color} />
      </mesh>
    );
  }
  
  if (obj.type === 'circle') {
    return (
      <mesh 
        ref={meshRef}
        position={[(obj.x || 0) / 50, -(obj.y || 0) / 50, 0.5]}
      >
        <sphereGeometry args={[(obj.radius || 0) / 50, 32, 32]} />
        <meshStandardMaterial color={obj.color} />
      </mesh>
    );
  }
  
  if (obj.type === 'line') {
    const points = [
      new THREE.Vector3((obj.x1 || 0) / 50, -(obj.y1 || 0) / 50, 0.1),
      new THREE.Vector3((obj.x2 || 0) / 50, -(obj.y2 || 0) / 50, 0.1)
    ];
    return (
      <Line
        points={points}
        color={obj.color}
        lineWidth={obj.lineWidth || 2}
      />
    );
  }
  
  if (obj.type === 'text' || obj.type === 'math') {
    return (
      <Text
        position={[(obj.x || 0) / 50, -(obj.y || 0) / 50, 0.1]}
        fontSize={(obj.fontSize || 16) / 50}
        color={obj.color}
        anchorX="left"
        anchorY="middle"
      >
        {obj.text}
      </Text>
    );
  }
  
  return null;
};

// Interactive 3D Scene
const Scene3D = ({ 
  objects, 
  showGrid = true, 
  onPointerDown, 
  onPointerMove, 
  onPointerUp,
  currentPath,
  previewStartPoint,
  previewEndPoint,
  color,
  brushSize,
  isDrawing,
  selectedShape,
  mode
}: { 
  objects: AnyDrawingObject[], 
  showGrid?: boolean,
  onPointerDown?: (e: any) => void,
  onPointerMove?: (e: any) => void,
  onPointerUp?: (e: any) => void,
  currentPath?: { x: number, y: number }[],
  previewStartPoint?: { x: number, y: number } | null,
  previewEndPoint?: { x: number, y: number } | null,
  color?: string,
  brushSize?: number,
  isDrawing?: boolean,
  selectedShape?: string,
  mode?: DrawingMode
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>();
  
  useEffect(() => {
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />
      
      {/* Grid */}
      {showGrid && (
        <Grid
          position={[0, 0, 0]}
          args={[20, 20]}
          cellSize={1}
          cellThickness={0.5}
          cellColor={'#6f6f6f'}
          sectionSize={5}
          sectionThickness={1}
          sectionColor={'#9d4b4b'}
          fadeDistance={25}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={true}
        />
      )}
      
      {/* Invisible plane for drawing detection */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        visible={false}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Render all objects */}
      {objects.map((obj, index) => {
        if (obj.type === 'draw') {
          return (
            <DrawingPath
              key={`draw-${index}`}
              points={obj.points || []}
              color={obj.color || '#ffffff'}
              lineWidth={obj.lineWidth || 2}
            />
          );
        }
        return <Shape3D key={`shape-${index}`} obj={obj} />;
      })}
      
      {/* Show current drawing path preview */}
      {isDrawing && currentPath && currentPath.length > 0 && mode === 'draw' && (
        <DrawingPreview
          points={currentPath}
          color={color || '#ffffff'}
          lineWidth={brushSize || 2}
        />
      )}
      
      {/* Show shape preview */}
      {isDrawing && selectedShape && previewStartPoint && previewEndPoint && mode !== 'draw' && (
        <ShapePreview
          startPoint={previewStartPoint}
          endPoint={previewEndPoint}
          shapeType={selectedShape}
          color={color || '#ffffff'}
          lineWidth={brushSize || 2}
        />
      )}
      
      {/* Controls */}
      <OrbitControls 
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={1}
        maxDistance={50}
      />
    </>
  );
};

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
  const { keyPressed } = useKeyboardControl();
  
  const handlePointerDown = (e: any) => {
    if (keyPressed.space) return;
    
    e.stopPropagation();
    
    const point = e.point;
    const worldPoint = { x: point.x * 50, y: -point.z * 50 };
    
    setIsDrawing(true);
    setStartPoint(worldPoint);
    
    if (mode === 'draw') {
      setCurrentPath([worldPoint]);
    }
  };
  
  const handlePointerMove = (e: any) => {
    const point = e.point;
    const worldPoint = { x: point.x * 50, y: -point.z * 50 };
    
    // Update position indicator
    setCurrentPosition({
      x: worldPoint.x,
      y: worldPoint.y,
      z: point.y * 50
    });
    
    if (!isDrawing || keyPressed.space) return;
    
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
    if (!isDrawing || keyPressed.space) return;
    
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
      
      if (selectedShape === 'rectangle') {
        const width = Math.abs(endPoint.x - startPoint.x);
        const height = Math.abs(endPoint.y - startPoint.y);
        newObject = {
          type: 'rectangle',
          x: Math.min(startPoint.x, endPoint.x),
          y: Math.min(startPoint.y, endPoint.y),
          width,
          height,
          color,
          lineWidth: brushSize
        };
      } else if (selectedShape === 'circle') {
        const radius = Math.sqrt(
          Math.pow(endPoint.x - startPoint.x, 2) + 
          Math.pow(endPoint.y - startPoint.y, 2)
        );
        newObject = {
          type: 'circle',
          x: startPoint.x,
          y: startPoint.y,
          radius,
          color,
          lineWidth: brushSize
        };
      } else if (selectedShape === 'line') {
        newObject = {
          type: 'line',
          x1: startPoint.x,
          y1: startPoint.y,
          x2: endPoint.x,
          y2: endPoint.y,
          color,
          lineWidth: brushSize
        };
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
      <PositionIndicator position={currentPosition} />
      <Canvas
        camera={{ position: [5, 5, 5], fov: 75 }}
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
