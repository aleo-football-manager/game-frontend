"use client";
// import { Physics } from "@react-three/cannon";
import { Box, Environment, OrbitControls, Sphere } from "@react-three/drei";
import { Canvas, useLoader } from "@react-three/fiber";
import {
  BallCollider,
  Physics,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import { Suspense, useEffect, useRef, useState } from "react";
import { Group } from "three";
//@ts-ignore
import { GLTFLoader } from "../../node_modules/three/examples/jsm/loaders/GLTFLoader";
function Ball() {
  const gltf = useLoader(GLTFLoader, "./stadium/scene.gltf");
  const stadiumRef = useRef<Group>(null);
  const ballRef = useRef<RapierRigidBody>();
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);
  const isOnFloor = useRef(true);
  const jump = () => {
    if (isOnFloor.current) {
      ballRef.current!.applyImpulse({ x: 0, y: 5, z: 0 }, true);
      isOnFloor.current = false;
    }
  };
  // const [ref, api] = useTrimesh(
  //   () => ({
  //     args: [gltf.attributes.position.array, gltf.index.array],
  //     mass: 1,
  //   }),
  //   useRef(null)
  // );

  // const handleObjectClick = () => {
  //   const jumpHeight = 200; // Adjust as needed
  //   const newPositionY = position[1] + jumpHeight;

  //   // Update position when the object is clicked
  //   setPosition([position[0], newPositionY, position[2]]);
  // };

  // // Update the position of the object in each frame
  // useFrame(() => {
  //   if (stadiumRef.current) {
  //     stadiumRef.current.position.x +=
  //       (position[0] - stadiumRef.current.position.x) * 0.05;
  //     stadiumRef.current.position.y +=
  //       (position[1] - stadiumRef.current.position.y) * 0.05;
  //     stadiumRef.current.position.z +=
  //       (position[2] - stadiumRef.current.position.z) * 0.05;
  //   }
  // });

  return (
    <group
    // ref={ref}
    // onPointerDown={() => api.velocity.set(0, 5, 0)}
    >
      <primitive geometry={gltf.geometry} object={gltf.scene} />
    </group>
  );
}

const StadiumCanvas = () => {
  const rigidBody = useRef<RapierRigidBody>(null);
  useEffect(() => {
    if (rigidBody.current) {
      // A one-off "push"
      rigidBody.current.applyImpulse({ x: 0, y: 10, z: 0 }, true);

      // A continuous force
      rigidBody.current.addForce({ x: 0, y: 10, z: 0 }, true);

      // A one-off torque rotation
      rigidBody.current.applyTorqueImpulse({ x: 0, y: 10, z: 0 }, true);

      // A continuous torque
      rigidBody.current.addTorque({ x: 0, y: 10, z: 0 }, true);
    }
  }, []);
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <Suspense fallback={null}>
        <Physics debug>
          <ambientLight />
          <OrbitControls
            autoRotate
            // minDistance={100}
            // maxDistance={200}
            enableDamping
          />
          <RigidBody ref={rigidBody} colliders="ball">
            <Sphere />
            <BallCollider args={[0.5]} />
            {/* <Ball /> */}
          </RigidBody>
          <RigidBody type="fixed" restitution={2}>
            <Box position={[0, 0, 0]} args={[10, 1, 0]} />
            <meshStandardMaterial color={"black"} />
          </RigidBody>
        </Physics>
      </Suspense>
      <Environment preset="sunset" />
    </Canvas>
  );
};

export default StadiumCanvas;
