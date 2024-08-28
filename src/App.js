import React, { useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import Controls from './Controls';
import Rocks from './Rocks';
import Plane from './Plane';
import UI from './UI';

function App() {
  const [collisionBoxes, setCollisionBoxes] = useState([]);
  const [currentColor, setCurrentColor] = useState('#ff0000');
  const rocksRef = useRef();

  const handleColorChange = useCallback((color) => {
    setCurrentColor(color);
  }, []);

  const handlePaint = useCallback((intersection) => {
    if (rocksRef.current && intersection) {
      const { point, face } = intersection;
      rocksRef.current.paintOnRock(
        point,
        face.normal,
        currentColor, 
        0.05 // Adjusted size of the decal
      );
    }
  }, [currentColor]);

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
      <UI onColorChange={handleColorChange} /> {/* Pass handleColorChange to UI */}
    </>
  );
}

export default App;
