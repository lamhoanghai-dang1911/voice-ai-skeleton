import React, { useState, useEffect } from 'react';
import {
  Mic,
  Activity,
  FileCheck2,
  FileSpreadsheet,
  Headphones,
  Sparkles,
  RefreshCw,
  Terminal,
  ShieldCheck,
  Server
} from 'lucide-react';

import { AudioJob, Transcript, AnalysisEmotion, EvidenceQAReview } from './types/contracts';
import { apiClient } from './api/client';
import { AudioUploader } from './components/AudioUploader';
import { JobProgress } from './components/JobProgress';
import { TranscriptViewer } from './components/TranscriptViewer';
import { AnalysisPanel } from './components/AnalysisPanel';
import { EmotionInteractionCard } from './components/EmotionInteractionCard';
import { QAReviewPanel } from './components/QAReviewPanel';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transcript' | 'intelligence' | 'emotion' | 'qa'>('overview');
  const [activeJobId, setActiveJobId] = useState<string>('f47ac10b-58cc-4372-a567-0e02b2c3d479');
  const [job, setJob] = useState<AudioJob | null>(null);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisEmotion | null>(null);
  const [qaReview, setQaReview] = useState<EvidenceQAReview | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Load job data
  const loadJobData = async (jobId: string) => {
    setLoading(true);
    try {
      const [jobData, transData, analysisData, qaData] = await Promise.all([
        apiClient.getJob(jobId),
        apiClient.getTranscript(jobId),
        apiClient.getAnalysis(jobId),
        apiClient.getQAReview(jobId),
      ]);
      setJob(jobData);
      setTranscript(transData);
      setAnalysis(analysisData);
      setQaReview(qaData);
    } catch (err) {
      console.error('Failed to load job data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobData(activeJobId);
  }, [activeJobId]);

  const handleUseSample = () => {
    setActiveJobId('f47ac10b-58cc-4372-a567-0e02b2c3d479');
    loadJobData('f47ac10b-58cc-4372-a567-0e02b2c3d479');
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <div className="brand-area">
          <div className="brand-icon">
            <Mic size={22} color="#ffffff" />
          </div>
          <div>
            <div className="brand-title">INTEGRIX IX.VOICE</div>
            <div className="brand-subtitle">Speech & Conversation Intelligence • MVP v0.1</div>
          </div>
        </div>

        <div className="header-badges">
          <span className="badge">
            <span className="badge-pulse" />
            Local-first Runtime
          </span>
          <span className="badge" style={{ color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
            <Server size={12} />
            Docker CI Skeleton
          </span>
          <span className="badge" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
            <ShieldCheck size={12} />
            Prudential Baseline v1.1
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-wrapper">
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="tabs-nav">
            <button
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <Headphones size={16} />
              Tổng quan & Tải lên
            </button>
            <button
              className={`tab-btn ${activeTab === 'transcript' ? 'active' : ''}`}
              onClick={() => setActiveTab('transcript')}
            >
              <Terminal size={16} />
              Transcript & Diarization
            </button>
            <button
              className={`tab-btn ${activeTab === 'intelligence' ? 'active' : ''}`}
              onClick={() => setActiveTab('intelligence')}
            >
              <FileSpreadsheet size={16} />
              Checklist & Policy
            </button>
            <button
              className={`tab-btn ${activeTab === 'emotion' ? 'active' : ''}`}
              onClick={() => setActiveTab('emotion')}
            >
              <Activity size={16} />
              Emotion & Tương tác
            </button>
            <button
              className={`tab-btn ${activeTab === 'qa' ? 'active' : ''}`}
              onClick={() => setActiveTab('qa')}
            >
              <FileCheck2 size={16} />
              Evidence & QA Review
            </button>
          </div>

          <button
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem' }}
            onClick={() => loadJobData(activeJobId)}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'badge-pulse' : ''} />
            {loading ? 'Đang đồng bộ...' : 'Làm mới dữ liệu'}
          </button>
        </div>

        {/* Real-time Job Progress Indicator */}
        <JobProgress job={job} />

        {/* Tab 1: Overview & Upload */}
        {activeTab === 'overview' && (
          <div className="grid-2">
            <AudioUploader
              onJobCreated={(id) => {
                setActiveJobId(id);
                loadJobData(id);
              }}
              onUseSample={handleUseSample}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="card">
                <div className="card-title">
                  <Sparkles size={20} color="#f59e0b" />
                  Kịch bản kiểm chứng: Tư vấn Bảo hiểm Nhân thọ
                </div>
                <div className="card-subtitle">
                  Use case mẫu được đối chiếu với bộ tài liệu sản phẩm công khai của Prudential (PRU-Đầu Tư Linh Hoạt):
                </div>
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: '1.7' }}>
                  <li><strong>Flow chuỗi giá trị:</strong> Audio → VAD → ASR + Diarization → Checklist/Policy → Emotion Signals → QA Review.</li>
                  <li><strong>Quy tắc bảo vệ:</strong> Minh bạch không cam kết lãi suất và làm rõ quyền 21 ngày cân nhắc.</li>
                  <li><strong>Mô hình chạy:</strong> Local-first, chuẩn bị cho inference PhoWhisper & pyannote trên Docker Compose.</li>
                </ul>
              </div>

              <EmotionInteractionCard emotion={analysis?.emotionSignals || null} />
            </div>
          </div>
        )}

        {/* Tab 2: Vietnamese Transcript & Diarization */}
        {activeTab === 'transcript' && (
          <TranscriptViewer transcript={transcript} />
        )}

        {/* Tab 3: Conversation Intelligence & Checklist Grounding */}
        {activeTab === 'intelligence' && (
          <AnalysisPanel analysis={analysis} />
        )}

        {/* Tab 4: Emotion & Interaction Signals */}
        {activeTab === 'emotion' && (
          <div style={{ maxWidth: '850px', margin: '0 auto', width: '100%' }}>
            <EmotionInteractionCard emotion={analysis?.emotionSignals || null} />
          </div>
        )}

        {/* Tab 5: Evidence & Human QA Review */}
        {activeTab === 'qa' && (
          <div className="grid-2">
            <QAReviewPanel
              jobId={activeJobId}
              qaReview={qaReview}
              onReviewUpdated={(updated) => setQaReview(updated)}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <AnalysisPanel analysis={analysis} />
            </div>
          </div>
        )}

        {/* Footer with Team Attribution */}
        <footer style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          <div>
            <strong>INTEGRIX IX.VOICE R&D Project</strong> • 16-Week Baseline v1.1 • Local-first Engineering Architecture
          </div>
          <div style={{ marginTop: '0.25rem' }}>
            PM: Đức • Speech AI: Lê Huy • QA/Coordination: Bách Sỹ • Data: Trọng Nhân • Tech Lead/BE: Thiên Long • Frontend: Tùng Chi • DevOps: Hải Đăng
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
