
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

  // Improved zoom to cursor functionality
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!controlsRef.current) return;
      
      e.preventDefault();
      
      // Get mouse position in normalized device coordinates (-1 to +1)
      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Create raycaster from mouse position
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      
      // Find intersection with the grid plane (y = 0)
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersectionPoint = new THREE.Vector3();
      const hasIntersection = raycaster.ray.intersectPlane(plane, intersectionPoint);
      
      // Zoom parameters
      const zoomSpeed = 0.3;
      const zoomFactor = e.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed;
      
      // Get current distance from target
      const currentDistance = camera.position.distanceTo(controlsRef.current.target);
      
      // Calculate new distance with limits
      const minDistance = 5;
      const maxDistance = 100;
      const newDistance = Math.max(minDistance, Math.min(maxDistance, currentDistance * zoomFactor));
      
      // Calculate zoom ratio for target adjustment
      const zoomRatio = (currentDistance - newDistance) / currentDistance;
      
      // Move target towards intersection point for zoom-to-cursor effect
      if (hasIntersection && intersectionPoint) {
        // Calculate the vector from current target to intersection point
        const targetToIntersection = intersectionPoint.clone().sub(controlsRef.current.target);
        
        // Move target by a portion of this vector based on zoom amount
        const targetShift = targetToIntersection.multiplyScalar(zoomRatio * 0.5);
        controlsRef.current.target.add(targetShift);
      }
      
      // Calculate direction from target to camera
      const direction = camera.position.clone().sub(controlsRef.current.target).normalize();
      
      // Set new camera position maintaining the same angle
      const newPosition = controlsRef.current.target.clone().add(direction.multiplyScalar(newDistance));
      camera.position.copy(newPosition);
      
      // Update controls
      controlsRef.current.update();
    };

    const canvas = gl.domElement;
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [camera, gl]);

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
      
      {isDrawing && selectedShape && previewStartPoint && previewEndPoint && mode !== 'draw' && (
        <ShapePreview3D
          startPoint={previewStartPoint}
          endPoint={previewEndPoint}
          shapeType={selectedShape}
          color={color || '#ffffff'}
          lineWidth={brushSize || 2}
        />
      )}
      
      {/* Orbit Controls - rotation only, no zoom */}
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
        minDistance={5}
        maxDistance={100}
      />
    </>
  );
};

export default Scene3D;
