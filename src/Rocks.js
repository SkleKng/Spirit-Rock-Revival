import React, { useRef, useEffect, useMemo, forwardRef, useImperativeHandle, useState } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { 
  MeshStandardMaterial, 
  DoubleSide, 
  Box3, 
  TextureLoader,
  Vector3,
  Mesh,
  PlaneGeometry,
  MeshBasicMaterial
} from 'three';

const Rocks = forwardRef(({ onUpdate }, ref) => {
  const gltf = useLoader(GLTFLoader, '/assets/rocks.glb');
  const rockMeshes = useRef([]);
  const { scene } = useThree();
  const [decals, setDecals] = useState([]);

  useImperativeHandle(ref, () => ({
    paintOnRock: (position, normal, color, size) => {
      const positionVector = new Vector3(position.x, position.y, position.z);
      const normalVector = new Vector3(normal.x, normal.y, normal.z);
    
      // Check if there is already a decal at this position, if there is don't paint
      const existingDecal = decals.find(decal => decal.position.distanceTo(positionVector) < 0.01);
      if (existingDecal) {
        console.log('Decal already exists at this position');
        return;
      }
    
      const decalGeometry = new PlaneGeometry(size, size);
      const decalMaterial = new MeshBasicMaterial({ 
        color: color, 
        transparent: true, 
        opacity: 0.8,
        depthTest: true,
        depthWrite: false,
        side: DoubleSide
      });
    
      const decal = new Mesh(decalGeometry, decalMaterial);
    
      // Positioning and orienting the decal
      decal.position.copy(positionVector);
      decal.lookAt(positionVector.clone().add(normalVector));
      decal.renderOrder = 1;
    
      setDecals(prevDecals => [...prevDecals, decal]);
    },    
    findRockIndex: (mesh) => {
      return rockMeshes.current.findIndex(rock => rock.mesh === mesh);
    }
  }));

  useEffect(() => {
    gltf.scene.children.forEach((child) => {
      if (child.isMesh) {
        child.material = new MeshStandardMaterial({
          color: child.material.color,
          side: DoubleSide
        });
      }
    });

    const updateBoundingBoxes = () => {
      rockMeshes.current = gltf.scene.children
        .filter(child => child.isMesh)
        .map(mesh => {
          const box = new Box3().setFromObject(mesh);
          return { mesh, box };
        });
      if (onUpdate) {
        onUpdate(rockMeshes.current);
      }
    };

    updateBoundingBoxes();
    scene.add(gltf.scene);

    return () => {
      scene.remove(gltf.scene);
      decals.forEach(decal => scene.remove(decal));
    };
  }, [gltf.scene, onUpdate, scene]);

  useEffect(() => {
    // Add new decals to the scene
    decals.forEach(decal => {
      if (!scene.children.includes(decal)) {
        scene.add(decal);
        console.log(decal);
      }
    });

    // Clean up function to remove decals when component unmounts
    return () => {
      decals.forEach(decal => scene.remove(decal));
    };
  }, [decals, scene]);

  return null;
});

export default Rocks;