# Task List: Operations Dashboard (Frontend/Visualization)

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

**Development Approach**: Vertical slices - each slice is a fully testable, end-to-end feature that can be tested immediately after completion.

---

## Phase 1: Foundation & Setup (Days 1-2)

### 1.1 Project Setup (if not already done with simulator)
- [ ] Ensure SvelteKit project initialized with TypeScript
- [ ] Install frontend dependencies:
  - `echarts`: `^5.5.0` (Charting library - use directly with custom wrapper)
  - `@ai-sdk/openai`: `^2.0.64` (AI SDK for Dashboard AI Contextualizer)
  - `ai`: `^5.0.0` (AI SDK core)
  - `shadcn-svelte`: Check latest version (UI components - includes Radix primitives)
  - Lucide icons (comes with shadcn)
  - `tailwindcss`: `^4.1.14` (Already installed)
  
- [ ] Set up frontend project structure:
  ```
  /routes
    /dashboard         - Main operations dashboard
  /lib
    /components        - Reusable UI components
      /dashboard       - Dashboard-specific components
      /ui              - shadcn components
    /stores            - Svelte runes stores for state
    /ai-contextualizer - Dashboard AI logic
    /utils             - Utility functions
  ```

### 1.2 State Management Setup
- [ ] Create Svelte runes stores for dashboard state
- [ ] Create WebSocket connection store
- [ ] Create UI state store for filters and selections
- [ ] Create chart state store for zoom/pan state

### 1.3 Type Definitions
- [ ] Create frontend type definitions matching backend types
- [ ] Define dashboard-specific types (HeatmapCell, Recommendation, ChartSeries, etc.)

---

## Phase 2: Vertical Slices - Build Testable Features Incrementally

### Slice 1: Minimal Testable Dashboard (Day 2)
**Goal**: Create a basic dashboard page with hardcoded data - verify layout and routing work.

- [ ] Create `/dashboard` route page
  - Basic layout with header
  - Placeholder sections for chart, heatmap, events, recommendations
  - Hardcoded connection status: "Connected"
  - Test: Navigate to `/dashboard`, verify page loads
  - **Testable**: ✅ Can test immediately in browser

---

### Slice 2: Single Stream on Chart (Hardcoded) (Day 2-3)
**Goal**: Display one stream on a chart with hardcoded data - verify ECharts integration works.

- [ ] Install Apache ECharts (`echarts: ^5.5.0`)
- [ ] Create ECharts Svelte wrapper component (see `lib/components/ECharts.svelte`)
- [ ] Build minimal chart component
  - Display one stream (`customer.tutor.search`) with hardcoded data
  - 7 data points (one per day for last week)
  - Basic line chart
  - Test: See chart render with hardcoded data
  - **Testable**: ✅ Can test immediately in browser

- [ ] Add baseline reference line (y=50)
  - Horizontal line at normalized value 50
  - Test: Verify baseline line appears
  - **Testable**: ✅ Can test immediately in browser

---

### Slice 3: WebSocket Connection (Minimal) (Day 3)
**Goal**: Connect to WebSocket and show connection status - verify WebSocket integration works.

- [ ] Build minimal WebSocket connection manager
  - Connect to `ws://localhost:5173/ws` (or production URL)
  - Track connection state (connected/disconnected)
  - Display connection status in header
  - Test: Connect to WebSocket, verify status shows "Connected"
  - **Testable**: ✅ Can test immediately (requires backend WebSocket server)

- [ ] Implement auto-reconnect
  - Reconnect on disconnect
  - Show "Reconnecting..." status
  - Test: Disconnect WebSocket, verify reconnection
  - **Testable**: ✅ Can test immediately

---

### Slice 4: Real-time Updates (One Stream) (Day 3-4)
**Goal**: Receive one stream event via WebSocket and update chart - verify real-time updates work.

- [ ] Subscribe to one stream (`customer.tutor.search`)
  - Send subscription message: `{ type: "subscribe", topics: ["customer.tutor.search"] }`
  - Handle subscription confirmation
  - Test: Verify subscription message sent
  - **Testable**: ✅ Can test via WebSocket client

