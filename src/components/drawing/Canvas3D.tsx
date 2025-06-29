
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { AnyDrawingObject, DrawingMode } from './types';

interface Canvas3DProps {
  color: string;
  brushSize: number;
  mode: DrawingMode;
  objects: AnyDrawingObject[];
  setObjects: (objects: AnyDrawingObject[]) => void;
  showGrid?: boolean;
}

// 3D Drawing Path Component
const DrawingPath = ({ points, color, lineWidth }: { points: any[], color: string, lineWidth: number }) => {
  if (!points || points.length < 2) return null;
  
  const linePoints = points.map(p => new THREE.Vector3(p.x / 50, p.y / 50, 0));
  
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
      meshRef.current.rotation.y += 0.01;
    }
  });
  
  if (obj.type === 'rectangle') {
    return (
      <mesh 
        ref={meshRef}
        position={[(obj.x || 0) / 50, -(obj.y || 0) / 50, 0]}
      >
        <boxGeometry args={[(obj.width || 0) / 50, (obj.height || 0) / 50, 0.5]} />
        <meshStandardMaterial color={obj.color} />
      </mesh>
    );
  }
  
  if (obj.type === 'circle') {
    return (
      <mesh 
        ref={meshRef}
        position={[(obj.x || 0) / 50, -(obj.y || 0) / 50, 0]}
      >
        <sphereGeometry args={[(obj.radius || 0) / 50, 32, 32]} />
        <meshStandardMaterial color={obj.color} />
      </mesh>
    );
  }
  
  if (obj.type === 'text' || obj.type === 'math') {
    return (
      <Text
        position={[(obj.x || 0) / 50, -(obj.y || 0) / 50, 0]}
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
const Scene3D = ({ objects, showGrid = true }: { objects: AnyDrawingObject[], showGrid?: boolean }) => {
  const { camera } = useThree();
  
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
          position={[0, 0, -0.1]}
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
      
      {/* Controls */}
      <OrbitControls 
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
  showGrid = true 
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number, y: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const handlePointerDown = (e: React.PointerEvent) => {
    if (mode === 'draw') {
      setIsDrawing(true);
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      setCurrentPath([{ x: x * 400, y: y * 400 }]);
    }
  };
  
  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDrawing && mode === 'draw') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      setCurrentPath(prev => [...prev, { x: x * 400, y: y * 400 }]);
    }
  };
  
  const handlePointerUp = () => {
    if (isDrawing && currentPath.length > 1) {
      const newObject: AnyDrawingObject = {
        type: 'draw',
        points: currentPath,
        color: color,
        lineWidth: brushSize
      };
      setObjects([...objects, newObject]);
    }
    setIsDrawing(false);
    setCurrentPath([]);
  };
  
  return (
    <div 
      className="w-full h-full cursor-crosshair"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <Canvas
        ref={canvasRef}
        camera={{ position: [5, 5, 5], fov: 75 }}
        style={{ background: '#1a1a1a' }}
      >
        <Scene3D objects={objects} showGrid={showGrid} />
        
        {/* Show current drawing path */}
        {isDrawing && currentPath.length > 1 && (
          <DrawingPath
            points={currentPath}
            color={color}
            lineWidth={brushSize}
          />
        )}
      </Canvas>
    </div>
  );
};

export default Canvas3D;
