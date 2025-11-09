# Dashboard Tasks - Grouped for Efficient Development

This document reorganizes the tasks into logical chunks that can be worked on together for more efficient development.

## Project Overview
Building the real-time operations dashboard that visualizes marketplace data streams, displays AI-generated recommendations, and provides interactive analysis tools. This dashboard connects to the AI Mock Simulator backend and features a separate Dashboard AI Contextualizer that analyzes data and provides insights.

**Tech Stack**: SvelteKit + TypeScript, shadcn-svelte UI components, Apache ECharts for charting, Svelte Runes for state management, AI SDK with OpenAI, Railway.app deployment

**Key Features**:
- Normalized time-series chart with interactive stream selection (Apache ECharts)
- Interactive heatmap for 50 streams (color-coded by variance, pulsing anomalies)
- External events timeline (clickable, filterable, with links)
- Proactive AI recommendations panel (prioritized, with actions)
- Real-time WebSocket data streaming
- Desktop-only responsive design
- Dashboard AI Contextualizer for proactive recommendations

**Note**: This document covers the FRONTEND/DASHBOARD only. See `ai-mock-simulator-tasks.md` for backend tasks and `ARCHITECTURE-2.md` for system integration details.

**Development Approach**: Vertical slices - each slice is a fully testable, end-to-end feature that can be tested immediately after completion. Tasks are grouped into logical chunks for more efficient development.

---

## Chunk 1: Foundation & Initial Setup (Days 1-2)
**All setup work that needs to happen first**

- **Phase 1.1**: Project Setup
  - Install dependencies (echarts, AI SDK, shadcn-svelte)
  - Set up project structure
- **Phase 1.2**: State Management Setup
  - All store creation (dashboard state, WebSocket, UI state, chart state)
- **Phase 1.3**: Type Definitions
  - All type definitions (backend matching + dashboard-specific)
- **Slice 1**: Minimal Dashboard Page
  - Basic layout and routing

**Why together**: All foundational work that enables everything else.

---

## Chunk 2: Chart Foundation (Days 2-3)
**Everything needed to display a basic chart**

- **Slice 2**: Single Stream Chart (Hardcoded)
  - ECharts installation and wrapper
  - Basic chart with hardcoded data
  - Baseline reference line

**Why together**: All chart display basics in one go. Can test immediately.

---

## Chunk 3: WebSocket & Real-time Data Infrastructure (Days 3-4)
**Complete WebSocket connection and data flow**

- **Slice 3**: WebSocket Connection
  - Connection manager
  - Auto-reconnect
- **Slice 4**: Real-time Updates (One Stream)
  - Subscription handling
  - Event processing
  - Chart updates
- **Slice 5**: Historical Data Loading
  - API fetcher
  - Historical + real-time merge

**Why together**: These are tightly coupled - WebSocket connection enables real-time, and historical data needs to merge with real-time. Natural workflow.

---

## Chunk 4: Heatmap Complete Feature (Days 4-5)
**Build the entire heatmap feature end-to-end**

- **Slice 6**: Heatmap Display
  - Grid layout
  - Cell component with color coding
- **Slice 7**: Heatmap Interactions
  - Click handlers
  - Chart integration
- **Slice 8**: Heatmap Real-time Updates
  - Subscribe to all streams
  - Update cells from WebSocket events
- **Slice 16**: Heatmap Filtering (can be done later, but fits here)
  - Filter buttons and logic
- **Slice 20**: Heatmap Pulsing Animation (can be done later, but fits here)
  - Animation for critical anomalies

**Why together**: Complete heatmap feature. All heatmap-related work in one chunk. Slices 16 and 20 are enhancements but fit the feature.

---

## Chunk 5: Events Feature Complete (Days 5-6)
**Build the entire events timeline feature**

- **Slice 9**: External Events Timeline
  - Timeline component
  - Event cards
  - Historical data loading
- **Slice 10**: Event-Chart Integration
  - Plot toggle
  - Event markers on chart
