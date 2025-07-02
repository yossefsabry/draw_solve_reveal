import React, { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { AnyDrawingObject, DrawingMode } from '../types';
import Shape3D from './Shape3D';
import DrawingPath3D from './DrawingPath3D';
import ShapePreview3D from './ShapePreview3D';

interface Scene3DProps {
  objects: AnyDrawingObject[];
  showGrid?: boolean;
  onPointerDown?: (e: any) => void;
  onPointerMove?: (e: any) => void;
  onPointerUp?: (e: any) => void;
  currentPath?: { x: number; y: number }[];
  previewStartPoint?: { x: number; y: number } | null;
  previewEndPoint?: { x: number; y: number } | null;
  color?: string;
  brushSize?: number;
  isDrawing?: boolean;
  selectedShape?: string;
  mode?: DrawingMode;
}

const Scene3D: React.FC<Scene3DProps> = ({ 
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
}) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>();
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [isAltPressed, setIsAltPressed] = useState(false);
  
  useEffect(() => {
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    
    // Enable shadows for better visual quality
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = 2; // PCFSoftShadowMap
  }, [camera, gl]);

  // Handle keyboard events for Alt key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        setIsAltPressed(true);
        if (controlsRef.current) {
          controlsRef.current.enabled = false;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.altKey) {
        setIsAltPressed(false);
        setIsPanning(false);
        if (controlsRef.current) {
          controlsRef.current.enabled = true;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle mouse events for panning
  const handleMouseDown = (e: any) => {
    if (isAltPressed) {
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
      e.stopPropagation();
    } else if (onPointerDown) {
      onPointerDown(e);
    }
  };

  const handleMouseMove = (e: any) => {
    if (isPanning && isAltPressed) {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      
      // Pan the camera based on mouse movement
      const panSpeed = 0.01;
      camera.position.x -= deltaX * panSpeed;
      camera.position.y += deltaY * panSpeed;
      
      setLastMousePos({ x: e.clientX, y: e.clientY });
      e.stopPropagation();
    } else if (onPointerMove && !isAltPressed) {
      onPointerMove(e);
    }
  };

  const handleMouseUp = (e: any) => {
    if (isPanning) {
      setIsPanning(false);
      e.stopPropagation();
    } else if (onPointerUp) {
      onPointerUp(e);
    }
  };
  
  return (
    <>
      {/* Enhanced Lighting with shadows */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <pointLight 
        position={[-10, 8, -5]} 
        intensity={0.3}
        castShadow
      />
      
      {/* Grid with shadow receiving capability */}
      {showGrid && (
        <>
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
          {/* Invisible plane to receive shadows */}
          <mesh
            position={[0, 0, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial 
              transparent 
              opacity={0}
              shadowSide={2}
            />
          </mesh>
        </>
      )}
      
      {/* Drawing plane - invisible but catches pointer events */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={handleMouseDown}
        onPointerMove={handleMouseMove}
        onPointerUp={handleMouseUp}
        visible={false}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Render all objects */}
      {objects.map((obj, index) => {
        if (obj.type === 'draw') {
          return (
            <DrawingPath3D
              key={`draw-${index}`}
              points={obj.points || []}
              color={obj.color || '#ffffff'}
              lineWidth={obj.lineWidth || 2}
            />
          );
        }
        return <Shape3D key={`shape-${index}`} obj={obj} />;
      })}
      
      {/* Show current drawing path preview with better visibility */}
      {isDrawing && currentPath && currentPath.length > 1 && mode === 'draw' && !isPanning && (
        <DrawingPath3D
          points={currentPath}
          color={color || '#ffffff'}
          lineWidth={brushSize || 2}
          isPreview={true}
        />
      )}
      
      {/* Show shape preview with improved rendering */}
      {isDrawing && selectedShape && previewStartPoint && previewEndPoint && mode !== 'draw' && !isPanning && (
        <ShapePreview3D
          startPoint={previewStartPoint}
          endPoint={previewEndPoint}
          shapeType={selectedShape}
          color={color || '#ffffff'}
          lineWidth={brushSize || 2}
        />
      )}
      
      {/* Controls - disable when drawing or panning */}
      <OrbitControls 
        ref={controlsRef}
        enablePan={!isDrawing && !isPanning}
        enableZoom={!isDrawing && !isPanning}
        enableRotate={!isDrawing && !isPanning}
        minDistance={1}
        maxDistance={50}
        dampingFactor={0.05}
        enableDamping={true}
      />
    </>
  );
};

export default Scene3D;
