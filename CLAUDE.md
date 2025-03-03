# Party-Pipe Development Guide

## Build Commands
- `npm run dev` - Start Next.js development server
- `npm run partykit:dev` - Start PartyKit development server
- `npm run dev:all` - Start both Next.js and PartyKit servers
- `npm run build` - Build the application
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checker
- `npm test` - Run all tests
- `npm test -- __tests__/classification.test.ts` - Run a specific test file
- `npm run partykit:deploy` - Deploy PartyKit server

## Code Style Guidelines
- **Imports**: Use `@/` for importing from local app code
- **Files/Folders**: Use kebab-case, unless conventional for the framework
- **Types**: Place in `lib/types`, export from `index.ts`, prefer interfaces
- **Components**: React functional components with explicit type annotations
- **Hooks**: Custom hooks in `hooks/` directory with `use` prefix
- **Error Handling**: Use try/catch with descriptive error messages
- **State Management**: React state/context for UI, server-side for persistence
- **API**: Use Next.js server actions for API endpoints
- **Testing**: Use Vitest for unit/integration tests

## Project Structure
- `app/` - Next.js app router routes and components
- `components/` - Shared UI components
- `hooks/` - Custom React hooks
- `lib/` - Utility functions and types
- `party-server/` - PartyKit server for real-time functionality
- `__tests__/` - Test files