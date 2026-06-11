import { useEffect, useRef, useState } from 'react'
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import './App.css'
import * as THREE from "three";
import gsap from "gsap";


function App() {
  const [count, setCount] = useState(1)
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const rendererRef = useRef(null);
  const [selectedSphere, setSelectedSphere] = useState(null);
  const [spheres, setSpheres] = useState([]);
  const modelRef = useRef(null);

  useEffect(() => {
    treefunc()
  }, [])

  useEffect(() => {
    focusOn(selectedSphere)
  }, [selectedSphere])

  const treefunc = () => {
    const width = window.screen.width;
    const height = window.screen.height;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    //#region Lightening
    // softer ambient (less flat)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // key light (main light - like sun)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(0, 100, 0);
    keyLight.castShadow = true;

    keyLight.shadow.mapSize.width = 4096;
    keyLight.shadow.mapSize.height = 4096;
    keyLight.shadow.bias = -0.0001;        // try small negative
    keyLight.shadow.normalBias = 0.2;     // VERY important (fixes square artifacts)

    // Increase these until the yellow helper box fully encloses your model
    keyLight.shadow.camera.top = 100;
    keyLight.shadow.camera.bottom = -100;
    keyLight.shadow.camera.left = -100;
    keyLight.shadow.camera.right = 100;

    // Also ensure the 'far' plane is deep enough to reach the back of the model
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 500;

    // Essential: Update the projection matrix after changes
    keyLight.shadow.camera.updateProjectionMatrix();
    scene.add(keyLight);


    // fill light (softens shadows)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-60, 40, 50);
    fillLight.castShadow = false;

    scene.add(fillLight);

    // rim/back light (gives glow outline)
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.7);
    rimLight.castShadow = false;
    rimLight.position.set(-100, 50, -100);
    scene.add(rimLight);

    // Light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.castShadow = false;

    light.position.set(0, 0, 1);
    light.shadow.bias = -0.0001;
    light.shadow.normalBias = 0.02;
    scene.add(light);

    //#endregion 


    // Camera
    const camera = new THREE.PerspectiveCamera(20, width / height, 0.1, 1000);
    camera.position.z = 50;
    camera.position.x = 100
    camera.position.y = 100
    camera.rotation.order = 'YXZ';

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;

    mountRef.current.appendChild(renderer.domElement);

    //#region control
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;     // smooth movement
    controls.dampingFactor = 0.05;

    controls.enableZoom = true;
    controls.enablePan = true;
    controls.enableRotate = true;
    controls.enableDamping = true;
    controls.minAzimuthAngle = -Infinity;
    controls.maxAzimuthAngle = Infinity;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.7;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.minPolarAngle = 0;          // look straight up
    controls.maxPolarAngle = Math.PI;    // look straight down

    controls.target.set(0, 0, 0);
    controls.update();
    //#endregion

    //#region keys
    const keys = {
      forward: false,
      arrowUp: false,
      backward: false,
      arrowDown: false,
      left: false,
      arrowLeft: false,
      right: false,
      arrowRight: false
    };

    const onKeyDown = (e) => {
      // Prevent the page from scrolling when using Arrow keys or Space
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'KeyW') keys.forward = true;
      if (e.code === 'ArrowUp') keys.arrowUp = true;

      if (e.code === 'KeyS') keys.backward = true;
      if (e.code === 'ArrowDown') keys.arrowDown = true;

      if (e.code === 'KeyA') keys.left = true;
      if (e.code === 'ArrowLeft') keys.arrowLeft = true;

      if (e.code === 'KeyD') keys.right = true;
      if (e.code === 'ArrowRight') keys.arrowRight = true;

    };

    const onKeyUp = (e) => {
      if (e.code === 'KeyW') keys.forward = false;
      if (e.code === 'ArrowUp') keys.arrowUp = false;

      if (e.code === 'KeyS') keys.backward = false;
      if (e.code === 'ArrowDown') keys.arrowDown = false;

      if (e.code === 'KeyA') keys.left = false;
      if (e.code === 'ArrowLeft') keys.arrowLeft = false;

      if (e.code === 'KeyD') keys.right = false;
      if (e.code === 'ArrowRight') keys.arrowRight = false;

    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    //#endregion

    const clock = new THREE.Clock();

    // Loader
    const loader = new STLLoader();
    loader.load("/models/3D_Model.stl", (geometry) => {
      // ✅ CENTER the model
      geometry.center();
      geometry.computeVertexNormals(); // VERY IMPORTANT

      const material = new THREE.MeshStandardMaterial({
        color: 0xBBBBBB,
        metalness: 0.5,    // 🔥 FULL metal
        roughness: 0.5,     // 🔥 low = shiny
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;

      mesh.castShadow = true;
      mesh.receiveShadow = true;
      modelRef.current = mesh;
      const newSphere = {
        id: 'model',
        mesh,
        size: 10,
        color: "#ff000000",
      };

      setSpheres((prev) => [...prev, newSphere]);

      scene.add(mesh);
    });


    const moveSpeed = 1.5;    // Units per second
    const rotateSpeed = 0.8;  // Radians per second
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const moveSpeed = 30 * delta;    // Adjust speed
      const rotateSpeed = delta; // Adjust turning sensitivity

      // --- ROTATION (Turning around itself) ---
      if (keys.left) {
        camera.rotation.y += rotateSpeed;
      }
      if (keys.right) {
        camera.rotation.y -= rotateSpeed;
      }

      // --- SLIDE LEFT / RIGHT ---
      if (keys.arrowRight) {
        // .translateX moves the camera along its own local X axis
        camera.translateX(moveSpeed);
      }
      if (keys.arrowLeft) {
        camera.translateX(-moveSpeed);
      }

      // --- LOOK UP / DOWN (Pitch) ---
      if (keys.arrowUp) {
        camera.rotation.x += rotateSpeed;
      }
      if (keys.arrowDown) {
        camera.rotation.x -= rotateSpeed;
      }

      // --- MOVEMENT (Moving Forward/Backward) ---
      if (keys.forward || keys.backward) {
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction); // Gets the vector the camera is facing

        const speed = keys.forward ? moveSpeed : -moveSpeed;
        camera.position.addScaledVector(direction, speed * 2);
      }

      // controls.update(); // required for damping
      renderer.render(scene, camera);
    };
    animate();

    sceneRef.current = scene;
    cameraRef.current = camera
    controlsRef.current = controls
    rendererRef.current = renderer
    // Cleanup
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }


  const focusOn = (sphere) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const model = modelRef.current;
    if (!camera || !controls || !model) return;


    const spherePos = sphere.mesh.position.clone();
    const modelPos = model.position.clone();

    // direction from sphere → model
    const direction = new THREE.Vector3()
      .subVectors(modelPos, spherePos)
      .normalize();


    // place camera so model is behind sphere
    const cameraPos = spherePos.clone().add(
      direction.multiplyScalar(-120)
    );


    gsap.to(camera.position, {
      x: sphere?.id == 'model' ? sphere.mesh.position.x + 50 : cameraPos.x,
      y: sphere?.id == 'model' ? sphere.mesh.position.y + 50 : cameraPos.y,
      z: sphere?.id == 'model' ? sphere.mesh.position.z + 50 : cameraPos.z,
      duration: 1.2,
      ease: "power2.out"
    });

    gsap.to(controls.target, {
      x: spherePos.x,
      y: spherePos.y,
      z: spherePos.z,
      duration: 1.2,
      ease: "power2.out",
      onUpdate: () => controls.update()
    });

    // camera.position.copy(cameraPos);

    // rotate around sphere
    // controls.target.copy(spherePos);
    controls.update();
  };

  // Button handler to add spheres dynamically
  const addSphere = () => {
    const randColor = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: randColor });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      Math.random() * 100 - 50,
      Math.random() * 100 - 50,
      Math.random() * 100 - 50
    );

    sceneRef.current.add(mesh);
    setCount(count + 1)
    const newSphere = {
      id: count,
      mesh,
      size: 5,
      color: randColor,
    };

    setSpheres((prev) => [...prev, newSphere]);
  };
  const removeSphere = (id) => {
    setSpheres((prev) => {
      const sphereToRemove = prev.find((s) => s.id === id);
      if (sphereToRemove) {
        // remove from Three.js scene
        sceneRef.current?.remove(sphereToRemove.mesh);

        // optional: dispose geometry & material (VERY GOOD PRACTICE)
        sphereToRemove.mesh.geometry.dispose();
        sphereToRemove.mesh.material.dispose();

      }

      // remove from state
      return prev.filter((s) => s.id !== id);
    });
  };
  const handleSelectedSphere = (sphere) => {
    if (sphere) setSelectedSphere(sphere)
    else selectedSphereRef.current = null

  }
  const SphereCard = () => {
    const handleSizeChange = (sphere, newSize) => {
      console.log('handleSizeChange', sphere)
      setSpheres((prev) =>
        prev.map((s) => {
          if (s.id === sphere?.id) {
            // update mesh scale
            const scale = newSize / 10;
            s.mesh.scale.set(scale, scale, scale);

            return { ...s, size: newSize };
          }
          return s;
        })
      );
    };

    const handleColorChange = (id, newColor) => {
      setSpheres((prev) =>
        prev.map((s) => {
          if (s.id === id) {
            s.mesh.material.color.set(newColor);
            return { ...s, color: newColor };
          }
          return s;
        })
      );
    };
    return spheres.map((sphere) => (
      <div
        key={sphere.id}
        className={`w-full border-2 rounded-lg p-3 transition-all cursor-pointer shadow-sm 
    ${selectedSphere?.id === sphere.id ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
        onClick={() => handleSelectedSphere(sphere)}
      >
        {/* HEADER */}
        <div className='flex justify-between items-center mb-2'>
          <span className="text-sm font-bold text-gray-700 capitalize">
            {sphere.id === 'model' ? 'Base Model' : `Sphere ${sphere.id}`}
          </span>

          {sphere.id !== 'model' && (
            <button
              className="text-gray-400 hover:text-red-500 text-lg leading-none"
              onClick={(e) => {
                e.stopPropagation();
                removeSphere(sphere.id);
              }}
            >
              &times;
            </button>
          )}
        </div>

        {/* CONTROLS - Stacked Vertically */}
        {sphere.id !== 'model' && (
          <div className="space-y-3" onClick={(e) => e.stopPropagation()}>

            {/* SIZE SECTION */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-gray-400 uppercase font-bold">Radius</label>
                <span className="text-[10px] font-mono font-bold text-green-700">{sphere.size}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                value={sphere.size}
                onChange={(e) => handleSizeChange(sphere, e.target.value)}
              />
            </div>

            {/* COLOR SECTION */}
            <div className="flex items-center justify-between pt-1 border-t border-gray-100">
              <label className="text-[10px] text-gray-400 uppercase font-bold">Material</label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-gray-500">{sphere.color}</span>
                <input
                  type="color"
                  className="w-5 h-5 p-0 border-none cursor-pointer bg-transparent"
                  value={sphere.color}
                  onChange={(e) => handleColorChange(sphere.id, e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    ))

  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-100">
      {/* SIDEBAR CONTAINER */}
      <div className="w-64 h-full border-r-2 border-gray-100 bg-gray-50/50 shadow-inner flex flex-col">

        {/* SCROLLABLE LIST */}
        <div className='flex flex-col gap-2 overflow-y-auto p-3 custom-scrollbar flex-grow'>

          {/* ADD BUTTON - Now spans width or fits at the top */}
          <button
            onClick={addSphere}
            className="flex-shrink-0 flex flex-row items-center justify-center gap-2 w-full py-3 mb-2 border-2 border-dashed border-green-300 bg-white hover:bg-green-50 hover:border-green-500 text-green-600 rounded-lg transition-all group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">+</span>
            <span className="text-xs font-bold uppercase tracking-wider">Add Sphere</span>
          </button>

          {/* LIST OF CARDS */}
          <div className="flex flex-col gap-2" style={{ minWidth: "184px" }}>
            <SphereCard />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT / CANVAS AREA */}
      <div
        ref={mountRef}
        id='tree'
        className="flex-grow"
        style={{
          height: "100%",
          border: "1px solid #ccc",
        }}
      ></div>
    </div>


  )
}

export default App
