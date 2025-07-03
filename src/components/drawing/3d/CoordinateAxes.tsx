
import React from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const CoordinateAxes: React.FC = () => {
  return (
    <group>
      {/* X-axis (Subtle Red) */}
      <group>
        <Text
          position={[20, 1, 0]}
          fontSize={1.5}
          color="#ff9999"
          anchorX="center"
          anchorY="middle"
          material-transparent={true}
          material-opacity={0.6}
        >
          X
        </Text>
        <mesh position={[8, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.5, 2, 8]} />
          <meshBasicMaterial color="#ff9999" transparent opacity={0.5} />
        </mesh>
        <mesh position={[4, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, 16, 8]} />
          <meshBasicMaterial color="#ff9999" transparent opacity={0.4} />
        </mesh>
      </group>

      {/* Y-axis (Subtle Green) */}
      <group>
        <Text
          position={[0, 20, 0]}
          fontSize={1.5}
          color="#99ff99"
          anchorX="center"
          anchorY="middle"
          material-transparent={true}
          material-opacity={0.6}
        >
          Y
        </Text>
        <mesh position={[0, 8, 0]}>
          <coneGeometry args={[0.5, 2, 8]} />
          <meshBasicMaterial color="#99ff99" transparent opacity={0.5} />
        </mesh>
        <mesh position={[0, 4, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 16, 8]} />
          <meshBasicMaterial color="#99ff99" transparent opacity={0.4} />
        </mesh>
      </group>

      {/* Z-axis (Subtle Blue) */}
      <group>
        <Text
          position={[0, 1, 20]}
          fontSize={1.5}
          color="#9999ff"
          anchorX="center"
          anchorY="middle"
          material-transparent={true}
          material-opacity={0.6}
        >
          Z
        </Text>
        <mesh position={[0, 0, 8]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.5, 2, 8]} />
          <meshBasicMaterial color="#9999ff" transparent opacity={0.5} />
        </mesh>
        <mesh position={[0, 0, 4]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 16, 8]} />
          <meshBasicMaterial color="#9999ff" transparent opacity={0.4} />
        </mesh>
      </group>
    </group>
  );
};

export default CoordinateAxes;
