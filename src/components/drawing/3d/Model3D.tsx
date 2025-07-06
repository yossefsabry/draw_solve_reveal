
import React, { useRef, useState } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { useDrag } from '@use-gesture/react';
import * as THREE from 'three';

interface Model3DProps {
  url: string;
  format: 'gltf' | 'glb' | 'obj';
  position?: [number, number, number];
  onPositionChange?: (position: [number, number, number]) => void;
  scale?: number;
}

const Model3D: React.FC<Model3DProps> = ({ 
  url, 
  format, 
  position = [0, 0, 0], 
  onPositionChange,
  scale = 1 
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Load the model based on format
  let model;
  try {
    if (format === 'gltf' || format === 'glb') {
      const gltf = useLoader(GLTFLoader, url);
      model = gltf.scene;
    } else if (format === 'obj') {
      model = useLoader(OBJLoader, url);
    }
  } catch (error) {
    console.error('Error loading 3D model:', error);
    return null;
  }

  // Handle dragging
  const bind = useDrag(({ active, movement: [x, y], memo = position }) => {
    setIsDragging(active);
    if (active && meshRef.current) {
      const newPosition: [number, number, number] = [
        memo[0] + x * 0.01,
        memo[1],
        memo[2] - y * 0.01
      ];
      meshRef.current.position.set(...newPosition);
      onPositionChange?.(newPosition);
      return memo;
    }
    return memo;
  });

  return (
    <group
      ref={meshRef}
      position={position}
      scale={[scale, scale, scale]}
      {...bind()}
      onPointerOver={() => document.body.style.cursor = 'grab'}
      onPointerOut={() => document.body.style.cursor = 'auto'}
      onPointerDown={() => document.body.style.cursor = 'grabbing'}
      onPointerUp={() => document.body.style.cursor = 'grab'}
    >
      {model && <primitive object={model.clone()} />}
    </group>
  );
};

export default Model3D;
