
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
  
  const linePoints = points.map(p => new THREE.Vector3(p.x / 50, p.y / 50, 0.2)); // Raised above grid
  
  return (
    <Line
      points={linePoints}
      color={color}
      lineWidth={lineWidth}
    />
  );
};

// Preview Path Component
const PreviewPath = ({ points, color, lineWidth }: { points: any[], color: string, lineWidth: number }) => {
  if (!points || points.length < 2) return null;
  
  const linePoints = points.map(p => new THREE.Vector3(p.x / 50, p.y / 50, 0.3)); // Higher than regular paths
  
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

// Preview Shape Component
const PreviewShape = ({ startPoint, currentPoint, selectedShape, color, brushSize }: {
  startPoint: { x: number, y: number } | null,
  currentPoint: { x: number, y: number } | null,
  selectedShape?: string,
  color: string,
  brushSize: number
}) => {
  if (!startPoint || !currentPoint || !selectedShape) return null;
  
  const meshRef = useRef<THREE.Mesh>(null);
  
  if (selectedShape === 'rectangle') {
    const width = Math.abs(currentPoint.x - startPoint.x);
    const height = Math.abs(currentPoint.y - startPoint.y);
    const centerX = (startPoint.x + currentPoint.x) / 2;
    const centerY = (startPoint.y + currentPoint.y) / 2;
    
    return (
      <mesh 
        ref={meshRef}
        position={[centerX / 50, -centerY / 50, 0.3]}
      >
        <boxGeometry args={[width / 50, height / 50, 0.2]} />
        <meshStandardMaterial color={color} transparent opacity={0.7} />
      </mesh>
    );
  }
  
  if (selectedShape === 'circle') {
    const radius = Math.sqrt(
      Math.pow(currentPoint.x - startPoint.x, 2) + 
      Math.pow(currentPoint.y - startPoint.y, 2)
    );
    return (
      <mesh 
        ref={meshRef}
        position={[startPoint.x / 50, -startPoint.y / 50, 0.3]}
      >
        <sphereGeometry args={[radius / 50, 32, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.7} />
      </mesh>
    );
  }
  
  if (selectedShape === 'line') {
    const points = [
      new THREE.Vector3(startPoint.x / 50, -startPoint.y / 50, 0.3),
      new THREE.Vector3(currentPoint.x / 50, -currentPoint.y / 50, 0.3)
    ];
    return (
      <Line
        points={points}
        color={color}
        lineWidth={brushSize}
        opacity={0.7}
        transparent
      />
    );
  }
  
  return null;
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
      new THREE.Vector3((obj.x1 || 0) / 50, -(obj.y1 || 0) / 50, 0.2),
      new THREE.Vector3((obj.x2 || 0) / 50, -(obj.y2 || 0) / 50, 0.2)
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
        position={[(obj.x || 0) / 50, -(obj.y || 0) / 50, 0.2]}
        fontSize={(obj.fontSize || 16) / 50}
        color={obj.color}
        anchorX="left"
        anchorY="top"
      >
        {obj.text}
      </Text>
    );
  }
  
  return null;
};

