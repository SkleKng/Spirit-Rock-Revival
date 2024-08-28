import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Controls from './Controls'; // Import the Controls component
import Rocks from './Rocks';
import Plane from './Plane';
import UI from './UI'; // Import the UI component
import { AmbientLight, DirectionalLight } from 'three';
import { MeshStandardMaterial, MeshBasicMaterial, DoubleSide } from 'three';

function App() {
  const [collisionBoxes, setCollisionBoxes] = useState([]);

  return (
    <>
      <Canvas>
        {/* Lights */}
        <ambientLight intensity={0.5} /> {/* Soft light that affects all objects */}
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
        /> {/* Strong directional light to simulate sunlight */}

        <Controls rocks={collisionBoxes}/>
        <Plane />
        <Rocks onUpdate={setCollisionBoxes}/>
      </Canvas>
      {/* Crosshair */}
      <div className="crosshair" />
      <UI />
    </>
  );
}

export default App;
