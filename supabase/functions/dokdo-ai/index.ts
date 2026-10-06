// Blue Guardians AI proxy (Supabase Edge Function "dokdo-ai")
// Keeps the OpenAI key on the server and only runs the app's fixed tasks,
// so the endpoint cannot be used as a general-purpose GPT proxy.
// Secret required: OPENAI_API_KEY (Edge Functions > Secrets)

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const MAX_CONTENT_LENGTH = 5000;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const FACT_CHECK_PROMPT = `당신은 대한민국 독도 및 동해 해양 역사·국제법 전문 AI 팩트체커입니다.
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
}`;

const TEXT_PROMPTS = {
  refine: '당신은 독도 및 해양 생태계 전문 에디터입니다. 원문의 고유한 내용과 사실을 해치지 않고 오탈자와 문맥, 가독성만을 깔끔하고 품격 있게 다듬어주세요.',
  expand: '당신은 해양 보전 전문가입니다. 입력된 글의 핵심 아이디어를 바탕으로 풍부한 배경 지식과 구체적인 설명을 더해 전문적인 글로 확장해주세요.',
  summarize: '당신은 문서 요약 전문가입니다. 핵심 사실과 중요 활동 내용을 3~4줄 내외로 명확하게 요약해주세요.',
};

type Task = 'factcheck' | keyof typeof TEXT_PROMPTS;
const TASKS: Task[] = ['factcheck', 'refine', 'expand', 'summarize'];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!OPENAI_API_KEY) return json({ error: 'OPENAI_API_KEY is not configured' }, 500);

  let task: Task;
  let content: string;
  try {
    ({ task, content } = await req.json());
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  if (!TASKS.includes(task)) return json({ error: 'Unknown task' }, 400);
  if (typeof content !== 'string' || !content.trim()) return json({ error: '내용을 입력해주세요.' }, 400);
  if (content.length > MAX_CONTENT_LENGTH) {
    return json({ error: `내용은 ${MAX_CONTENT_LENGTH}자 이하로 입력해주세요.` }, 400);
  }

  const isFactCheck = task === 'factcheck';
  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: isFactCheck ? FACT_CHECK_PROMPT : TEXT_PROMPTS[task as keyof typeof TEXT_PROMPTS] },
        { role: 'user', content },
      ],
      temperature: isFactCheck ? 0.1 : 0.5,
      ...(isFactCheck ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  if (!openaiResponse.ok) {
    return json({ error: 'OpenAI request failed', status: openaiResponse.status }, 502);
  }

  const data = await openaiResponse.json();
  const text: string = data.choices?.[0]?.message?.content ?? '';
  if (!isFactCheck) return json({ result: text });

  try {
    return json({ result: JSON.parse(text) });
  } catch {
    return json({ error: 'Invalid fact-check response' }, 502);
  }
});
