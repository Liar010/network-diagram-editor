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
- Connections between devices with interface mappings
- Current selection state (single and multiple selection)
- Network layer context (L1/L2/L3)
- Diagram loading/saving operations
- Annotations (text notes and sticky notes)
- Freehand drawings and drawing tools
- Undo/Redo history
- Device groups
- Copy/Paste clipboard

The store follows an immutable update pattern and automatically handles cascading deletes (e.g., removing a device also removes its connections).

### Component Architecture
The app follows a **layout-based component structure**:

- **App.tsx** - Root component with Material-UI theme and DnD context
- **Toolbar/** - Top navigation with file operations, layer switching, export controls, and drawing mode toggle
- **Sidebar/** - Draggable device library and annotation templates using react-dnd
- **Canvas/** - React Flow-based diagram editor with:
  - **NetworkDeviceNode** - Custom nodes for network devices
  - **AnnotationNode** - Text and sticky note annotations
  - **SelectableDrawingPanel** - SVG overlay for freehand drawing with selection
  - **DrawingToolbar** - Tools for pen, highlighter, rectangle drawing
- **Properties/** - Context-sensitive property editor for devices, connections, and annotations
- **Templates/** - Modal dialog for loading pre-built network templates
- **AutoLayout/** - Automatic layout algorithms (hierarchical, force-directed, circular)
- **ExportPreview/** - CSV export preview with column selection

### Data Flow
1. **Device Creation**: Drag from Sidebar → Drop on Canvas → Create device with interfaces → Zustand store update → React Flow re-render
2. **Connections**: React Flow connection event → Interface selection → Store validation → Store update with interface IDs
3. **Property Editing**: Properties panel → Store update → Re-render affected components
4. **Template Loading**: Templates component → Store.loadDiagram() → Complete state replacement with migration
5. **Annotations**: Drag from Sidebar → Drop on Canvas → Create annotation node → Store update
6. **Drawing**: Drawing tool selection → Mouse events on SVG overlay → Store update → Real-time path rendering
7. **Import/Export**: JSON includes all state (devices, connections, annotations, drawings) → Load restores complete state

### Key Integrations

**React Flow Integration**: 
- Custom `NetworkDeviceNode` components render network devices with interface ports
- `AnnotationNode` components for text and sticky notes
- Nodes are synced bidirectionally with Zustand store
- Connection creation handled through React Flow's onConnect callback with interface selection
- Drawing overlay uses React Flow's transform for pan/zoom synchronization

**React DnD Integration**:
- Sidebar devices are draggable with type `'network-device'`
- Annotations are draggable with type `'annotation'`
- Canvas accepts drops and calculates position using React Flow's coordinate system
- Grid snapping applied during drop

**Export System**:
- PNG export via html2canvas targeting React Flow canvas
- SVG export with custom SVG generation from device/connection data
- JSON export serializes complete diagram state including annotations and drawings
- CSV export with customizable columns and preview

**Interface Management**:
- Devices have multiple interfaces (ethernet, serial, fiber, wireless)
- Each interface has properties (IP, VLAN, speed, status)
- Connections map between specific interfaces on devices
- Migration system upgrades old diagrams to interface-based model

### Template System
Network templates (`src/data/templates.ts`) define reusable network architectures with:
- Device definitions with types, positions, and initial configurations
- Connection mappings between devices by array index
- Metadata for template selection UI

Templates are instantiated by generating unique IDs for devices and connections, then replacing the entire store state.

### TypeScript Architecture
Core types defined across multiple files:

**`src/types/network.ts`**:
- `NetworkDevice` - Device entities with position, config, interfaces array, and type
- `NetworkInterface` - Interface properties (name, type, IP, VLAN, status)
- `Connection` - Links between devices with source/target interface IDs
- `DeviceGroup` - Grouping of devices with collapse state
- `NetworkDiagram` - Complete diagram state including annotations and drawings
- `DeviceType` - Union type for supported network device categories

**`src/types/annotation.ts`**:
- `StructuredAnnotation` - Text notes and sticky notes with style properties
- `FreehandDrawing` - Drawing paths with stroke styles
- `DrawingTool` - Available drawing tools (select, pen, highlighter, rectangle)
- `AnnotationStyle` - Visual properties for annotations

**`src/types/reactflow.ts`**:
- `NetworkNode` - React Flow node type for devices
- `NetworkEdge` - React Flow edge type for connections

The type system enforces network-specific constraints like layer types (L1/L2/L3), connection types (ethernet/serial/fiber/wireless), and interface compatibility.

## Development Notes

### Adding New Device Types
1. Update `DeviceType` union in `src/types/network.ts`
2. Add icon mapping in `src/components/Canvas/NetworkDeviceNode.tsx`
3. Add to device templates in `src/components/Sidebar/Sidebar.tsx`
4. Define default interfaces in `src/utils/migrationUtils.ts`

### Adding New Annotation Types
1. Update `AnnotationType` in `src/types/annotation.ts`
2. Add rendering logic in `src/components/Canvas/AnnotationNode.tsx`
3. Add template in `src/components/Sidebar/Sidebar.tsx`
4. Create draggable component in `src/components/Sidebar/DraggableAnnotation.tsx`

### Extending Export Formats
Export utilities in `src/utils/exportUtils.ts` provide a foundation for new formats. Each export function should accept:
- devices array
- connections array  
- annotations array
- drawings array

### State Management Patterns
When adding new store actions, follow the existing pattern:
- Accept minimal required parameters
- Use functional state updates with spread operators
- Handle related state cleanup (e.g., selections, cascading deletes)
- Generate IDs using timestamp-based approach for uniqueness
- Update history for undo/redo support
- Clear conflicting selections when selecting different item types

### Interface Migration
The system automatically migrates old diagrams:
- Devices without interfaces get default interfaces based on type
- Connections using port names are mapped to interface IDs
- Migration happens transparently on diagram load

## Key Features Implementation Details

### Interface Management System
- Each device has multiple interfaces with unique IDs
- Interfaces have types (ethernet, serial, fiber, wireless) with different properties
- Connections map between specific interfaces, not just devices
- UI shows interface selection when creating connections
- Properties panel allows editing individual interface settings

### Annotation System
- Two types: text notes and sticky notes
- Draggable from sidebar like devices
- Double-click to edit content
- Resizable through properties panel
- Saved/loaded with diagram JSON

### Drawing System  
- SVG overlay synchronized with React Flow transform
- Tools: select, pen, highlighter, rectangle
- Individual drawing selection and deletion
- Drawing toolbar with color and stroke width controls
- Drawings move with canvas pan/zoom

### Multi-Selection & Copy/Paste
- Shift+click to add to selection
- Ctrl+C/V for copy/paste with position offset
- Clipboard includes devices and their connections
- Pasted items get new IDs

### Group Management
- Create groups from selected devices
- Groups can be collapsed/expanded
- Visual boundary box around grouped devices
- Groups saved in diagram state

## Important Files and Their Purposes

### Core Store
- `src/store/diagramStore.ts` - Central state management, all application state and actions

### Utilities
- `src/utils/exportUtils.ts` - All export functionality (PNG, SVG, JSON, CSV)
- `src/utils/layerUtils.ts` - Layer-specific display logic and connection styles
- `src/utils/migrationUtils.ts` - Interface migration and device upgrade logic
- `src/utils/layoutUtils.ts` - Auto-layout algorithms
- `src/utils/gridUtils.ts` - Grid snapping calculations

### Main Components
- `src/components/Canvas/NetworkDeviceNode.tsx` - Device rendering with interfaces
- `src/components/Canvas/AnnotationNode.tsx` - Text and sticky note rendering
- `src/components/Canvas/SelectableDrawingPanel.tsx` - Drawing overlay with selection
- `src/components/Properties/Properties.tsx` - Unified property editor for all items
- `src/components/Toolbar/Toolbar.tsx` - Main toolbar with all actions

## Testing Strategy
- Unit tests for store actions and utilities
- Component tests focus on user interactions
- Integration tests for drag-and-drop and export features
- Test files located alongside components (*.test.tsx)

## Performance Considerations
- Memoized components to prevent unnecessary re-renders
- Lazy loading for templates and large datasets
- Throttled drawing updates during freehand drawing
- Efficient diff algorithms for undo/redo

## Known Issues and Limitations
- Tests may need `interfaces: []` added to mock devices
- Drawing selection accuracy depends on zoom level
- Large diagrams (100+ devices) may have performance impact
- Some export formats may not preserve all styling