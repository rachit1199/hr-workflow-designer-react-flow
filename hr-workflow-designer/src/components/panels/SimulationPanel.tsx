import { X, CheckCircle, AlertTriangle, XCircle, Loader2, ChevronRight } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import type { SimulationStep } from '../../types';

const STATUS_CONFIG = {
  success: { icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  warning: { icon: AlertTriangle, color: '#eab308', bg: 'rgba(234,179,8,0.12)' },
  error: { icon: XCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

function StepRow({ step, index }: { step: SimulationStep; index: number }) {
  const config = STATUS_CONFIG[step.status];
  const Icon = config.icon;

  return (
    <div style={{
      display: 'flex',
      gap: 10,
      padding: '10px 0',
      borderBottom: '1px solid var(--border)',
      animation: `fadeIn 0.3s ease ${index * 0.08}s both`,
    }}>
      {/* Timeline dot */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: config.bg,
          border: `1.5px solid ${config.color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon size={13} color={config.color} />
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{step.nodeTitle}</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
            {step.timestamp}
          </span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{step.message}</div>
        <div style={{
          display: 'inline-block',
          marginTop: 4,
          fontSize: 9,
          fontFamily: 'var(--font-mono)',
          color: config.color,
          background: config.bg,
          padding: '2px 6px',
          borderRadius: 4,
          letterSpacing: '0.06em',
        }}>
          {step.nodeType.toUpperCase()}
        </div>
      </div>
    </div>
  );
}

export function SimulationPanel() {
  const showSimPanel = useWorkflowStore(s => s.showSimPanel);
  const setShowSimPanel = useWorkflowStore(s => s.setShowSimPanel);
  const simulation = useWorkflowStore(s => s.simulation);
  const isSimulating = useWorkflowStore(s => s.isSimulating);

  if (!showSimPanel) return null;

  return (
    <div style={{
      width: 320,
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
            SANDBOX
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
            Simulation Log
          </div>
        </div>
        <button
          onClick={() => setShowSimPanel(false)}
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

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
        {isSimulating && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 200,
            gap: 12,
          }}>
            <Loader2 size={24} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Executing workflow…</div>
          </div>
        )}

        {simulation && !isSimulating && (
          <>
            {/* Summary banner */}
            <div style={{
              margin: '12px 0',
              padding: '10px 12px',
              borderRadius: 8,
              background: simulation.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${simulation.success ? '#22c55e40' : '#ef444440'}`,
              fontSize: 12,
              color: simulation.success ? '#22c55e' : '#ef4444',
              fontWeight: 500,
            }}>
              {simulation.summary}
            </div>

            {/* Errors */}
            {simulation.errors.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#ef4444', marginBottom: 6, letterSpacing: '0.06em' }}>
                  VALIDATION ERRORS
                </div>
                {simulation.errors.map((err, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 6,
                    fontSize: 11,
                    color: '#ef4444',
                    marginBottom: 4,
                  }}>
                    <ChevronRight size={12} style={{ flexShrink: 0, marginTop: 1 }} />
                    {err}
                  </div>
                ))}
              </div>
            )}

            {/* Steps */}
            {simulation.steps.length > 0 && (
              <>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.06em' }}>
                  EXECUTION TRACE
                </div>
                {simulation.steps.map((step, i) => (
                  <StepRow key={step.nodeId} step={step} index={i} />
                ))}
              </>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}
