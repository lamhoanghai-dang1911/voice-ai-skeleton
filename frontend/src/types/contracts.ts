export type JobStatus =
  | 'QUEUED'
  | 'VALIDATING'
  | 'VAD_PROCESSING'
  | 'ASR_DIARIZATION'
  | 'NLP_ANALYSIS'
  | 'COMPLETED'
  | 'FAILED';

export interface AudioMetadata {
  filename: string;
  fileSize: number;
  format: string;
  durationMs?: number;
  sampleRate?: number;
  channels?: number;
}

export interface JobError {
  code: string;
  message: string;
  stage?: string;
  timestamp: string;
}

export interface AudioJob {
  jobId: string;
  status: JobStatus;
  progress: number;
  audioMetadata: AudioMetadata;
  traceId: string;
  errors: JobError[];
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptSegment {
  id: string;
  startMs: number;
  endMs: number;
  speakerId: string;
  speakerLabel: string;
  text: string;
  confidence: number;
}

export interface Transcript {
  jobId: string;
  modelVersion: string;
  language: string;
  qualityFlags: {
    snrEstimateDb?: number;
    lowConfidenceSegmentsCount?: number;
    averageConfidence?: number;
  };
  segments: TranscriptSegment[];
}

export interface MeetingMinuteItem {
  title: string;
  content: string;
  actionItems: string[];
}

export interface ChecklistItemResult {
  checklistId: string;
  title: string;
  passed: boolean;
  policyDocId: string;
  policyVersion: string;
  policySection: string;
  evidenceSegmentIds: string[];
  findings?: string;
}

export interface AcousticFeatures {
  speechRateWpm: number;
  silenceRatio: number;
  interruptionCount: number;
  pitchVariabilityHz?: number;
}

export interface FlaggedMoment {
  segmentId: string;
  indicator: string;
  observation: string;
  confidence: number;
}

export interface EmotionSignals {
  disclaimer: string;
  acousticFeatures: AcousticFeatures;
  linguisticTone: string;
  uncertaintyScore: number;
  flaggedMoments: FlaggedMoment[];
}

export interface AnalysisEmotion {
  jobId: string;
  summary: string;
  meetingMinutes: MeetingMinuteItem[];
  topics: string[];
  checklistResults: ChecklistItemResult[];
  emotionSignals: EmotionSignals;
}

export type AuditState =
  | 'PENDING_REVIEW'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'FLAGGED_FOR_CORRECTION'
  | 'REJECTED';

export type ReviewDecision = 'PASS' | 'PASS_WITH_ACTIONS' | 'FAIL';

export interface ReviewerInfo {
  userId: string;
  fullName: string;
  role: string;
}

export interface ChecklistOverride {
  checklistId: string;
  originalAiStatus: boolean;
  reviewerStatus: boolean;
  reason: string;
}

export interface PolicyDocRef {
  docId: string;
  title: string;
  version: string;
  effectiveDate?: string;
}

export interface EvidenceQAReview {
  jobId: string;
  reviewId: string;
  auditState: AuditState;
  reviewer: ReviewerInfo;
  reviewedAt: string;
  decision: ReviewDecision;
  decisionNotes: string;
  checklistOverrides: ChecklistOverride[];
  policyDocRefs: PolicyDocRef[];
}
