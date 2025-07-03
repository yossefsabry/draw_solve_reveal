
import React, { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { AnyDrawingObject, DrawingMode } from '../types';
import Shape3D from './Shape3D';
import DrawingPath3D from './DrawingPath3D';
import ShapePreview3D from './ShapePreview3D';
import CoordinateAxes from './CoordinateAxes';
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
    camera.position.set(20, 20, 20);
    camera.lookAt(0, 0, 0);
    
    // Enable shadows for better visual quality
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
  }, [camera, gl]);

  // Enhanced zoom to cursor functionality
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
        
        // Smooth zoom factor
        const zoomSpeed = 0.08;
        const zoomFactor = e.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed;
        
        // Calculate direction from camera to intersection point
        const direction = intersectionPoint.clone().sub(camera.position);
        const currentDistance = direction.length();
        
        // Calculate new distance with smooth transition
        const newDistance = currentDistance * zoomFactor;
        
        // Clamp zoom distance for better control
        const minDistance = 3;
        const maxDistance = 100;
        const clampedDistance = Math.max(minDistance, Math.min(maxDistance, newDistance));
        
        // Update camera position smoothly
        direction.normalize();
        const newPosition = intersectionPoint.clone().sub(direction.multiplyScalar(clampedDistance));
        
        // Smooth transition
        camera.position.lerp(newPosition, 0.15);
        
        // Update orbit controls target to the intersection point
        if (controlsRef.current) {
          controlsRef.current.target.lerp(intersectionPoint, 0.15);
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
      {/* Enhanced Lighting with shadows */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[30, 30, 20]} 
        intensity={1.5}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={200}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />
      <pointLight 
        position={[-30, 25, -20]} 
        intensity={0.5}
        castShadow
      />
      
      {/* Coordinate Axes */}
      {showGrid && <CoordinateAxes />}
      
      {/* Large Rectangular Grid Plate with soft pink color */}
      {showGrid && (
        <>
          <Grid
            position={[0, 0, 0]}
            args={[120, 80]} 
            cellSize={2}
            cellThickness={0.8}
            cellColor={'#ff69b4'} 
            sectionSize={10}
            sectionThickness={1.5}
            sectionColor={'#ff1493'} 
            fadeDistance={200}
            fadeStrength={0.5} 
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
            <planeGeometry args={[300, 300]} />
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
      
      {/* Enhanced Orbit Controls - removed pan, enhanced zoom and rotation */}
      <OrbitControls 
        ref={controlsRef}
        enablePan={false} 
        enableZoom={false} 
        enableRotate={true} 
        enableDamping={true}
        dampingFactor={0.05} 
        rotateSpeed={0.6}
        autoRotate={false}
        target={[0, 0, 0]}
        minDistance={3}
        maxDistance={100}
      />
    </>
  );
};

export default Scene3D;
