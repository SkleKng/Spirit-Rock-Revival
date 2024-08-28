import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Euler, Quaternion, Box3, Raycaster, Vector2 } from 'three';

function Controls({ rocks, onPaint }) {
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

  const raycaster = new Raycaster();
  const mouse = new Vector2(0, 0);

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

    direction.copy(movementVector);
    direction.applyQuaternion(tempQuaternion.setFromEuler(new Euler(0, yaw.current, 0, 'XYZ')));
    const potentialNewPosition = camera.position.clone().add(direction);

    if (!checkCollision(potentialNewPosition)) {
      camera.position.copy(potentialNewPosition);
    }

    // Handle mouse look
    yaw.current -= mouseMovement.current.x * mouseSensitivity;
    pitch.current -= mouseMovement.current.y * mouseSensitivity;

    pitch.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch.current));

    pitchQuaternion.setFromEuler(new Euler(pitch.current, 0, 0, 'XYZ'));
    yawQuaternion.setFromEuler(new Euler(0, yaw.current, 0, 'XYZ'));

    targetQuaternion.identity().multiply(yawQuaternion).multiply(pitchQuaternion);
    camera.quaternion.copy(targetQuaternion);

    mouseMovement.current.x = 0;
    mouseMovement.current.y = 0;

    // Ray casting for painting
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(rocks.map(rock => rock.mesh));
    
    if (intersects.length > 0 && keys.current['mouse0']) {
      console.log('Intersection detected, calling onPaint');
      onPaint(intersects[0]);
    }
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

    const handleMouseDown = () => {
      console.log('Mouse down detected');
      keys.current['mouse0'] = true;
    };

    const handleMouseUp = () => {
      console.log('Mouse up detected');
      keys.current['mouse0'] = false;
    };

    const handlePointerLockChange = () => {
      if (document.pointerLockElement === gl.domElement) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);
      } else {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mouseup', handleMouseUp);
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
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [gl.domElement, onPaint]);

  useEffect(() => {
    if (rocks) {
      collisionBoxes.current = rocks;
    }
  }, [rocks]);

  return null;
}

export default Controls;