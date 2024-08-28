import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Euler, Quaternion, Box3 } from 'three';

function Controls({ rocks }) {
  const { camera, gl } = useThree();
  const movementSpeed = 0.1;
  const mouseSensitivity = 0.002;
  const keys = useRef({});
  const mouseMovement = useRef({ x: 0, y: 0 });
  const yaw = useRef(0);
  const pitch = useRef(0);

  const targetQuaternion = new Quaternion();
  const pitchQuaternion = new Quaternion();
  const yawQuaternion = new Quaternion();
  const tempQuaternion = new Quaternion();
  const movementVector = new Vector3();
  const direction = new Vector3();
  const collisionBoxes = useRef([]);

  // Predictive collision detection
  const checkCollision = (newPosition) => {
    const cameraBox = new Box3().setFromCenterAndSize(newPosition, new Vector3(1, 1, 1));

    for (const { box: rockBox } of collisionBoxes.current) {
      if (cameraBox.intersectsBox(rockBox)) {
        return true;
      }
    }
    return false;
  };

  useFrame(() => {
    // Handle WASD movement
    movementVector.set(0, 0, 0);
    if (keys.current['w']) movementVector.z -= movementSpeed;
    if (keys.current['s']) movementVector.z += movementSpeed;
    if (keys.current['a']) movementVector.x -= movementSpeed;
    if (keys.current['d']) movementVector.x += movementSpeed;

    // Calculate direction based on camera's yaw
    direction.copy(movementVector);
    direction.applyQuaternion(tempQuaternion.setFromEuler(new Euler(0, yaw.current, 0, 'XYZ')));
    const potentialNewPosition = camera.position.clone().add(direction);

    // Check for collisions
    if (!checkCollision(potentialNewPosition)) {
      camera.position.copy(potentialNewPosition);
    }

    // Handle mouse look
    yaw.current -= mouseMovement.current.x * mouseSensitivity;
    pitch.current -= mouseMovement.current.y * mouseSensitivity;

    // Clamp pitch to avoid flipping
    pitch.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch.current));

    // Calculate quaternions
    pitchQuaternion.setFromEuler(new Euler(pitch.current, 0, 0, 'XYZ'));
    yawQuaternion.setFromEuler(new Euler(0, yaw.current, 0, 'XYZ'));

    // Apply the quaternions
    targetQuaternion.identity().multiply(yawQuaternion).multiply(pitchQuaternion);
    camera.quaternion.copy(targetQuaternion);

    // Reset mouse movement
    mouseMovement.current.x = 0;
    mouseMovement.current.y = 0;
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      keys.current[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e) => {
      keys.current[e.key.toLowerCase()] = false;
    };

    const handleMouseMove = (e) => {
      mouseMovement.current.x = e.movementX;
      mouseMovement.current.y = e.movementY;
    };

    const handlePointerLockChange = () => {
      if (document.pointerLockElement === gl.domElement) {
        document.addEventListener('mousemove', handleMouseMove);
      } else {
        document.removeEventListener('mousemove', handleMouseMove);
      }
    };

    const requestPointerLock = () => {
      gl.domElement.requestPointerLock();
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('click', requestPointerLock);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('click', requestPointerLock);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [gl.domElement]);

  useEffect(() => {
    if (rocks) {
      collisionBoxes.current = rocks;
    }
  }, [rocks]);

  return null;
}

export default Controls;
