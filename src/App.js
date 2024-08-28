import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { io } from 'socket.io-client';
import Controls from './Controls';
import Rocks from './Rocks';
import Plane from './Plane';
import UI from './UI';

const socket = io('http://localhost:3001');

function App() {
  const [collisionBoxes, setCollisionBoxes] = useState([]);
  const [currentColor, setCurrentColor] = useState('#ff0000');
  const rocksRef = useRef();
  const lastPosition = useRef(null); // Track the last painted position

  const handleColorChange = useCallback((color) => {
    setCurrentColor(color);
  }, []);

  const handlePaint = useCallback((intersection) => {
    if (rocksRef.current && intersection) {
      const { point, face } = intersection;
      const currentPosition = { x: point.x, y: point.y, z: point.z };
      const normal = { x: face.normal.x, y: face.normal.y, z: face.normal.z };

      // Interpolate positions if needed
      if (lastPosition.current) {
        const distance = Math.hypot(
          currentPosition.x - lastPosition.current.x,
          currentPosition.y - lastPosition.current.y,
          currentPosition.z - lastPosition.current.z
        );

        const steps = Math.ceil(distance / 0.02); // Adjust this threshold as needed
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          const interpolatedPosition = {
            x: lastPosition.current.x + (currentPosition.x - lastPosition.current.x) * t,
            y: lastPosition.current.y + (currentPosition.y - lastPosition.current.y) * t,
            z: lastPosition.current.z + (currentPosition.z - lastPosition.current.z) * t,
          };

          const decal = {
            position: interpolatedPosition,
            normal,
            color: currentColor,
            size: 0.05,
          };
          rocksRef.current.paintOnRock(decal.position, decal.normal, decal.color, decal.size);

          // Send the new decal to the server
          socket.emit('new-decal', decal);
        }
      }

      // Update last position
      lastPosition.current = currentPosition;
    }
  }, [currentColor]);

  useEffect(() => {
    // Reset the last position when mouse up
    const resetLastPosition = () => {
      lastPosition.current = null;
    };
    window.addEventListener('mouseup', resetLastPosition);

    return () => {
      window.removeEventListener('mouseup', resetLastPosition);
    };
  }, []);

  useEffect(() => {
    const handleInitialDecals = (decals) => {
      const retryInterval = 100; // Retry every 100 ms
      const maxRetries = 50; // Max retries (about 5 seconds)
  
      const checkAndApplyDecals = (attempts) => {
        if (rocksRef.current && rocksRef.current.paintOnRock) {
          decals.forEach(decal => {
            rocksRef.current.paintOnRock(decal.position, decal.normal, decal.color, decal.size);
          });
        } else if (attempts < maxRetries) {
          setTimeout(() => checkAndApplyDecals(attempts + 1), retryInterval);
        } else {
          console.error("Failed to apply decals, rocksRef is not ready.");
        }
      };
  
      checkAndApplyDecals(0);
    };

    // Receive existing decals when connecting
    socket.on('initial-decals', handleInitialDecals);

    // Receive new decals from other users
    socket.on('new-decal', (decal) => {
      if (rocksRef.current) {
        rocksRef.current.paintOnRock(decal.position, decal.normal, decal.color, decal.size);
      }
    });

    return () => {
      socket.off('initial-decals');
      socket.off('new-decal');
    };
  }, []);

  return (
    <>
      <Canvas>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
        <Controls rocks={collisionBoxes} onPaint={handlePaint} />
        <Plane />
        <Rocks ref={rocksRef} onUpdate={setCollisionBoxes} />
      </Canvas>
      <div className="crosshair" />
      <UI onColorChange={handleColorChange} />
    </>
  );
}

export default App;
