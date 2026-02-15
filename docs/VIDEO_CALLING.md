# Video Calling System

## Overview

A comprehensive video calling interface built with Stream Video SDK and Next.js. The system provides a complete meeting experience with real-time video/audio communication.

## Features

### 1. **Waiting Room**
- Preview before joining
- Microphone and camera controls
- Device testing interface

### 2. **Call Interface**
- Dynamic participant grid (supports 1-9+ participants)
- Real-time video tiles with participant names
- Adaptive grid layout based on participant count

### 3. **Call Controls**
- 🎤 Microphone toggle (mute/unmute)
- 📹 Camera toggle (on/off)
- 🖥️ Screen sharing
- ⚙️ Settings access
- 📞 Leave call

### 4. **Call Header**
- Meeting title display
- ⏱️ Live call duration timer
- 👥 Active participant count
- 🔴 Recording indicator (when active)
- Meeting actions dropdown

## Components

### CallProvider
Manages Stream Video client initialization and authentication:
- User authentication via TRPC
- Token generation
- Client connection management
- Loading states

### CallView
Main container component:
- Meeting data fetching
- Call room orchestration
- State management

### CallRoom
Handles call lifecycle:
- Join/leave logic
- Loading states
- Waiting room transition
- Call UI rendering

### CallControls
Bottom control bar with:
- Device control buttons
- Visual feedback for states
- Tooltips for actions
- Leave call functionality

### CallHeader
Top bar with:
- Meeting information
- Call duration
- Participant count
- Recording status
- Actions menu

### ParticipantGrid
Adaptive video grid:
- Dynamic layout (1-9+ participants)
- Participant name overlay
- Video tile rendering
- Responsive sizing

### WaitingRoom
Pre-call interface:
- Device preview
- Camera/mic controls
- Join button
- Meeting info display

## Technology Stack

- **Stream Video SDK**: Real-time video/audio communication
- **Next.js**: Server-side rendering and routing
- **TRPC**: Type-safe API communication
- **TanStack Query**: Data fetching and caching
- **Radix UI**: Accessible UI components
- **Tailwind CSS**: Styling

## Usage

### Navigate to a Meeting
```
/call/[meetingId]
```

### Flow
1. User navigates to meeting URL
2. CallProvider initializes Stream client
3. WaitingRoom displays for device setup
4. User clicks "Join meeting"
5. Call interface loads with participant grid
6. Controls available at bottom
7. Header shows meeting info
8. User can leave anytime

## File Structure

```
src/modules/call/ui/
├── components/
│   ├── call-provider.tsx      # Stream client setup
│   ├── call-controls.tsx      # Bottom controls bar
│   ├── call-header.tsx        # Top info bar
│   ├── participant-grid.tsx   # Video grid layout
│   ├── waiting-room.tsx       # Pre-call screen
│   └── index.ts               # Exports
└── views/
    └── call-view.tsx          # Main view component
```

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_STREAM_VIDEO_API_KEY=your_api_key
STREAM_VIDEO_SECRET_KEY=your_secret_key
```

## API Integration

### TRPC Procedures Used:
- `meetings.generateToken` - Creates user token for Stream
- `meetings.getOne` - Fetches meeting details

## Future Enhancements

- [ ] Settings panel for device selection
- [ ] Chat sidebar
- [ ] Participant management (pin, spotlight)
- [ ] Virtual backgrounds
- [ ] Reactions and emoji
- [ ] Hand raise feature
- [ ] Recording controls
- [ ] Breakout rooms
- [ ] Meeting transcription display
- [ ] AI agent integration in call
