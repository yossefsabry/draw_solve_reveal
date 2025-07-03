import React, { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { AnyDrawingObject, DrawingMode } from '../types';
import Shape3D from './Shape3D';
import DrawingPath3D from './DrawingPath3D';
import ShapePreview3D from './ShapePreview3D';
import CoordinateAxes from './CoordinateAxes';
import CoordinateIndicator from './CoordinateIndicator';
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
  isSpaceDown?: boolean;
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
  mode,
  isSpaceDown = false
}) => {
  const { camera, gl, raycaster } = useThree();
  const controlsRef = useRef<any>();
  const planeRef = useRef<THREE.Mesh>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ x: number; y: number; cameraPos: THREE.Vector3; target: THREE.Vector3 } | null>(null);

  useEffect(() => {
    // Position camera to show the full grid plate
    camera.position.set(25, 25, 25);
    camera.lookAt(0, 0, 0);
    
    // Enable shadows for better visual quality
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
  }, [camera, gl]);

  // Enhanced zoom to cursor functionality - fixed rotation issue
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Reverse zoom direction
      const zoomSpeed = 0.1;
      // Get mouse position in normalized device coordinates
      const rect = gl.domElement.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      // Raycast to find intersection point on the grid/plane
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
      let intersectionPoint = null;
      if (planeRef.current) {
        const intersects = raycaster.intersectObject(planeRef.current);
        if (intersects.length > 0) {
          intersectionPoint = intersects[0].point;
        }
      }
      // Calculate zoom direction (reverse)
      const delta = e.deltaY < 0 ? 1 : -1; // Reverse: scroll up = zoom in
      // Clamp distance
      const minDistance = 2;
      const maxDistance = 150;
      if (intersectionPoint) {
        // Vector from intersection to camera
        const toCamera = camera.position.clone().sub(intersectionPoint);
        const currentDistance = toCamera.length();
        let newDistance = currentDistance * (1 - delta * zoomSpeed);
        newDistance = Math.max(minDistance, Math.min(maxDistance, newDistance));
        // New camera position along the same ray
        const newCameraPos = intersectionPoint.clone().add(toCamera.normalize().multiplyScalar(newDistance));
        camera.position.copy(newCameraPos);
        camera.lookAt(intersectionPoint);
        if (controlsRef.current) {
          controlsRef.current.target.copy(intersectionPoint);
          controlsRef.current.update();
        }
      }
    };
    const canvas = gl.domElement;
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [camera, gl, raycaster]);

  // --- Modern Panning Logic ---
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      // Only pan with space + left mouse
      if (isSpaceDown && e.button === 0) {
        setIsPanning(true);
        panStart.current = {
          x: e.clientX,
          y: e.clientY,
          cameraPos: camera.position.clone(),
          target: controlsRef.current ? controlsRef.current.target.clone() : new THREE.Vector3(0, 0, 0)
        };
      }
    };
    const handlePointerMove = (e: MouseEvent) => {
      if (isPanning && panStart.current) {
        // Calculate mouse movement
        const dx = e.clientX - panStart.current.x;
        const dy = e.clientY - panStart.current.y;
        // Pan speed factor (adjust as needed)
        const panSpeed = 0.02 * camera.position.length() / 25;
        // Get camera right and up vectors
        const right = new THREE.Vector3();
        camera.getWorldDirection(right);
        right.cross(camera.up).normalize();
        const up = camera.up.clone().normalize();
        // Calculate pan offset
        const offset = right.multiplyScalar(-dx * panSpeed).add(up.multiplyScalar(dy * panSpeed));
        // Move camera and target
        camera.position.copy(panStart.current.cameraPos.clone().add(offset));
        if (controlsRef.current) {
          controlsRef.current.target.copy(panStart.current.target.clone().add(offset));
          controlsRef.current.update();
        }
      }
    };
    const handlePointerUp = (e: MouseEvent) => {
      if (isPanning) {
        setIsPanning(false);
        panStart.current = null;
      }
    };
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isSpaceDown, camera]);

  // --- OrbitControls: only for right mouse drag (button 2) ---
  // Always enabled, but only allow rotation if right mouse is down and not panning
  const [isRotating, setIsRotating] = useState(false);
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (!isSpaceDown && e.button === 2) {
        setIsRotating(true);
      }
    };
    const handlePointerUp = (e: MouseEvent) => {
      if (isRotating && e.button === 2) {
        setIsRotating(false);
      }
    };
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isSpaceDown, isRotating]);

  // --- Drawing logic: only when not panning or rotating ---
  const handleMouseDown = (e: any) => {
    if (isPanning || isRotating) return;
    if (onPointerDown) {
      onPointerDown(e);
    }
  };
  const handleMouseMove = (e: any) => {
    if (isPanning || isRotating) return;
    if (onPointerMove) {
      onPointerMove(e);
    }
  };
  const handleMouseUp = (e: any) => {
    if (isPanning || isRotating) return;
    if (onPointerUp) {
      onPointerUp(e);
    }
  };
  
  return (
    <>
      {/* Removed Coordinate Indicator in top right */}
      
      {/* Enhanced Lighting with shadows */}
      <ambientLight intensity={0.7} />
      <directionalLight 
        position={[40, 40, 30]} 
        intensity={1.2}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={300}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      <pointLight 
        position={[-40, 30, -30]} 
        intensity={0.4}
        castShadow
      />
      
      {/* Removed Subtle Coordinate Axes */}
      
      {/* Large Rectangular Grid Plate with very subtle pink color */}
      {showGrid && (
        <>
          <Grid
            position={[0, 0, 0]}
            args={[200, 150]} 
            cellSize={2}
            cellThickness={0.3}
            cellColor={'#ffb3d9'} 
            sectionSize={10}
            sectionThickness={0.5}
            sectionColor={'#ff99cc'} 
            fadeDistance={400}
            fadeStrength={0.8} 
            followCamera={false}
            infiniteGrid={false}
            material-opacity={0.2}
            material-transparent={true}
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
            <planeGeometry args={[400, 300]} />
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
      {isDrawing && currentPath && currentPath.length > 1 && mode === 'draw' && (
        <DrawingPath3D
          points={currentPath}
          color={color || '#ffffff'}
          lineWidth={brushSize || 2}
          isPreview={true}
        />
      )}
      
      {/* Show shape preview */}
      {isDrawing && selectedShape && previewStartPoint && previewEndPoint && mode !== 'draw' && (
        <ShapePreview3D
          startPoint={previewStartPoint}
          endPoint={previewEndPoint}
          shapeType={selectedShape}
          color={color || '#ffffff'}
          lineWidth={brushSize || 2}
        />
      )}
      
      {/* OrbitControls: always rendered, but only enabled when spacebar is held */}
      <OrbitControls
        ref={controlsRef}
        enabled={isRotating}
        enablePan={false}
        enableZoom={false}
        enableRotate={true}
        enableDamping={true}
        dampingFactor={0.08}
        rotateSpeed={0.5}
        autoRotate={false}
        target={[0, 0, 0]}
        minDistance={2}
        maxDistance={150}
      />
    </>
  );
};

export default Scene3D;
