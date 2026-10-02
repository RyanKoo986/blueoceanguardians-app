import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
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
        {/* Header navigation */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </button>
          <span className="text-xs text-slate-500">최종 수정일: 2026. 03. 15</span>
        </div>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">개인정보처리방침</h1>
            <p className="text-sm text-slate-400">Blue Ocean Guardians (블루오션 가디언스)</p>
          </div>
        </div>

        {/* Policy Content */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 sm:p-8 space-y-8 text-slate-300 leading-relaxed text-sm sm:text-base">
          <div>
            <p className="text-slate-300">
              <strong>블루오션 가디언스</strong>(이하 "본 서비스")는 정보주체의 자유와 권리 보호를 위해 「개인정보 보호법」 및 관계 법령이 정한 바를 준수하여, 적법하게 개인정보를 처리하고 안전하게 관리하고 있습니다.
            </p>
          </div>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-500 rounded-full inline-block"></span>
              1. 개인정보의 수집 및 이용 목적
            </h2>
            <p className="mb-2">본 서비스는 다음의 목적을 위하여 최소한의 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않습니다.</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
              <li>회원 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증</li>
              <li>회원자격 유지·관리, 서비스 부정 이용 방지 및 계정 보호</li>
              <li>해양 환경 정화 활동 제보 및 공모전 접수 처리, 결과 안내</li>
              <li>독도 오류 보고 및 AI 팩트체크 문의사항 응대 및 고지사항 전달</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-500 rounded-full inline-block"></span>
              2. 수집하는 개인정보의 항목
            </h2>
            <div className="space-y-3">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/40">
                <p className="font-medium text-white mb-1">필수 수집 항목</p>
                <p className="text-slate-400 text-sm">이메일 주소, 비밀번호, 닉네임(이름)</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/40">
                <p className="font-medium text-white mb-1">서비스 이용 과정에서 생성되는 정보</p>
                <p className="text-slate-400 text-sm">접속 로그, 접속 IP 정보, 서비스 이용 기록, 업로드한 활동 사진 및 제보 내용</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-500 rounded-full inline-block"></span>
              3. 개인정보의 보유 및 이용 기간
            </h2>
            <p className="mb-2">본 서비스는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
              <li><strong>회원 탈퇴 시:</strong> 즉시 파기 (앱 내 마이페이지 &gt; 회원 탈퇴 기능을 통해 언제든지 즉시 삭제 가능)</li>
              <li><strong>부정 이용 방지 및 관계 법령에 따른 보존:</strong> 법령에서 정한 일정 기간 동안 안전하게 보관 후 파기</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-500 rounded-full inline-block"></span>
              4. 정보주체의 권리·의무 및 행사방법
            </h2>
            <p className="mb-2">이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
              <li>개인정보 열람, 정정, 삭제 요구</li>
              <li>회원 탈퇴를 통한 개인정보 처리 정지 및 계정 즉시 삭제 요구</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-500 rounded-full inline-block"></span>
              5. 개인정보의 파기 절차 및 방법
            </h2>
            <p className="text-slate-400">
              전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제하며, 종이에 출력된 개인정보가 있을 경우 분쇄하거나 소각하여 파기합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-500 rounded-full inline-block"></span>
              6. 개인정보 보호책임자 및 문의처
            </h2>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/40 text-sm space-y-1">
              <p><span className="text-slate-500">책임자/운영팀:</span> <span className="text-white">사단법인 대한잠수협회</span></p>
              <p><span className="text-slate-500">연락처:</span> <span className="text-white">02-425-5800</span></p>
              <p><span className="text-slate-500">이메일:</span> <span className="text-blue-400">kudaon@daum.net</span></p>
              <p className="text-xs text-slate-500 mt-2">개인정보 열람청구 및 불만처리 관련 사항은 상기 이메일로 접수해 주시면 신속히 처리해 드립니다.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
