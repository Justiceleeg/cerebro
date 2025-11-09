/**
 * Chart state store
 * Manages zoom level, pan position, selected streams for chart display, and event markers visibility
 */

export interface ChartStateStore {
	zoomLevel: number; // 1.0 = no zoom, >1.0 = zoomed in, <1.0 = zoomed out
	panPosition: { x: number; y: number }; // Pan offset in pixels
	selectedStreams: string[]; // Streams to display in chart
	eventMarkersVisible: boolean;
}

const initialState: ChartStateStore = {
	zoomLevel: 1.0,
	panPosition: { x: 0, y: 0 },
	selectedStreams: [],
	eventMarkersVisible: true
};

export const chartStore = $state(initialState);

export function setZoomLevel(level: number) {
	chartStore.zoomLevel = Math.max(0.1, Math.min(10, level)); // Clamp between 0.1 and 10
}

export function resetZoom() {
	chartStore.zoomLevel = 1.0;
}

export function zoomIn(factor: number = 1.2) {
	chartStore.zoomLevel = Math.min(10, chartStore.zoomLevel * factor);
}

export function zoomOut(factor: number = 1.2) {
	chartStore.zoomLevel = Math.max(0.1, chartStore.zoomLevel / factor);
}

export function setPanPosition(x: number, y: number) {
	chartStore.panPosition = { x, y };
}

export function resetPan() {
	chartStore.panPosition = { x: 0, y: 0 };
}

export function addStreamToChart(streamName: string) {
	if (!chartStore.selectedStreams.includes(streamName)) {
		chartStore.selectedStreams = [...chartStore.selectedStreams, streamName];
	}
}

export function removeStreamFromChart(streamName: string) {
	chartStore.selectedStreams = chartStore.selectedStreams.filter((s) => s !== streamName);
}

export function setChartStreams(streams: string[]) {
	chartStore.selectedStreams = streams;
}

export function clearChartStreams() {
	chartStore.selectedStreams = [];
}

export function setEventMarkersVisible(visible: boolean) {
	chartStore.eventMarkersVisible = visible;
}

export function toggleEventMarkers() {
	chartStore.eventMarkersVisible = !chartStore.eventMarkersVisible;
}

export function resetChart() {
	chartStore.zoomLevel = 1.0;
	chartStore.panPosition = { x: 0, y: 0 };
	chartStore.selectedStreams = [];
	chartStore.eventMarkersVisible = true;
}

