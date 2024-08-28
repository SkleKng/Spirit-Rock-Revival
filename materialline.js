const materials = gltf.scene.children.map(child => {
    if (child.isMesh) {
      child.material = new MeshStandardMaterial({ color: 0xffffff, side: DoubleSide }); // Ensure double-sided rendering
    }
    return child;
  });