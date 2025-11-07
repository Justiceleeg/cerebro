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

## Phase 2: WebSocket Client Integration (Days 2-3)

### 2.1 WebSocket Connection Manager
- [ ] Build WebSocket connection with auto-reconnect
- [ ] Implement subscription management
- [ ] Build event handler for incoming stream data (including catchup message type)
- [ ] Implement heartbeat/ping-pong
- [ ] Handle catch-up events on connection
  - Receive catchup message with events after lastTimestamp
  - Merge catch-up events with historical data
  - Start real-time events after catchUpEndTime

### 2.2 Data Aggregation & Normalization
- [ ] Build stream data aggregator
- [ ] Build anomaly detector
- [ ] Build efficient update strategy (debouncing, batching)

### 2.3 Historical Data Loading
- [ ] Build historical data fetcher from API
- [ ] Build data caching and merging with real-time
- [ ] Handle time range changes
- [ ] Implement gap detection and fill
  - Detect gap between historical data end time and WebSocket connection time
  - If gap > 60 seconds, request historical data for gap period
  - Merge gap data with existing historical data
  - Pass lastTimestamp to WebSocket subscribe message for catch-up events

---

## Phase 3: Main Time-Series Chart (Days 3-5)

### 3.1 ECharts Setup & Configuration
- [ ] Install Apache ECharts (`echarts: ^5.5.0`)
- [ ] Create ECharts Svelte wrapper component (see `lib/components/ECharts.svelte`)
- [ ] Build chart container component
- [ ] Initialize ECharts instance with proper lifecycle

### 3.2 Chart Data Management
- [ ] Build chart data transformer (stores → ECharts format)
- [ ] Implement dynamic series add/remove
- [ ] Handle real-time data updates with smooth animations

### 3.3 Chart Visualization Features
- [ ] Build baseline reference line (y=50)
- [ ] Build variance bands (normal/warning/critical zones)
- [ ] Build external event markers (vertical lines with icons)
- [ ] Implement "NOW" indicator (current time marker)

### 3.4 Chart Interactions
- [ ] Build rich tooltip with stream details
- [ ] Implement zoom and pan (mouse wheel, drag, slider)
- [ ] Build time range selector (24h, 7d, 30d, custom)
- [ ] Implement legend interactions (click to show/hide series)

### 3.5 AI-Suggested View
- [ ] Build "AI: Show me what's important" button
- [ ] Call Dashboard AI to recommend stream combinations
- [ ] Apply AI-selected streams to chart automatically
- [ ] Display AI explanation for why these streams were chosen

---

## Phase 4: Interactive Heatmap (Days 5-7)

### 4.1 Heatmap Component Structure
- [ ] Build 50-cell heatmap grid (organized by domain)
  - Customer: 10 cells
  - Tutor: 10 cells  
  - Session: 12 cells
  - Support: 8 cells
  - Marketing: 5 cells
  - System: 5 cells
  
- [ ] Build individual heatmap cell component
  - Color-coded by normalized value:
    - Green (🟢): 40-60 (normal)
    - Yellow (🟡): 30-40 or 60-70 (warning)
    - Red (🔴): <30 or >70 (critical)
  - Display stream name on hover
  - Click to select/deselect for chart
  - Multi-select support (hold shift/ctrl)

### 4.2 Heatmap Interactions
- [ ] Implement cell click handler
  - Toggle stream selection
  - Add/remove from chart
  - Visual feedback (highlighted border when selected)
  
- [ ] Build hover tooltip
  - Stream name and current value
  - Normalized score (0-100)
  - Variance from baseline (σ)
  - Short explanation: "3.2σ below baseline. Supply shortage detected."
  - Last 6-hour mini sparkline trend
  
- [ ] Implement pulsing animation for anomalies
  - Critical anomalies pulse (scale + opacity animation)
  - Smooth CSS animation
  - Only pulse while anomaly persists

### 4.3 Heatmap Filtering
- [ ] Build filter buttons above heatmap
  - "All" (default)
  - "🔴 Red only" - show only critical anomalies
  - "🟡 Yellow only" - show only warnings
  - "🟢 Green only" - show only normal
  - By domain: Customer, Tutor, Session, Support, Marketing, System
  
- [ ] Implement filter logic
  - Hide filtered-out cells (or gray them out)
  - Update grid layout dynamically
  - Maintain selections when filters change

### 4.4 Related Stream Highlighting
- [ ] Build "show related streams" feature
  - When stream selected, highlight related streams in heatmap
  - Use relationship graph from config
  - Visual indicator (glow effect or icon)
  - Useful for understanding cascading effects

---

## Phase 5: External Events Timeline (Days 7-8)