- [ ] Handle incoming stream events
  - Receive `{ type: "event", data: StreamEvent }` messages
  - Update chart with new data point
  - Smooth animation for new points
  - Test: Receive events, verify chart updates
  - **Testable**: ✅ Can test via WebSocket (requires backend generating events)

---

### Slice 5: Historical Data Loading (Minimal) (Day 4)
**Goal**: Load 1 day of historical data for 1 stream and display on chart.

- [ ] Build historical data fetcher
  - Call `GET /api/simulation/history?start=X&end=Y&streams=customer.tutor.search`
  - Parse response and merge with chart data
  - Test: Load historical data, verify chart shows past data
  - **Testable**: ✅ Can test via API (requires backend API endpoint)

- [ ] Merge historical with real-time
  - Load historical data on mount
  - Append real-time events to historical data
  - Test: Verify seamless transition from historical to real-time
  - **Testable**: ✅ Can test via API + WebSocket

---

### Slice 6: Heatmap (Minimal - Display Only) (Day 4-5)
**Goal**: Display 50 streams in a heatmap grid - verify heatmap layout works.

- [ ] Build 50-cell heatmap grid (organized by domain)
  - Customer: 10 cells
  - Tutor: 10 cells  
  - Session: 12 cells
  - Support: 8 cells
  - Marketing: 5 cells
  - System: 5 cells
  - Hardcoded values for now (all at 50 = normal)
  
- [ ] Build individual heatmap cell component
  - Color-coded by normalized value:
    - Green (🟢): 40-60 (normal)
    - Yellow (🟡): 30-40 or 60-70 (warning)
    - Red (🔴): <30 or >70 (critical)
  - Display stream name on hover
  - Test: See heatmap with all cells, verify colors work
  - **Testable**: ✅ Can test immediately in browser

---

### Slice 7: Heatmap Interactions (Day 5)
**Goal**: Click heatmap cells to add/remove streams from chart.

- [ ] Implement cell click handler
  - Toggle stream selection
  - Add/remove stream from chart
  - Visual feedback (highlighted border when selected)
  - Test: Click cell, verify stream appears on chart
  - **Testable**: ✅ Can test immediately in browser

- [ ] Update chart with selected streams
  - Add new series when stream selected
  - Remove series when stream deselected
  - Test: Select multiple streams, verify all appear on chart
  - **Testable**: ✅ Can test immediately in browser

---

### Slice 8: Heatmap Real-time Updates (Day 5)
**Goal**: Heatmap cells update in real-time as WebSocket events arrive.

- [ ] Subscribe to all streams (`*`)
  - Send subscription: `{ type: "subscribe", topics: ["*"] }`
  - Receive events for all streams
  
- [ ] Update heatmap cells with real-time data
  - Update cell color based on normalized value
  - Update cell value on hover
  - Test: Receive events, verify heatmap cells update
  - **Testable**: ✅ Can test via WebSocket (requires backend)

---

### Slice 9: External Events Timeline (Minimal) (Day 5-6)
**Goal**: Display external events in a timeline - verify events display works.

- [ ] Build horizontal timeline component
  - Chronological list of events (newest first)
  - Each event is a card with: icon, title, timestamp, severity badge
  - Hardcoded events for now (from API response)
  - Test: See events in timeline, verify layout
  - **Testable**: ✅ Can test via API (requires backend API endpoint)

- [ ] Load events from historical data API
  - Events included in `GET /api/simulation/history` response
  - Display events in timeline
  - Test: Load historical data, verify events appear
  - **Testable**: ✅ Can test via API

---

### Slice 10: Event-Chart Integration (Day 6)
**Goal**: Click events to plot them on chart as vertical markers.

- [ ] Implement "plot on chart" toggle
  - Toggle button on each event card
  - When enabled, event appears as vertical marker on chart
  - When disabled, event marker removed
  - Test: Toggle event plotting, verify markers appear/disappear
  - **Testable**: ✅ Can test immediately in browser

- [ ] Build event markers on chart
  - Vertical line at event timestamp
  - Icon and tooltip on hover
  - Test: Verify markers render correctly
  - **Testable**: ✅ Can test immediately in browser

---

### Slice 11: Recommendations Panel (Minimal - Hardcoded) (Day 6-7)
**Goal**: Display recommendations panel with hardcoded recommendations.

