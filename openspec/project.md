# Project Context

## Purpose

Cerebro is a real-time operations dashboard and AI-powered marketplace simulation system. It consists of two integrated components:

1. **AI Mock Simulator (Backend)**: Generates realistic marketplace data streams using pre-defined scenarios (no AI required). Manages 50 interconnected data streams, external events, and scenario orchestration.

2. **Operations Dashboard (Frontend)**: Visualizes real-time data streams, displays AI-generated insights and recommendations, and provides interactive analysis tools powered by OpenAI.

The system demonstrates AI-powered operations monitoring with realistic data generation, intelligent analysis, and real-time visualization for a tutoring marketplace platform.

## Tech Stack

### Core Framework
- **SvelteKit** (`^2.47.1`): Modern full-stack framework with SSR + SPA capabilities
- **TypeScript** (`^5.9.3`): Type-safe development
- **Svelte 5**: Using runes for fine-grained reactivity

### Frontend Libraries
- **Apache ECharts** (`^5.5.0`): Time-series charting and visualization
- **shadcn-svelte**: UI component library with Radix primitives
- **Tailwind CSS** (`^4.1.14`): Utility-first CSS framework
- **Lucide Svelte**: Icon library

### AI & Backend
- **AI SDK** (`^5.0.89`): AI integration framework
- **@ai-sdk/openai** (`^2.0.64`): OpenAI integration for Dashboard AI Contextualizer
- **ws** (`^8.18.3`): WebSocket server implementation

### Development Tools
- **Vite** (`^7.1.10`): Build tool and dev server
- **ESLint** + **Prettier**: Code quality and formatting
- **TypeScript ESLint**: TypeScript linting

### Deployment
- **Railway.app** or **Render**: Hosting platforms with native WebSocket support
- **@sveltejs/adapter-node**: SvelteKit adapter for Node.js runtime (works with Railway and Render)

## Project Conventions

### Code Style

- **Formatting**: Prettier with default configuration
- **Linting**: ESLint with Svelte plugin
- **Naming**: 
  - Files: kebab-case (e.g., `stream-generator.ts`)
  - Components: PascalCase (e.g., `TimeSeriesChart.svelte`)
  - Functions/variables: camelCase
  - Types/interfaces: PascalCase
- **Imports**: Organized by type (external → internal → types)
- **Comments**: Use JSDoc for public APIs, inline comments for complex logic

### Architecture Patterns

#### Component Structure
```
/routes
  /dashboard         - Main operations dashboard page
  /admin             - Admin UI for scenario control
/lib
  /components
    /dashboard       - Dashboard-specific components
    /ui              - Reusable UI components (shadcn-svelte)
  /stores            - Svelte runes stores for state management
  /ai-contextualizer - Dashboard AI logic and prompts
  /utils             - Utility functions
/api
  /simulation        - Simulator control endpoints
  /dashboard         - Dashboard utility endpoints
```

#### State Management
- **Svelte Runes**: Use `$state`, `$derived`, `$effect` for reactive state
- **Stores**: Create runes-based stores for:
  - WebSocket connection state
  - Stream data aggregation
  - UI filters and selections
  - Chart zoom/pan state
  - Recommendations state

#### Data Flow
1. **Real-time**: WebSocket → Data Aggregator → Stores → UI Components
2. **Historical**: API → Data Cache → Merge with Real-time → UI
3. **AI Recommendations**: Anomaly Detection → AI Context → OpenAI → Recommendations Store → UI

#### API Patterns
- **REST**: Use SvelteKit API routes (`/api/*`)
- **WebSocket**: Server-side handler in `hooks.server.ts`
- **Error Handling**: Consistent error response format (see API_CONTRACT.md)
- **Type Safety**: Shared TypeScript interfaces between frontend/backend

### Testing Strategy

**Current**: Manual testing during development  
**Future**: 
- Unit tests for utility functions
- Integration tests for API endpoints
- E2E tests for critical user flows
- Mock WebSocket server for frontend testing

### Git Workflow

- **Branching**: `main` branch for production-ready code
- **Commits**: Conventional commits preferred (feat:, fix:, docs:, etc.)
- **PRs**: Required for all changes (except hotfixes)
- **OpenSpec**: Use openspec for change proposals (see `openspec/AGENTS.md`)

## Domain Context

### System Overview

The system simulates a tutoring marketplace with 50 interconnected data streams representing:
- **Customer (Student) Streams** (10): Signups, logins, searches, bookings
- **Tutor (Supplier) Streams** (10): Availability, profiles, onboarding
- **Session (Transaction) Streams** (12): Booking requests, confirmations, cancellations
- **Support & Operations Streams** (8): Tickets, escalations, resolutions
- **Marketing Streams** (5): Tutor recruiting, campaigns
- **System Health Streams** (5): Performance, errors, infrastructure

### Key Concepts

#### Streams
- Each stream represents a specific event type (e.g., `customer.tutor.search`)
- Streams have cadences (high/medium/low frequency)
- Streams have relationships (cascading effects, correlations)
- Streams are normalized to 0-100 scale (50 = baseline mean)

