Unit tests for Project3_Client - summary and acceptance criteria

Overview
```markdown
## Unit tests — in-depth guide

This document explains what each unit test file in `Project3_Client/Unit tests` verifies, why certain mocks are used, how to run the tests, and how to diagnose the common failures you may encounter while authoring or running tests locally.

### Quick facts
- Location: `Project3_Client/Unit tests`
- Test runner: Jest (jsdom) + React Testing Library
- Main test goals: Ensure page components mount reliably, exercise primary event handlers and side-effects, and provide lightweight smoke/regression checks for the UI flows used in the client app.

### How to run the tests
- Install dependencies (if needed):

```powershell
cd Project3_Client
npm install
```

- Run all tests (parallel):

```powershell
npm test
```

- Run all tests sequentially (recommended for CI or when tests share globals):

```powershell
npm run test:ci
```

- Run a single test file (example):

```powershell
npx jest "Unit tests/Menu.test.jsx" --config ./jest.config.cjs --runInBand
```

### Mocking patterns used across tests
- `global.fetch` is commonly replaced per-test with a jest mock so components can exercise success and failure branches without an actual backend.
- `react-router-dom` hooks (for example `useNavigate` and `useSearchParams`) are mocked to make navigation and URL-driven behavior deterministic.
- Some Vite-only components (those using `import.meta` or other browser-only features) are mocked to plain React elements so Jest can import the modules without parsing errors.
- Chart rendering (Chart.js + react-chartjs-2) is mocked in global test setup to avoid jsdom canvas limitations.

Example fetch mock (common pattern used in tests):

```js
global.fetch = jest.fn((url, opts) => {
  if (url.includes('/api/authenticate-login')) {
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) });
  }
  return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
});
```

### Per-test file deep-dive
Below is a detailed description of what each test file is doing, which code paths it targets, and the rationale behind the mocks/assertions.

- `Unit tests/Login.test.jsx`
  - Focus: The Login page user flows (form rendering, client-side validation, server authentication flow, and the Google OAuth callback handling).
  - Key behaviors tested:
    - Rendering of the login form and the two input fields and submit button.
    - Client-side validation: submitting with empty username or password shows a specific alert message.
    - Failure and success branches when POSTing to `/api/authenticate-login` (mocked via `global.fetch`): tests assert that the correct alert or navigation happens.
    - Presence of the Google login button (the actual `googleLoginButton` component is mocked to a simple element during tests to avoid import.meta or external SDKs).
  - Why: Login logic interacts with both browser APIs (sessionStorage, window.history) and network APIs; unit tests keep those interactions deterministic via mocks so they exercise only the Login component logic.

- `Unit tests/Kiosk.test.jsx`
  - Focus: Kiosk flow and behavior after Google OAuth callback parameters in the URL.
  - Key behaviors tested:
    - Handling of `?success` and `functionality` URL parameters: the component shows the correct alert and sets a one-time handled flag on `window` so callbacks are not re-run.
    - Safe handling of sessionStorage (saved orders) during mount.
    - Basic fetch calls are triggered on mount when mocked; tests assert there are no unhandled rejections.
  - Why: The Kiosk page integrates with an OAuth redirect flow and session state; the tests are intentionally small and focused on the callback and side-effects rather than rendering the entire kiosk UI.

- `Unit tests/Cashier.test.jsx`
  - Focus: Basic cashier page flows (loading current state, transaction UI, customizing items, and manager overrides).
  - Key behaviors tested:
    - Render sanity for cashier header and language selector.
    - Manager override flow via URL query `?success=2` (ensures override flags and alerts don't crash).
    - UpdatePage and current-state loading: when `/api/current-state` returns empty results, the page should not crash.
    - Smoke tests for purchase and customize flows to make sure the core handlers are wired.
  - Why: Cashier has a lot of interactive logic and relies on server state; tests focus on the main entry points and validation behavior.

- `Unit tests/Manager.test.jsx`
  - Focus: Manager dashboard smoke checks (rendering the main container, availability of manager actions and chart/report code paths).
  - Key behaviors tested:
    - The manager container renders (we check for a top-level container element rather than asserting exact header text to be tolerant of small UI changes).
    - Buttons and controls used by managers (sign out, manage inventory, etc.) are present.
    - Chart rendering is not exercised against a real canvas — it is mocked globally in test setup to avoid jsdom canvas errors.
    - Safe handling when `/api/get-user` returns empty or errors — the page should not crash.
  - Why: The Manager page includes Chart.js and a number of server-driven report loads; tests ensure the page boots up and reacts to basic success/failure of API calls.

- `Unit tests/Kitchen.test.jsx`
  - Focus: Kitchen ticket loading and basic ticket UI.
  - Key behaviors tested:
    - Component mounts without crashes when `fetch` is mocked.
    - The ticket-loading code path correctly updates component state when fetch returns data (the tests are primarily smoke tests for mount + fetch flows).
    - Proper behaviour if translation context is not present.
  - Why: Kitchen UI depends on repeated async fetches; tests validate basic resilience of the component.

- `Unit tests/Menu.test.jsx`
  - Focus: Menu page flows (loading menus by type, paginating items, and rendering special menus like drinks/extra menus).
  - Key behaviors tested:
    - Mounts and renders the main page container.
    - When mocked fetch returns specific menu/type data (entrees, sides, drinks), the corresponding DOM nodes for items are rendered.
    - Pagination logic is exercised by returning more items than the page size and asserting the initial slice rendered matches the page size.
    - The component is resilient to fetch failures (test mocks a rejected fetch and asserts the component still mounts without unhandled exceptions).
  - Why: Menu has complex client-side logic (grouping by type, handling extras and paginating lists); the tests focus on the groups and pagination behavior rather than full end-to-end rendering.

### Common failures and how to debug them
- "Cannot use import.meta outside a module": this usually happens when source files use Vite-specific `import.meta` constructs. Solution: tests mock or guard those imports (we added small mocks for `import.meta`-dependent components in the test files). Example: `googleLoginButton.jsx` is mocked to a simple div.
- Chart.js / Canvas errors in jsdom: Chart.js tries to acquire a CanvasRenderingContext which jsdom does not provide. Solution: tests mock `react-chartjs-2` in the global `jest.setup.js` to a simple element (`data-testid="chart-mock"`), so Manager tests can run without a real canvas.
- "Invalid hook call" or duplicate React dispatchers after per-test mocking: if tests use `jest.doMock()` and then import components at the top level, module cache interactions can cause duplicate React internals. Solution: prefer stable module-level mocks, use `jest.resetModules()` before dynamic doMock/re-import patterns, or use runtime/factory mocks inside tests.
- "An update to <Component> inside a test was not wrapped in act(...)": this warning appears when components update state asynchronously in effects. Fixes:
  - Update tests to wait for async state changes: use `await waitFor(() => /* assertion */)` or use `findBy*` queries.
  - Ensure per-test `fetch` mocks return resolved promises to allow effects to finish before assertions.

### Test authoring tips
- When a component performs network requests in `useEffect`, stub `global.fetch` at the start of the test and return the exact shape the component expects (including `ok`, `status`, `headers.get`, and `json()` methods) to exercise both success and failure code paths.
- Prefer `findBy*` and `waitFor` from Testing Library when asserting on elements that appear as a result of async effects.
- Keep component-level mocks small and deterministic (e.g., mock `googleLoginButton` to `() => <div>GoogleMock</div>`). If a component uses `import.meta`, mock the module rather than editing source files.

If you want me to:
- Add per-file code examples (full fetch mock snippets used in each test) — I can insert short code blocks for `Login`, `Menu`, and `Manager`.
- Convert noisy tests to explicitly `await` effects to eliminate the remaining "act(...)" warnings.
- Update the top-level README to link to this document.

---

End of unit test documentation
```
