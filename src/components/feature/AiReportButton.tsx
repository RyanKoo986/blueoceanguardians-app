import { useState } from 'react';
import { Flag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { moderationService, AI_REPORT_REASONS } from '../../services/moderationService';
import ReportDialog from './ReportDialog';

interface FactCheckOutput {
  issues: { original: string; reason: string }[];
  correctedContent: string;
}

// Lets anyone flag an AI fact-check result in the app (Google Play AI-generated content policy)
export default function AiReportButton({ result, className = '' }: { result: FactCheckOutput; className?: string }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const output = [...result.issues.map((issue) => `- ${issue.original}: ${issue.reason}`), result.correctedContent]
    .filter(Boolean)
    .join('\n');

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1 text-[11px] underline cursor-pointer ${className}`}
      >
        <Flag size={12} />
        AI 결과 신고
      </button>
      {isOpen && (
        <ReportDialog
          title="AI 결과 신고"
          reasons={AI_REPORT_REASONS}
          onSubmit={(reason, detail) =>
            moderationService.reportAiOutput(output, reason, detail, { name: user?.name, email: user?.email })
          }
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
