import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type NodeTypes,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowStore } from '../store/workflowStore';
import { BaseNode } from './nodes/BaseNode';
import { useAddNode } from '../hooks/useWorkflow';
import type { NodeType, WorkflowNodeData } from '../types';

const nodeTypes: NodeTypes = {
  start: BaseNode,
  task: BaseNode,
  approval: BaseNode,
  automated: BaseNode,
  end: BaseNode,
};

export function Canvas() {
  const nodes = useWorkflowStore(s => s.nodes);
  const edges = useWorkflowStore(s => s.edges);
  const onNodesChange = useWorkflowStore(s => s.onNodesChange);
  const onEdgesChange = useWorkflowStore(s => s.onEdgesChange);
  const onConnect = useWorkflowStore(s => s.onConnect);
  const setSelectedNodeId = useWorkflowStore(s => s.setSelectedNodeId);
  const addNode = useAddNode();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const onPaneClick = useCallback(() => setSelectedNodeId(null), [setSelectedNodeId]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('nodeType') as NodeType;
    if (!type || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    addNode(type, { x: e.clientX - rect.left - 90, y: e.clientY - rect.top - 30 });
  }, [addNode]);

  return (
    <div ref={wrapperRef} style={{ flex: 1, position: 'relative', overflow: 'hidden' }} onDragOver={onDragOver} onDrop={onDrop}>
      {nodes.length === 0 && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10, pointerEvents: 'none', flexDirection: 'column', gap: 8,
        }}>
          <div style={{ fontSize: 40, opacity: 0.1 }}>⬡</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>Canvas is empty</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', opacity: 0.6 }}>Drag nodes from the sidebar or click them to add</div>
        </div>
      )}
      <ReactFlow
        nodes={nodes as Node[]}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_e, node) => setSelectedNodeId(node.id)}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        defaultEdgeOptions={{ type: 'smoothstep', animated: true, style: { stroke: '#f97316', strokeWidth: 2 } }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(255,255,255,0.05)" />
        <Controls />
        <MiniMap
          nodeColor={(n) => {
            const colors: Record<string, string> = { start: '#22c55e', task: '#3b82f6', approval: '#a855f7', automated: '#f97316', end: '#ef4444' };
            const d = n.data as WorkflowNodeData;
            return colors[d?.type] || '#6b7280';
          }}
          maskColor="rgba(0,0,0,0.6)"
        />
      </ReactFlow>
    </div>
  );
}
