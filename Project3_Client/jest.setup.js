require('@testing-library/jest-dom');

// provide a basic fetch mock placeholder; tests will override as needed
// Default to a successful empty-array response so components that expect lists don't throw
global.fetch = global.fetch || jest.fn(() => Promise.resolve({
	ok: true,
	status: 200,
	headers: { entries: () => [], get: () => null },
	json: () => Promise.resolve([])
}));

// Ensure `define` (AMD) is present on the global object to avoid loader issues in tests
global.define = global.define || undefined;

// Polyfill TextEncoder/TextDecoder for environments that lack them
try {
	const { TextEncoder, TextDecoder } = require('util');
	if (typeof global.TextEncoder === 'undefined') global.TextEncoder = TextEncoder;
	if (typeof global.TextDecoder === 'undefined') global.TextDecoder = TextDecoder;
} catch (e) {
	// ignore if not available
}

// Keep module registry stable across tests. Tests that need isolated
// requires should use `jest.isolateModules()` or call `jest.resetModules()`
// themselves. Only clear mocks globally after each test.
afterEach(() => {
    try {
        jest.clearAllMocks();
    } catch (e) {
        // ignore in environments where jest globals aren't present
    }
});

// Ensure a clean module registry and global state before each test.
// This makes patterns like `jest.doMock(...); require('...')` reliable
// and prevents window-scoped flags from leaking between tests.
beforeEach(() => {
	try {
		jest.clearAllMocks();
	} catch (e) {
		// ignore when jest globals are not present
	}

	// clear common window-scoped test flags used by components
	try { delete window.__cashier_initial_fetch_done; } catch (e) {}
	try { delete window.__cashier_override_handled; } catch (e) {}
	try { delete window.__kiosk_google_login_handled; } catch (e) {}

	// ensure alert is a jest mock so tests can spy/inspect it safely
	if (typeof window !== 'undefined') {
		try {
			if (typeof window.alert !== 'function' || !window.alert._isMockFunction) {
				window.alert = jest.fn();
			}
		} catch (e) {
			// ignore
		}
	}
});

// Prevent Chart.js from trying to acquire a real CanvasRenderingContext in jsdom tests.
// Mock `react-chartjs-2` to render a simple div instead of trying to draw to a canvas.
try {
	jest.mock('react-chartjs-2', () => {
		const React = require('react');
		const MockChart = (props) => React.createElement('div', { 'data-testid': 'chart-mock' }, null);
		return { Line: MockChart, Bar: MockChart, Pie: MockChart, Doughnut: MockChart };
	});
} catch (e) {
	// jest may not be available in some tooling contexts; ignore failures here
}
