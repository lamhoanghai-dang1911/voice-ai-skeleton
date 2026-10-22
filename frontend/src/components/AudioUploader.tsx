import React, { useState, useRef } from 'react';
import { UploadCloud, FileAudio, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { apiClient } from '../api/client';

interface Props {
  onJobCreated: (jobId: string) => void;
  onUseSample: () => void;
}

export const AudioUploader: React.FC<Props> = ({ onJobCreated, onUseSample }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setSuccessMsg(null);

    // Basic format check
    const validExtensions = ['.wav', '.mp3', '.m4a', '.flac', '.aac', '.ogg'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setError(`Định dạng tệp không hợp lệ. Vui lòng chọn: ${validExtensions.join(', ')}`);
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError('Kích thước tệp vượt quá giới hạn 100MB.');
      return;
    }

    setIsUploading(true);
    try {
      const res = await apiClient.uploadAudio(file);
      setSuccessMsg(`Tải lên thành công! Job ID: ${res.jobId}`);
      onJobCreated(res.jobId);
    } catch (err: any) {
      setError(err.message || 'Lỗi tải tệp âm thanh');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-title">
        <UploadCloud size={20} color="#6366f1" />
        Tải lên bản ghi âm cuộc gọi
      </div>
      <div className="card-subtitle">
        Hỗ trợ định dạng WAV, MP3, M4A, FLAC tối đa 100MB. Quy trình VAD và Diarization xử lý tự động local-first.
      </div>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="audio/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      <div
        className={`uploader-box ${isDragging ? 'drag-over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-icon-circle">
          <FileAudio size={28} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: '0.25rem' }}>
            {isUploading ? 'Đang tải lên và khởi tạo Job...' : 'Kéo thả tệp âm thanh vào đây hoặc bấm để chọn tệp'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Chuẩn hoá 16kHz Mono • VAD Silero • PhoWhisper ASR • pyannote Diarization
          </div>
        </div>
      </div>

      {error && (
        <div className="callout" style={{ marginTop: '1rem', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'var(--danger-bg)', color: '#fca5a5' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="callout" style={{ marginTop: '1rem', borderColor: 'rgba(16, 185, 129, 0.4)', background: 'var(--success-bg)', color: '#6ee7b7' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
        <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
          Hoặc thử nghiệm nhanh với dữ liệu mẫu bảo hiểm Prudential đã chuẩn hóa:
        </span>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem' }}
          onClick={onUseSample}
        >
          <Sparkles size={14} color="#f59e0b" />
          Nạp kịch bản mẫu PRU-Đầu Tư Linh Hoạt
        </button>
      </div>
    </div>
  );
};
