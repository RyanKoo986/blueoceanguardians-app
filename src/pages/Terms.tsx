import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, X } from 'lucide-react';

const TERMS_SECTIONS: { title: string; items: string[] }[] = [
  {
    title: '제1조 (목적)',
    items: [
      '이 약관은 사단법인 대한잠수협회(이하 "협회")가 운영하는 블루 가디언즈(Blue Guardians, 이하 "서비스")의 이용 조건과 절차, 이용자와 협회의 권리·의무를 정합니다.',
    ],
  },
  {
    title: '제2조 (회원가입과 계정)',
    items: [
      '회원가입은 이 약관과 개인정보 수집·이용에 동의한 뒤 신청하며, 협회가 승낙하면 완료됩니다.',
      '회원은 자신의 계정 정보를 안전하게 관리해야 하며, 타인의 정보를 도용해 가입하거나 계정을 타인에게 양도할 수 없습니다.',
      '만 14세 미만은 회원가입을 할 수 없습니다. 로그인 없이 이용할 수 있는 기능은 나이와 관계없이 이용할 수 있습니다.',
    ],
  },
  {
    title: '제3조 (게시물)',
    items: [
      '회원은 게시판에 글, 댓글, 사진, 영상을 올릴 수 있으며, 게시물에 대한 책임은 작성한 회원에게 있습니다.',
      '게시물의 저작권은 작성한 회원에게 있으며, 협회는 서비스 화면에 게시물을 노출하는 범위에서 이를 이용합니다.',
    ],
  },
  {
    title: '제4조 (금지되는 게시물과 행위)',
    items: [
      '음란하거나 선정적인 내용',
      '폭력적이거나 잔혹한 내용, 특정인이나 집단에 대한 혐오·차별·비하 표현',
      '욕설, 괴롭힘, 명예훼손, 다른 회원을 위협하는 행위',
      '본인 또는 타인의 개인정보·사생활을 노출하는 내용',
      '광고, 홍보, 스팸, 같은 내용의 반복 게시',
      '사실이 아닌 정보나 역사 왜곡을 의도적으로 퍼뜨리는 내용',
      '불법 행위를 조장하거나 저작권 등 타인의 권리를 침해하는 내용',
      '협회, 운영진 또는 다른 사람을 사칭하는 행위',
    ],
  },
  {
    title: '제5조 (신고와 차단)',
    items: [
      '이용자는 게시글과 댓글의 [신고] 버튼으로 제4조에 해당하는 게시물을 신고할 수 있습니다.',
      '이용자는 [차단] 버튼으로 특정 회원을 차단할 수 있으며, 차단한 회원의 게시글과 댓글은 보이지 않습니다. 차단은 마이페이지에서 언제든 해제할 수 있습니다.',
      '협회는 접수된 신고를 신속하게 검토하여 조치합니다.',
    ],
  },
  {
    title: '제6조 (게시물 삭제와 이용 제한)',
    items: [
      '협회는 제4조에 해당하는 게시물을 사전 통지 없이 삭제할 수 있습니다.',
      '제4조를 반복하거나 위반 정도가 무거운 회원은 게시 제한 또는 회원 자격 해지(강제 탈퇴) 조치를 받을 수 있습니다.',
    ],
  },
  {
    title: '제7조 (서비스의 변경과 중단)',
    items: ['협회는 운영상 필요한 경우 서비스의 내용을 변경하거나 중단할 수 있으며, 이 경우 서비스 화면에 미리 알립니다.'],
  },
  {
    title: '제8조 (회원 탈퇴)',
    items: ['회원은 마이페이지 > 회원 탈퇴에서 언제든 탈퇴할 수 있습니다. 탈퇴 후 게시물 처리는 개인정보처리방침에 따릅니다.'],
  },
  {
    title: '제9조 (책임의 한계)',
    items: [
      '회원이 게시한 정보의 정확성과 신뢰성에 대한 책임은 작성한 회원에게 있습니다.',
      'AI 팩트체크 결과는 참고용이며, 협회는 그 결과의 정확성을 보증하지 않습니다.',
    ],
  },
  {
    title: '제10조 (문의)',
    items: ['서비스 이용 문의: kudaon@daum.net / 02-425-5800'],
  },
];

export const TermsContent: React.FC = () => (
  <div className="space-y-7 text-slate-300 leading-relaxed text-sm sm:text-base">
    {TERMS_SECTIONS.map((section) => (
      <section key={section.title}>
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-blue-500 rounded-full inline-block"></span>
          {section.title}
        </h2>
        <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
          {section.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    ))}
    <p className="text-xs text-slate-500">부칙: 이 약관은 2026년 10월 16일부터 시행합니다.</p>
  </div>
);

// Lets the signup form show the terms without leaving the page (and losing the typed form)
export const TermsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
    <div
      className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-y-auto p-6 sm:p-8"
      style={{ maxHeight: '85dvh', overscrollBehavior: 'contain' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">이용약관</h1>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1" aria-label="닫기">
          <X className="w-5 h-5" />
        </button>
      </div>
      <TermsContent />
    </div>
  </div>
);

const TermsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-slate-900 text-slate-100 px-4 sm:px-6 lg:px-8"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 76px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 90px)',
      }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </button>
          <span className="text-xs text-slate-500">시행일: 2026. 10. 16</span>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">이용약관</h1>
            <p className="text-sm text-slate-400">Blue Guardians (블루 가디언즈)</p>
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 sm:p-8">
          <TermsContent />
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
