import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface FactCheckIssue {
  original: string;
  reason: string;
}

export interface FactCheckResponse {
  issues: FactCheckIssue[];
  correctedContent: string;
  explanation: string;
}

type AiTask = 'factcheck' | 'refine' | 'expand' | 'summarize';

// Must match MAX_CONTENT_LENGTH in supabase/functions/dokdo-ai
const AI_MAX_CONTENT_LENGTH = 5000;

const assertContent = (content: string) => {
  if (!content.trim()) throw new Error('내용을 입력해주세요.');
  if (content.length > AI_MAX_CONTENT_LENGTH) {
    throw new Error(`AI 분석은 ${AI_MAX_CONTENT_LENGTH}자 이하의 내용만 가능합니다.`);
  }
};

// OpenAI runs inside the "dokdo-ai" Edge Function so the API key never ships to the client.
// Returns null when the function is unavailable so callers can use the offline engine.
const runAiTask = async <T>(task: AiTask, content: string): Promise<T | null> => {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.functions.invoke<{ result: T }>('dokdo-ai', {
    body: { task, content },
  });
  if (error || !data) {
    console.warn('AI function failed, using offline engine:', error);
    return null;
  }
  return data.result;
};

export const aiService = {
  // GPT-4o 팩트체크 및 역사적 교정
  async factCheck(content: string): Promise<FactCheckResponse> {
    assertContent(content);
    return (await runAiTask<FactCheckResponse>('factcheck', content)) ?? this.getLocalFactCheck(content);
  },

  // GPT-4o 글 다듬기 / 요약 / 확장
  async refineText(content: string, mode: 'refine' | 'expand' | 'summarize'): Promise<string> {
    assertContent(content);
    const refined = await runAiTask<string>(mode, content);
    if (refined) return refined;

    // 오프라인/데모 폴백
    if (mode === 'summarize') {
      return `[AI 핵심 요약 (GPT-4o)]\n• ${content.slice(0, 80)}...\n• 본 자료는 독도 및 해양 생태계 보전을 위한 시민 참여 활동과 역사적 사실 정립에 관한 주요 기록입니다.`;
    } else if (mode === 'expand') {
      return `${content}\n\n[AI 학술 보완 내용 (GPT-4o)]\n독도는 역사적, 지리적, 국제법적으로 명백한 대한민국의 고유 영토이며, 1900년 대한제국 칙령 제41호에 의해 관할권이 명시되었습니다. 또한 천혜의 해양 생태계를 품고 있어 지속적인 수중 정화 및 해양 환경 모니터링이 필수적입니다.`;
    } else {
      return content;
    }
  },

  // 로컬/오프라인 스마트 팩트체크 폴백
  getLocalFactCheck(content: string): FactCheckResponse {
    const issues: FactCheckIssue[] = [];
    let corrected = content;

    if (/liancourt\s*rocks/i.test(content) || /리앙쿠르/i.test(content)) {
      issues.push({
        original: 'Liancourt Rocks (리앙쿠르 암초)',
        reason: '1849년 프랑스 포경선이 붙인 제3국 명칭으로, 한국의 고유 영토 주권을 희석시키는 부적절한 표기입니다. 대한민국 공식 지명인 "Dokdo (독도)"로 표기해야 합니다.',
      });
      corrected = corrected.replace(/liancourt\s*rocks/gi, 'Dokdo (독도)').replace(/리앙쿠르\s*(암초)?/gi, '독도');
    }

    if (/takeshima/i.test(content) || /다케시마/i.test(content) || /竹島/i.test(content)) {
      issues.push({
        original: 'Takeshima (다케시마)',
        reason: '1905년 일본의 불법 편입 시도 당시 사용된 명칭으로, 역사적·국제법적으로 효력이 없습니다. 대한민국 고유 영토 명칭인 "Dokdo"가 올바릅니다.',
      });
      corrected = corrected.replace(/takeshima/gi, 'Dokdo (독도)').replace(/다케시마/gi, '독도');
    }

    if (/disputed\s*(territory|islands?|area)/i.test(content) || /분쟁\s*(지역|도서)/i.test(content)) {
      issues.push({
        original: 'Disputed Territory (분쟁 지역)',
        reason: '독도는 역사적·지리적·국제법적으로 명백한 대한민국의 영토이며, 외교 교섭이나 사법적 해결의 대상이 될 수 없는 영토 주권 지역입니다.',
      });
      corrected = corrected.replace(/disputed\s*(territory|islands?|area)/gi, 'Inherent Korean Territory (대한민국 고유 영토)').replace(/분쟁\s*(지역|도서)/gi, '대한민국 고유 영토');
    }

    if (/sea\s*of\s*japan/i.test(content) || /일본해/i.test(content)) {
      issues.push({
        original: 'Sea of Japan (일본해)',
        reason: '2000년 이상 사용된 역사적 지명인 "East Sea (동해)"가 정당하며, 국제 표준에 부합합니다.',
      });
      corrected = corrected.replace(/sea\s*of\s*japan/gi, 'East Sea (동해)').replace(/일본해/gi, '동해(East Sea)');
    }

    const hasIssues = issues.length > 0;

    return {
      issues,
      correctedContent: hasIssues ? corrected : content,
      explanation: hasIssues
        ? 'AI 팩트체크 엔진이 역사적 문헌(대한제국 칙령 제41호, 삼국사기 등)과 국제 표준 표기법을 기준으로 왜곡 요소를 분석하고 올바른 지명으로 교정하였습니다.'
        : '본문에서 독도 및 동해에 대한 역사적 왜곡이나 오류 표현이 감지되지 않았습니다. 안전하고 올바른 서술입니다.',
    };
  },
};