### 5.1 Timeline Component
- [ ] Build horizontal timeline component
  - Chronological list of events (newest first or oldest first, toggleable)
  - Each event is a card with: icon, title, timestamp, severity badge
  - Click to toggle plotting on chart
  - External link button (opens in new tab)
  
- [ ] Build individual event card component
  - Icon based on event type
  - Title and short description
  - Timestamp (relative: "2 hours ago" or absolute)
  - Severity badge (🔴 Critical, 🟡 Warning, 🟢 Info)
  - "Plot on chart" toggle button
  - External link icon (if link available)

### 5.2 Event Filtering
- [ ] Build filter dropdown for event types
  - Marketing
  - Product
  - Infrastructure  
  - Academic
  - Competitive
  - Operational
  - Multi-select filter
  
- [ ] Build filter by impact level
  - High impact
  - Medium impact
  - Low impact
  - Unknown impact
  
- [ ] Build date range filter
  - Last 24h, Last 7d (default), Last 30d, Custom
  - Sync with chart time range

### 5.3 Event-Chart Integration
- [ ] Implement "plot on chart" toggle
  - When enabled, event appears as vertical marker on chart
  - When disabled, event marker removed from chart
  - State persists (remember which events are plotted)
  
- [ ] Implement "click event card highlights related streams"
  - Clicking event card highlights affected streams in heatmap
  - Shows correlation strength (how much each stream changed)
  - Option to add all affected streams to chart automatically

---

## Phase 6: AI Recommendations Panel (Days 8-10)

### 6.1 Dashboard AI Contextualizer Setup
- [ ] Create separate AI system prompt for Dashboard AI
  - Role: "You are an AI analyzing marketplace operations data to provide insights"
  - Context: Stream data, external events, baseline statistics
  - Output: Recommendations with priority, actions, confidence
  - Different from Simulator AI (analysis not simulation)
  
- [ ] Build Dashboard AI context preparation
  - Current anomalies (streams with high variance)
  - Recent external events
  - Stream correlation data
  - Historical baseline for comparison
  
- [ ] Build AI recommendation generator
  - Triggered periodically (every 2 minutes) or on significant anomaly
  - Calls OpenAI with dashboard context
  - Parses recommendations from AI response
  - Updates recommendations store

### 6.2 Recommendations Panel Component
- [ ] Build recommendations sidebar panel (right side of dashboard)
  - Scrollable list
  - Sections: Critical, Warning, Normal, Resolved
  - Each section collapsible
  - Count badges showing number in each priority
  
