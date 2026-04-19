import { X, Plus, Trash2 } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import type {
  WorkflowNodeData, StartNodeData, TaskNodeData,
  ApprovalNodeData, AutomatedNodeData, EndNodeData, KeyValuePair
} from '../../types';

export function NodeFormPanel() {
  const selectedNodeId = useWorkflowStore(s => s.selectedNodeId);
  const nodes = useWorkflowStore(s => s.nodes);
  const updateNodeData = useWorkflowStore(s => s.updateNodeData);
  const setSelectedNodeId = useWorkflowStore(s => s.setSelectedNodeId);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  if (!selectedNode) return null;

  const data = selectedNode.data as WorkflowNodeData;

  const update = (partial: Partial<WorkflowNodeData>) => {
    updateNodeData(selectedNode.id, partial);
  };

  return (
    <div style={{
      width: 300,
      background: 'var(--surface)',
      borderLeft: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>
            CONFIGURE NODE
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
            {data.type.charAt(0).toUpperCase() + data.type.slice(1)} Node
          </div>
        </div>
        <button
          onClick={() => setSelectedNodeId(null)}
          style={{
            background: 'var(--surface-3)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            color: 'var(--text-muted)',
            padding: 6,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Form body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {data.type === 'start' && <StartForm data={data} update={update} />}
        {data.type === 'task' && <TaskForm data={data} update={update} />}
        {data.type === 'approval' && <ApprovalForm data={data} update={update} />}
        {data.type === 'automated' && <AutomatedForm data={data} update={update} />}
        {data.type === 'end' && <EndForm data={data} update={update} />}
      </div>
    </div>
  );
}

// ---- Field helpers ----

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: 'block',
        fontSize: 11,
        fontWeight: 500,
        color: 'var(--text-muted)',
        marginBottom: 5,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        fontFamily: 'var(--font-mono)',
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function KeyValueEditor({
  pairs,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
}: {
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}) {
  const addPair = () => onChange([...pairs, { key: '', value: '' }]);
  const removePair = (i: number) => onChange(pairs.filter((_, idx) => idx !== i));
  const updatePair = (i: number, field: 'key' | 'value', val: string) => {
    const next = [...pairs];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };

  return (
    <div>
      {pairs.map((pair, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
          <input
            value={pair.key}
            onChange={e => updatePair(i, 'key', e.target.value)}
            placeholder={keyPlaceholder}
            style={{ flex: 1 }}
          />
          <input
            value={pair.value}
            onChange={e => updatePair(i, 'value', e.target.value)}
            placeholder={valuePlaceholder}
            style={{ flex: 1 }}
          />
          <button
            onClick={() => removePair(i)}
            style={{
              background: 'transparent',
              color: 'var(--text-muted)',
              padding: 4,
              flexShrink: 0,
              borderRadius: 4,
              display: 'flex',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button
        onClick={addPair}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 12,
          color: 'var(--accent)',
          background: 'transparent',
          padding: '4px 0',
        }}
      >
        <Plus size={12} /> Add pair
      </button>
    </div>
  );
}

// ---- Node-specific forms ----

function StartForm({ data, update }: { data: StartNodeData; update: (d: Partial<WorkflowNodeData>) => void }) {
  return (
    <>
      <Field label="Title">
        <input value={data.title} onChange={e => update({ title: e.target.value } as any)} placeholder="Start title" />
      </Field>
      <Field label="Metadata (key-value)">
        <KeyValueEditor
          pairs={data.metadata}
          onChange={pairs => update({ metadata: pairs } as any)}
        />
      </Field>
    </>
  );
}

function TaskForm({ data, update }: { data: TaskNodeData; update: (d: Partial<WorkflowNodeData>) => void }) {
  return (
    <>
      <Field label="Title *">
        <input value={data.title} onChange={e => update({ title: e.target.value } as any)} placeholder="Task title" />
      </Field>
      <Field label="Description">
        <textarea
          value={data.description}
          onChange={e => update({ description: e.target.value } as any)}
          placeholder="Describe the task..."
          rows={3}
          style={{ resize: 'vertical' }}
        />
      </Field>
      <Field label="Assignee">
        <input value={data.assignee} onChange={e => update({ assignee: e.target.value } as any)} placeholder="e.g. john.doe@company.com" />
      </Field>
      <Field label="Due Date">
        <input type="date" value={data.dueDate} onChange={e => update({ dueDate: e.target.value } as any)} />
      </Field>
      <Field label="Custom Fields">
        <KeyValueEditor
          pairs={data.customFields}
          onChange={pairs => update({ customFields: pairs } as any)}
        />
      </Field>
    </>
  );
}

function ApprovalForm({ data, update }: { data: ApprovalNodeData; update: (d: Partial<WorkflowNodeData>) => void }) {
  return (
    <>
      <Field label="Title">
        <input value={data.title} onChange={e => update({ title: e.target.value } as any)} placeholder="Approval step title" />
      </Field>
      <Field label="Approver Role">
        <select value={data.approverRole} onChange={e => update({ approverRole: e.target.value } as any)}>
          <option>Manager</option>
          <option>HRBP</option>
          <option>Director</option>
          <option>VP</option>
          <option>C-Suite</option>
        </select>
      </Field>
      <Field label="Auto-Approve Threshold (%)">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="range"
            min={0}
            max={100}
            value={data.autoApproveThreshold}
            onChange={e => update({ autoApproveThreshold: Number(e.target.value) } as any)}
            style={{ flex: 1, padding: 0, background: 'transparent', border: 'none', accentColor: 'var(--accent)' }}
          />
          <span style={{
            fontSize: 13,
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent)',
            minWidth: 36,
          }}>
            {data.autoApproveThreshold}%
          </span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          Requests below this score auto-approve.
        </div>
      </Field>
    </>
  );
}

function AutomatedForm({ data, update }: { data: AutomatedNodeData; update: (d: Partial<WorkflowNodeData>) => void }) {
  const automations = useWorkflowStore(s => s.automations);

  const selectedAction = automations.find(a => a.id === data.actionId);

  const handleActionChange = (actionId: string) => {
    // Reset params when action changes
    update({ actionId, actionParams: {} } as any);
  };

  return (
    <>
      <Field label="Title">
        <input value={data.title} onChange={e => update({ title: e.target.value } as any)} placeholder="Automated step title" />
      </Field>
      <Field label="Action">
        <select value={data.actionId} onChange={e => handleActionChange(e.target.value)}>
          <option value="">— Select an action —</option>
          {automations.map(a => (
            <option key={a.id} value={a.id}>{a.label}</option>
          ))}
        </select>
      </Field>
      {selectedAction && selectedAction.params.length > 0 && (
        <Field label="Action Parameters">
          {selectedAction.params.map(param => (
            <div key={param} style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 3, display: 'block' }}>
                {param}
              </label>
              <input
                value={data.actionParams?.[param] || ''}
                onChange={e =>
                  update({
                    actionParams: { ...data.actionParams, [param]: e.target.value },
                  } as any)
                }
                placeholder={`Enter ${param}...`}
              />
            </div>
          ))}
        </Field>
      )}
    </>
  );
}

function EndForm({ data, update }: { data: EndNodeData; update: (d: Partial<WorkflowNodeData>) => void }) {
  return (
    <>
      <Field label="End Message">
        <input value={data.endMessage} onChange={e => update({ endMessage: e.target.value } as any)} placeholder="Workflow complete message" />
      </Field>
      <Field label="Generate Summary">
        <div
          onClick={() => update({ summaryFlag: !data.summaryFlag } as any)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div style={{
            width: 36,
            height: 20,
            borderRadius: 10,
            background: data.summaryFlag ? 'var(--accent)' : 'var(--surface-3)',
            border: '1px solid var(--border)',
            position: 'relative',
            transition: 'background 0.2s',
          }}>
            <div style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: 'white',
              position: 'absolute',
              top: 2,
              left: data.summaryFlag ? 18 : 2,
              transition: 'left 0.2s',
            }} />
          </div>
          <span style={{ fontSize: 13, color: data.summaryFlag ? 'var(--text)' : 'var(--text-muted)' }}>
            {data.summaryFlag ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </Field>
    </>
  );
}
