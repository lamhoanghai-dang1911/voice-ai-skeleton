import React from 'react';
import { AudioJob } from '../types/contracts';
import { CheckCircle2, Clock, Layers, Radio } from 'lucide-react';

interface Props {
  job: AudioJob | null;
}

export const JobProgress: React.FC<Props> = ({ job }) => {
  if (!job) return null;

  const steps = [
    { label: 'Upload & Validation', min: 10 },
    { label: 'VAD & Phân đoạn', min: 30 },
    { label: 'ASR & Gán người nói', min: 65 },
    { label: 'NLP & Emotion', min: 85 },
    { label: 'Evidence & QA Ready', min: 100 },
  ];

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8' }}>
            <Layers size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
              {job.audioMetadata.filename}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              Job ID: {job.jobId} • Trace: {job.traceId}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="badge" style={{ background: job.status === 'COMPLETED' ? 'var(--success-bg)' : 'rgba(99, 102, 241, 0.15)', color: job.status === 'COMPLETED' ? 'var(--success)' : '#818cf8' }}>
            <span className="badge-pulse" style={{ background: job.status === 'COMPLETED' ? 'var(--success)' : '#6366f1' }} />
            {job.status}
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>
            {job.progress}%
          </span>
        </div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${job.progress}%` }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginTop: '0.85rem' }}>
        {steps.map((step, idx) => {
          const isDone = job.progress >= step.min;
          const isCurrent = job.progress < step.min && (idx === 0 || job.progress >= steps[idx - 1].min);

          return (
            <div
              key={idx}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: isDone ? 'rgba(16, 185, 129, 0.06)' : isCurrent ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${isDone ? 'rgba(16, 185, 129, 0.2)' : isCurrent ? 'rgba(99, 102, 241, 0.3)' : 'var(--border-subtle)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.75rem',
                color: isDone ? '#6ee7b7' : isCurrent ? '#a5b4fc' : 'var(--text-dim)',
              }}
            >
              {isDone ? <CheckCircle2 size={14} /> : isCurrent ? <Radio size={14} className="badge-pulse" /> : <Clock size={14} />}
              <span>{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
