import { useEffect, useState } from 'react';
import { Ban } from 'lucide-react';
import { moderationService, type BlockedUser } from '../../services/moderationService';

// MyPage list of blocked members with unblock (Google Play UGC policy)
export default function BlockedUsersSection() {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);

  useEffect(() => {
    moderationService
      .getBlockedUsers()
      .then(setBlockedUsers)
      .catch((error) => console.error('차단 목록 로드 실패:', error));
  }, []);

  const handleUnblock = async (blocked: BlockedUser) => {
    if (!confirm(`${blocked.name}님의 차단을 해제할까요?`)) return;
    try {
      await moderationService.unblockUser(blocked.id);
      setBlockedUsers((prev) => prev.filter((member) => member.id !== blocked.id));
    } catch (error) {
      alert(error instanceof Error ? error.message : '차단 해제에 실패했습니다.');
    }
  };

  return (
    <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-5 sm:p-7 backdrop-blur-md">
      <h3 className="text-base font-bold text-white flex items-center gap-2">
        <Ban className="w-4 h-4 text-red-400" />
        차단한 회원
      </h3>
      <p className="text-xs text-gray-400 mt-1">차단한 회원의 게시글과 댓글은 보이지 않습니다.</p>

      {blockedUsers.length === 0 ? (
        <p className="text-sm text-gray-500 mt-4">차단한 회원이 없습니다.</p>
      ) : (
        <ul className="mt-4 divide-y divide-white/10">
          {blockedUsers.map((blocked) => (
            <li key={blocked.id} className="flex items-center justify-between py-3">
              <span className="text-sm text-gray-200">{blocked.name}</span>
              <button
                onClick={() => handleUnblock(blocked)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-700 hover:bg-gray-600 text-gray-200 transition"
              >
                차단 해제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
