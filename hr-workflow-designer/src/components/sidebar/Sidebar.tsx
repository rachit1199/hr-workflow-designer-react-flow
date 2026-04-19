import { useAddNode } from '../../hooks/useWorkflow';
import { useSimulate } from '../../hooks/useWorkflow';
import { useWorkflowStore } from '../../store/workflowStore';
import { Play, Download, Upload, Loader2 } from 'lucide-react';
import type { NodeType } from '../../types';

const NODE_TYPES: { type: NodeType; label: string; icon: string; color: string; desc: string }[] = [
  { type: 'start', label: 'Start', icon: '▶', color: '#22c55e', desc: 'Entry point' },
  { type: 'task', label: 'Task', icon: '☑', color: '#3b82f6', desc: 'Human task' },
  { type: 'approval', label: 'Approval', icon: '✓', color: '#a855f7', desc: 'Approval step' },
  { type: 'automated', label: 'Automated', icon: '⚡', color: '#f97316', desc: 'System action' },
  { type: 'end', label: 'End', icon: '⏹', color: '#ef4444', desc: 'Completion' },
];

export function Sidebar() {
  const addNode = useAddNode();
  const simulate = useSimulate();
  const isSimulating = useWorkflowStore(s => s.isSimulating);
  const exportWorkflow = useWorkflowStore(s => s.exportWorkflow);
  const importWorkflow = useWorkflowStore(s => s.importWorkflow);
  const nodes = useWorkflowStore(s => s.nodes);

  const handleExport = () => {
    const json = exportWorkflow();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        importWorkflow(text);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleDragStart = (e: React.DragEvent, type: NodeType) => {
    e.dataTransfer.setData('nodeType', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div style={{
      width: 220,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          fontSize: 13,
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          color: 'var(--accent)',
          letterSpacing: '-0.02em',
        }}>
          HR Workflow
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
          Designer
        </div>
      </div>

      {/* Node palette */}
      <div style={{ padding: '14px 12px', flex: 1 }}>
        <div style={{
          fontSize: 10,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          letterSpacing: '0.1em',
          marginBottom: 10,
        }}>
          NODE PALETTE
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {NODE_TYPES.map(({ type, label, icon, color, desc }) => (
            <div
              key={type}
              draggable
              onDragStart={e => handleDragStart(e, type)}
              onClick={() => addNode(type)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 10px',
                borderRadius: 8,
                border: `1px solid ${color}22`,
                background: `${color}0d`,
                cursor: 'grab',
                transition: 'background 0.15s, border-color 0.15s, transform 0.1s',
                userSelect: 'none',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.background = `${color}1a`;
                (e.currentTarget as HTMLDivElement).style.borderColor = `${color}44`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.background = `${color}0d`;
                (e.currentTarget as HTMLDivElement).style.borderColor = `${color}22`;
              }}
            >
              <span style={{ fontSize: 14, color }}>{icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{
        padding: '10px 12px',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        gap: 12,
      }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
            {nodes.length}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Nodes</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={simulate}
          disabled={isSimulating || nodes.length === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            padding: '9px',
            borderRadius: 8,
            background: isSimulating ? 'var(--surface-3)' : 'var(--accent)',
            color: 'white',
            fontSize: 13,
            fontWeight: 600,
            opacity: nodes.length === 0 ? 0.5 : 1,
            transition: 'opacity 0.15s, background 0.15s',
            cursor: nodes.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          {isSimulating ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={14} />}
          {isSimulating ? 'Running…' : 'Run Simulation'}
        </button>

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={handleExport}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              padding: '7px',
              borderRadius: 7,
              background: 'var(--surface-3)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              fontSize: 12,
            }}
          >
            <Download size={12} /> Export
          </button>
          <button
            onClick={handleImport}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              padding: '7px',
              borderRadius: 7,
              background: 'var(--surface-3)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              fontSize: 12,
            }}
          >
            <Upload size={12} /> Import
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
