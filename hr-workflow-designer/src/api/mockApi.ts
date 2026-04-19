import type { AutomationAction, SimulationResult, SimulationStep, WorkflowNodeData, NodeType } from '../types';
import type { Node, Edge } from '@xyflow/react';

export const getAutomations = async (): Promise<AutomationAction[]> => {
  await delay(300);
  return [
    { id: 'send_email', label: 'Send Email', params: ['to', 'subject', 'body'] },
    { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
    { id: 'slack_notify', label: 'Slack Notification', params: ['channel', 'message'] },
    { id: 'create_ticket', label: 'Create JIRA Ticket', params: ['project', 'summary', 'assignee'] },
    { id: 'update_hris', label: 'Update HRIS Record', params: ['employeeId', 'field', 'value'] },
    { id: 'schedule_meeting', label: 'Schedule Meeting', params: ['attendees', 'title', 'duration'] },
  ];
};

export const simulateWorkflow = async (
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[]
): Promise<SimulationResult> => {
  await delay(800);

  const errors: string[] = [];
  const steps: SimulationStep[] = [];

  const startNodes = nodes.filter(n => (n.data as WorkflowNodeData).type === 'start');
  const endNodes = nodes.filter(n => (n.data as WorkflowNodeData).type === 'end');

  if (startNodes.length === 0) errors.push('Workflow must have exactly one Start node.');
  if (startNodes.length > 1) errors.push('Workflow has multiple Start nodes — only one is allowed.');
  if (endNodes.length === 0) errors.push('Workflow must have at least one End node.');

  const connectedNodeIds = new Set<string>();
  edges.forEach(e => { connectedNodeIds.add(e.source); connectedNodeIds.add(e.target); });
  if (nodes.length > 1) {
    nodes.filter(n => !connectedNodeIds.has(n.id)).forEach(n => {
      const d = n.data as WorkflowNodeData;
      const title = d.type === 'end' ? d.endMessage : d.title;
      errors.push(`Node "${title}" is disconnected from the workflow.`);
    });
  }

  const orderedNodes = topologicalSort(nodes, edges);
  for (const node of orderedNodes) {
    steps.push(simulateNode(node.id, node.data as WorkflowNodeData));
  }

  const success = errors.length === 0 && steps.every(s => s.status !== 'error');
  return {
    success,
    steps,
    errors,
    summary: success
      ? `Workflow executed successfully across ${steps.length} step(s).`
      : `Workflow simulation failed with ${errors.length} error(s).`,
  };
};

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function simulateNode(nodeId: string, data: WorkflowNodeData): SimulationStep {
  const timestamp = new Date().toLocaleTimeString();
  const getTitle = (d: WorkflowNodeData) => d.type === 'end' ? d.endMessage || 'End' : d.title;
  const title = getTitle(data);

  switch (data.type) {
    case 'start':
      return { nodeId, nodeTitle: title, nodeType: 'start' as NodeType, status: 'success', message: `Workflow initiated: "${title}"`, timestamp };
    case 'task':
      return { nodeId, nodeTitle: title, nodeType: 'task' as NodeType,
        status: data.assignee ? 'success' : 'warning',
        message: data.assignee ? `Task assigned to "${data.assignee}" — ${data.description || 'No description'}` : `Task has no assignee — manual intervention required`, timestamp };
    case 'approval':
      return { nodeId, nodeTitle: title, nodeType: 'approval' as NodeType, status: 'success',
        message: `Approval request sent to "${data.approverRole}" (auto-approve threshold: ${data.autoApproveThreshold}%)`, timestamp };
    case 'automated':
      return { nodeId, nodeTitle: title, nodeType: 'automated' as NodeType,
        status: data.actionId ? 'success' : 'error',
        message: data.actionId ? `Automation "${data.actionId}" triggered with ${Object.keys(data.actionParams || {}).length} param(s)` : `No automation action configured`, timestamp };
    case 'end':
      return { nodeId, nodeTitle: title || 'Workflow Complete', nodeType: 'end' as NodeType, status: 'success', message: data.endMessage || 'Workflow completed.', timestamp };
  }
}

function topologicalSort(nodes: Node[], edges: Edge[]): Node[] {
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();
  nodes.forEach(n => { inDegree.set(n.id, 0); adj.set(n.id, []); });
  edges.forEach(e => { inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1); adj.get(e.source)?.push(e.target); });
  const queue = nodes.filter(n => (inDegree.get(n.id) || 0) === 0);
  const result: Node[] = [];
  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);
    (adj.get(node.id) || []).forEach(targetId => {
      const d = (inDegree.get(targetId) || 0) - 1;
      inDegree.set(targetId, d);
      if (d === 0) { const t = nodes.find(n => n.id === targetId); if (t) queue.push(t); }
    });
  }
  nodes.forEach(n => { if (!result.find(r => r.id === n.id)) result.push(n); });
  return result;
}
