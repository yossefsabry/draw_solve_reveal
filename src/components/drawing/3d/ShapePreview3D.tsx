
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
  
  // Common calculations
  const width = Math.abs(endPoint.x - startPoint.x) / 50;
  const height = Math.abs(endPoint.y - startPoint.y) / 50;
  const centerX = (startPoint.x + endPoint.x) / 2 / 50;
  const centerZ = -(startPoint.y + endPoint.y) / 2 / 50;
  
  if (shapeType === 'rectangle') {
    const depth = Math.max(width, height) * 0.2;
    
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
    const cylinderHeight = Math.max(radius * 0.4, 0.15);
    
    return (
      <mesh position={[startPoint.x / 50, cylinderHeight / 2 + 1, -startPoint.y / 50]} castShadow>
        <cylinderGeometry args={[radius, radius, cylinderHeight, 64]} />
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
    // Flat triangular prism (like Shape3D)
    const x1 = startPoint.x;
    const y1 = startPoint.y;
    const x2 = endPoint.x;
    const y2 = startPoint.y;
    const x3 = (startPoint.x + endPoint.x) / 2;
    const y3 = endPoint.y;
    const p1 = new THREE.Vector3(x1 / 50, 1, -y1 / 50);
    const p2 = new THREE.Vector3(x2 / 50, 1, -y2 / 50);
    const p3 = new THREE.Vector3(x3 / 50, 1, -y3 / 50);
    const height3d = 0.1;
    const vertices = new Float32Array([
      p1.x, p1.y, p1.z,
      p2.x, p2.y, p2.z,
      p3.x, p3.y, p3.z,
      p1.x, p1.y + height3d, p1.z,
      p2.x, p2.y + height3d, p2.z,
      p3.x, p3.y + height3d, p3.z
    ]);
    const indices = [
      0, 1, 2,  // bottom
      3, 5, 4,  // top
      0, 3, 4, 0, 4, 1,  // sides
      1, 4, 5, 1, 5, 2,
      2, 5, 3, 2, 3, 0
    ];
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return (
      <mesh castShadow position={[0, 0, 0]}>
        <primitive object={geometry} />
        <meshStandardMaterial color={color} transparent opacity={0.7} metalness={0.2} roughness={0.3} />
      </mesh>
    );
  }
  if (shapeType === 'triangularPrism') {
    // Always upright: base parallel to ground
    const x1 = Math.min(startPoint.x, endPoint.x);
    const x2 = Math.max(startPoint.x, endPoint.x);
    const yBase = Math.max(startPoint.y, endPoint.y);
    const yTop = Math.min(startPoint.y, endPoint.y);
    const width = (x2 - x1) / 50;
    const height = (yBase - yTop) / 50;
    const depth = width * 0.5;
    // Front triangle (base on X axis, height on Y axis)
    const p1 = new THREE.Vector3(x1 / 50, 1, -yBase / 50);
    const p2 = new THREE.Vector3(x2 / 50, 1, -yBase / 50);
    const p3 = new THREE.Vector3((x1 + x2) / 2 / 50, 1, -yTop / 50);
    // Back triangle (offset in Y)
    const p4 = new THREE.Vector3(x1 / 50, 1 + depth, -yBase / 50);
    const p5 = new THREE.Vector3(x2 / 50, 1 + depth, -yBase / 50);
    const p6 = new THREE.Vector3((x1 + x2) / 2 / 50, 1 + depth, -yTop / 50);
    const vertices = new Float32Array([
      p1.x, p1.y, p1.z,
      p2.x, p2.y, p2.z,
      p3.x, p3.y, p3.z,
      p4.x, p4.y, p4.z,
      p5.x, p5.y, p5.z,
      p6.x, p6.y, p6.z
    ]);
    const indices = [
      0, 1, 2,  // front
      3, 5, 4,  // back
      0, 3, 4, 0, 4, 1,  // sides
      1, 4, 5, 1, 5, 2,
      2, 5, 3, 2, 3, 0
    ];
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return (
      <mesh castShadow position={[0, 0, 0]}>
        <primitive object={geometry} />
        <meshStandardMaterial color={color} transparent opacity={0.7} metalness={0.2} roughness={0.3} />
      </mesh>
    );
  }
  
  if (shapeType === 'star') {
    const radius = Math.max(width, height) / 2;
    
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
    const personHeight = height;
    const headRadius = personHeight * 0.15;
    const bodyHeight = personHeight * 0.6;
    
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
    const houseWidth = width;
    const houseHeight = height;
    
    return (
      <group position={[centerX, 1, centerZ]}>
        {/* House base */}
        <mesh position={[0, houseHeight * 0.3, 0]} castShadow>
          <boxGeometry args={[houseWidth, houseHeight * 0.6, houseWidth * 0.8]} />
          <meshStandardMaterial 
            color={color} 
            transparent 
            opacity={0.7}
          />
        </mesh>
        {/* Roof */}
        <mesh position={[0, houseHeight * 0.7, 0]} castShadow>
          <coneGeometry args={[houseWidth * 0.7, houseHeight * 0.4, 4]} />
          <meshStandardMaterial 
            color={color} 
            transparent 
            opacity={0.7}
          />
        </mesh>
      </group>
    );
  }
  
  // 3D Shapes
  if (shapeType === 'cube') {
    const size = Math.max(width, height);
    return (
      <mesh position={[centerX, size / 2 + 1, centerZ]} castShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color={color} transparent opacity={0.7} metalness={0.3} roughness={0.3} />
      </mesh>
    );
  }
  
  if (shapeType === 'cylinder') {
    const radius = width / 2;
    const cylinderHeight = height;
    return (
      <mesh position={[centerX, cylinderHeight / 2 + 1, centerZ]} castShadow>
        <cylinderGeometry args={[radius, radius, cylinderHeight, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.7} metalness={0.3} roughness={0.3} />
      </mesh>
    );
  }
  
  if (shapeType === 'pyramid') {
    const size = Math.max(width, height);
    const pyramidHeight = height;
    return (
      <mesh position={[centerX, pyramidHeight / 2 + 1, centerZ]} castShadow>
        <coneGeometry args={[size / 2, pyramidHeight, 4]} />
        <meshStandardMaterial color={color} transparent opacity={0.7} metalness={0.3} roughness={0.3} />
      </mesh>
    );
  }
  
  if (shapeType === 'cone') {
    const radius = width / 2;
    const coneHeight = height;
    return (
      <mesh position={[centerX, coneHeight / 2 + 1, centerZ]} castShadow>
        <coneGeometry args={[radius, coneHeight, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.7} metalness={0.3} roughness={0.3} />
      </mesh>
    );
  }
  
  if (shapeType === 'sphere') {
    const radius = Math.max(width, height) / 2;
    return (
      <mesh position={[centerX, radius + 1, centerZ]} castShadow>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.7} metalness={0.3} roughness={0.3} />
      </mesh>
    );
  }
  
  if (shapeType === 'hemisphere') {
    const radius = Math.max(width, height) / 2;
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
