# Overview

This is a 3D isometric action RPG game built with React Three Fiber, featuring dungeon crawling, enemy combat, loot collection, and character progression. The game includes real-time combat mechanics, procedurally generated dungeons, and a comprehensive skill system. The architecture follows a full-stack pattern with Express.js backend, React frontend, and Zustand for state management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React Three Fiber**: 3D rendering engine for the game world, handling player movement, enemy AI, and environmental rendering
- **Zustand State Management**: Multiple stores managing game state including player stats, enemies, dungeon generation, loot system, and audio
- **Radix UI Components**: Comprehensive UI component library for game interface elements like inventory, skill trees, and dialogs
- **Tailwind CSS**: Utility-first styling framework with custom theme configuration for consistent visual design
- **Vite Build System**: Modern bundler with React support, GLSL shader support, and development server with HMR

## Backend Architecture
- **Express.js Server**: RESTful API server with middleware for request logging and error handling
- **Memory Storage**: In-memory data persistence using Map-based storage for user management
- **Modular Route System**: Structured route registration with separation of concerns between storage and HTTP handlers

## Game Systems
- **Component-Based 3D Entities**: Player, enemies, loot, and dungeon elements as separate Three.js components
- **Real-time Combat**: Frame-based collision detection and projectile physics using useFrame hooks
- **Procedural Generation**: Dynamic dungeon layout generation with rooms, walls, and enemy spawning based on player level
- **Character Progression**: Experience-based leveling with skill trees covering combat, magic, and defense specializations
- **Inventory Management**: Equipment system with rarity-based items and stat modifications

## Data Storage
- **PostgreSQL Integration**: Drizzle ORM configured for PostgreSQL with Neon Database serverless connection
- **Schema Management**: Type-safe database schemas with Zod validation for user management
- **Migration System**: Database migration support through Drizzle Kit for schema versioning

## State Management Pattern
- **Zustand Stores**: Separated concerns with dedicated stores for player state, enemies, dungeon generation, loot system, and audio management
- **Local Storage Persistence**: Client-side storage utilities for game progress and settings
- **React Query Integration**: Server state management with caching and error handling for API interactions

# External Dependencies

## Database & ORM
- **Neon Database**: Serverless PostgreSQL database for production deployment
- **Drizzle ORM**: Type-safe database queries and schema management
- **Drizzle Kit**: Database migration and schema generation tools

## 3D Graphics & Audio
- **Three.js**: Core 3D graphics library via React Three Fiber
- **React Three Drei**: Helper components for Three.js including controls, loaders, and utilities
- **React Three Postprocessing**: Visual effects and post-processing pipeline
- **GLSL Shader Support**: Custom shader loading through Vite plugin

## UI Framework
- **Radix UI**: Headless component library for accessible interface elements
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Icon library for UI elements
- **Class Variance Authority**: Component variant management for consistent styling

## Development Tools
- **TypeScript**: Type safety across frontend and backend with shared types
- **Replit Integration**: Development environment optimization with runtime error overlay
- **ESBuild**: Fast bundling for production builds with Node.js server compilation