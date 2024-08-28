import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function Plane() {
    const gltf = useLoader(GLTFLoader, '/assets/plane.glb');
    return <primitive object={gltf.scene} />;
}

export default Plane;