# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm start` - Start development server (opens http://localhost:3000)
- `npm run build` - Build for production
- `npm test` - Run Jest tests in watch mode
- `npm test -- --watchAll=false` - Run tests once without watch mode
- `npm run lint` - Run ESLint on all TypeScript files
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run type-check` - Run TypeScript compiler without emitting
- `npm run validate` - Run full validation (type-check, lint, tests)

### Testing Specific Components
- `npm test -- --testNamePattern="ComponentName"` - Run tests matching pattern
- `npm test -- src/components/Canvas/Canvas.test.tsx` - Run specific test file

## Architecture Overview

### State Management Architecture
This application uses **Zustand** for centralized state management with a single store (`src/store/diagramStore.ts`) that manages:
- Network devices and their configurations
- Connections between devices  
- Current selection state (selected device/connection)
- Network layer context (L1/L2/L3)
- Diagram loading/saving operations

The store follows an immutable update pattern and automatically handles cascading deletes (e.g., removing a device also removes its connections).

### Component Architecture
The app follows a **layout-based component structure**:

- **App.tsx** - Root component with Material-UI theme and DnD context
- **Toolbar/** - Top navigation with file operations, layer switching, and export controls
- **Sidebar/** - Draggable device library using react-dnd
- **Canvas/** - React Flow-based diagram editor with custom network device nodes
- **Properties/** - Context-sensitive property editor for selected items
- **Templates/** - Modal dialog for loading pre-built network templates

### Data Flow
1. **Device Creation**: Drag from Sidebar → Drop on Canvas → Zustand store update → React Flow re-render
2. **Connections**: React Flow connection event → Store validation → Store update
3. **Property Editing**: Properties panel → Store update → Re-render affected components
4. **Template Loading**: Templates component → Store.loadDiagram() → Complete state replacement

### Key Integrations

**React Flow Integration**: 
- Custom `NetworkDeviceNode` components render network devices
- Nodes are synced bidirectionally with Zustand store
- Connection creation handled through React Flow's onConnect callback

**React DnD Integration**:
- Sidebar devices are draggable with type `'network-device'`
- Canvas accepts drops and calculates position using React Flow's coordinate system

**Export System**:
- PNG export via html2canvas targeting React Flow canvas
- SVG export with custom SVG generation from device/connection data
- JSON export serializes complete diagram state

### Template System
Network templates (`src/data/templates.ts`) define reusable network architectures with:
- Device definitions with types, positions, and initial configurations
- Connection mappings between devices by array index
- Metadata for template selection UI

Templates are instantiated by generating unique IDs for devices and connections, then replacing the entire store state.

### TypeScript Architecture
Core types defined in `src/types/network.ts`:
- `NetworkDevice` - Device entities with position, config, and type
- `Connection` - Links between devices with interface mapping
- `NetworkDiagram` - Complete diagram state for serialization
- `DeviceType` - Union type for supported network device categories

The type system enforces network-specific constraints like layer types (L1/L2/L3) and connection types (ethernet/serial/fiber/wireless).

## Development Notes

### Adding New Device Types
1. Update `DeviceType` union in `src/types/network.ts`
2. Add icon mapping in `src/components/Canvas/NetworkDeviceNode.tsx`
3. Add to device templates in `src/components/Sidebar/Sidebar.tsx`

### Extending Export Formats
Export utilities in `src/utils/exportUtils.ts` provide a foundation for new formats. Each export function should accept the current devices and connections arrays from the store.

### State Management Patterns
When adding new store actions, follow the existing pattern:
- Accept minimal required parameters
- Use functional state updates with spread operators
- Handle related state cleanup (e.g., selections, cascading deletes)
- Generate IDs using timestamp-based approach for uniqueness