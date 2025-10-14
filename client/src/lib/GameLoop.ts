import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export interface GameLoopCallbacks {
  onUpdate?: (deltaTime: number) => void;
  onFixedUpdate?: () => void;
  onRender?: () => void;
}

export interface GameLoopState {
  isPaused: boolean;
  timeScale: number;
  frameCount: number;
  fps: number;
  deltaTime: number;
}

/**
 * Core game loop that handles timing, updates, and rendering
 */
export function useGameLoop(callbacks: GameLoopCallbacks) {
  const stateRef = useRef<GameLoopState>({
    isPaused: false,
    timeScale: 1.0,
    frameCount: 0,
    fps: 60,
    deltaTime: 0
  });
  
  const fixedTimeStep = 1 / 60; // 60 FPS fixed updates
  const accumulatorRef = useRef(0);
  const lastTimeRef = useRef(0);
  const fpsCounterRef = useRef({ frames: 0, lastTime: 0 });
  
  useFrame((state, delta) => {
    const currentTime = state.clock.getElapsedTime();
    
    // Update FPS counter
    fpsCounterRef.current.frames++;
    if (currentTime - fpsCounterRef.current.lastTime >= 1.0) {
      stateRef.current.fps = fpsCounterRef.current.frames;
      fpsCounterRef.current.frames = 0;
      fpsCounterRef.current.lastTime = currentTime;
    }
    
    if (stateRef.current.isPaused) {
      return;
    }
    
    const scaledDelta = delta * stateRef.current.timeScale;
    stateRef.current.deltaTime = scaledDelta;
    stateRef.current.frameCount++;
    
    // Variable update - called every frame
    if (callbacks.onUpdate) {
      callbacks.onUpdate(scaledDelta);
    }
    
    // Fixed update - called at fixed intervals
    if (callbacks.onFixedUpdate) {
      accumulatorRef.current += scaledDelta;
      
      while (accumulatorRef.current >= fixedTimeStep) {
        callbacks.onFixedUpdate();
        accumulatorRef.current -= fixedTimeStep;
      }
    }
    
    // Render callback
    if (callbacks.onRender) {
      callbacks.onRender();
    }
    
    lastTimeRef.current = currentTime;
  });
  
  return {
    pause: () => { stateRef.current.isPaused = true; },
    resume: () => { stateRef.current.isPaused = false; },
    setTimeScale: (scale: number) => { stateRef.current.timeScale = scale; },
    getState: () => stateRef.current
  };
}

/**
 * Input manager for keyboard and mouse
 */
export class InputManager {
  private keys: Set<string> = new Set();
  private mousePosition = { x: 0, y: 0 };
  private mouseButtons: Set<number> = new Set();
  
  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('keyup', this.handleKeyUp);
      window.addEventListener('mousemove', this.handleMouseMove);
      window.addEventListener('mousedown', this.handleMouseDown);
      window.addEventListener('mouseup', this.handleMouseUp);
    }
  }
  
  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys.add(e.code);
  };
  
  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };
  
  private handleMouseMove = (e: MouseEvent) => {
    this.mousePosition = { x: e.clientX, y: e.clientY };
  };
  
  private handleMouseDown = (e: MouseEvent) => {
    this.mouseButtons.add(e.button);
  };
  
  private handleMouseUp = (e: MouseEvent) => {
    this.mouseButtons.delete(e.button);
  };
  
  isKeyPressed(code: string): boolean {
    return this.keys.has(code);
  }
  
  isMouseButtonPressed(button: number): boolean {
    return this.mouseButtons.has(button);
  }
  
  getMousePosition() {
    return { ...this.mousePosition };
  }
  
  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
      window.removeEventListener('mousemove', this.handleMouseMove);
      window.removeEventListener('mousedown', this.handleMouseDown);
      window.removeEventListener('mouseup', this.handleMouseUp);
    }
  }
}

/**
 * State machine for managing game states
 */
export class StateMachine<T extends string> {
  private currentState: T;
  private states: Map<T, StateDefinition>;
  private transitionCallbacks: Map<string, () => void> = new Map();
  
  constructor(initialState: T) {
    this.currentState = initialState;
    this.states = new Map();
  }
  
  addState(state: T, definition: StateDefinition) {
    this.states.set(state, definition);
  }
  
  transition(newState: T) {
    const current = this.states.get(this.currentState);
    if (current?.onExit) {
      current.onExit();
    }
    
    const transitionKey = `${this.currentState}->${newState}`;
    const callback = this.transitionCallbacks.get(transitionKey);
    if (callback) {
      callback();
    }
    
    this.currentState = newState;
    
    const next = this.states.get(newState);
    if (next?.onEnter) {
      next.onEnter();
    }
  }
  
  update(deltaTime: number) {
    const state = this.states.get(this.currentState);
    if (state?.onUpdate) {
      state.onUpdate(deltaTime);
    }
  }
  
  getCurrentState(): T {
    return this.currentState;
  }
  
  onTransition(from: T, to: T, callback: () => void) {
    this.transitionCallbacks.set(`${from}->${to}`, callback);
  }
}

export interface StateDefinition {
  onEnter?: () => void;
  onUpdate?: (deltaTime: number) => void;
  onExit?: () => void;
}

/**
 * Update scheduler for managing different update frequencies
 */
export class UpdateScheduler {
  private tasks: Map<string, ScheduledTask> = new Map();
  
  addTask(id: string, callback: () => void, interval: number) {
    this.tasks.set(id, {
      callback,
      interval,
      lastRun: 0,
      enabled: true
    });
  }
  
  removeTask(id: string) {
    this.tasks.delete(id);
  }
  
  update(currentTime: number) {
    this.tasks.forEach((task, id) => {
      if (!task.enabled) return;
      
      if (currentTime - task.lastRun >= task.interval) {
        task.callback();
        task.lastRun = currentTime;
      }
    });
  }
  
  enableTask(id: string) {
    const task = this.tasks.get(id);
    if (task) {
      task.enabled = true;
    }
  }
  
  disableTask(id: string) {
    const task = this.tasks.get(id);
    if (task) {
      task.enabled = false;
    }
  }
}

interface ScheduledTask {
  callback: () => void;
  interval: number;
  lastRun: number;
  enabled: boolean;
}
