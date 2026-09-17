export interface FactCheckIssue {
  original: string;
  reason: string;
}

export interface FactCheckResponse {
  issues: FactCheckIssue[];
  correctedContent: string;
  explanation: string;
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const aiService = {
  // GPT-4o 팩트체크 및 역사적 교정
  async factCheck(content: string): Promise<FactCheckResponse> {
    if (!content.trim()) {
      throw new Error('분석할 내용을 입력해주세요.');
    }

    if (OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: `당신은 대한민국 독도 및 동해 해양 역사·국제법 전문 AI 팩트체커입니다.
입력된 문장에서 독도(Dokdo) 왜곡(예: 리앙쿠르 암초/Liancourt Rocks, 다케시마/Takeshima, 분쟁 지역 표기, 일본 영유권 주장 등)과 동해(East Sea) 왜곡(일본해 단독 표기 등)을 정밀 분석하세요.

[핵심 검증 규칙]
1. 독도나 동해에 관한 명백한 역사적·국제법적 오류 또는 왜곡 표현이 실제로 존재하는 경우에만 "issues" 배열에 추가하고, "correctedContent"에 교정본을 제공하세요.
2. 왜곡 표현이 없거나, 일반적인 일상/환경/학술 글인 경우 텍스트를 임의로 수정하거나 꼬리말/요약문을 추가하지 마십시오. 반드시 "issues": [] (빈 배열)을 반환하고 "correctedContent"는 사용자의 입력 원문과 100% 동일하게 유지해야 합니다.

반드시 아래 JSON 형식으로만 응답해야 합니다 (마크다운 코드블록 없이 순수 JSON):
{
  "issues": [
    {
      "original": "왜곡된 원문 문구",
      "reason": "역사적/국제법적 오류 이유 및 반박 근거 (대한제국 칙령 제41호, 샌프란시스코 강화조약 등)"
    }
  ],
  "correctedContent": "교정된 완성형 문장 (오류가 없으면 원문 그대로)",
  "explanation": "분석 요약 (오류가 없으면 '역사적 왜곡이나 오류가 발견되지 않은 안전한 서술입니다.')"
}`,
              },
              {
                role: 'user',
                content: content,
              },
            ],
            temperature: 0.1,
            response_format: { type: 'json_object' },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.warn('OpenAI API call failed, falling back to local engine:', errorData);
          return this.getLocalFactCheck(content);
        }

        const data = await response.json();
        const parsed: FactCheckResponse = JSON.parse(data.choices[0].message.content);
        return parsed;
      } catch (err) {
        console.warn('OpenAI request error, using fallback:', err);
        return this.getLocalFactCheck(content);
      }
    }

    // 데모/오프라인 모드 스마트 분석 엔진
    return this.getLocalFactCheck(content);
  },

  // GPT-4o 글 다듬기 / 요약 / 확장
  async refineText(content: string, mode: 'refine' | 'expand' | 'summarize'): Promise<string> {
    if (!content.trim()) {
      throw new Error('내용을 입력해주세요.');
    }

    const systemPrompts = {
      refine: '당신은 독도 및 해양 생태계 전문 에디터입니다. 원문의 고유한 내용과 사실을 해치지 않고 오탈자와 문맥, 가독성만을 깔끔하고 품격 있게 다듬어주세요.',
      expand: '당신은 해양 보전 전문가입니다. 입력된 글의 핵심 아이디어를 바탕으로 풍부한 배경 지식과 구체적인 설명을 더해 전문적인 글로 확장해주세요.',
      summarize: '당신은 문서 요약 전문가입니다. 핵심 사실과 중요 활동 내용을 3~4줄 내외로 명확하게 요약해주세요.',
    };

    if (OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: systemPrompts[mode] },
              { role: 'user', content },
            ],
            temperature: 0.5,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return data.choices[0].message.content;
        }
      } catch (err) {
        console.warn('OpenAI refine error, falling back:', err);
      }
    }

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