- [ ] Build recommendations sidebar panel (right side of dashboard)
  - Scrollable list
  - Sections: Critical, Warning, Normal, Resolved
  - Hardcoded recommendations for now
  - Test: See recommendations panel, verify layout
  - **Testable**: ✅ Can test immediately in browser

- [ ] Build individual recommendation card component
  - Priority indicator (🔴 Critical, 🟡 Warning, 🟢 Normal)
  - Title, description, impact statement
  - "⚡ Take action" button
  - Test: See recommendation cards, verify styling
  - **Testable**: ✅ Can test immediately in browser

- [ ] Implement "Take action" button behavior
  - Click button → show loading → move to "Resolved" section
  - Test: Click action button, verify recommendation moves to resolved
  - **Testable**: ✅ Can test immediately in browser

---

### Slice 12: Dashboard AI Integration (Minimal) (Day 7-8)
**Goal**: Generate real AI recommendations from OpenAI.

- [ ] Create Dashboard AI system prompt
  - Role: "You are an AI analyzing marketplace operations data"
  - Context: Stream data, external events, baseline statistics
  - Output: Recommendations with priority, actions, confidence
  
- [ ] Build AI recommendation generator (minimal)
  - Trigger manually (button click for now)
  - Prepare context with current anomalies (hardcoded for now)
  - Call OpenAI API
  - Parse recommendations from response
  - Display in recommendations panel
  - Test: Click button, verify AI recommendations appear
  - **Testable**: ✅ Can test with OpenAI API key

---

### Slice 13: Expand to All Streams (Day 8)
**Goal**: Support all 50 streams instead of just one.

- [ ] Update WebSocket subscription
  - Subscribe to all streams (`*`)
  - Handle events for all stream types
  
- [ ] Update chart to handle multiple streams
  - Support up to 10 simultaneous streams
  - Distinct colors for each stream
  - Legend with stream names
  
- [ ] Update heatmap with real-time data
  - All 50 cells update from WebSocket events
  - Test: Receive events for all streams, verify heatmap updates
  - **Testable**: ✅ Can test via WebSocket

---

### Slice 14: Full Historical Data (Day 8-9)
**Goal**: Load full 7-day historical data for all streams.

- [ ] Expand historical data loading
  - Load 7 days of data for all streams
  - Merge with real-time updates
  - Handle time range changes
  
- [ ] Implement gap detection and fill
  - Detect gap between historical data end time and WebSocket connection time
  - Request historical data for gap period if gap > 60 seconds
  - Test: Load dashboard, verify seamless data continuity
  - **Testable**: ✅ Can test via API + WebSocket

---

### Slice 15: Chart Interactions (Day 9)
**Goal**: Add zoom, pan, and time range selection to chart.

- [ ] Implement zoom and pan
  - Mouse wheel zoom
  - Drag to pan
  - Time range slider
  
- [ ] Build time range selector
  - Buttons: 24h, 7d, 30d, Custom
  - Reload historical data when range changes
  - Test: Change time range, verify chart updates
  - **Testable**: ✅ Can test immediately in browser

- [ ] Build rich tooltip
  - Show stream details on hover
  - Display normalized value, raw value, timestamp
  - Test: Hover over chart, verify tooltip appears
  - **Testable**: ✅ Can test immediately in browser

---

### Slice 16: Heatmap Filtering (Day 9)
**Goal**: Filter heatmap by status and domain.

- [ ] Build filter buttons above heatmap
  - "All" (default)
  - "🔴 Red only" - show only critical anomalies
  - "🟡 Yellow only" - show only warnings
  - "🟢 Green only" - show only normal
  - By domain: Customer, Tutor, Session, Support, Marketing, System
  
- [ ] Implement filter logic
  - Hide filtered-out cells (or gray them out)
  - Maintain selections when filters change
  - Test: Apply filters, verify cells hide/show correctly
  - **Testable**: ✅ Can test immediately in browser

---

### Slice 17: Event Filtering (Day 9-10)
**Goal**: Filter events timeline by type and impact.

- [ ] Build filter dropdown for event types
  - Marketing, Product, Infrastructure, Academic, Competitive, Operational
  - Multi-select filter
  
- [ ] Build filter by impact level
  - High impact, Medium impact, Low impact
  
