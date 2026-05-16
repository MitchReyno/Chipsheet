# Chipsheet

A general-purpose electronic component cheatsheet generator. Chipsheet produces printable reference materials from a shared component data library.

## Output Types

| Output                  | Status      | Description                                                                                       |
| ----------------------- | ----------- | ------------------------------------------------------------------------------------------------- |
| **Pinout diagrams**     | Implemented | Dimensionally accurate, datasheet-style SVG/PNG/JPG IC pinout diagrams with internal gate symbols |
| **Datasheet booklets**  | Planned     | Multi-IC reference booklets as printable PDFs                                                     |
| **IC-top stickers**     | Planned     | Miniature pin labels sized to stick on top of DIP packages                                        |
| **Breadboard stencils** | Planned     | Stencils sized to sit around a chip inserted into a breadboard                                    |

## Pinout Diagrams

Diagrams are generated from YAML data files and rendered as SVG with accurate JEDEC DIP package proportions. Each diagram shows:

- IC body with notch marker indicating pin 1 orientation
- Pin stubs with numbers inside the body and names outside
- Internal logic gate symbols (NOT, NAND, NOR, AND, OR, XOR, XNOR) where the IC contains simple subcircuits

### Supported IC Library (v1)

4000-series CMOS logic: CD4001, CD4011, CD4017, CD4040, CD4069, CD4070, CD4071, CD4081

## Development Setup

**Prerequisites:** Node.js 20+

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to browse the IC library and download diagrams.

### Available Scripts

| Script                  | Description                           |
| ----------------------- | ------------------------------------- |
| `npm run dev`           | Start development server              |
| `npm run build`         | Production build                      |
| `npm run lint`          | Run ESLint                            |
| `npm run lint:fix`      | Run ESLint with auto-fix              |
| `npm run format`        | Format all source files with Prettier |
| `npm run format:check`  | Check formatting without writing      |
| `npm test`              | Run test suite                        |
| `npm run test:watch`    | Run tests in watch mode               |
| `npm run test:coverage` | Run tests with coverage report        |

### Export API

Diagrams can be exported directly via the API:

```
GET /api/export/[partNumber]?format=svg|png|jpg&scale=<number>
```

Example: `/api/export/CD4069?format=png&scale=2`

### Project Structure

```
src/
  app/          # Next.js App Router pages and API routes
  components/   # React components (PinoutDiagram, NavBar, etc.)
  lib/          # Business logic (schema, symbols, DIP constants)
  data/         # IC YAML files and loaders
  types/        # TypeScript interfaces
  test/         # Test setup, fixtures, and integration tests
docs/           # Project documentation
```

### Adding New ICs

Add a YAML file to `src/data/ics/<series>/<PART>.yaml`. The file is validated against the Zod schema on load — see `src/lib/schema.ts` and `docs/testing.md` for details.

### Print Accuracy

SVG diagrams are generated at actual DIP package proportions (300-mil row spacing, 100-mil pin pitch). To verify your printer is outputting at the correct scale, measure a printed diagram against the physical chip before using stencils or stickers.
