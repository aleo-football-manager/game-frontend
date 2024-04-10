"use client";
import { useLoader } from "@react-three/fiber";
//@ts-ignore
import { GLTFLoader } from "../../node_modules/three/examples/jsm/loaders/GLTFLoader";
export function Knight() {
  const gltf = useLoader(GLTFLoader, "/models/scene.gltf");

  return (
    <group>
      <primitive object={gltf.scene} />
    </group>
  );
}
