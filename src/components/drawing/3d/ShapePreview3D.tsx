import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface ShapePreview3DProps {
  startPoint: any;
  endPoint: any;
  shapeType: string;
  color: string;
  lineWidth: number;
}

const ShapePreview3D: React.FC<ShapePreview3DProps> = ({ 
  startPoint, 
  endPoint, 
  shapeType, 
  color, 
  lineWidth 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    if (meshRef.current && (shapeType === 'line' || shapeType === 'arrow') && startPoint && endPoint) {
      const start = new THREE.Vector3(startPoint.x / 50, 1, -startPoint.y / 50);
      const end = new THREE.Vector3(endPoint.x / 50, 1, -endPoint.y / 50);
      const direction = end.clone().sub(start);
      const axis = new THREE.Vector3(0, 1, 0);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction.normalize());
      meshRef.current.quaternion.copy(quaternion);
    }
  }, [startPoint, endPoint, shapeType]);
  
  if (!startPoint || !endPoint) return null;
  
  if (shapeType === 'rectangle') {
    const width = Math.abs(endPoint.x - startPoint.x) / 50;
    const height = Math.abs(endPoint.y - startPoint.y) / 50;
    const depth = Math.max(width, height) * 0.2;
    const centerX = (startPoint.x + endPoint.x) / 2 / 50;
    const centerZ = -(startPoint.y + endPoint.y) / 2 / 50;
    
    return (
      <mesh position={[centerX, depth / 2 + 1, centerZ]} castShadow>
        <boxGeometry args={[width, depth, height]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.7}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>
    );
  }
  
  if (shapeType === 'circle') {
    const radius = Math.sqrt(
      Math.pow(endPoint.x - startPoint.x, 2) + 
      Math.pow(endPoint.y - startPoint.y, 2)
    ) / 50;
    const height = Math.max(radius * 0.4, 0.15);
    
    return (
      <mesh position={[startPoint.x / 50, height / 2 + 1, -startPoint.y / 50]} castShadow>
        <cylinderGeometry args={[radius, radius, height, 64]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.7}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>
    );
  }
  
  if (shapeType === 'ellipse') {
    const radiusX = Math.abs(endPoint.x - startPoint.x) / 100;
    const radiusY = Math.abs(endPoint.y - startPoint.y) / 100;
    const height = Math.max(Math.max(radiusX, radiusY) * 0.4, 0.15);
    const centerX = (startPoint.x + endPoint.x) / 2 / 50;
    const centerZ = -(startPoint.y + endPoint.y) / 2 / 50;
    
    return (
      <mesh position={[centerX, height / 2 + 1, centerZ]} castShadow scale={[radiusX * 2, 1, radiusY * 2]}>
        <cylinderGeometry args={[1, 1, height, 64]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.7}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>
    );
  }
  
  if (shapeType === 'line') {
    const start = new THREE.Vector3(startPoint.x / 50, 1, -startPoint.y / 50);
    const end = new THREE.Vector3(endPoint.x / 50, 1, -endPoint.y / 50);
    const direction = end.clone().sub(start);
    const length = direction.length();
    const center = start.clone().add(end).multiplyScalar(0.5);
    
    return (
      <mesh ref={meshRef} position={center} castShadow>
        <cylinderGeometry args={[lineWidth / 120, lineWidth / 120, length, 12]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.7}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
    );
  }
  
  if (shapeType === 'arrow') {
    const start = new THREE.Vector3(startPoint.x / 50, 1, -startPoint.y / 50);
    const end = new THREE.Vector3(endPoint.x / 50, 1, -endPoint.y / 50);
    const direction = end.clone().sub(start);
    const length = direction.length();
    const center = start.clone().add(end).multiplyScalar(0.5);
    
    const axis = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction.normalize());
    
    return (
      <group>
        {/* Arrow shaft */}
        <mesh position={center} quaternion={quaternion} castShadow>
          <cylinderGeometry args={[lineWidth / 120, lineWidth / 120, length * 0.8, 12]} />
          <meshStandardMaterial 
            color={color} 
            transparent 
            opacity={0.7}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
        {/* Arrow head */}
        <mesh position={end} quaternion={quaternion} castShadow>
          <coneGeometry args={[lineWidth / 60, length * 0.2, 8]} />
          <meshStandardMaterial 
            color={color} 
            transparent 
            opacity={0.7}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
      </group>
    );
  }
  
  if (shapeType === 'triangle') {
    // Create a simple triangular prism preview
    const width = Math.abs(endPoint.x - startPoint.x) / 50;
    const height = Math.abs(endPoint.y - startPoint.y) / 50;
    const centerX = (startPoint.x + endPoint.x) / 2 / 50;
    const centerZ = -(startPoint.y + endPoint.y) / 2 / 50;
    
    return (
      <mesh position={[centerX, 1.1, centerZ]} castShadow>
        <coneGeometry args={[width / 2, height, 3]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.7}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>
    );
  }
  
  if (shapeType === 'star') {
    const centerX = (startPoint.x + endPoint.x) / 2 / 50;
    const centerZ = -(startPoint.y + endPoint.y) / 2 / 50;
    const radius = Math.abs(endPoint.x - startPoint.x) / 100;
    
    const starShape = new THREE.Shape();
    const outerRadius = radius;
    const innerRadius = radius * 0.4;
    
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      
      if (i === 0) {
        starShape.moveTo(x, y);
      } else {
        starShape.lineTo(x, y);
      }
    }
    starShape.closePath();
    
    const extrudeSettings = {
      depth: 0.15,
      bevelEnabled: false
    };
    
    const geometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
    
    return (
      <mesh position={[centerX, 1.1, centerZ]} castShadow>
        <primitive object={geometry} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.7}
          metalness={0.3}
          roughness={0.2}
        />
      </mesh>
    );
  }
  
  if (shapeType === 'person') {
    const centerX = (startPoint.x + endPoint.x) / 2 / 50;
    const centerZ = -(startPoint.y + endPoint.y) / 2 / 50;
    const height = Math.abs(endPoint.y - startPoint.y) / 50;
    const headRadius = height * 0.15;
    const bodyHeight = height * 0.6;
    
    return (
      <group position={[centerX, 1, centerZ]}>
        {/* Head */}
        <mesh position={[0, bodyHeight + headRadius, 0]} castShadow>
          <sphereGeometry args={[headRadius, 16, 16]} />
          <meshStandardMaterial 
            color={color} 
            transparent 
            opacity={0.7}
          />
        </mesh>
        {/* Body */}
        <mesh position={[0, bodyHeight / 2, 0]} castShadow>
          <cylinderGeometry args={[headRadius * 0.8, headRadius * 1.2, bodyHeight, 8]} />
          <meshStandardMaterial 
            color={color} 
            transparent 
            opacity={0.7}
          />
        </mesh>
      </group>
    );
  }
  
  if (shapeType === 'house') {
    const centerX = (startPoint.x + endPoint.x) / 2 / 50;
    const centerZ = -(startPoint.y + endPoint.y) / 2 / 50;
    const width = Math.abs(endPoint.x - startPoint.x) / 50;
    const height = Math.abs(endPoint.y - startPoint.y) / 50;
    
    return (
      <group position={[centerX, 1, centerZ]}>
        {/* House base */}
        <mesh position={[0, height * 0.3, 0]} castShadow>
          <boxGeometry args={[width, height * 0.6, width * 0.8]} />
          <meshStandardMaterial 
            color={color} 
            transparent 
            opacity={0.7}
          />
        </mesh>
        {/* Roof */}
        <mesh position={[0, height * 0.7, 0]} castShadow>
          <coneGeometry args={[width * 0.7, height * 0.4, 4]} />
          <meshStandardMaterial 
            color={color} 
            transparent 
            opacity={0.7}
          />
        </mesh>
      </group>
    );
  }
  
  if (shapeType === 'cube') {
    const size = Math.abs(endPoint.x - startPoint.x) / 50;
    const centerX = (startPoint.x + endPoint.x) / 2 / 50;
    const centerZ = -(startPoint.y + endPoint.y) / 2 / 50;
    return (
      <mesh position={[centerX, size / 2 + 1, centerZ]} castShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color={color} transparent opacity={0.7} metalness={0.3} roughness={0.3} />
      </mesh>
    );
  }
  
  if (shapeType === 'cylinder') {
    const radius = Math.abs(endPoint.x - startPoint.x) / 100;
    const height = Math.abs(endPoint.y - startPoint.y) / 50;
    const centerX = (startPoint.x + endPoint.x) / 2 / 50;
    const centerZ = -(startPoint.y + endPoint.y) / 2 / 50;
    return (
      <mesh position={[centerX, height / 2 + 1, centerZ]} castShadow>
        <cylinderGeometry args={[radius, radius, height, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.7} metalness={0.3} roughness={0.3} />
      </mesh>
    );
  }
  
  if (shapeType === 'pyramid') {
    const size = Math.abs(endPoint.x - startPoint.x) / 50;
    const height = Math.abs(endPoint.y - startPoint.y) / 50;
    const centerX = (startPoint.x + endPoint.x) / 2 / 50;
    const centerZ = -(startPoint.y + endPoint.y) / 2 / 50;
    return (
      <mesh position={[centerX, height / 2 + 1, centerZ]} castShadow>
        <coneGeometry args={[size / 2, height, 4]} />
        <meshStandardMaterial color={color} transparent opacity={0.7} metalness={0.3} roughness={0.3} />
      </mesh>
    );
  }
  
  if (shapeType === 'cone') {
    const radius = Math.abs(endPoint.x - startPoint.x) / 100;
    const height = Math.abs(endPoint.y - startPoint.y) / 50;
    const centerX = (startPoint.x + endPoint.x) / 2 / 50;
    const centerZ = -(startPoint.y + endPoint.y) / 2 / 50;
    return (
      <mesh position={[centerX, height / 2 + 1, centerZ]} castShadow>
        <coneGeometry args={[radius, height, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.7} metalness={0.3} roughness={0.3} />
      </mesh>
    );
  }
  
  if (shapeType === 'cuboid') {
    const width = Math.abs(endPoint.x - startPoint.x) / 50;
    const height = Math.abs(endPoint.y - startPoint.y) / 50;
    const depth = Math.abs((endPoint.z || 0) - (startPoint.z || 0)) / 50 || width * 0.5;
    const centerX = (startPoint.x + endPoint.x) / 2 / 50;
    const centerZ = -(startPoint.y + endPoint.y) / 2 / 50;
    return (
      <mesh position={[centerX, height / 2 + 1, centerZ]} castShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} transparent opacity={0.7} metalness={0.3} roughness={0.3} />
      </mesh>
    );
  }
  
  if (shapeType === 'hexagonalPrism') {
    const radius = Math.abs(endPoint.x - startPoint.x) / 100;
    const height = Math.abs(endPoint.y - startPoint.y) / 50;
    const centerX = (startPoint.x + endPoint.x) / 2 / 50;
    const centerZ = -(startPoint.y + endPoint.y) / 2 / 50;
    return (
      <mesh position={[centerX, height / 2 + 1, centerZ]} castShadow>
        <cylinderGeometry args={[radius, radius, height, 6]} />
        <meshStandardMaterial color={color} transparent opacity={0.7} metalness={0.3} roughness={0.3} />
      </mesh>
    );
  }
  
  if (shapeType === 'sphere') {
    const radius = Math.abs(endPoint.x - startPoint.x) / 100;
    const centerX = (startPoint.x + endPoint.x) / 2 / 50;
    const centerZ = -(startPoint.y + endPoint.y) / 2 / 50;
    return (
      <mesh position={[centerX, radius + 1, centerZ]} castShadow>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.7} metalness={0.3} roughness={0.3} />
      </mesh>
    );
  }
  
  if (shapeType === 'hemisphere') {
    const radius = Math.abs(endPoint.x - startPoint.x) / 100;
    const centerX = (startPoint.x + endPoint.x) / 2 / 50;
    const centerZ = -(startPoint.y + endPoint.y) / 2 / 50;
    return (
      <mesh position={[centerX, radius + 1, centerZ]} castShadow>
        <sphereGeometry args={[radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} transparent opacity={0.7} metalness={0.3} roughness={0.3} />
      </mesh>
    );
  }
  
  return null;
};

export default ShapePreview3D;
