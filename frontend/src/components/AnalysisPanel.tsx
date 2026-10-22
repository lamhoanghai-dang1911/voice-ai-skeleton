import React from 'react';
import { AnalysisEmotion } from '../types/contracts';
import { FileText, CheckCircle2, XCircle, BookOpen, ListOrdered, Tag } from 'lucide-react';

interface Props {
  analysis: AnalysisEmotion | null;
}

export const AnalysisPanel: React.FC<Props> = ({ analysis }) => {
  if (!analysis) {
    return (
      <div className="card">
        <div className="card-title">
          <FileText size={20} color="#6366f1" />
          Conversation Intelligence & Đối chiếu chính sách
        </div>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
          Đang chờ kết quả phân tích NLP...
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Executive Summary */}
      <div className="card">
        <div className="card-title">
          <FileText size={20} color="#6366f1" />
          Tóm tắt điều hành & Điểm chính
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '1rem' }}>
          {analysis.summary}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
          {analysis.topics.map((t, idx) => (
            <span key={idx} className="badge" style={{ background: 'rgba(99, 102, 241, 0.08)', color: '#a5b4fc', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
              <Tag size={11} /> {t}
            </span>
          ))}
        </div>
      </div>

      {/* Meeting Minutes & Actions */}
      <div className="card">
        <div className="card-title">
          <ListOrdered size={20} color="#6366f1" />
          Biên bản & Đầu việc cần thực hiện
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {analysis.meetingMinutes.map((item, idx) => (
            <div key={idx} style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff', marginBottom: '0.25rem' }}>
                {item.title}
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: item.actionItems.length > 0 ? '0.5rem' : '0' }}>
                {item.content}
              </div>
              {item.actionItems.length > 0 && (
                <div style={{ borderTop: '1px dashed var(--border-subtle)', paddingTop: '0.4rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>Action Items:</div>
                  <ul style={{ paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-main)' }}>
                    {item.actionItems.map((act, aIdx) => (
                      <li key={aIdx}>{act}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Policy Checklist Grounding */}
      <div className="card">
        <div className="card-title">
          <BookOpen size={20} color="#10b981" />
          Đối chiếu Checklist tuân thủ (Prudential Life)
        </div>
        <div className="card-subtitle">
          Tự động đối chiếu quy định sản phẩm PRU-Đầu Tư Linh Hoạt với bằng chứng trích dẫn từ hội thoại:
        </div>

        <div>
          {analysis.checklistResults.map((chk) => (
            <div key={chk.checklistId} className={`checklist-item ${chk.passed ? 'passed' : 'failed'}`}>
              <div className="checklist-header">
                <span className="checklist-title">{chk.title}</span>
                <span className="badge" style={{ background: chk.passed ? 'var(--success-bg)' : 'var(--danger-bg)', color: chk.passed ? 'var(--success)' : 'var(--danger)' }}>
                  {chk.passed ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  {chk.passed ? 'ĐẠT TIÊU CHUẨN' : 'CHƯA ĐẠT'}
                </span>
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {chk.findings}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.4rem' }}>
                <span className="policy-ref">
                  {chk.policyDocId} • {chk.policySection}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  Evidence Segments: [{chk.evidenceSegmentIds.join(', ')}]
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
