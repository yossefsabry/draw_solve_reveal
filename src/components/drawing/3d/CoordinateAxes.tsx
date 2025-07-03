
import React from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const CoordinateAxes: React.FC = () => {
  return (
    <group>
      {/* X-axis (Red) */}
      <group>
        <Text
          position={[25, 2, 0]}
          fontSize={2}
          color="red"
          anchorX="center"
          anchorY="middle"
        >
          X
        </Text>
        <mesh position={[10, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[1, 3, 8]} />
          <meshBasicMaterial color="red" />
        </mesh>
        <mesh position={[5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 20, 8]} />
          <meshBasicMaterial color="red" />
        </mesh>
      </group>

      {/* Y-axis (Green) */}
      <group>
        <Text
          position={[0, 25, 0]}
          fontSize={2}
          color="green"
          anchorX="center"
          anchorY="middle"
        >
          Y
        </Text>
        <mesh position={[0, 10, 0]}>
          <coneGeometry args={[1, 3, 8]} />
          <meshBasicMaterial color="green" />
        </mesh>
        <mesh position={[0, 5, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 20, 8]} />
          <meshBasicMaterial color="green" />
        </mesh>
      </group>

      {/* Z-axis (Blue) */}
      <group>
        <Text
          position={[0, 2, 25]}
          fontSize={2}
          color="blue"
          anchorX="center"
          anchorY="middle"
        >
          Z
        </Text>
        <mesh position={[0, 0, 10]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[1, 3, 8]} />
          <meshBasicMaterial color="blue" />
        </mesh>
        <mesh position={[0, 0, 5]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 20, 8]} />
          <meshBasicMaterial color="blue" />
        </mesh>
      </group>
    </group>
  );
};

export default CoordinateAxes;
