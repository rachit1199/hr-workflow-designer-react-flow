import { useCallback, useEffect } from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import { getAutomations, simulateWorkflow } from '../api/mockApi';
import type { NodeType, WorkflowNodeData } from '../types';
import type { Node } from '@xyflow/react';

export function useAutomations() {
  const setAutomations = useWorkflowStore(s => s.setAutomations);
  useEffect(() => { getAutomations().then(setAutomations); }, [setAutomations]);
}

export function useAddNode() {
  const addNode = useWorkflowStore(s => s.addNode);
  const nodes = useWorkflowStore(s => s.nodes);

  return useCallback(
    (type: NodeType, position = { x: 150 + Math.random() * 300, y: 80 + Math.random() * 250 }) => {
      if (type === 'start' && nodes.some(n => (n.data as WorkflowNodeData).type === 'start')) {
        alert('A workflow can only have one Start node.');
        return;
      }
      const id = `${type}-${Date.now()}`;
      const node: Node<WorkflowNodeData> = { id, type, position, data: createDefaultNodeData(type) };
      addNode(node);
    },
    [addNode, nodes]
  );
}

export function useSimulate() {
  const nodes = useWorkflowStore(s => s.nodes);
  const edges = useWorkflowStore(s => s.edges);
  const setSimulation = useWorkflowStore(s => s.setSimulation);
  const setIsSimulating = useWorkflowStore(s => s.setIsSimulating);
  const setShowSimPanel = useWorkflowStore(s => s.setShowSimPanel);

  return useCallback(async () => {
    setIsSimulating(true);
    setShowSimPanel(true);
    setSimulation(null);
    try {
      const result = await simulateWorkflow(nodes, edges);
      setSimulation(result);
    } finally {
      setIsSimulating(false);
    }
  }, [nodes, edges, setSimulation, setIsSimulating, setShowSimPanel]);
}

export function createDefaultNodeData(type: NodeType): WorkflowNodeData {
  switch (type) {
    case 'start':    return { type: 'start', title: 'Start', metadata: [] };
    case 'task':     return { type: 'task', title: 'New Task', description: '', assignee: '', dueDate: '', customFields: [] };
    case 'approval': return { type: 'approval', title: 'Approval', approverRole: 'Manager', autoApproveThreshold: 80 };
    case 'automated':return { type: 'automated', title: 'Automated Step', actionId: '', actionParams: {} };
    case 'end':      return { type: 'end', endMessage: 'Workflow Complete', summaryFlag: false };
  }
}
