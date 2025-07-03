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
  const { camera, gl, raycaster } = useThree();
  const controlsRef = useRef<any>();
  const planeRef = useRef<THREE.Mesh>(null);
  
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
      if (!controlsRef.current || !planeRef.current) return;
      
      e.preventDefault();
      
      // Get mouse position in normalized device coordinates
      const rect = gl.domElement.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Update raycaster with mouse position
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
      
      // Find intersection with the drawing plane
      const intersects = raycaster.intersectObject(planeRef.current);
      if (intersects.length > 0) {
        const intersectionPoint = intersects[0].point;
        
        // Increased zoom speed for faster zooming
        const zoomSpeed = 0.3;
        const zoomFactor = e.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed;
        
        // Calculate direction from camera to intersection point
        const direction = intersectionPoint.clone().sub(camera.position);
        const currentDistance = direction.length();
        
        // Calculate new distance with faster transition
        const newDistance = currentDistance * zoomFactor;
        
        // Clamp zoom distance for better control
        const minDistance = 2;
        const maxDistance = 150;
        const clampedDistance = Math.max(minDistance, Math.min(maxDistance, newDistance));
        
        // Update camera position smoothly but faster
        direction.normalize();
        const newPosition = intersectionPoint.clone().sub(direction.multiplyScalar(clampedDistance));
        
        // Faster transition and prevent rotation during zoom
        camera.position.lerp(newPosition, 0.4);
        
        // Keep the target stable to prevent rotation
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

  // Handle mouse events for drawing
  const handleMouseDown = (e: any) => {
    if (onPointerDown) {
      onPointerDown(e);
    }
  };

  const handleMouseMove = (e: any) => {
    if (onPointerMove) {
      onPointerMove(e);
    }
  };

  const handleMouseUp = (e: any) => {
    if (onPointerUp) {
      onPointerUp(e);
    }
  };
  
  return (
    <>
      {/* Coordinate Indicator in top right */}
      <CoordinateIndicator />
      
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
      
      {/* Subtle Coordinate Axes */}
      {showGrid && <CoordinateAxes />}
      
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
      
      {/* Enhanced Orbit Controls - stable rotation, no zoom */}
      <OrbitControls 
        ref={controlsRef}
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
