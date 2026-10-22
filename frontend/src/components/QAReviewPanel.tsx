import React, { useState } from 'react';
import { EvidenceQAReview, ReviewDecision } from '../types/contracts';
import { ShieldAlert, CheckCircle2, Save, UserCheck, FileCheck } from 'lucide-react';
import { apiClient } from '../api/client';

interface Props {
  jobId: string;
  qaReview: EvidenceQAReview | null;
  onReviewUpdated: (updated: EvidenceQAReview) => void;
}

export const QAReviewPanel: React.FC<Props> = ({ jobId, qaReview, onReviewUpdated }) => {
  const [decision, setDecision] = useState<ReviewDecision>(qaReview?.decision || 'PASS');
  const [notes, setNotes] = useState<string>(qaReview?.decisionNotes || '');
  const [reviewerName, setReviewerName] = useState<string>(qaReview?.reviewer.fullName || 'Bách Sỹ');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const updated = await apiClient.submitQAReview(jobId, {
        decision,
        auditState: decision === 'FAIL' ? 'REJECTED' : 'APPROVED',
        decisionNotes: notes,
        reviewer: {
          userId: 'qa-bachsy-01',
          fullName: reviewerName,
          role: 'QA & Compliance Reviewer',
        },
      });
      onReviewUpdated(updated);
      setFeedback('Đã lưu kết quả thẩm định QA thành công vào audit trail.');
    } catch (err: any) {
      setFeedback(`Lỗi khi lưu kết quả: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="card-title">
        <ShieldAlert size={20} color="#6366f1" />
        Evidence & QA Review (Thẩm định bởi con người)
      </div>
      <div className="card-subtitle">
        Con người kiểm tra bằng chứng, xác minh kết quả AI và phê duyệt quyết định tuân thủ trước khi xuất báo cáo:
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Thẩm định viên (Reviewer):
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem' }}>
              <UserCheck size={16} color="#6366f1" />
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.85rem', outline: 'none', width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Quyết định thẩm định (Decision):
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className={`btn ${decision === 'PASS' ? 'btn-success' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '0.5rem' }}
                onClick={() => setDecision('PASS')}
              >
                PASS
              </button>
              <button
                type="button"
                className={`btn ${decision === 'PASS_WITH_ACTIONS' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '0.5rem' }}
                onClick={() => setDecision('PASS_WITH_ACTIONS')}
              >
                PASS ĐIỀU KIỆN
              </button>
              <button
                type="button"
                className={`btn ${decision === 'FAIL' ? 'btn-danger' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '0.5rem' }}
                onClick={() => setDecision('FAIL')}
              >
                FAIL
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            Ghi chú thẩm định & Đề xuất hành động:
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Nhập nhận xét chi tiết, bằng chứng đối chiếu hoặc yêu cầu nhắc nhở tư vấn viên..."
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(255, 255, 255, 0.03)',
              color: '#fff',
              fontSize: '0.85rem',
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Policy document references */}
        {qaReview?.policyDocRefs && qaReview.policyDocRefs.length > 0 && (
          <div style={{ marginBottom: '1.25rem', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FileCheck size={14} /> Tài liệu chính sách tham chiếu chính thức:
            </div>
            {qaReview.policyDocRefs.map((doc, idx) => (
              <div key={idx} style={{ fontSize: '0.8rem', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between' }}>
                <span>• {doc.title}</span>
                <span className="policy-ref">{doc.docId} ({doc.version})</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            Audit State: {qaReview?.auditState || 'PENDING_REVIEW'} • Review ID: {qaReview?.reviewId || 'Chưa tạo'}
          </span>
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            <Save size={16} />
            {isSaving ? 'Đang lưu...' : 'Lưu kết quả thẩm định'}
          </button>
        </div>

        {feedback && (
          <div className="callout" style={{ marginTop: '1rem', borderColor: 'rgba(16, 185, 129, 0.4)', background: 'var(--success-bg)', color: '#6ee7b7' }}>
            <CheckCircle2 size={16} />
            <span>{feedback}</span>
          </div>
        )}
      </form>
    </div>
  );
};
