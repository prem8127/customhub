"use client";

import { Suspense, useEffect, useMemo } from "react";
import { Bounds, Center, ContactShadows, Html, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import { cn } from "@/lib/utils";

type Product3DCanvasProps = {
  modelUrl: string;
  className?: string;
  autoRotate?: boolean;
  backgroundColor?: string;
};

function ProductModel({ modelUrl }: { modelUrl: string }) {
  const gltf = useGLTF(modelUrl);
  const scene = useMemo(() => gltf.scene.clone(), [gltf.scene]);

  useEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }

      child.castShadow = true;
      child.receiveShadow = true;
    });
  }, [scene]);

  return (
    <Center>
      <primitive object={scene} />
    </Center>
  );
}

function ViewerFallback() {
  return (
    <Html center>
      <div className="rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-600 shadow-card">
        Loading 3D model...
      </div>
    </Html>
  );
}

export function Product3DCanvas({
  modelUrl,
  className,
  autoRotate = true,
  backgroundColor = "#f6f7fb"
}: Product3DCanvasProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-soft",
        className
      )}
    >
      <div className="aspect-[4/3] w-full">
        <Canvas
          shadows
          camera={{ position: [0, 0.4, 3.2], fov: 34 }}
          dpr={[1, 1.8]}
          gl={{ antialias: true, alpha: true }}
        >
          <color attach="background" args={[backgroundColor]} />
          <ambientLight intensity={1.1} />
          <directionalLight
            castShadow
            position={[4, 6, 4]}
            intensity={1.9}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <spotLight position={[-4, 5, 2]} intensity={1.2} angle={0.34} penumbra={0.8} />

          <Suspense fallback={<ViewerFallback />}>
            <Bounds fit clip observe margin={1.15}>
              <ProductModel modelUrl={modelUrl} />
            </Bounds>
            <ContactShadows
              position={[0, -1.15, 0]}
              opacity={0.35}
              scale={10}
              blur={2.1}
              far={4.5}
              resolution={1024}
            />
          </Suspense>

          <OrbitControls
            enablePan={false}
            autoRotate={autoRotate}
            autoRotateSpeed={1.2}
            minDistance={1.8}
            maxDistance={4.8}
          />
        </Canvas>
      </div>
    </div>
  );
}