- [ ] Build date range filter
  - Last 24h, Last 7d (default), Last 30d, Custom
  - Sync with chart time range
  - Test: Apply filters, verify events filter correctly
  - **Testable**: ✅ Can test immediately in browser

---

### Slice 18: AI Recommendations (Full) (Day 10)
**Goal**: Full AI recommendations with automatic generation and analysis.

- [ ] Implement automatic AI trigger
  - Run every 2 minutes
  - Trigger on significant anomaly (stream >2σ from baseline)
  - Prepare context with real stream data
  
- [ ] Build full recommendation context
  - Current anomalies (streams with high variance)
  - Recent external events
  - Stream correlation data
  - Historical baseline for comparison
  
- [ ] Enhance recommendation cards
    - Full analysis with mini-charts
  - Related streams and events
  - Confidence scores
  - Test: Wait for AI recommendations, verify they appear automatically
  - **Testable**: ✅ Can test with OpenAI API key

---

### Slice 19: Advanced Chart Features (Day 10-11)
**Goal**: Add variance bands, event markers, and AI-suggested views.

- [ ] Build variance bands (normal/warning/critical zones)
  - Shaded regions on chart
  - Green: 40-60 (normal)
  - Yellow: 30-40 or 60-70 (warning)
  - Red: <30 or >70 (critical)
  - Test: Verify bands render correctly
  - **Testable**: ✅ Can test immediately in browser

- [ ] Implement "NOW" indicator
  - Vertical line at current time
  - Updates as time progresses
  - Test: Verify NOW indicator appears and updates
  - **Testable**: ✅ Can test immediately in browser

- [ ] Build "AI: Show me what's important" button
  - Call Dashboard AI to recommend stream combinations
  - Apply AI-selected streams to chart automatically
  - Display AI explanation
  - Test: Click button, verify AI selects streams
  - **Testable**: ✅ Can test with OpenAI API key

---

### Slice 20: Heatmap Pulsing Animation (Day 11)
**Goal**: Add pulsing animation for critical anomalies.

- [ ] Implement pulsing animation for anomalies
  - Critical anomalies pulse (scale + opacity animation)
  - Smooth CSS animation
  - Only pulse while anomaly persists
  - Test: Create critical anomaly, verify pulsing animation
  - **Testable**: ✅ Can test immediately in browser

---

### Slice 21: Chart Presets & Saved Views (Day 11)
**Goal**: Add quick view buttons and save/load custom views.

- [ ] Build quick view buttons above chart
  - "Supply/Demand Balance" - loads relevant streams
  - "Customer Health" - loads retention indicators
  - "Quality Metrics" - loads session ratings
  - "System Health" - loads system errors
  - Test: Click preset buttons, verify streams load
  - **Testable**: ✅ Can test immediately in browser
  
- [ ] Build save/load custom views
  - "Save current view" button
  - Store in localStorage
  - "Load view" dropdown with saved views
  - Test: Save view, reload page, verify view restores
  - **Testable**: ✅ Can test immediately in browser

---

### Slice 22: Data Export (Day 11-12)
**Goal**: Export chart data and screenshots.

- [ ] Build "Export chart data" button
  - Download current chart data as CSV
  - Include: timestamps, all plotted streams, event markers
  - Test: Export data, verify CSV file downloads
  - **Testable**: ✅ Can test immediately in browser
  
- [ ] Build "Export screenshot" button
  - Capture chart as PNG image
  - Use ECharts built-in export feature
  - Test: Export screenshot, verify PNG downloads
  - **Testable**: ✅ Can test immediately in browser

---

### Slice 23: Customer Health & Retention Analysis (Day 12)
**Goal**: Add customer health scoring and churn risk analysis.

- [ ] Build customer health score calculation
  - Aggregate signals into 0-100 health score
  - Session velocity, payment status, IB calls, etc.
  - Calculate per customer, aggregate by cohort
  
- [ ] Build churn risk prediction
  - Calculate churn risk score per customer
  - Segment by cohort, subscription plan, subject preference
  - Display in recommendations
  - Test: Verify health scores and churn risk calculations
  - **Testable**: ✅ Can test with real data

---

### Slice 24: Polish & Error Handling (Day 12)
**Goal**: Add loading states, error handling, and polish.

