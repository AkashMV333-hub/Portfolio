import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

const App = () => {
  const [currentSection, setCurrentSection] = useState(0);

  // Persistent refs
  const cameraRef = useRef();
  const mesh2Ref = useRef();
  const mesh3Ref = useRef();
  const scrollYRef = useRef(0);
  const cameraZRef = useRef(4); // Start camera z at 4


  useEffect(() => {
    // STEP 1: Canvas
    const canvas = document.querySelector(".webgl");

    // STEP 2: Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // STEP 3: Scene
    const scene = new THREE.Scene();

    // STEP 4: Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.z = 4;
    scene.add(camera);
    cameraRef.current = camera;

    // STEP 5: Meshes
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material1 = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const material2 = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const material3 = new THREE.MeshStandardMaterial({ color: 0x0000ff });

    const mesh1 = new THREE.Mesh(geometry, material1);
    const mesh2 = new THREE.Mesh(geometry, material2);
    const mesh3 = new THREE.Mesh(geometry, material3);

    mesh2.position.z = -4;
    mesh3.position.z = -8;

    scene.add(mesh1, mesh2, mesh3);

    // Planet-like ground
    const groundGeometry = new THREE.CircleGeometry(20, 64);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      side: THREE.DoubleSide,
    });
    // Remove texture and rely on material color only
    groundMaterial.map = null;

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    scene.add(ground);

    mesh2Ref.current = mesh2;
    mesh3Ref.current = mesh3;

    // STEP 6: Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Fog for depth effect
    scene.fog = new THREE.Fog(0x000000, 5, 15);

    // Directional light (like a sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 2);
    scene.add(directionalLight);


    // STEP 7: Particles
    const particlesCount = 200;
    const positions = new Float32Array(particlesCount * 3); // x, y, z for each
    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 10; // Random range -5 to 5
    }
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.02,
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // STEP 7: Renderer
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000); // Space-black background

    // STEP 8: Animate Loop
    const animate = () => {

      const time = performance.now() * 0.001;

      // 👇 Add this line here
      camera.position.y = Math.sin(time * 2) * 0.05;

      // Smoothly interpolate camera Z
      const targetZ = 4 - (scrollYRef.current / window.innerHeight) * 10;
      cameraZRef.current = THREE.MathUtils.lerp(cameraZRef.current, targetZ, 0.05);
      camera.position.z = cameraZRef.current;

      // Optional: rotate meshes
      mesh1.rotation.y += 0.01;
      mesh2.rotation.y += 0.01;
      mesh3.rotation.y += 0.01;

      mesh1.position.y = Math.sin(time) * 0.1;
      mesh2.position.y = Math.sin(time + 1) * 0.1;
      mesh3.position.y = Math.sin(time + 2) * 0.1;


      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };


    animate();

    // Resize handler
    const handleResize = () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // STEP 9: Scroll + GSAP
  useEffect(() => {
    const onScroll = () => {
      scrollYRef.current = window.scrollY;

      const scrollPercent = scrollYRef.current / window.innerHeight;
      const newSection = Math.round(scrollPercent);
      if (newSection !== currentSection) {
        setCurrentSection(newSection);

        if (newSection === 1 && mesh2Ref.current) {
          gsap.to(mesh2Ref.current.rotation, { duration: 1.5, y: "+=6" });
        } else if (newSection === 2 && mesh3Ref.current) {
          gsap.to(mesh3Ref.current.rotation, { duration: 1.5, y: "+=6" });
        }
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [currentSection]);

  return (
    <>
      <canvas className="webgl" />
      {/* Fake height to allow scrolling */}
       <div className="scroll-container" />
    </>
  );
};

export default App;



