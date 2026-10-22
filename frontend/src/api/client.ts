import {
  AudioJob,
  Transcript,
  AnalysisEmotion,
  EvidenceQAReview,
  ReviewDecision,
  AuditState
} from '../types/contracts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Canonical fallback data for offline / standalone preview
import fallbackJob from '../../../contracts/fixtures/mock_audio_job.json';
import fallbackTranscript from '../../../contracts/fixtures/mock_transcript.json';
import fallbackAnalysis from '../../../contracts/fixtures/mock_analysis_emotion.json';
import fallbackQA from '../../../contracts/fixtures/mock_evidence_qa.json';

export const apiClient = {
  async getJob(jobId: string): Promise<AudioJob> {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API unavailable, returning local fixture for job:', err);
      return fallbackJob as unknown as AudioJob;
    }
  },

  async getTranscript(jobId: string): Promise<Transcript> {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/transcript`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API unavailable, returning local fixture for transcript:', err);
      return fallbackTranscript as unknown as Transcript;
    }
  },

  async getAnalysis(jobId: string): Promise<AnalysisEmotion> {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/analysis`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API unavailable, returning local fixture for analysis:', err);
      return fallbackAnalysis as unknown as AnalysisEmotion;
    }
  },

  async getQAReview(jobId: string): Promise<EvidenceQAReview> {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/qa-review`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API unavailable, returning local fixture for QA review:', err);
      return fallbackQA as unknown as EvidenceQAReview;
    }
  },

  async uploadAudio(file: File): Promise<{ jobId: string; status: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Upload failed');
    }

    return await res.json();
  },

  async submitQAReview(jobId: string, payload: {
    decision: ReviewDecision;
    auditState: AuditState;
    decisionNotes: string;
    reviewer: { userId: string; fullName: string; role: string };
  }): Promise<EvidenceQAReview> {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/qa-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to submit review');
      return await res.json();
    } catch (err) {
      console.warn('Submit review fallback to local mock update:', err);
      return {
        ...(fallbackQA as unknown as EvidenceQAReview),
        ...payload,
        reviewedAt: new Date().toISOString(),
      };
    }
  }
};