- [ ] Build skeleton loaders
  - Chart skeleton while loading historical data
  - Heatmap skeleton while connecting to WebSocket
  - Recommendations skeleton while AI generates
  - Test: Verify skeletons appear during loading
  - **Testable**: ✅ Can test immediately in browser

- [ ] Build error handling UI
  - WebSocket connection error: "Unable to connect. Retrying..."
  - API error: "Failed to load data. Refresh to try again."
  - AI error: "AI recommendations temporarily unavailable"
  - Toast notifications for transient errors
  - Test: Simulate errors, verify error messages appear
  - **Testable**: ✅ Can test by disconnecting WebSocket/API

- [ ] Apply final styling and polish
  - shadcn-svelte theme
  - Consistent spacing and colors
  - Smooth animations
  - Test: Verify polished UI looks good
  - **Testable**: ✅ Can test immediately in browser

---

## Phase 3: Testing & Refinement (Days 12-13)

### 3.1 UI/UX Testing
- [ ] Test all interactions
  - Click heatmap cells → streams added to chart
  - Click event cards → markers appear on chart
  - Take action on recommendations → moves to resolved
  - Filters work correctly
  - Time range changes work
  
- [ ] Test real-time updates
  - Data streams in smoothly
  - No lag or jankiness
  - Animations are smooth
  - No memory leaks over time
  
- [ ] Test error scenarios
  - WebSocket disconnect/reconnect
  - API failures
  - AI failures
  - Malformed data

### 3.2 Performance Optimization
- [ ] Optimize chart rendering
  - Limit max data points shown (downsample if needed)
  - Debounce real-time updates
  - Use ECharts performance features
  
- [ ] Optimize heatmap rendering
  - Efficient re-rendering (only update changed cells)
  - CSS transforms for animations (GPU-accelerated)
  
- [ ] Optimize state updates
  - Batch updates where possible
  - Use Svelte's fine-grained reactivity effectively
  - Profile and identify bottlenecks

### 3.3 Accessibility
- [ ] Add keyboard navigation
  - Tab through interactive elements
  - Enter to activate buttons
  - Arrow keys to navigate heatmap cells
  - Escape to close modals
  
- [ ] Add ARIA labels
  - Screen reader friendly labels for all interactive elements
  - Announce state changes
  - Semantic HTML
  
- [ ] Add focus indicators
  - Clear focus outlines on all interactive elements
  - High contrast mode support

---

## Phase 4: Documentation & Deployment (Days 13-14)

### 4.1 Documentation
- [ ] Create user guide
  - How to use the dashboard
  - Explanation of each section
  - Tips for interpreting the data
  - Common workflows
  
- [ ] Create tooltips/help text
  - Question mark icons with help text
  - First-time user walkthrough (optional)
  - Inline explanations where helpful

### 4.2 Build & Deploy
- [ ] Optimize production build
  - Minification
  - Code splitting
  - Tree shaking
  - Asset optimization
  
- [ ] Deploy to Railway (same app as simulator)
  - Ensure routing works (`/dashboard` and `/admin`)
  - Test on production URL
  - Verify WebSocket connection works

### 4.3 Demo Preparation
- [ ] Prepare demo script
  - Start with baseline (all green)
  - Trigger exam season scenario (admin UI)
  - Watch supply/demand imbalance develop
  - Show AI recommendation appearing
  - Take action on recommendation
  - Show recovery
  
- [ ] Create demo talking points
  - Explain normalized view and why it's useful
  - Show how external events correlate with data
  - Demonstrate AI insights
  - Show proactive recommendations
  - Highlight key interactions

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

- **Days 1-2**: Foundation, setup, state management, types
- **Days 2-4**: Vertical slices 1-5 (minimal testable features)
- **Days 4-6**: Vertical slices 6-10 (expand to full functionality)
- **Days 6-10**: Vertical slices 11-18 (advanced features)
- **Days 10-12**: Vertical slices 19-24 (polish and advanced features)
- **Days 12-13**: Testing and refinement
- **Days 13-14**: Documentation and deployment

**Total Estimated Time**: 14 days for full feature set

**MVP Timeline**: 9-10 days (through Slice 18)

---

## Notes

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
