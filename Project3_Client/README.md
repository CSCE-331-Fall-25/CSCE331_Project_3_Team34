# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

## Tests

This project includes a set of Jest unit tests (located in the `Unit tests/` folder) that exercise the main page components. You can run them from the `Project3_Client` directory.

- Run all tests (parallel):

```powershell
npm test
```

- Run all tests sequentially (safer when tests share globals or when debugging):

```powershell
npm run test:ci
```

- Run a single test file with Jest directly (example):

```powershell
npx jest "Unit tests/Menu.test.jsx" --config ./jest.config.cjs --runInBand
```

What the tests cover
- `Unit tests/Cashier.test.jsx`: exercises the Cashier page flows (transaction state updates, UI elements and buttons used in cashier workflows).
- `Unit tests/Kiosk.test.jsx`: verifies kiosk-related behaviors (Google login redirect handling, session interactions and kiosk flow). The test uses a focused mock for the kiosk callback behavior.
- `Unit tests/Kitchen.test.jsx`: checks the Kitchen page (ticket loading, status updates and display behavior).
- `Unit tests/Login.test.jsx`: validates the Login page (form rendering, empty-submit alerts, server/Google login flows and navigation on success).
- `Unit tests/Manager.test.jsx`: smoke tests for the Manager page (renders manager container, presence of manager controls and basic report/chart handling). Chart rendering is mocked during tests to avoid a canvas requirement in jsdom.
- `Unit tests/Menu.test.jsx`: tests the Menu page (menu loading by type, pagination, and item display behavior).

Notes and debugging tips
- The test runner is configured via `jest.config.cjs`. If you see warnings like "An update to <Component> inside a test was not wrapped in act(...)" it means a component performs async state updates in effects — the tests still pass, but you can make tests less noisy by awaiting effect-driven updates with `waitFor()` or `findBy*` queries.
- Use `--runInBand` (or the `test:ci` script) when tests fail due to shared global state or module mocking issues.
- If you need to mock network responses, tests set `global.fetch` per-test in many suites; add/override `global.fetch` in the test before rendering the component.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
