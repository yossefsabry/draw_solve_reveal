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
        <cylinderGeometry args={[radius, radius, height, 64]} />
        <meshStandardMaterial 
          color={obj.color}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>
    );
  }
  
  if (obj.type === 'ellipse') {
    const radiusX = Math.abs(obj.radiusX || 0) / 50;
    const radiusY = Math.abs(obj.radiusY || 0) / 50;
    const height = Math.max(Math.max(radiusX, radiusY) * 0.4, 0.15);
    
    return (
      <mesh 
        ref={meshRef}
        position={[(obj.x || 0) / 50, height / 2 + 1, -(obj.y || 0) / 50]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[1, 1, height, 64]} />
        <meshStandardMaterial 
          color={obj.color}
          metalness={0.2}
          roughness={0.3}
        />
        <primitive object={new THREE.Matrix4().makeScale(radiusX, 1, radiusY)} />
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
  
  if (obj.type === 'arrow') {
    const start = new THREE.Vector3((obj.x1 || 0) / 50, 1, -(obj.y1 || 0) / 50);
    const end = new THREE.Vector3((obj.x2 || 0) / 50, 1, -(obj.y2 || 0) / 50);
    const direction = end.clone().sub(start);
    const length = direction.length();
    const center = start.clone().add(end).multiplyScalar(0.5);
    
    const axis = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction.normalize());
    
    return (
      <group>
        {/* Arrow shaft */}
        <mesh 
          position={center}
          quaternion={quaternion}
          castShadow
        >
          <cylinderGeometry args={[(obj.lineWidth || 2) / 120, (obj.lineWidth || 2) / 120, length * 0.8, 12]} />
          <meshStandardMaterial 
            color={obj.color}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
        {/* Arrow head */}
        <mesh 
          position={end}
          quaternion={quaternion}
          castShadow
        >
          <coneGeometry args={[(obj.lineWidth || 2) / 60, length * 0.2, 8]} />
          <meshStandardMaterial 
            color={obj.color}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
      </group>
    );
  }
  
  if (obj.type === 'triangle') {
    // Real square-based pyramid
    const x1 = obj.x1 || 0;
    const y1 = obj.y1 || 0;
    const x2 = obj.x2 || 0;
    const y3 = obj.y3 || 0;
    // Use drag to define base width and depth
    const baseWidth = Math.abs(x2 - x1);
    const baseDepth = Math.abs(y3 - y1);
    const height = Math.max(baseWidth, baseDepth); // Height equal to max(base width, depth)
    // Base corners (on XZ plane)
    const px1 = x1 / 50, pz1 = -y1 / 50;
    const px2 = x2 / 50, pz2 = -y1 / 50;
    const px3 = x2 / 50, pz3 = -y3 / 50;
    const px4 = x1 / 50, pz4 = -y3 / 50;
    // Apex directly above base center
    const cx = (x1 + x2) / 2 / 50;
    const cz = -(y1 + y3) / 2 / 50;
    const apex = new THREE.Vector3(cx, 1 + height / 50, cz);
    // Vertices: base (p1, p2, p3, p4), apex
    const vertices = new Float32Array([
      px1, 1, pz1, // 0
      px2, 1, pz2, // 1
      px3, 1, pz3, // 2
      px4, 1, pz4, // 3
      apex.x, apex.y, apex.z // 4
    ]);
    // Faces: base (square), and four sides
    const indices = [
      0, 1, 2, 0, 2, 3, // base
      0, 1, 4, // side 1
      1, 2, 4, // side 2
      2, 3, 4, // side 3
      3, 0, 4  // side 4
    ];
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return (
      <mesh ref={meshRef} castShadow receiveShadow>
        <primitive object={geometry} />
        <meshStandardMaterial 
          color={obj.color}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>
    );
  }
  
  if (obj.type === 'polygon') {
    const points = obj.points || [];
    if (points.length < 3) return null;
    
    const shape = new THREE.Shape();
    shape.moveTo(points[0].x / 50, -points[0].y / 50);
    for (let i = 1; i < points.length; i++) {
      shape.lineTo(points[i].x / 50, -points[i].y / 50);
    }
    shape.closePath();
    
    const extrudeSettings = {
      depth: 0.2,
      bevelEnabled: false
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
    return (
      <mesh ref={meshRef} position={[0, 1, 0]} castShadow receiveShadow>
        <primitive object={geometry} />
        <meshStandardMaterial 
          color={obj.color}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>
    );
  }
  
  if (obj.type === 'star') {
    const centerX = ((obj.x1 || 0) + (obj.x2 || 0)) / 2 / 50;
    const centerZ = -((obj.y1 || 0) + (obj.y2 || 0)) / 2 / 50;
    const radius = Math.abs((obj.x2 || 0) - (obj.x1 || 0)) / 100;
    
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
      <mesh ref={meshRef} position={[centerX, 1.1, centerZ]} castShadow receiveShadow>
        <primitive object={geometry} />
        <meshStandardMaterial 
          color={obj.color}
          metalness={0.3}
          roughness={0.2}
        />
      </mesh>
    );
  }
  
  if (obj.type === 'person') {
    const centerX = ((obj.x1 || 0) + (obj.x2 || 0)) / 2 / 50;
    const centerZ = -((obj.y1 || 0) + (obj.y2 || 0)) / 2 / 50;
    const height = Math.abs((obj.y2 || 0) - (obj.y1 || 0)) / 50;
    const headRadius = height * 0.15;
    const bodyHeight = height * 0.6;
    
    return (
      <group position={[centerX, 1, centerZ]}>
        {/* Head */}
        <mesh position={[0, bodyHeight + headRadius, 0]} castShadow>
          <sphereGeometry args={[headRadius, 16, 16]} />
          <meshStandardMaterial color={obj.color} />
        </mesh>
        {/* Body */}
        <mesh position={[0, bodyHeight / 2, 0]} castShadow>
          <cylinderGeometry args={[headRadius * 0.8, headRadius * 1.2, bodyHeight, 8]} />
          <meshStandardMaterial color={obj.color} />
        </mesh>
      </group>
    );
  }
  
  if (obj.type === 'house') {
    const centerX = ((obj.x1 || 0) + (obj.x2 || 0)) / 2 / 50;
    const centerZ = -((obj.y1 || 0) + (obj.y2 || 0)) / 2 / 50;
    const width = Math.abs((obj.x2 || 0) - (obj.x1 || 0)) / 50;
    const height = Math.abs((obj.y2 || 0) - (obj.y1 || 0)) / 50;
    
    return (
      <group position={[centerX, 1, centerZ]}>
        {/* House base */}
        <mesh position={[0, height * 0.3, 0]} castShadow>
          <boxGeometry args={[width, height * 0.6, width * 0.8]} />
          <meshStandardMaterial color={obj.color} />
        </mesh>
        {/* Roof */}
        <mesh position={[0, height * 0.7, 0]} castShadow>
          <coneGeometry args={[width * 0.7, height * 0.4, 4]} />
          <meshStandardMaterial color={obj.color} />
        </mesh>
      </group>
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
  
  if (obj.type === 'cube') {
    const size = Math.abs(obj.size || 50) / 50;
    const centerX = (obj.x || 0) / 50 + size / 2;
    const centerZ = -((obj.y || 0) / 50 + size / 2);
    return (
      <mesh ref={meshRef} position={[centerX, size / 2 + 1, centerZ]} castShadow receiveShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color={obj.color || '#e74c3c'} metalness={0.3} roughness={0.3} />
      </mesh>
    );
  }
  
  if (obj.type === 'cylinder') {
    const radius = Math.abs(obj.radius || 25) / 50;
    const height = Math.abs(obj.height || 50) / 50;
    const centerX = (obj.x || 0) / 50;
    const centerZ = -((obj.y || 0) / 50);
    return (
      <mesh ref={meshRef} position={[centerX, height / 2 + 1, centerZ]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, height, 32]} />
        <meshStandardMaterial color={obj.color || '#9b59b6'} metalness={0.3} roughness={0.3} />
      </mesh>
    );
  }
  
  if (obj.type === 'pyramid') {
    const size = Math.abs(obj.size || 50) / 50;
    const height = Math.abs(obj.height || 50) / 50;
    const centerX = (obj.x || 0) / 50;
    const centerZ = -((obj.y || 0) / 50);
    return (
      <mesh ref={meshRef} position={[centerX, height / 2 + 1, centerZ]} castShadow receiveShadow>
        <coneGeometry args={[size / 2, height, 4]} />
        <meshStandardMaterial color={obj.color || '#27ae60'} metalness={0.3} roughness={0.3} />
      </mesh>
    );
  }
  
  if (obj.type === 'cone') {
    const radius = Math.abs(obj.radius || 25) / 50;
    const height = Math.abs(obj.height || 50) / 50;
    const centerX = (obj.x || 0) / 50;
    const centerZ = -((obj.y || 0) / 50);
    return (
      <mesh ref={meshRef} position={[centerX, height / 2 + 1, centerZ]} castShadow receiveShadow>
        <coneGeometry args={[radius, height, 32]} />
        <meshStandardMaterial color={obj.color || '#f1c40f'} metalness={0.3} roughness={0.3} />
      </mesh>
    );
  }
  
  if (obj.type === 'cuboid') {
    const width = Math.abs(obj.width || 50) / 50;
    const height = Math.abs(obj.height || 30) / 50;
    const depth = Math.abs(obj.depth || 25) / 50;
    const centerX = (obj.x || 0) / 50 + width / 2;
    const centerZ = -((obj.y || 0) / 50 + depth / 2);
    return (
      <mesh ref={meshRef} position={[centerX, height / 2 + 1, centerZ]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={obj.color || '#8e44ad'} metalness={0.3} roughness={0.3} />
      </mesh>
    );
  }
  
  if (obj.type === 'hexagonalPrism') {
    const radius = Math.abs(obj.radius || 25) / 50;
    const height = Math.abs(obj.height || 50) / 50;
    const centerX = (obj.x || 0) / 50;
    const centerZ = -((obj.y || 0) / 50);
    return (
      <mesh ref={meshRef} position={[centerX, height / 2 + 1, centerZ]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, height, 6]} />
        <meshStandardMaterial color={obj.color || '#e67e22'} metalness={0.3} roughness={0.3} />
      </mesh>
    );
  }
  
  if (obj.type === 'sphere') {
    const radius = Math.abs(obj.radius || 25) / 50;
    const centerX = (obj.x || 0) / 50;
    const centerZ = -((obj.y || 0) / 50);
    return (
      <mesh ref={meshRef} position={[centerX, radius + 1, centerZ]} castShadow receiveShadow>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial color={obj.color || '#3498db'} metalness={0.3} roughness={0.3} />
      </mesh>
    );
  }
  
  if (obj.type === 'hemisphere') {
    const radius = Math.abs(obj.radius || 25) / 50;
    const centerX = (obj.x || 0) / 50;
    const centerZ = -((obj.y || 0) / 50);
    return (
      <mesh ref={meshRef} position={[centerX, radius + 1, centerZ]} castShadow receiveShadow>
        <sphereGeometry args={[radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={obj.color || '#00bfff'} metalness={0.3} roughness={0.3} />
      </mesh>
    );
  }
  
  if (obj.type === 'triangularPrism') {
    // Always upright: base parallel to ground
    const x1 = obj.x;
    const x2 = obj.x + obj.width;
    const yBase = obj.y + obj.height;
    const yTop = obj.y;
    const width = obj.width / 50;
    const height = obj.height / 50;
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
      <mesh ref={meshRef} castShadow receiveShadow>
        <primitive object={geometry} />
        <meshStandardMaterial 
          color={obj.color}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>
    );
  }
  
  return null;
};

export default Shape3D;
