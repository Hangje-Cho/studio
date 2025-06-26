'use server';
/**
 * @fileOverview This file defines a Genkit flow for comparing a user-uploaded photo to a set of characters.
 *
 * - comparePhotoToCharacters - The main function that orchestrates the comparison process.
 * - ComparePhotoToCharactersInput - The input type for the comparePhotoToCharacters function.
 * - ComparePhotoToCharactersOutput - The output type for the comparePhotoToCharacters function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ComparePhotoToCharactersInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "사용자의 사진. MIME 타입과 Base64 인코딩을 포함하는 데이터 URI 형식이어야 합니다. (예: 'data:<mimetype>;base64,<encoded_data>')"
    ),
  characterData: z
    .array(
      z.object({
        id: z.string().describe('The unique identifier for the character.'),
        name: z.string().describe('캐릭터의 이름.'),
        description: z.string().describe('캐릭터에 대한 설명.'),
        imageDataUri: z
          .string()
          .describe(
            '캐릭터 이미지. MIME 타입과 Base64 인코딩을 포함하는 데이터 URI 형식이어야 합니다.'
          ),
      })
    )
    .describe('분석할 캐릭터 정보의 배열.'),
});
export type ComparePhotoToCharactersInput = z.infer<
  typeof ComparePhotoToCharactersInputSchema
>;

const CharacterMatchSchema = z.object({
  id: z
    .string()
    .describe('The original unique identifier for the character.'),
  resemblanceScore: z
    .number()
    .describe(
      '사용자와 캐릭터의 시각적 유사도 점수 (0에서 100 사이). 높을수록 더 닮았음을 의미합니다.'
    ),
});

const ComparePhotoToCharactersOutputSchema = z.object({
  results: z
    .array(CharacterMatchSchema)
    .describe('입력으로 제공된 각 캐릭터에 대한 분석 결과.'),
});
export type ComparePhotoToCharactersOutput = z.infer<
  typeof ComparePhotoToCharactersOutputSchema
>;

export async function comparePhotoToCharacters(
  input: ComparePhotoToCharactersInput
): Promise<ComparePhotoToCharactersOutput> {
  return comparePhotoToCharactersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'comparePhotoToCharactersPrompt',
  input: {schema: ComparePhotoToCharactersInputSchema},
  output: {schema: ComparePhotoToCharactersOutputSchema},
  prompt: `당신은 사용자의 사진과 주어진 캐릭터 목록의 시각적 유사도를 분석하는 AI 전문가입니다.

**지시사항:**
1.  **ID 반환 (매우 중요):** 각 캐릭터의 고유 'id'를 결과에 반드시 포함시켜야 합니다. 입력으로 받은 'id'를 절대 변경하지 말고 그대로 결과 객체에 포함시키세요.
2.  **시각적 분석 및 점수 부여:** 사용자의 사진과 각 캐릭터의 이미지를 면밀히 비교하여, 얼굴 형태, 표정, 헤어스타일 등 시각적 공통점을 중심으로 분석하세요. 각 캐릭터와의 시각적 유사도를 0에서 100점 사이의 점수로 평가하여 'resemblanceScore'에 할당하세요. 점수가 높을수록 더 닮았음을 의미합니다. 캐릭터 설명은 분석에 참고만 하세요.

사용자의 사진:
{{media url=photoDataUri}}

분석할 캐릭터 목록 (각 캐릭터의 id를 결과에 반드시 포함시키세요):
{{#each characterData}}
- ID: {{this.id}}
  이름: {{this.name}}
  이미지: {{media url=this.imageDataUri}}
  설명: {{this.description}}
{{/each}}
`,
  config: {
    temperature: 0.2,
     safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const comparePhotoToCharactersFlow = ai.defineFlow(
  {
    name: 'comparePhotoToCharactersFlow',
    inputSchema: ComparePhotoToCharactersInputSchema,
    outputSchema: ComparePhotoToCharactersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
