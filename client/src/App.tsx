import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { KeyboardControls } from "@react-three/drei";
import { useAudio } from "./lib/stores/useAudio";
import { useGame } from "./lib/stores/useGame";
import { useEnemies } from "./lib/stores/useEnemies";
import { useDungeon } from "./lib/stores/useDungeon";
import { useLoot } from "./lib/stores/useLoot";
import { usePlayer } from "./lib/stores/usePlayer";
import GameScene from "./components/game/GameScene";
import GameUI from "./components/ui/GameUI";
// Using default system fonts instead of @fontsource/inter

// Define control enum for type safety
export enum Controls {
  forward = 'forward',
  backward = 'backward',
  leftward = 'leftward',
  rightward = 'rightward',
  attack = 'attack',
  ability1 = 'ability1',
  ability2 = 'ability2',
  ability3 = 'ability3',
  inventory = 'inventory',
  skills = 'skills',
}

// Define control keys for the game
const controls = [
  { name: Controls.forward, keys: ["KeyW", "ArrowUp"] },
  { name: Controls.backward, keys: ["KeyS", "ArrowDown"] },
  { name: Controls.leftward, keys: ["KeyA", "ArrowLeft"] },
  { name: Controls.rightward, keys: ["KeyD", "ArrowRight"] },
  { name: Controls.attack, keys: ["Space"] },
  { name: Controls.ability1, keys: ["KeyQ"] },
  { name: Controls.ability2, keys: ["KeyE"] },
  { name: Controls.ability3, keys: ["KeyR"] },
  { name: Controls.inventory, keys: ["KeyI"] },
  { name: Controls.skills, keys: ["KeyT"] },
];

// Main App component
function App() {
  const { phase, start } = useGame();
  const { spawnWave } = useEnemies();
  const { generateLevel } = useDungeon();
  const { generateRandomLoot } = useLoot();
  const { level } = usePlayer();
  const [showCanvas, setShowCanvas] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);

  // Check WebGL support (prefer webgl2, fallback to webgl, then experimental-webgl)
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2') || 
                     canvas.getContext('webgl') || 
                     canvas.getContext('experimental-webgl');
      if (!context) {
        setWebglSupported(false);
        console.warn('WebGL not supported');
      } else {
        console.log('WebGL supported:', context.constructor.name);
      }
    } catch (e) {
      setWebglSupported(false);
      console.warn('WebGL not supported:', e);
    }
  }, []);

  // Initialize game
  useEffect(() => {
    if (webglSupported) {
      // Generate initial dungeon level
      generateLevel(1);
      
      // Spawn initial enemies
      spawnWave(1);
      
      // Spawn some initial loot
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const distance = 5 + Math.random() * 10;
        generateRandomLoot({
          x: Math.cos(angle) * distance,
          y: 0.5,
          z: Math.sin(angle) * distance
        }, 1);
      }
      
      // Start the game
      start();
    }
  }, [webglSupported, generateLevel, spawnWave, generateRandomLoot, start]);

  // Initialize audio
  useEffect(() => {
    const audio = new Audio("/sounds/background.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    
    // Start background music after user interaction
    const startAudio = () => {
      audio.play().catch(console.warn);
      document.removeEventListener("click", startAudio);
    };
    
    document.addEventListener("click", startAudio);
    
    return () => {
      audio.pause();
      document.removeEventListener("click", startAudio);
    };
  }, []);

  // Show the canvas once everything is loaded
  useEffect(() => {
    setShowCanvas(true);
  }, []);

  if (!showCanvas) {
    return (
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        color: '#fff',
        fontSize: '24px'
      }}>
        Loading Dungeon Crawler...
      </div>
    );
  }

  if (!webglSupported) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        color: '#fff',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h1 style={{ color: '#ff6b6b', marginBottom: '20px' }}>WebGL Not Supported</h1>
        <p style={{ fontSize: '18px', marginBottom: '10px' }}>
          Your browser doesn't support WebGL, which is required for this 3D dungeon crawler game.
        </p>
        <p style={{ fontSize: '16px', color: '#aaa' }}>
          Please try using a modern browser like Chrome, Firefox, Safari, or Edge.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#4a90e2',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <KeyboardControls map={controls}>
        <Canvas
          shadows
          camera={{
            position: [10, 15, 10],
            fov: 45,
            near: 0.1,
            far: 1000
          }}
          gl={{
            antialias: true,
            powerPreference: "high-performance"
          }}
        >
          <color attach="background" args={["#2a1810"]} />
          
          <Suspense fallback={null}>
            <GameScene />
          </Suspense>
        </Canvas>
        
        <GameUI />
      </KeyboardControls>
    </div>
  );
}

export default App;
