import React from 'react';
import { EmotionSignals } from '../types/contracts';
import { Activity, AlertTriangle, Gauge, Mic, PauseCircle, Users2 } from 'lucide-react';

interface Props {
  emotion: EmotionSignals | null;
}

export const EmotionInteractionCard: React.FC<Props> = ({ emotion }) => {
  if (!emotion) return null;

  return (
    <div className="card">
      <div className="card-title">
        <Activity size={20} color="#ec4899" />
        Tín hiệu Tương tác & Âm học (Interaction & Acoustic Signals)
      </div>
      <div className="card-subtitle">
        Các chỉ báo trích xuất từ đặc trưng âm học (librosa) và sắc thái ngôn ngữ phục vụ coaching nội bộ:
      </div>

      {/* Mandatory Disclaimer */}
      <div className="callout" style={{ marginBottom: '1.25rem' }}>
        <AlertTriangle size={18} style={{ flexShrink: 0 }} />
        <span>{emotion.disclaimer}</span>
      </div>

      {/* Acoustic Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', color: '#6366f1', marginBottom: '0.35rem' }}>
            <Gauge size={20} />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
            {emotion.acousticFeatures.speechRateWpm}
          </div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Tốc độ nói (WPM)</div>
        </div>

        <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', color: '#06b6d4', marginBottom: '0.35rem' }}>
            <PauseCircle size={20} />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
            {Math.round(emotion.acousticFeatures.silenceRatio * 100)}%
          </div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Tỷ lệ khoảng lặng</div>
        </div>

        <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', color: '#f59e0b', marginBottom: '0.35rem' }}>
            <Users2 size={20} />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
            {emotion.acousticFeatures.interruptionCount}
          </div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Lần ngắt lời</div>
        </div>

        <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', color: '#10b981', marginBottom: '0.35rem' }}>
            <Mic size={20} />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
            {emotion.linguisticTone}
          </div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Sắc thái ngôn ngữ</div>
        </div>
      </div>

      {/* Flagged Moments */}
      {emotion.flaggedMoments && emotion.flaggedMoments.length > 0 && (
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
            Các thời điểm đáng lưu ý cần rà soát:
          </div>
          {emotion.flaggedMoments.map((item, idx) => (
            <div key={idx} style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', marginRight: '0.5rem' }}>
                  {item.indicator}
                </span>
                <span style={{ fontSize: '0.825rem', color: 'var(--text-main)' }}>{item.observation}</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                Đoạn: {item.segmentId} (Tin cậy: {Math.round(item.confidence * 100)}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