- **Slice 17**: Event Filtering
  - Type filters
  - Impact filters
  - Date range filters

**Why together**: Complete events feature. Timeline → Chart integration → Filtering is a natural progression.

---

## Chunk 6: Recommendations Feature Complete (Days 6-8)
**Build the entire recommendations system**

- **Slice 11**: Recommendations Panel (Hardcoded)
  - Panel layout
  - Card component
  - "Take action" behavior
- **Slice 12**: Dashboard AI Integration (Minimal)
  - System prompt
  - Manual trigger
  - OpenAI integration
- **Slice 18**: AI Recommendations (Full)
  - Automatic triggers
  - Full context building
  - Enhanced cards

**Why together**: Complete recommendations feature. Start with UI, add AI, then enhance. Natural progression.

---

## Chunk 7: Multi-Stream & Full Data (Day 8-9)
**Scale from single stream to all streams**

- **Slice 13**: Expand to All Streams
  - Multi-stream WebSocket subscription
  - Multi-stream chart support
  - Heatmap updates for all streams
- **Slice 14**: Full Historical Data
  - 7-day data loading
  - Gap detection and fill

**Why together**: Both are about scaling from single to all streams. Natural pairing.

---

## Chunk 8: Chart Interactions & Advanced Features (Days 9-11)
**All chart enhancements and interactions**

- **Slice 15**: Chart Interactions
  - Zoom and pan
  - Time range selector
  - Rich tooltip
- **Slice 19**: Advanced Chart Features
  - Variance bands
  - NOW indicator
  - AI-suggested views
- **Slice 21**: Chart Presets & Saved Views
  - Quick view buttons
  - Save/load custom views
- **Slice 22**: Data Export
  - CSV export
  - Screenshot export

**Why together**: All chart enhancements. Interactions → Advanced features → Presets → Export is a logical flow.

---

## Chunk 9: Polish & Error Handling (Day 12)
**All UI polish and error handling**

- **Slice 24**: Polish & Error Handling
  - Skeleton loaders
  - Error handling UI
  - Final styling and polish

**Why together**: All polish work. Do this after features are complete.

---

## Chunk 10: Advanced Analytics (Day 12)
**Optional advanced features**

- **Slice 23**: Customer Health & Retention Analysis
  - Health score calculation
  - Churn risk prediction

**Why together**: Standalone feature. Can be done independently or skipped for MVP.

---

## Chunk 11: Testing & Refinement (Days 12-13)
**All testing and optimization**

- **Phase 3.1**: UI/UX Testing
  - Interaction testing
  - Real-time update testing
  - Error scenario testing
- **Phase 3.2**: Performance Optimization
  - Chart rendering optimization
  - Heatmap rendering optimization
  - State update optimization
- **Phase 3.3**: Accessibility
  - Keyboard navigation
  - ARIA labels
  - Focus indicators

**Why together**: All testing and optimization work. Do this after features are complete.

---

## Chunk 12: Documentation & Deployment (Days 13-14)
**Final documentation and deployment**

- **Phase 4.1**: Documentation
  - User guide
  - Tooltips/help text
- **Phase 4.2**: Build & Deploy
  - Production build optimization
  - Railway deployment
- **Phase 4.3**: Demo Preparation
  - Demo script
  - Talking points

**Why together**: All final preparation work.

---

## Recommended Workflow

### MVP Path (9-10 days):
1. **Chunk 1**: Foundation (Days 1-2)
2. **Chunk 2**: Chart Foundation (Day 2-3)
3. **Chunk 3**: WebSocket & Real-time (Days 3-4)
4. **Chunk 4**: Heatmap Complete (Days 4-5)
5. **Chunk 5**: Events Complete (Days 5-6)
6. **Chunk 6**: Recommendations Complete (Days 6-8)
7. **Chunk 7**: Multi-Stream & Full Data (Days 8-9)
8. **Chunk 8**: Chart Interactions (Days 9-10) - partial (just Slice 15)
9. **Chunk 9**: Polish & Error Handling (Day 10)
10. **Chunk 11**: Testing (Days 10-11)
11. **Chunk 12**: Documentation & Deploy (Days 11-12)

