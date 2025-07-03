
import React, { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { AnyDrawingObject, DrawingMode } from '../types';
import Shape3D from './Shape3D';
import DrawingPath3D from './DrawingPath3D';
import ShapePreview3D from './ShapePreview3D';
import * as THREE from 'three';

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
  const { camera, gl, raycaster, mouse } = useThree();
  const controlsRef = useRef<any>();
  const [isPanning, setIsPanning] = useState(false);
  const [isAltPressed, setIsAltPressed] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const planeRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    // Position camera to show the full grid plate
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
    
    // Enable shadows for better visual quality
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
  }, [camera, gl]);

  // Handle keyboard events for Alt key (panning)
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

  // Handle zoom to cursor functionality
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!controlsRef.current) return;
      
      e.preventDefault();
      
      // Get mouse position in normalized device coordinates
      const rect = gl.domElement.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Update raycaster with mouse position
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
      
      // Find intersection with the drawing plane
      if (planeRef.current) {
        const intersects = raycaster.intersectObject(planeRef.current);
        if (intersects.length > 0) {
          const point = intersects[0].point;
          
          // Zoom towards the intersection point
          const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
          const direction = point.clone().sub(camera.position).normalize();
          const distance = camera.position.distanceTo(point);
          const newDistance = distance * zoomFactor;
          
          // Clamp zoom distance
          const clampedDistance = Math.max(2, Math.min(50, newDistance));
          camera.position.copy(point.clone().sub(direction.multiplyScalar(clampedDistance)));
          
          if (controlsRef.current) {
            controlsRef.current.target.copy(point);
            controlsRef.current.update();
          }
        }
      }
    };

    const canvas = gl.domElement;
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [camera, gl, raycaster]);

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
      const right = new THREE.Vector3();
      const up = new THREE.Vector3();
      
      camera.getWorldDirection(new THREE.Vector3());
      right.setFromMatrixColumn(camera.matrix, 0);
      up.setFromMatrixColumn(camera.matrix, 1);
      
      const panVector = right.multiplyScalar(-deltaX * panSpeed).add(up.multiplyScalar(deltaY * panSpeed));
      camera.position.add(panVector);
      
      if (controlsRef.current) {
        controlsRef.current.target.add(panVector);
        controlsRef.current.update();
      }
      
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
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[15, 15, 10]} 
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <pointLight 
        position={[-15, 12, -10]} 
        intensity={0.4}
        castShadow
      />
      
      {/* Large Grid Plate - positioned as the base */}
      {showGrid && (
        <>
          <Grid
            position={[0, 0, 0]}
            args={[50, 50]}
            cellSize={1}
            cellThickness={0.6}
            cellColor={'#444444'}
            sectionSize={10}
            sectionThickness={1.2}
            sectionColor={'#666666'}
            fadeDistance={100}
            fadeStrength={0.8}
            followCamera={false}
            infiniteGrid={false}
          />
          {/* Invisible plane to receive shadows and catch pointer events */}
          <mesh
            ref={planeRef}
            position={[0, 0, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
            onPointerDown={handleMouseDown}
            onPointerMove={handleMouseMove}
            onPointerUp={handleMouseUp}
            visible={false}
          >
            <planeGeometry args={[200, 200]} />
            <meshStandardMaterial 
              transparent 
              opacity={0}
              shadowSide={2}
            />
          </mesh>
        </>
      )}
      
      {/* Render all objects above the grid plate */}
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
      
      {/* Show current drawing path preview */}
      {isDrawing && currentPath && currentPath.length > 1 && mode === 'draw' && !isPanning && (
        <DrawingPath3D
          points={currentPath}
          color={color || '#ffffff'}
          lineWidth={brushSize || 2}
          isPreview={true}
        />
      )}
      
      {/* Show shape preview */}
      {isDrawing && selectedShape && previewStartPoint && previewEndPoint && mode !== 'draw' && !isPanning && (
        <ShapePreview3D
          startPoint={previewStartPoint}
          endPoint={previewEndPoint}
          shapeType={selectedShape}
          color={color || '#ffffff'}
          lineWidth={brushSize || 2}
        />
      )}
      
      {/* Enhanced Orbit Controls */}
      <OrbitControls 
        ref={controlsRef}
        enablePan={!isDrawing && !isPanning}
        enableZoom={false} // We handle zoom manually for cursor-based zooming
        enableRotate={!isDrawing && !isPanning}
        minDistance={2}
        maxDistance={50}
        dampingFactor={0.08}
        enableDamping={true}
        rotateSpeed={0.8}
        panSpeed={0.8}
        autoRotate={false}
        target={[0, 0, 0]}
      />
    </>
  );
};

export default Scene3D;
