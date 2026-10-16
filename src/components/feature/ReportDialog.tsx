import { useState } from 'react';
import { Flag, X } from 'lucide-react';
import { moderationService, REPORT_REASONS, type ReportReason, type ReportTarget } from '../../services/moderationService';

interface ReportDialogProps {
  target: ReportTarget;
  onClose: () => void;
}

const MAX_DETAIL_LENGTH = 500;

export default function ReportDialog({ target, onClose }: ReportDialogProps) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [detail, setDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const targetLabel = target.commentId ? '댓글' : '게시글';

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    try {
      await moderationService.reportContent(target, reason, detail);
      alert('신고가 접수되었습니다. 운영진이 검토한 뒤 조치합니다.');
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : '신고 접수에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Flag size={18} className="text-red-500" />
            {targetLabel} 신고
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1" aria-label="닫기">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-3">신고 사유를 선택해 주세요.</p>
        <div className="space-y-2 mb-4">
          {(Object.keys(REPORT_REASONS) as ReportReason[]).map((key) => (
            <label key={key} className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
              <input
                type="radio"
                name="report-reason"
                checked={reason === key}
                onChange={() => setReason(key)}
                className="accent-red-500"
              />
              {REPORT_REASONS[key]}
            </label>
          ))}
        </div>

        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          maxLength={MAX_DETAIL_LENGTH}
          rows={3}
          placeholder="추가 설명 (선택)"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-red-400 resize-none"
        />

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason || submitting}
            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 disabled:opacity-50"
          >
            {submitting ? '접수 중...' : '신고하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
