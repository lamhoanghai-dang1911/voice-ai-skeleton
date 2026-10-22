import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from fastapi import APIRouter, HTTPException
from app.services.storage import storage_service, get_fixture_path
from app.models.contracts import (
    EvidenceQAV01,
    SubmitQAReviewRequest,
    AuditStateEnum,
    PolicyDocRef
)

router = APIRouter()


@router.get("/jobs/{job_id}/qa-review", response_model=EvidenceQAV01, summary="Get human QA review status and audit record")
def get_qa_review(job_id: str):
    review_file = storage_service.base_dir / job_id / "qa_review.json"

    if not review_file.exists():
        # Check canonical fixture fallback
        if job_id == "f47ac10b-58cc-4372-a567-0e02b2c3d479":
            fixture_file = get_fixture_path("mock_evidence_qa.json")
            if fixture_file and fixture_file.exists():
                with open(fixture_file, "r", encoding="utf-8") as f:
                    return json.load(f)

        # Return default PENDING_REVIEW structure if job exists
        job_file = storage_service.base_dir / job_id / "job.json"
        if not job_file.exists():
            raise HTTPException(status_code=404, detail=f"Không tìm thấy Job {job_id}")

        return EvidenceQAV01(
            jobId=job_id,
            reviewId=f"rev-{uuid.uuid4().hex[:8]}",
            auditState=AuditStateEnum.PENDING_REVIEW,
            reviewer={"userId": "unassigned", "fullName": "Chưa chỉ định", "role": "QA Reviewer"},
            reviewedAt=datetime.now(timezone.utc).isoformat(),
            decision="PASS_WITH_ACTIONS",
            decisionNotes="Hồ sơ đang chờ thẩm định viên xem xét và xác nhận bằng chứng.",
            checklistOverrides=[],
            policyDocRefs=[
                PolicyDocRef(
                    docId="DOC-PRUDENTIAL-PRU-DAUTULINHHOAT-TC",
                    title="Quy tắc và Điều khoản PRU-Đầu Tư Linh Hoạt",
                    version="v2.0"
                )
            ]
        )

    with open(review_file, "r", encoding="utf-8") as f:
        return json.load(f)


@router.post("/jobs/{job_id}/qa-review", response_model=EvidenceQAV01, summary="Submit human QA review decision")
def submit_qa_review(job_id: str, payload: SubmitQAReviewRequest):
    review_id = f"rev-{uuid.uuid4().hex[:8]}"
    now_iso = datetime.now(timezone.utc).isoformat()

    review_record = EvidenceQAV01(
        jobId=job_id,
        reviewId=review_id,
        auditState=payload.auditState,
        reviewer=payload.reviewer,
        reviewedAt=now_iso,
        decision=payload.decision,
        decisionNotes=payload.decisionNotes,
        checklistOverrides=payload.checklistOverrides,
        policyDocRefs=[
            PolicyDocRef(
                docId="DOC-PRUDENTIAL-PRU-DAUTULINHHOAT-TC",
                title="Quy tắc và Điều khoản PRU-Đầu Tư Linh Hoạt",
                version="v2.0"
            )
        ]
    )

    review_file = storage_service.base_dir / job_id / "qa_review.json"
    with open(review_file, "w", encoding="utf-8") as f:
        f.write(review_record.model_dump_json(indent=2))

    return review_record
