'use server';
/**
 * @fileOverview This file defines a Genkit flow for comparing a user-uploaded photo to a set of Italian Brainrot characters.
 *
 * - comparePhotoToCharacters - The main function that orchestrates the comparison process.
 * - ComparePhotoToCharactersInput - The input type for the comparePhotoToCharacters function.
 * - ComparePhotoToCharactersOutput - The output type for the comparePhotoToCharacters function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CharacterInputSchema = z.object({
  characterId: z.string().describe('The unique identifier for the character.'),
  name: z.string().describe('캐릭터의 이름.'),
  description: z.string().describe('캐릭터에 대한 설명.'),
  imageDataUri: z
    .string()
    .describe(
      '캐릭터 이미지. MIME 타입과 Base64 인코딩을 포함하는 데이터 URI 형식이어야 합니다.'
    ),
});

const ComparePhotoToCharactersInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "사용자의 사진. MIME 타입과 Base64 인코딩을 포함하는 데이터 URI 형식이어야 합니다. (예: 'data:<mimetype>;base64,<encoded_data>')"
    ),
  characterData: z
    .array(CharacterInputSchema)
    .describe('분석할 캐릭터 정보의 배열.'),
});
export type ComparePhotoToCharactersInput = z.infer<
  typeof ComparePhotoToCharactersInputSchema
>;

const CharacterMatchSchema = z.object({
  characterId: z
    .string()
    .describe('The original unique identifier for the character.'),
  resemblanceExplanation: z
    .string()
    .describe(
      '사용자가 해당 캐릭터와 닮은 이유에 대한 유머러스하고 재치있는 설명.'
    ),
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
  prompt: `당신은 사용자의 사진과 주어진 캐릭터 목록을 비교 분석하는 AI 전문가입니다.

**지시사항:**
1.  **ID 반환 (매우 중요):** 각 캐릭터는 고유한 'characterId'를 가지고 있습니다. 각 캐릭터에 대한 분석 결과를 반환할 때, 입력으로 받은 **'characterId'를 절대 변경하지 말고 그대로** 결과 객체에 포함시켜야 합니다.
2.  **시각적 분석 우선:** 사용자의 사진과 각 캐릭터의 이미지를 면밀히 비교하여, 얼굴 형태, 표정, 헤어스타일 등 시각적 공통점을 중심으로 분석하세요. 캐릭터 설명은 부가 정보로만 활용하세요.
3.  **점수 부여:** 각 캐릭터와의 시각적 유사도를 0점에서 100점 사이의 점수로 평가하여 'resemblanceScore'에 할당하세요. 점수가 높을수록 더 닮은 것입니다.
4.  **재치있는 설명:** 시각적 분석 결과를 바탕으로, 각 캐릭터와 닮은 이유를 창의적이고 유머러스한 한국어로 'resemblanceExplanation'에 작성해주세요. 시각적 유사성이 낮다면 낮은 점수를 부여하고, 억지로 닮았다고 설명하지 마세요.

사용자의 사진:
{{media url=photoDataUri}}

캐릭터 목록 (각 캐릭터의 characterId를 결과에 반드시 포함시키세요):
{{#each characterData}}
- ID: {{this.characterId}}
  이름: {{this.name}}
  이미지: {{media url=this.imageDataUri}}
  설명: {{this.description}}
{{/each}}
`,
  config: {
    temperature: 0.7,
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
