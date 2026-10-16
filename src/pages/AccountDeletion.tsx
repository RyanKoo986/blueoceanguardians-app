import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserX } from 'lucide-react';

// Google Play account / data deletion URL: steps, what is deleted or kept, retention
const CONTACT_EMAIL = 'kudaon@daum.net';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section>
    <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
      <span className="w-1.5 h-4 bg-blue-500 rounded-full inline-block"></span>
      {title}
    </h2>
    {children}
  </section>
);

const AccountDeletionPage: React.FC = () => {
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
          <span className="text-xs text-slate-500">최종 수정일: 2026. 10. 16</span>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">계정 및 데이터 삭제 안내</h1>
            <p className="text-sm text-slate-400">Blue Guardians (블루 가디언즈) · 운영: 사단법인 대한잠수협회</p>
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 sm:p-8 space-y-8 text-slate-300 leading-relaxed text-sm sm:text-base">
          <Section title="1. 계정 삭제 (앱·웹에서 바로)">
            <ol className="list-decimal list-inside space-y-1 text-slate-400">
              <li>Blue Guardians 앱 또는 웹사이트(<span className="text-blue-400">https://main.d2t329riy5sv3g.amplifyapp.com</span>)에 로그인합니다.</li>
              <li>하단 메뉴의 MY(마이페이지)에서 [회원 탈퇴]를 누릅니다.</li>
              <li>안내에 따라 '탈퇴'를 입력하면 계정이 즉시 삭제됩니다.</li>
            </ol>
            <Link
              to="/login"
              className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold text-white transition"
            >
              로그인하기
            </Link>
          </Section>

          <Section title="2. 로그인할 수 없는 경우 (이메일 요청)">
            <p className="text-slate-400">
              가입한 이메일 주소로 <span className="text-blue-400">{CONTACT_EMAIL}</span>에 '계정 삭제 요청'을 보내 주세요.
              본인 확인 후 지체 없이(늦어도 10일 이내) 삭제하고 결과를 알려 드립니다.
            </p>
          </Section>

          <Section title="3. 계정은 유지하고 일부 데이터만 삭제">
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li><strong>게시글·댓글:</strong> 아카이브에서 내가 쓴 게시글이나 댓글의 [삭제]를 눌러 언제든 직접 삭제할 수 있습니다.</li>
              <li>
                <strong>그 밖의 정보:</strong> 회원 선택 정보(생년월일, 소속, 잠수 라이선스 등급), 수중정화 참여 신청, 오류 제보, 1:1 문의 내용은{' '}
                <span className="text-blue-400">{CONTACT_EMAIL}</span>로 삭제할 항목을 알려 주시면 확인 후 지체 없이(늦어도 10일 이내) 삭제합니다.
              </li>
            </ul>
          </Section>

          <Section title="4. 삭제되는 정보와 남는 정보">
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li><strong>즉시 삭제:</strong> 이메일, 비밀번호, 이름, 휴대폰번호, 선택 정보 등 계정·회원 정보와 신고·차단 내역</li>
              <li><strong>남는 정보:</strong> 작성한 게시글·댓글은 작성자가 '탈퇴한 회원'으로 바뀌어 남습니다. 삭제를 원하시면 탈퇴 전에 직접 삭제하거나 위 이메일로 요청해 주세요.</li>
              <li><strong>계정과 연결되지 않은 정보:</strong> 수중정화 참여 신청, 오류 제보, 1:1 문의는 계정과 별도로 접수되어 탈퇴 시 자동으로 삭제되지 않습니다. 위 이메일로 요청하시면 삭제합니다.</li>
              <li><strong>보관:</strong> 관계 법령에 보존 의무가 있는 정보는 해당 기간 동안만 보관한 뒤 파기합니다.</li>
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default AccountDeletionPage;
