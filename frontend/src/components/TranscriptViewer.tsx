import React, { useState } from 'react';
import { Transcript } from '../types/contracts';
import { MessageSquareText, Search, User, ShieldCheck } from 'lucide-react';

interface Props {
  transcript: Transcript | null;
}

export const TranscriptViewer: React.FC<Props> = ({ transcript }) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!transcript) {
    return (
      <div className="card">
        <div className="card-title">
          <MessageSquareText size={20} color="#6366f1" />
          Hội thoại & Gán người nói (Diarization)
        </div>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
          Chưa có transcript. Vui lòng tải lên audio hoặc nạp kịch bản mẫu.
        </div>
      </div>
    );
  }

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filteredSegments = transcript.segments.filter(seg =>
    seg.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    seg.speakerLabel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div className="card-title" style={{ marginBottom: '0.25rem' }}>
            <MessageSquareText size={20} color="#6366f1" />
            Hội thoại & Gán người nói tiếng Việt
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            Model: {transcript.modelVersion} • Ngôn ngữ: {transcript.language} • Độ tin cậy TB: {Math.round((transcript.qualityFlags.averageConfidence || 0.9) * 100)}%
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '220px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-dim)' }} />
          <input
            type="text"
            placeholder="Tìm kiếm nội dung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.75rem 0.45rem 2rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(255, 255, 255, 0.03)',
              color: '#fff',
              fontSize: '0.8rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      <div className="transcript-list">
        {filteredSegments.map((seg) => {
          const isAdvisor = seg.speakerLabel.toLowerCase().includes('tư vấn');
          return (
            <div
              key={seg.id}
              className={`transcript-item ${isAdvisor ? 'speaker-advisor' : 'speaker-customer'}`}
            >
              <div className="segment-meta">
                <span className="segment-speaker">
                  {isAdvisor ? <ShieldCheck size={13} style={{ display: 'inline', marginRight: '4px' }} /> : <User size={13} style={{ display: 'inline', marginRight: '4px' }} />}
                  {seg.speakerLabel} ({seg.speakerId})
                </span>
                <span className="segment-time">
                  {formatTime(seg.startMs)} - {formatTime(seg.endMs)} • {Math.round(seg.confidence * 100)}%
                </span>
              </div>
              <div className="segment-text">{seg.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
