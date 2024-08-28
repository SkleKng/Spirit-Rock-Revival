import React, { useRef, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshStandardMaterial, DoubleSide, Box3 } from 'three';

function Rocks({ onUpdate }) {
  const gltf = useLoader(GLTFLoader, '/assets/rocks.glb');
  const rockMeshes = useRef([]);

  const materials = gltf.scene.children.map(child => {
    if (child.isMesh) {
      child.material = new MeshStandardMaterial({ color: 0xffffff, side: DoubleSide }); // Ensure double-sided rendering
    }
    return child;
  });

  useEffect(() => {
    // Update bounding boxes
    const updateBoundingBoxes = () => {
      rockMeshes.current = gltf.scene.children
        .filter(child => child.isMesh)
        .map(mesh => {
          const box = new Box3().setFromObject(mesh);
          return { mesh, box };
        });
      // Trigger update in Controls component
      if (onUpdate) {
        onUpdate(rockMeshes.current);
      }
    };

    updateBoundingBoxes();
  }, [gltf.scene, onUpdate]);

  return <primitive object={gltf.scene} />;
}

export default Rocks;
