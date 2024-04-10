"use client";

import { Environment, OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Knight } from "./Knight";
interface IPortalTeamCard {}

const PortalTeamCard: React.FC<IPortalTeamCard> = ({}) => {
  const map = useTexture("castle.jpg");
  return (
    <>
      <ambientLight intensity={0.5} />
      <Environment preset="sunset" />
      <OrbitControls />
      <Knight />
      <mesh>
        <sphereGeometry args={[5, 64, 64]} />
        <meshStandardMaterial map={map} side={THREE.BackSide} />
      </mesh>
    </>
  );
};
export default PortalTeamCard;
