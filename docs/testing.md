# Testing Guide

## 1. Test Scope and Philosophy

We test **behaviour**, not implementation. A test should verify what the code does for its callers, not how it does it internally. If a test breaks because you renamed a private variable without changing observable behaviour, that test is wrong.

What we test:

- Pure functions and data transforms (schema validation, dimension calculations, symbol path generation)
- React component rendering and user-facing output (correct SVG structure, pin labels, gate symbols)
- The data loading pipeline (valid YAML loads, missing file throws, bad schema fails)

What we do **not** test:

- Third-party library internals (Zod's validation engine, Sharp's rasterisation, Next.js routing)
- Implementation details that are not observable from outside a module
- Snapshot tests of arbitrary component state (exception: SVG output regression checks)

---

## 2. Test Categories

### Unit Tests

For pure functions and data transforms that have no side effects and no external dependencies. Fastest to run; no mocking needed.

Examples:

- `src/lib/schema.ts` — Zod IC schema validation
- `src/lib/dip.ts` — dimension calculation functions
- `src/lib/symbols.ts` — SVG path string generators

### Component Tests

For React components rendered in isolation using React Testing Library. Verify that the component renders the correct DOM/SVG structure and responds to props.

Examples:

- `src/components/PinoutDiagram.tsx` — renders correct IC body, pins, gate symbols
- `src/components/NavBar.tsx` — renders correct navigation links

### Integration Tests

For multi-module pipelines where testing each module in isolation would miss important interactions. Live in `src/test/integration/`.

Examples:

- Data loader + Zod schema + renderer pipeline (load YAML → validate → render SVG)

---

## 3. File and Naming Conventions

- Co-locate test files with the source file they test: `src/lib/schema.ts` → `src/lib/schema.test.ts`
- Use `.test.ts` for non-JSX tests and `.test.tsx` for tests that render React components
- Integration tests that span multiple modules go in `src/test/integration/`
- Fixture YAML files go in `src/test/fixtures/`
- Shared test helpers go in `src/test/helpers/`

---

## 4. Mocking Approach

**Mock when:**

- External I/O is involved (file system reads in tests that don't test the loader itself)
- Native binary dependencies are involved (Sharp — mock in component tests that aren't testing export)
- A dependency is non-deterministic (dates, random values)

**Do not mock:**

- Pure logic — call the real function
- Zod schemas — validate against the real schema to catch schema bugs
- The data loader in schema unit tests

**How to mock in Jest:**

- `jest.mock('module-path')` at the top of the test file for automatic mocking
- Manual mocks in `src/__mocks__/` for modules that need a custom mock implementation
- Use `jest.spyOn` when you need to restore original behaviour after the test

---

## 5. Test Data and Fixtures

Fixture YAML files in `src/test/fixtures/` provide known-good IC definitions for component tests. This decouples component tests from the live data files.

To create a fixture:

1. Copy or write a minimal valid YAML file that exercises the behaviour you are testing
2. Place it in `src/test/fixtures/<PartNumber>.yaml`
3. Load it in your test with `fs.readFileSync` + `js-yaml.load` + the Zod schema, or import a pre-parsed object directly

Keep fixture ICs simple — a DIP-4 with 2 gates is easier to assert against than a full DIP-14.

---

## 6. Assertion Style

- **DOM/SVG structure** — prefer `@testing-library/jest-dom` matchers: `toBeInTheDocument()`, `toHaveAttribute()`, `toHaveTextContent()`
- **Data objects** — prefer `toEqual` for deep equality, `toMatchObject` when you only care about a subset of fields
- **Error cases** — `expect(() => fn()).toThrow(SpecificError)` or `await expect(promise).rejects.toThrow()`
- **Snapshot tests** — only for SVG output regression checks, where the full string output is the contract. Prefer explicit assertions for everything else
- Avoid `toBeTruthy` / `toBeFalsy` — be specific about what you are asserting

---

## 7. CI Expectations

- Tests run on every commit via the pre-commit hook (`npx lint-staged` runs tests before committing)
- `npm test` — runs all tests, exits 0 when all pass
- `npm run test:coverage` — generates a coverage summary and writes an LCOV report to `coverage/`
- No enforced coverage threshold in v1, but coverage is tracked and should not regress significantly
- Test output must be deterministic — flaky tests are treated as bugs
