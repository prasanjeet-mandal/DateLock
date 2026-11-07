import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const COLLEGES_DATA = [
  { id: 'iitr', name: 'IIT Roorkee', count: 18, color: '#ff2d87' },
  { id: 'coer', name: 'COER University', count: 14, color: '#ff77a9' },
  { id: 'quantum', name: 'Quantum University', count: 12, color: '#ff007f' },
  { id: 'kldav', name: 'KLDAV PG College', count: 8, color: '#fda4af' },
  { id: 'bsm', name: 'BSM PG College', count: 7, color: '#f472b6' },
  { id: 'rit', name: 'RIT Roorkee', count: 10, color: '#fb7185' },
  { id: 'motherhood', name: 'Motherhood Univ', count: 6, color: '#f43f5e' },
  { id: 'haridwar', name: 'Haridwar Univ', count: 9, color: '#d946ef' },
  { id: 'phonics', name: 'Phonics Group', count: 5, color: '#e879f9' }
];

export default function CampusSphere3D({ onSelectCollege, selectedCollegeId }) {
  const containerRef = useRef(null);
  const [hoveredCollege, setHoveredCollege] = useState(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch (e) {
      return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 24;

    // College Nodes Group
    const group = new THREE.Group();
    scene.add(group);

    // Center Core Globe Wireframe in Rose Pink
    const coreGeo = new THREE.SphereGeometry(6, 24, 24);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x831843,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const coreSphere = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreSphere);

    // Place 9 College Spheres orbiting
    const collegeMeshes = [];
    const collegeCount = COLLEGES_DATA.length;

    COLLEGES_DATA.forEach((col, idx) => {
      const phi = Math.acos(-1 + (2 * idx) / collegeCount);
      const theta = Math.sqrt(collegeCount * Math.PI) * phi;
      const radius = 9;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      const sphereGeo = new THREE.SphereGeometry(1.15, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(col.color),
        transparent: true,
        opacity: 0.9
      });
      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.position.set(x, y, z);
      mesh.userData = col;

      group.add(mesh);
      collegeMeshes.push(mesh);

      // Connecting line to center in pink tint
      const lineMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(col.color),
        transparent: true,
        opacity: 0.3
      });
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, y, z)
      ]);
      const line = new THREE.Line(lineGeo, lineMat);
      group.add(line);
    });

    // Raycaster for click/hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(collegeMeshes);

      if (intersects.length > 0) {
        setHoveredCollege(intersects[0].object.userData);
        container.style.cursor = 'pointer';
      } else {
        setHoveredCollege(null);
        container.style.cursor = 'default';
      }
    };

    const onClick = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(collegeMeshes);
      if (intersects.length > 0) {
        onSelectCollege && onSelectCollege(intersects[0].object.userData.id);
      }
    };

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerdown', onClick);

    // Animation loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      group.rotation.y += 0.005;
      group.rotation.x += 0.002;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerdown', onClick);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      coreGeo.dispose();
      coreMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[320px] sm:h-[400px] rounded-3xl glass-panel-elevated overflow-hidden border border-pink-500/25 flex items-center justify-center">
      <div ref={containerRef} className="w-full h-full" />

      {/* Hover info tooltip */}
      {hoveredCollege && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl bg-black/85 backdrop-blur-md border border-pink-500/50 text-center pointer-events-none shadow-glow-pink">
          <div className="text-sm font-bold text-white">{hoveredCollege.name}</div>
          <div className="text-xs text-pink-300 font-medium">{hoveredCollege.count} Demo Students Enrolled</div>
        </div>
      )}

      {/* Help Badge */}
      <div className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-pink-500/10 border border-pink-500/20 text-xs text-pink-300 pointer-events-none">
        🌸 Drag & click campus spheres to filter
      </div>
    </div>
  );
}
