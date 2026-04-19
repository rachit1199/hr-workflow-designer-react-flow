# HR Workflow Designer

<img src="https://github.com/rachit1199/hr-workflow-designer-react-flow/blob/main/2.jpg" />

A full-stack-ready, production-quality HR Workflow Designer built for the Tredence Studio Full Stack Engineering Internship case study.

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Architecture

### Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React 18 + Vite | Fast HMR, modern JSX transform |
| Language | TypeScript (strict mode) | Type safety, IDE ergonomics |
| Canvas | `@xyflow/react` v12 | Best-in-class graph UI library |
| State | Zustand | Minimal boilerplate, no Context hell |
| Styling | CSS variables + inline styles | Zero runtime overhead, full control |
| Icons | `lucide-react` | Consistent, tree-shakeable |

### Folder Structure

```
src/
├── api/
│   └── mockApi.ts          # GET /automations + POST /simulate (local mocks)
├── components/
│   ├── Canvas.tsx           # ReactFlow canvas with drag-drop
│   ├── nodes/
│   │   └── BaseNode.tsx     # Universal node renderer (all 5 types)
│   ├── forms/
│   │   └── NodeFormPanel.tsx # Per-node-type configuration forms
│   ├── panels/
│   │   └── SimulationPanel.tsx # Execution log / sandbox
│   └── sidebar/
│       └── Sidebar.tsx      # Node palette, actions, stats
├── hooks/
│   └── useWorkflow.ts       # useAddNode, useSimulate, useAutomations
├── store/
│   └── workflowStore.ts     # Zustand store (single source of truth)
├── types/
│   └── index.ts             # All TypeScript interfaces
├── App.tsx
├── main.tsx
└── index.css
```

---

## Design Decisions

### 1. Single `BaseNode` Component
Instead of 5 separate node files, I created one `BaseNode` that reads `data.type` and adapts. This avoids repetition and means all visual behavior (selection ring, delete button, handle colors) is controlled in one place. Adding a new node type means: add a type to `types/index.ts`, add config to `NODE_CONFIG`, add a form in `NodeFormPanel.tsx`.

### 2. Zustand over Context
Context with `useReducer` would have caused excessive re-renders across the canvas as nodes update. Zustand's selector-based subscriptions mean only the component that reads a slice re-renders. The entire canvas, node form, and simulation panel are fully independent.

### 3. Mock API Design
The `mockApi.ts` file exports `getAutomations()` and `simulateWorkflow()` with artificial delays to mimic real network latency. Replacing these with actual `fetch()` calls to a real backend requires zero changes to the rest of the app — the interface is identical.

### 4. Topological Sort for Simulation
The `/simulate` mock doesn't just iterate nodes randomly — it does a BFS topological sort (Kahn's algorithm) to execute nodes in dependency order. This demonstrates understanding of graph data structures, not just UI state management.

### 5. Form Extensibility
Each node form is a self-contained component receiving `data` and an `update` callback. Adding new fields to any node requires only changes in that one form component. The `KeyValueEditor` is a reusable sub-component used in both StartNode (metadata) and TaskNode (custom fields).

### 6. Type Safety
All node data is modeled as a discriminated union (`WorkflowNodeData`). TypeScript will catch any switch/case exhaustiveness issues. The store's `updateNodeData` uses `Partial<WorkflowNodeData>` with type assertions intentionally — the form components always pass correctly typed partial objects.

---

## Features Implemented

### Required
- [x] **Workflow Canvas** — Drag-and-drop nodes, connect with edges, delete nodes/edges
- [x] **5 Node Types** — Start, Task, Approval, Automated Step, End
- [x] **Node Config Forms** — Per-type editable panels with all required fields
- [x] **Dynamic Automated Forms** — Action params are rendered dynamically based on selected action
- [x] **Mock API Layer** — `GET /automations`, `POST /simulate` with realistic delay
- [x] **Simulation Panel** — Step-by-step timeline log with status indicators
- [x] **Graph Validation** — Detects missing Start/End nodes, disconnected nodes
- [x] **Auto-validate constraints** — Single Start node enforcement on add

### Bonus
- [x] **Export/Import workflow as JSON** — Download/upload full workflow state
- [x] **MiniMap** — Color-coded by node type
- [x] **Zoom/Pan controls** — Built into ReactFlow
- [x] **Drag from sidebar onto canvas** — Calculates drop position from mouse coordinates

---

## What I Would Add With More Time

1. **Undo/Redo** — Implement a history stack in Zustand using the `temporal` middleware from `zundo`.
2. **Visual validation errors on nodes** — Show a red badge on nodes with missing required fields.
3. **Auto-layout** — Use `elkjs` or `dagre` to auto-arrange nodes in a DAG layout.
4. **Node version history** — Store snapshots of node data per edit.
5. **Real backend** — Replace `mockApi.ts` with a FastAPI backend. The interface is already designed for a clean swap.
6. **E2E tests** — Cypress tests for the happy path: add Start → Task → End → simulate.
7. **Collaborative editing** — Integrate Y.js + WebSockets for real-time multi-user canvas editing.
8. **Conditional edges** — Allow edge labels like "approved / rejected" for branching approval flows.

---

## Assumptions

- No authentication required per the spec.
- No persistent backend — state lives in memory and can be exported/imported as JSON.
- The "auto-approve threshold" is a percentage score (0–100), simulating a confidence metric.
- Cycles in the graph are detected via the topological sort (remaining nodes after BFS have unresolved in-degrees).
