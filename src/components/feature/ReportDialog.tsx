import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Flag, X } from 'lucide-react';

interface ReportDialogProps<Reason extends string> {
  title: string;
  reasons: Record<Reason, string>;
  onSubmit: (reason: Reason, detail: string) => Promise<void>;
  onClose: () => void;
}

const MAX_DETAIL_LENGTH = 500;

// Rendered into <body> so it stays fixed to the viewport even when opened from an animated (transformed) modal
export default function ReportDialog<Reason extends string>({ title, reasons, onSubmit, onClose }: ReportDialogProps<Reason>) {
  const [reason, setReason] = useState<Reason | null>(null);
  const [detail, setDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    try {
      await onSubmit(reason, detail);
      alert('신고가 접수되었습니다. 운영진이 검토한 뒤 조치합니다.');
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : '신고 접수에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Flag size={18} className="text-red-500" />
            {title}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1" aria-label="닫기">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-3">신고 사유를 선택해 주세요.</p>
        <div className="space-y-2 mb-4">
          {(Object.keys(reasons) as Reason[]).map((key) => (
            <label key={key} className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
              <input
                type="radio"
                name="report-reason"
                checked={reason === key}
                onChange={() => setReason(key)}
                className="accent-red-500"
              />
              {reasons[key]}
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
    </div>,
    document.body
  );
}
