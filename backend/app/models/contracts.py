from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# ------------------------------------------------------------------------------
# 1. Audio Job Models (Canonical Contract Audio Job v0.1)
# ------------------------------------------------------------------------------
class JobStatusEnum(str, Enum):
    QUEUED = "QUEUED"
    VALIDATING = "VALIDATING"
    VAD_PROCESSING = "VAD_PROCESSING"
    ASR_DIARIZATION = "ASR_DIARIZATION"
    NLP_ANALYSIS = "NLP_ANALYSIS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class AudioMetadata(BaseModel):
    filename: str
    fileSize: int
    format: str
    durationMs: Optional[int] = None
    sampleRate: Optional[int] = 16000
    channels: Optional[int] = 1


class JobError(BaseModel):
    code: str
    message: str
    stage: Optional[str] = None
    timestamp: str


class AudioJobV01(BaseModel):
    jobId: str
    status: JobStatusEnum = JobStatusEnum.QUEUED
    progress: int = Field(default=0, ge=0, le=100)
    audioMetadata: AudioMetadata
    traceId: str
    errors: List[JobError] = []
    createdAt: str
    updatedAt: str


class CreateJobResponse(BaseModel):
    jobId: str
    status: JobStatusEnum
    traceId: str
    message: str


# ------------------------------------------------------------------------------
# 2. Transcript Models (Canonical Contract Transcript v0.1)
# ------------------------------------------------------------------------------
class WordTimestamp(BaseModel):
    word: str
    startMs: int
    endMs: int
    confidence: Optional[float] = 1.0


class TranscriptSegment(BaseModel):
    id: str
    startMs: int
    endMs: int
    speakerId: str
    speakerLabel: str
    text: str
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    words: Optional[List[WordTimestamp]] = None


class QualityFlags(BaseModel):
    snrEstimateDb: Optional[float] = None
    lowConfidenceSegmentsCount: Optional[int] = 0
    averageConfidence: Optional[float] = 1.0


class TranscriptV01(BaseModel):
    jobId: str
    modelVersion: str
    language: str = "vi"
    qualityFlags: QualityFlags = Field(default_factory=QualityFlags)
    segments: List[TranscriptSegment]


# ------------------------------------------------------------------------------
# 3. Analysis & Emotion Models (Canonical Contract Analysis / Emotion v0.1)
# ------------------------------------------------------------------------------
class MeetingMinuteItem(BaseModel):
    title: str
    content: str
    actionItems: List[str] = []


class ChecklistItemResult(BaseModel):
    checklistId: str
    title: str
    passed: bool
    policyDocId: str
    policyVersion: str
    policySection: str
    evidenceSegmentIds: List[str]
    findings: Optional[str] = None


class AcousticFeatures(BaseModel):
    speechRateWpm: float
    silenceRatio: float = Field(ge=0.0, le=1.0)
    interruptionCount: int = Field(default=0, ge=0)
    pitchVariabilityHz: Optional[float] = None


class FlaggedMoment(BaseModel):
    segmentId: str
    indicator: str
    observation: str
    confidence: float


class EmotionSignals(BaseModel):
    disclaimer: str = (
        "Lưu ý: Tín hiệu Emotion & Interaction chỉ là chỉ báo hỗ trợ cho công tác QA và coaching; "
        "không phải kết luận chắc chắn về cảm xúc, ý định hay phẩm chất cá nhân."
    )
    acousticFeatures: AcousticFeatures
    linguisticTone: str
    uncertaintyScore: float = Field(ge=0.0, le=1.0)
    flaggedMoments: List[FlaggedMoment] = []


class AnalysisEmotionV01(BaseModel):
    jobId: str
    summary: str
    meetingMinutes: List[MeetingMinuteItem]
    topics: List[str]
    checklistResults: List[ChecklistItemResult]
    emotionSignals: EmotionSignals


# ------------------------------------------------------------------------------
# 4. Evidence & QA Review Models (Canonical Contract Evidence / QA Review v0.1)
# ------------------------------------------------------------------------------
class AuditStateEnum(str, Enum):
    PENDING_REVIEW = "PENDING_REVIEW"
    IN_REVIEW = "IN_REVIEW"
    APPROVED = "APPROVED"
    FLAGGED_FOR_CORRECTION = "FLAGGED_FOR_CORRECTION"
    REJECTED = "REJECTED"


class DecisionEnum(str, Enum):
    PASS = "PASS"
    PASS_WITH_ACTIONS = "PASS_WITH_ACTIONS"
    FAIL = "FAIL"


class ReviewerInfo(BaseModel):
    userId: str
    fullName: str
    role: str


class ChecklistOverride(BaseModel):
    checklistId: str
    originalAiStatus: bool
    reviewerStatus: bool
    reason: str


class PolicyDocRef(BaseModel):
    docId: str
    title: str
    version: str
    effectiveDate: Optional[str] = None


class EvidenceQAV01(BaseModel):
    jobId: str
    reviewId: str
    auditState: AuditStateEnum
    reviewer: ReviewerInfo
    reviewedAt: str
    decision: DecisionEnum
    decisionNotes: str
    checklistOverrides: List[ChecklistOverride] = []
    policyDocRefs: List[PolicyDocRef] = []


class SubmitQAReviewRequest(BaseModel):
    reviewer: ReviewerInfo
    auditState: AuditStateEnum
    decision: DecisionEnum
    decisionNotes: str
    checklistOverrides: List[ChecklistOverride] = []
