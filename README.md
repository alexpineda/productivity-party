# Productivity Party

A real-time collaboration and productivity tracking platform powered by PartyKit server and Screenpipe.

<!-- <img width="1312" alt="screenshot of component playground" src="https://github.com/user-attachments/assets/3e5abd07-0a3c-4c3b-8351-5107beb4fb10"> -->

## Features

- **Real-time collaboration**: Connected experiences via PartyKit server
- **Productivity tracking**: Monitor and classify productivity metrics
- **Leaderboard**: Track achievements and scores
- **Chat**: Real-time messaging between users
- **Debug tools**: Server health monitoring and diagnostics
- **Server Health Monitoring**: Track PartyKit server status, connections, and performance

## Components

### Client-Side

- Next.js application with React components
- Real-time data hooks and utilities
- Productivity classification and tracking
- UI components for displaying server health and status

### Server-Side

- PartyKit server for real-time functionality
- Health check endpoint for monitoring
- Connection management and state synchronization
- TTL cache for efficient data storage

## Getting Started

1. Install dependencies: `npm install`
2. Start development servers:
   - Next.js: `npm run dev`
   - PartyKit: `npm run partykit:dev`
   - Both: `npm run dev:all`
3. Access the debug tools at `/debug` to monitor server health and status

## Development

Check the `CLAUDE.md` file for detailed development guidelines including:

- Build commands
- Code style guidelines
- Project structure
- Testing procedures
