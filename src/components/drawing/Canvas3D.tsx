
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
  
  const linePoints = points.map(p => new THREE.Vector3(p.x / 50, p.y / 50, 0.1)); // Raised above grid
  
  return (
    <Line
      points={linePoints}
      color={color}
      lineWidth={lineWidth}
    />
  );
};

// 3D Shape Components
const Shape3D = ({ obj }: { obj: AnyDrawingObject }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005; // Slower rotation
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
        anchorY="top"
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
  color,
  brushSize,
  isDrawing
}: { 
  objects: AnyDrawingObject[], 
  showGrid?: boolean,
  onPointerDown?: (e: any) => void,
  onPointerMove?: (e: any) => void,
  onPointerUp?: (e: any) => void,
  currentPath?: { x: number, y: number }[],
  color?: string,
  brushSize?: number,
  isDrawing?: boolean
}) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>();
  
  useEffect(() => {
    // Set default camera position
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
      
      {/* Show current drawing path */}
      {isDrawing && currentPath && currentPath.length > 1 && (
        <DrawingPath
          points={currentPath}
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
  const { keyPressed } = useKeyboardControl();
  
  const handlePointerDown = (e: any) => {
    // Don't draw if space is pressed (used for camera movement)
    if (keyPressed.space) return;
    
    e.stopPropagation();
    
    if (mode === 'draw') {
      setIsDrawing(true);
      const point = e.point;
      const worldPoint = { x: point.x * 50, y: -point.z * 50 };
      setCurrentPath([worldPoint]);
      setStartPoint(worldPoint);
    } else if (selectedShape && (selectedShape === 'rectangle' || selectedShape === 'circle' || selectedShape === 'line')) {
      setIsDrawing(true);
      const point = e.point;
      const worldPoint = { x: point.x * 50, y: -point.z * 50 };
      setStartPoint(worldPoint);
    }
  };
  
  const handlePointerMove = (e: any) => {
    if (!isDrawing || keyPressed.space) return;
    
    e.stopPropagation();
    const point = e.point;
    let worldPoint = { x: point.x * 50, y: -point.z * 50 };
    
    if (mode === 'draw') {
      // Handle straight line drawing with Shift
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
    } else if (selectedShape && startPoint) {
      const point = e.point;
      const endPoint = { x: point.x * 50, y: -point.z * 50 };
      
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
          color={color}
          brushSize={brushSize}
          isDrawing={isDrawing}
        />
      </Canvas>
    </div>
  );
};

export default Canvas3D;
