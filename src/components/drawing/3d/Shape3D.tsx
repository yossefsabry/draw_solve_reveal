
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { AnyDrawingObject } from '../types';
import DrawingPath3D from './DrawingPath3D';

interface Shape3DProps {
  obj: AnyDrawingObject;
}

const Shape3D: React.FC<Shape3DProps> = ({ obj }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current && obj.type !== 'draw' && obj.type !== 'line' && obj.type !== 'text') {
      meshRef.current.rotation.y += 0.005;
    }
  });
  
  if (obj.type === 'rectangle') {
    const width = Math.abs(obj.width || 0) / 50;
    const height = Math.abs(obj.height || 0) / 50;
    const depth = Math.max(width, height) * 0.2;
    const centerX = (obj.x || 0) / 50 + width / 2;
    const centerZ = -((obj.y || 0) / 50 + height / 2);
    
    return (
      <mesh 
        ref={meshRef}
        position={[centerX, depth / 2 + 1, centerZ]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, depth, height]} />
        <meshStandardMaterial 
          color={obj.color} 
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>
    );
  }
  
  if (obj.type === 'circle') {
    const radius = Math.abs(obj.radius || 0) / 50;
    const height = Math.max(radius * 0.4, 0.15);
    
    return (
      <mesh 
        ref={meshRef}
        position={[(obj.x || 0) / 50, height / 2 + 1, -(obj.y || 0) / 50]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[radius, radius, height, 32]} />
        <meshStandardMaterial 
          color={obj.color}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>
    );
  }
  
  if (obj.type === 'line') {
    const start = new THREE.Vector3((obj.x1 || 0) / 50, 1, -(obj.y1 || 0) / 50);
    const end = new THREE.Vector3((obj.x2 || 0) / 50, 1, -(obj.y2 || 0) / 50);
    const direction = end.clone().sub(start);
    const length = direction.length();
    const center = start.clone().add(end).multiplyScalar(0.5);
    
    // Calculate rotation to align cylinder with line direction
    const axis = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction.normalize());
    
    return (
      <mesh 
        position={center}
        quaternion={quaternion}
        castShadow
      >
        <cylinderGeometry args={[(obj.lineWidth || 2) / 120, (obj.lineWidth || 2) / 120, length, 12]} />
        <meshStandardMaterial 
          color={obj.color}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
    );
  }
  
  if (obj.type === 'text' || obj.type === 'math') {
    return (
      <Text
        position={[(obj.x || 0) / 50, 1.2, -(obj.y || 0) / 50]}
        fontSize={(obj.fontSize || 16) / 50}
        color={obj.color}
        anchorX="left"
        anchorY="middle"
        castShadow
      >
        {obj.text}
      </Text>
    );
  }
  
  if (obj.type === 'draw') {
    return (
      <DrawingPath3D 
        points={obj.points || []} 
        color={obj.color || '#ffffff'} 
        lineWidth={obj.lineWidth || 2} 
      />
    );
  }
  
  return null;
};

export default Shape3D;