- [ ] Build individual recommendation card component
  - Priority indicator (🔴 Critical, 🟡 Warning, 🟢 Normal)
  - Title (concise, action-oriented)
  - Description (1-2 sentences explaining issue)
  - Impact statement (what happens if not addressed)
  - Likely cause (root cause analysis)
  - Confidence score (AI's confidence %)
  - Related external events (links to event cards)
  - Affected streams (links to heatmap cells)
  - Timestamp (when detected)

### 6.3 Recommended Actions
- [ ] Build actions section within recommendation card
  - List of 1-3 recommended actions
  - Each action has:
    - Label (short action description)
    - Full description
    - Expected impact
    - Time to effect (how long until data changes)
  - "⚡ Take action" button per action
  
- [ ] Implement "Take action" button behavior
  - Click button
  - Show loading spinner on button
  - Wait 2-3 seconds (arbitrary delay to simulate processing)
  - Change to checkmark icon
  - Move recommendation to "Resolved" section (greyed out)
  - Add timestamp: "Action taken X minutes ago. Expected resolution in Y."
  - Recommendation stays visible at bottom of panel

### 6.4 Recommendation Interactions
- [ ] Build "📊 View details" button
  - Expands recommendation card to show:
    - Full analysis with mini-charts
    - List of affected customer/tutor IDs (sample, first 10)
    - Timeline of related events
    - Historical comparison ("last time this happened...")
    - Alternative actions with trade-offs
  - Collapse back to summary view
  
- [ ] Build "Show related streams" button
  - Highlights affected streams in heatmap
  - Optionally adds them to chart
  - Filters event timeline to show related events

### 6.5 Recommendations Management
- [ ] Build dismiss/resolve workflow
  - "❌ Dismiss" button removes from active list (doesn't move to resolved)
  - Taking action moves to resolved (stays visible, greyed out)
  - Resolved recommendations show: "Resolved X minutes ago"
  - Resolved section can be collapsed to hide
  
- [ ] Build recommendation refresh
  - Dashboard AI runs every 2 minutes
  - New recommendations appear at top
  - Updated recommendations re-sort by priority
  - Resolved recommendations stay in place

### 6.6 Customer Health & Retention Analysis
- [ ] Build customer health score calculation
  - Aggregate signals into 0-100 health score:
    - Session velocity (sessions/week) - higher = better
    - First session success rate - higher = better
    - Payment status (success vs failure) - success = better
    - IB call count (≥2 in 14 days = high risk) - lower = better
    - Support ticket volume - lower = better
    - Subscription downgrades - none = better
  - Calculate per customer, aggregate by cohort/segment
  
- [ ] Build first session success rate analysis
  - Identify first session per customer (from `session.started`)
  - Track success (first session `session.completed`)
  - Calculate success rate by tutor_id and subject
  - Display in recommendations: "Math tutors have 20% lower first session success"
  
- [ ] Build session velocity trends by cohort
  - Calculate velocity per customer (sessions/week from `session.completed`)
  - Group by `cohort_id` from `customer.signup.completed`
  - Track trends over time
  - Display in recommendations: "Q1-2025 cohort showing declining velocity"
  
- [ ] Build churn risk prediction by segment
  - Calculate churn risk score per customer using:
    - IB call pattern (≥2 in 14 days = high risk)
    - Session velocity trends (declining = risk)
    - Payment failure history
    - First session success rate
    - Support ticket volume
  - Segment by cohort, subscription plan, subject preference
  - Display in recommendations: "15 customers in Q1-2025 cohort at high churn risk"

### 6.7 Supply/Demand & Campaign Recommendations
- [ ] Enhance Dashboard AI to analyze supply/demand
  - Current supply vs. demand by subject
  - Projected supply vs. demand (next 24-48 hours)
  - Identify shortages/surpluses
  
- [ ] Generate recruiting campaign recommendations
  - "Math tutor supply 30% below demand - increase recruiting spend"
  - "Chemistry tutors oversupplied - reduce recruiting spend"
  - Include expected impact and time to effect
  - "Take action" button simulates campaign adjustment (mock action)

---

## Phase 7: Dashboard Layout & Polish (Days 10-11)

### 7.1 Main Dashboard Layout
- [ ] Build responsive grid layout (desktop-only)
  ```
  ┌────────────────────────────────────────────────┬──────────────────┐
  │  CHART (normalized time-series)                 │  RECOMMENDATIONS│
  │  Large area, 60-70% width                       │  Sidebar, 30-40%│
  │                                                  │  Scrollable      │
  ├────────────────────────────────────────────────┤                  │
  │  HEATMAP (50 cells, interactive)               │                  │
  │  Grid organized by domain                       │                  │
  ├────────────────────────────────────────────────┤                  │
  │  EXTERNAL EVENTS TIMELINE                       │                  │
  │  Horizontal scrollable list                     │                  │
  └────────────────────────────────────────────────┴──────────────────┘
  ```
  
- [ ] Build header/nav
  - Dashboard title
  - Connection status indicator (🟢 Connected, 🔴 Disconnected)
  - Link to Admin UI (`/admin`)
  - Settings button (future: theme toggle, etc.)

### 7.2 Styling & Theming
- [ ] Apply shadcn-svelte theme
  - Use shadcn color system
  - Consistent spacing (Tailwind utilities)
  - Card components for panels
  - Button styles from shadcn
  
- [ ] Build custom styles for dashboard
  - Chart container styling
  - Heatmap cell styling (colors, hover, selected states)
  - Recommendation card styling
  - Event card styling
  - Pulsing animation keyframes
  
- [ ] Implement color palette for streams
  - Distinct colors for up to 10 simultaneous streams on chart
  - Accessible colors (WCAG AA contrast)
  - Consistent color assignment (same stream = same color)

### 7.3 Loading States
- [ ] Build skeleton loaders
  - Chart skeleton while loading historical data
  - Heatmap skeleton while connecting to WebSocket
  - Recommendations skeleton while AI generates
  
- [ ] Build connection status indicators
  - Banner at top: "Connecting to data stream..."
  - "Reconnecting..." with retry countdown
  - "Connected" confirmation (brief, then fades)

### 7.4 Error States
- [ ] Build error handling UI
  - WebSocket connection error: "Unable to connect. Retrying..."
  - API error: "Failed to load data. Refresh to try again."
  - AI error: "AI recommendations temporarily unavailable"
  - Toast notifications for transient errors
  - Error boundary for unexpected crashes

---

## Phase 8: Advanced Features (Days 11-12)

### 8.1 Chart Presets & Views
- [ ] Build quick view buttons above chart
  - "Supply/Demand Balance" - loads relevant streams
    - Supply: `tutor.availability.set`, `tutor.onboarding.approved`
    - Demand: `customer.tutor.search`, `session.booking.requested`
    - Balance: `session.booking.confirmed`, `session.booking.expired`
  - "Customer Health" - loads retention and health indicators
    - `session.completed` (session velocity)
    - `support.call.inbound` (IB calls - ≥2 in 14 days = churn risk)
    - `customer.subscription.payment_failure` (payment issues)
    - `session.booking.expired` (can't find tutors)
    - `customer.subscription.plan_changed` (downgrades)
    - `support.refund.requested` (severe dissatisfaction)
    - Filter by cohort, subscription plan, or subject
  - "Quality Metrics" - loads session ratings, no-shows
  - "System Health" - loads system errors, payment gateway status
  - "Custom View" - user's saved selections
  
- [ ] Build save/load custom views
  - "Save current view" button
  - Name the view
  - Store in localStorage
  - "Load view" dropdown with saved views

### 8.2 Data Export
- [ ] Build "Export chart data" button
  - Download current chart data as CSV
  - Include: timestamps, all plotted streams, event markers
  - Filename: `marketplace-data-[date].csv`
  
- [ ] Build "Export screenshot" button
  - Capture chart as PNG image
  - Use ECharts built-in export feature
  - Filename: `marketplace-chart-[date].png`

### 8.3 Time Travel (Optional)
- [ ] Build time scrubber control
  - Slider to scrub through historical time
  - Pause real-time updates
  - Show dashboard state at selected time
  - "Return to NOW" button
  - Useful for replaying scenarios

### 8.4 Stream Details Modal
- [ ] Build detailed stream view modal
  - Click stream name anywhere to open
  - Shows:
    - Full 30-day history chart
    - Statistics (mean, σ, percentiles)
    - Recent events for this stream
    - Related streams
    - Related recommendations (if any exist for this stream)

---

## Phase 9: Testing & Polish (Days 11-12)

### 9.1 UI/UX Testing
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

### 9.2 Performance Optimization
- [ ] Optimize chart rendering
  - Limit max data points shown (downsample if needed)
  - Debounce real-time updates
  - Use ECharts performance features (lazy loading, progressive rendering)
  
- [ ] Optimize heatmap rendering
  - Virtual scrolling if needed (probably not with only 50 cells)
  - Efficient re-rendering (only update changed cells)
  - CSS transforms for animations (GPU-accelerated)
  
- [ ] Optimize state updates
  - Batch updates where possible
  - Use Svelte's fine-grained reactivity effectively
  - Profile and identify bottlenecks

### 9.3 Accessibility
- [ ] Add keyboard navigation
  - Tab through interactive elements
  - Enter to activate buttons
  - Arrow keys to navigate heatmap cells
  - Escape to close modals
  
- [ ] Add ARIA labels
  - Screen reader friendly labels for all interactive elements
  - Announce state changes (e.g., "Stream added to chart")
  - Semantic HTML
  
- [ ] Add focus indicators
  - Clear focus outlines on all interactive elements
  - High contrast mode support (use CSS variables)

### 9.4 Documentation
- [ ] Create user guide
  - How to use the dashboard
  - Explanation of each section
  - Tips for interpreting the data
  - Common workflows
  
- [ ] Create tooltips/help text
  - Question mark icons with help text
  - First-time user walkthrough (optional)
  - Inline explanations where helpful

---

## Phase 10: Deployment & Demo Prep (Day 12)

### 10.1 Build & Deploy
- [ ] Optimize production build
  - Minification
  - Code splitting
  - Tree shaking
  - Asset optimization
  
- [ ] Deploy to Railway (same app as simulator)
  - Ensure routing works (`/dashboard` and `/admin`)
  - Test on production URL
  - Verify WebSocket connection works

### 10.2 Demo Scenarios
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
  - Highlight key interactions (heatmap, chart, events)

### 10.3 Handoff
- [ ] Create demo video (optional)
  - Screen recording with voiceover
  - 3-5 minutes showing key features
  - Upload to video platform
  
- [ ] Create README for dashboard
  - Architecture overview
  - Component structure
  - State management
  - How to add new features
  - Deployment instructions

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

- **Days 1-2**: Foundation, setup, state management
- **Days 2-3**: WebSocket integration, data aggregation
- **Days 3-5**: Main chart with ECharts
- **Days 5-7**: Interactive heatmap
- **Days 7-8**: External events timeline
- **Days 8-10**: AI recommendations panel
- **Days 10-11**: Dashboard layout and polish
- **Days 11-12**: Advanced features
- **Days 11-12**: Testing, optimization, deployment

**Total Estimated Time**: 12 days for full feature set

**MVP Timeline**: 8-9 days (through Phase 6)

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
