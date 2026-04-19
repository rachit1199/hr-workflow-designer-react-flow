import { Handle, Position, useReactFlow } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { WorkflowNodeData, NodeType } from '../../types';
import { useWorkflowStore } from '../../store/workflowStore';
import { Trash2 } from 'lucide-react';

interface NodeConfig {
  color: string;
  bg: string;
  label: string;
  icon: string;
  hasSource: boolean;
  hasTarget: boolean;
}

const NODE_CONFIG: Record<NodeType, NodeConfig> = {
  start:     { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   label: 'START',    icon: '▶', hasSource: true,  hasTarget: false },
  task:      { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  label: 'TASK',     icon: '☑', hasSource: true,  hasTarget: true },
  approval:  { color: '#a855f7', bg: 'rgba(168,85,247,0.12)', label: 'APPROVAL', icon: '✓', hasSource: true,  hasTarget: true },
  automated: { color: '#f97316', bg: 'rgba(249,115,22,0.12)', label: 'AUTO',     icon: '⚡', hasSource: true,  hasTarget: true },
  end:       { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   label: 'END',      icon: '⏹', hasSource: false, hasTarget: true },
};

function getTitle(data: WorkflowNodeData): string {
  return data.type === 'end' ? (data.endMessage || 'End') : (data.title || data.type);
}

function getSubtitle(data: WorkflowNodeData): string {
  switch (data.type) {
    case 'task':      return data.assignee ? `→ ${data.assignee}` : 'Unassigned';
    case 'approval':  return data.approverRole;
    case 'automated': return data.actionId ? data.actionId.replace('_', ' ') : 'No action set';
    case 'start':     return data.metadata.length ? `${data.metadata.length} metadata field(s)` : 'Entry point';
    case 'end':       return data.summaryFlag ? 'Summary enabled' : 'Completion';
  }
}

export function BaseNode({ id, selected }: NodeProps) {
  const nodes = useWorkflowStore(s => s.nodes);
  const node = nodes.find(n => n.id === id);
  const setSelectedNodeId = useWorkflowStore(s => s.setSelectedNodeId);
  const deleteNode = useWorkflowStore(s => s.deleteNode);
  const selectedNodeId = useWorkflowStore(s => s.selectedNodeId);
  const { deleteElements } = useReactFlow();

  if (!node) return null;
  const data = node.data as WorkflowNodeData;
  const config = NODE_CONFIG[data.type];
  const isSelected = selectedNodeId === id || selected;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNodeId(id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(id);
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <div
      onClick={handleClick}
      style={{
        background: config.bg,
        border: `1.5px solid ${isSelected ? config.color : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 10,
        minWidth: 180,
        maxWidth: 220,
        position: 'relative',
        boxShadow: isSelected
          ? `0 0 0 1px ${config.color}40, 0 4px 20px ${config.color}20`
          : '0 2px 8px rgba(0,0,0,0.4)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        cursor: 'pointer',
      }}
    >
      {config.hasTarget && (
        <Handle type="target" position={Position.Top} style={{ borderColor: config.color, background: 'var(--bg)' }} />
      )}

      {/* Header */}
      <div style={{
        padding: '6px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: config.color }}>{config.icon}</span>
          <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 600, color: config.color, letterSpacing: '0.08em' }}>
            {config.label}
          </span>
        </div>
        <button
          onClick={handleDelete}
          style={{ background: 'transparent', color: 'rgba(255,255,255,0.2)', padding: 2, borderRadius: 4, display: 'flex', transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
        >
          <Trash2 size={11} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {getTitle(data)}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {getSubtitle(data)}
        </div>
      </div>

      {config.hasSource && (
        <Handle type="source" position={Position.Bottom} style={{ borderColor: config.color, background: 'var(--bg)' }} />
      )}
    </div>
  );
}
