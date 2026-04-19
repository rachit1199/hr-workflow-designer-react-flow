import { useAutomations } from './hooks/useWorkflow';
import { Sidebar } from './components/sidebar/Sidebar';
import { Canvas } from './components/Canvas';
import { NodeFormPanel } from './components/forms/NodeFormPanel';
import { SimulationPanel } from './components/panels/SimulationPanel';
import { useWorkflowStore } from './store/workflowStore';

export default function App() {
  useAutomations();

  const selectedNodeId = useWorkflowStore(s => s.selectedNodeId);
  const showSimPanel = useWorkflowStore(s => s.showSimPanel);

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: 'var(--bg)',
    }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <Canvas />

        {/* Toolbar overlay */}
        <div style={{
          position: 'absolute',
          top: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '6px 16px',
          fontSize: 12,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          zIndex: 5,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>
          HR Workflow Designer
        </div>
      </div>

      {selectedNodeId && !showSimPanel && <NodeFormPanel />}
      {showSimPanel && <SimulationPanel />}
    </div>
  );
}