### Full Feature Path (14 days):
Same as MVP, but include:
- **Chunk 8**: All chart features (Days 9-11)
- **Chunk 10**: Advanced Analytics (Day 12)
- Full **Chunk 11**: Testing (Days 12-13)
- **Chunk 12**: Documentation & Deploy (Days 13-14)

---

## Benefits of This Grouping

1. **Logical Feature Boundaries**: Each chunk represents a complete feature or logical grouping
2. **Reduced Context Switching**: Work on related tasks together
3. **Better Testing**: Test complete features before moving on
4. **Clearer Progress**: Each chunk is a milestone
5. **Parallel Work**: Some chunks can be worked on in parallel (e.g., Heatmap and Events after Chunk 3)
6. **Easier Estimation**: Each chunk has clear scope and dependencies

---

## Success Criteria

### Minimum Viable Product (MVP)
- ✅ Normalized time-series chart with Apache ECharts
- ✅ Interactive heatmap with 50 streams
- ✅ External events timeline
- ✅ Basic recommendations panel (can be mock data initially)
- ✅ Real-time WebSocket data streaming
- ✅ Responsive desktop layout
- ✅ Connection status indicators
- ✅ Basic filtering (heatmap and events)

### Full Feature Set
- ✅ All MVP features
- ✅ Dashboard AI Contextualizer generating recommendations
- ✅ AI-suggested chart views
- ✅ Full recommendation workflow (view details, take action, resolve)
- ✅ Advanced filtering and search
- ✅ Chart presets and saved views
- ✅ Data export functionality
- ✅ Polished UI with smooth animations
- ✅ Comprehensive tooltips and help text
- ✅ Error handling and loading states
- ✅ Performance optimized (smooth with 50+ streams)

---

## Timeline Summary

**Total Estimated Time**: 14 days for full feature set

**MVP Timeline**: 9-10 days (through Chunk 7 + partial Chunk 8)

### Chunk Timeline:
- **Chunk 1**: Days 1-2 (Foundation)
- **Chunk 2**: Days 2-3 (Chart Foundation)
- **Chunk 3**: Days 3-4 (WebSocket & Real-time)
- **Chunk 4**: Days 4-5 (Heatmap Complete)
- **Chunk 5**: Days 5-6 (Events Complete)
- **Chunk 6**: Days 6-8 (Recommendations Complete)
- **Chunk 7**: Days 8-9 (Multi-Stream & Full Data)
- **Chunk 8**: Days 9-11 (Chart Interactions & Advanced Features)
- **Chunk 9**: Day 12 (Polish & Error Handling)
- **Chunk 10**: Day 12 (Advanced Analytics - Optional)
- **Chunk 11**: Days 12-13 (Testing & Refinement)
- **Chunk 12**: Days 13-14 (Documentation & Deployment)

---

## Notes

- Some chunks can be done in parallel after dependencies are met (e.g., Heatmap and Events after WebSocket is done)
- Chunk 8 (Chart Interactions) can be split - do Slice 15 for MVP, add 19, 21, 22 for full feature
- Chunk 10 (Advanced Analytics) is optional and can be skipped for MVP
- Chunk 4 includes Slices 16 and 20 which are enhancements - can be done later if needed
- Dashboard is a separate concern from simulator but shares same SvelteKit app
- Dashboard AI (Contextualizer) generates proactive recommendations automatically (no chat interface, no "Ask AI" buttons)
- Apache ECharts chosen for powerful, performant charting with rich interactions
- shadcn-svelte for consistent, high-quality UI components
- Svelte runes for modern, reactive state management
- Desktop-only means we can use generous spacing and don't need mobile breakpoints
- Real-time updates must be smooth (no jank) - performance is critical
- AI recommendations are proactive (not just Q&A) - the AI surfaces insights automatically
- External events are key to causation analysis - not just decoration
- **Each slice is fully testable** - you can verify it works before moving to the next slice