#### Scenarios
- Pre-defined JSON configurations that modify stream behavior
- Include stream modifiers (multipliers, overrides)
- Inject external events (academic, marketing, operational)
- Support cascade effects (one stream affecting another)
- Have lifecycle: active → settling → settled

#### External Events
- Marketplace events that impact streams (e.g., "IB Exam Season begins")
- Types: marketing, product, infrastructure, academic, competitive, operational
- Can be causal (affects streams) or non-causal (red herrings)
- Include expected impact metadata

#### Dashboard AI Contextualizer
- Separate AI system (OpenAI) that analyzes data patterns
- Generates proactive recommendations based on anomalies
- Explains causation (which events caused which changes)
- Different from simulator (analysis vs orchestration)

### Data Models

See `docs/API_CONTRACT.md` for complete type definitions:
- `StreamEvent`: Real-time stream data
- `ExternalEvent`: Marketplace events
- `ScenarioModifier`: Active scenario configuration
- `Recommendation`: AI-generated insights
- `StreamBaseline`: Statistical baseline data

### Stream Relationships

Streams have cascading relationships:
- `customer.tutor.search` → `session.booking.requested` → `session.booking.confirmed`
- `session.booking.expired` → `support.ticket.created`
- `tutor.availability.set` affects `session.booking.requested` success rate

See `docs/STREAM_DEFINITIONS.md` for complete stream schemas and relationships.

## Important Constraints

### Current Limitations (Demo)
- **No Authentication**: Admin UI and API endpoints are unauthenticated
- **No Rate Limiting**: API endpoints have no rate limits
- **Single Scenario**: Only one scenario can be active at a time
- **Desktop Only**: Dashboard optimized for desktop (not mobile-responsive)
- **In-Memory Storage**: Historical data stored in memory (not persistent)

### Technical Constraints
- **WebSocket Connections**: Support 10-20 concurrent connections
- **Memory Usage**: ~50MB baseline + 1MB per WebSocket connection
- **Data Volume**: 30-day historical data ~3MB
- **Real-time Throughput**: ~20-30 events/second peak load

### Business Constraints
- **Demo Purpose**: System is for demonstration/education, not production use
- **Synthetic Data**: All data is generated, no real user information
- **OpenAI API**: Requires API key for Dashboard AI (simulator uses pre-defined scenarios)

## External Dependencies

### APIs
- **OpenAI API**: Required for Dashboard AI Contextualizer
  - Environment variable: `OPENAI_API_KEY`
  - Used for: Analyzing patterns, generating recommendations
  - Cost: Pay-per-use (monitor usage)

### Services
- **Railway.app**: Hosting platform
  - Environment: Production deployment
  - Features: Native WebSocket support, auto-scaling
  - Environment variables: `PORT` (auto-assigned), `NODE_ENV=production`

### Data Files
- **Baseline Historical Data**: Pre-generated 30-day baseline (~3MB)
- **Baseline Statistics**: Calculated statistics (~50KB)
- **External Events Timeline**: 30-day events (~20KB)
- **Scenario Definitions**: Pre-defined scenario configurations
- **Stream Definitions**: Complete stream schemas and relationships

### Documentation References
- `docs/ARCHITECTURE-2.md`: Complete system architecture
- `docs/API_CONTRACT.md`: API and WebSocket protocol specifications
- `docs/STREAM_DEFINITIONS.md`: All 50 stream schemas
- `docs/SCENARIO_DEFINITIONS.md`: Scenario structure and examples
- `docs/dashboard-tasks.md`: Dashboard implementation tasks
- `docs/ai-mock-simulator-tasks.md`: Simulator implementation tasks

## Development Workflow

### Starting Development
1. Install dependencies: `pnpm install`
2. Set up environment variables (`.env`):
   - `OPENAI_API_KEY` (for Dashboard AI)
3. Start dev server: `pnpm dev`
4. Access:
   - Dashboard: `http://localhost:5173/dashboard`
   - Admin UI: `http://localhost:5173/admin`

### Making Changes
1. **Small changes** (bug fixes, typos): Fix directly
2. **Feature changes**: Create openspec proposal (see `openspec/AGENTS.md`)
3. **Breaking changes**: Always create openspec proposal
4. **Architecture changes**: Create openspec proposal with design.md

### Testing
- Manual testing in browser
- Check WebSocket connection in browser DevTools
- Verify API responses match contract (see `docs/API_CONTRACT.md`)
- Test scenario activation and reset flows

### Deployment
- Push to `main` branch triggers Railway deployment
- Check Railway logs for errors
- Verify WebSocket connections work in production
- Monitor OpenAI API usage

## OpenSpec Integration

This project uses OpenSpec for change management. See `openspec/AGENTS.md` for:
- How to create change proposals
- Spec format and conventions
- Validation and approval process
- Archiving completed changes

**Key Commands**:
- `openspec list`: List active changes
- `openspec list --specs`: List capabilities
- `openspec show [item]`: View change or spec details
- `openspec validate [change] --strict`: Validate change proposal
- `openspec archive [change-id] --yes`: Archive completed change