// Position indicator component
const PositionIndicator = ({ position }: { position: { x: number, y: number, z: number } | null }) => {
  if (!position) return null;
  
  return (
    <group position={[position.x / 50, position.y / 50, position.z]}>
      <mesh>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      <Text
        position={[0, 0.3, 0]}
        fontSize={0.1}
        color="#ffffff"
        anchorX="center"
        anchorY="center"
      >
        {`X: ${Math.round(position.x)}, Y: ${Math.round(position.y)}, Z: ${Math.round(position.z * 50)}`}
      </Text>
    </group>
  );
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
  previewCurrentPoint,
  color,
  brushSize,
  isDrawing,
  selectedShape,
  cursorPosition
}: { 
  objects: AnyDrawingObject[], 
  showGrid?: boolean,
  onPointerDown?: (e: any) => void,
  onPointerMove?: (e: any) => void,
  onPointerUp?: (e: any) => void,
  currentPath?: { x: number, y: number }[],
  previewStartPoint?: { x: number, y: number } | null,
  previewCurrentPoint?: { x: number, y: number } | null,
  color?: string,
  brushSize?: number,
  isDrawing?: boolean,
  selectedShape?: string,
  cursorPosition?: { x: number, y: number, z: number } | null
}) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>();
  
  useEffect(() => {
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
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
      
      {/* Drawing plane - invisible but detects mouse */}
      <mesh
        position={[0, 0, 0.1]}
        rotation={[0, 0, 0]}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        visible={false}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Position indicator */}
      <PositionIndicator position={cursorPosition} />
      
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
      {isDrawing && currentPath && currentPath.length > 1 && (
        <PreviewPath
          points={currentPath}
          color={color || '#ffffff'}
          lineWidth={brushSize || 2}
        />
      )}
      
      {/* Show shape preview */}
      <PreviewShape
        startPoint={previewStartPoint}
        currentPoint={previewCurrentPoint}
        selectedShape={selectedShape}
        color={color || '#ffffff'}
        brushSize={brushSize || 2}
      />
      
      {/* Controls */}
      <OrbitControls 
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={1}
        maxDistance={50}
        enabled={true}
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
  const [previewPoint, setPreviewPoint] = useState<{ x: number, y: number } | null>(null);
  const [cursorPosition, setCursorPosition] = useState<{ x: number, y: number, z: number } | null>(null);
  const { keyPressed } = useKeyboardControl();
  
  const handlePointerDown = (e: any) => {
    if (keyPressed.space) return;
    
    e.stopPropagation();
    
    const point = e.point;
    const worldPoint = { x: point.x * 50, y: -point.y * 50 };
    
    if (mode === 'draw') {
      setIsDrawing(true);
      setCurrentPath([worldPoint]);
      setStartPoint(worldPoint);
    } else if (selectedShape && (selectedShape === 'rectangle' || selectedShape === 'circle' || selectedShape === 'line')) {
      setIsDrawing(true);
      setStartPoint(worldPoint);
      setPreviewPoint(worldPoint);
    }
  };
  
  const handlePointerMove = (e: any) => {
    e.stopPropagation();
    const point = e.point;
    let worldPoint = { x: point.x * 50, y: -point.y * 50 };
    
    // Update cursor position for indicator
    setCursorPosition({ x: worldPoint.x, y: worldPoint.y, z: 0.1 });
    
    if (!isDrawing) {
      setPreviewPoint(worldPoint);
      return;
    }
    
    if (keyPressed.space) return;
    
    if (mode === 'draw') {
      // Handle straight line drawing with keyboard shortcuts
      if (keyPressed.shift && startPoint) {
        const deltaX = Math.abs(worldPoint.x - startPoint.x);
        const deltaY = Math.abs(worldPoint.y - startPoint.y);
        
        if (keyPressed.ctrl) {
          // Snap to 90-degree increments
          const angle = Math.atan2(worldPoint.y - startPoint.y, worldPoint.x - startPoint.x);
          const snapAngle = Math.round(angle / (Math.PI / 2)) * (Math.PI / 2);
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          
          worldPoint = {
            x: startPoint.x + Math.cos(snapAngle) * distance,
            y: startPoint.y + Math.sin(snapAngle) * distance
          };
        } else {
          // Straight horizontal or vertical line
          if (deltaX >= deltaY) {
            worldPoint = { x: worldPoint.x, y: startPoint.y };
          } else {
            worldPoint = { x: startPoint.x, y: worldPoint.y };
          }
        }
      }
      
      setCurrentPath(prev => [...prev, worldPoint]);
    }
    
    setPreviewPoint(worldPoint);
  };
  
  const handlePointerUp = (e: any) => {
    if (!isDrawing || keyPressed.space) return;
    
    e.stopPropagation();
    
    if (mode === 'draw' && currentPath.length > 1) {
      const newObject: AnyDrawingObject = {
        type: 'draw',
        points: currentPath,
        color: color,
        lineWidth: brushSize
      };
      setObjects([...objects, newObject]);
    } else if (selectedShape && startPoint && previewPoint) {
      let newObject: AnyDrawingObject | null = null;
      
      if (selectedShape === 'rectangle') {
        const width = Math.abs(previewPoint.x - startPoint.x);
        const height = Math.abs(previewPoint.y - startPoint.y);
        newObject = {
          type: 'rectangle',
          x: Math.min(startPoint.x, previewPoint.x),
          y: Math.min(startPoint.y, previewPoint.y),
          width,
          height,
          color,
          lineWidth: brushSize
        };
      } else if (selectedShape === 'circle') {
        const radius = Math.sqrt(
          Math.pow(previewPoint.x - startPoint.x, 2) + 
          Math.pow(previewPoint.y - startPoint.y, 2)
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
          x2: previewPoint.x,
          y2: previewPoint.y,
          color,
          lineWidth: brushSize
        };
      }
      
      if (newObject) {
        setObjects([...objects, newObject]);
      }
    }
    
    // Reset states
    setIsDrawing(false);
    setCurrentPath([]);
    setStartPoint(null);
    setPreviewPoint(null);
  };
  
  return (
    <div className="w-full h-full">
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
          previewCurrentPoint={previewPoint}
          color={color}
          brushSize={brushSize}
          isDrawing={isDrawing}
          selectedShape={selectedShape}
          cursorPosition={cursorPosition}
        />
      </Canvas>
    </div>
  );
};

export default Canvas3D;
