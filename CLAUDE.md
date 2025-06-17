# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production (runs TypeScript build first)
- `npm run lint` - Run ESLint on all files
- `npm run preview` - Preview production build locally

### Build Process
The build process runs `tsc -b && vite build` which first compiles TypeScript then builds with Vite.

## Architecture Overview

### Core Architecture
This is a React-based Pomodoro timer application built with:
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: React Context (TimerContext) with localStorage persistence
- **Notifications**: Browser Notification API

### Key State Management
The entire application state is managed through `TimerContext` (`src/contexts/TimerContext.tsx`) which provides:
- Timer CRUD operations
- Active timer state (running/paused/stopped)
- Break timer functionality (automatic breaks after timer completion)
- Daily usage limits and resets
- Drag-and-drop reordering
- Notification permissions and browser notifications

### Timer System Design
- **TimerData**: Configuration for each timer (duration, daily limit, color, position)
- **ActiveTimer**: Currently running timer state with countdown
- **TimerBreak**: Automatic break periods after timer completion
- **Daily Reset**: Usage counts reset at midnight based on `lastResetDay`

### Component Structure
- `Dashboard` - Main container with drag-and-drop state
- `TimerGrid` - Grid layout with sortable timer cards
- `TimerCard` - Individual timer with controls and progress
- `TimerForm` - Create/edit timer modal
- `TimerBreak` - Full-screen break overlay
- `Header` - Top navigation and global controls

### File Organization
- `src/types/timer.ts` - Core TypeScript interfaces
- `src/contexts/TimerContext.tsx` - Central state management
- `src/components/` - All React components organized by feature
- `src/utils/` - Utility functions (state management, common helpers)
- `src/components/ui/` - shadcn/ui components (do not modify these)

### Key Features
- Multiple concurrent timers with individual settings
- Drag-and-drop reordering with visual feedback
- Automatic break periods with notifications  
- Daily usage limits that reset at midnight
- Browser notifications for timer/break completion
- LocalStorage persistence
- Dark/light theme support
- Responsive design

### Import Aliases
Uses `@/` alias for `src/` directory. All imports use this pattern.

### Browser APIs Used
- Notification API for desktop notifications
- LocalStorage for state persistence
- setInterval for timer countdown logic