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
  name: z.string().describe('캐릭터의 이름.'),
  description: z.string().describe('캐릭터에 대한 설명.'),
  imageDataUri: z.string().describe("캐릭터 이미지. MIME 타입과 Base64 인코딩을 포함하는 데이터 URI 형식이어야 합니다."),
});

const ComparePhotoToCharactersInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "사용자의 사진. MIME 타입과 Base64 인코딩을 포함하는 데이터 URI 형식이어야 합니다. (예: 'data:<mimetype>;base64,<encoded_data>')"
    ),
  characterData: z.array(CharacterInputSchema).describe('분석할 캐릭터 정보의 배열.'),
});
export type ComparePhotoToCharactersInput = z.infer<typeof ComparePhotoToCharactersInputSchema>;

const CharacterMatchSchema = z.object({
  characterName: z.string().describe('캐릭터의 이름.'),
  resemblanceExplanation: z
    .string()
    .describe(
      '사용자가 해당 캐릭터와 닮은 이유에 대한 유머러스하고 재치있는 설명.'
    ),
});

const ComparePhotoToCharactersOutputSchema = z.object({
  matches: z
    .array(CharacterMatchSchema)
    .describe('분석된 모든 캐릭터의 목록. 가장 닮은 순서대로 정렬되어야 합니다.'),
});
export type ComparePhotoToCharactersOutput = z.infer<typeof ComparePhotoToCharactersOutputSchema>;

export async function comparePhotoToCharacters(input: ComparePhotoToCharactersInput): Promise<ComparePhotoToCharactersOutput> {
  return comparePhotoToCharactersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'comparePhotoToCharactersPrompt',
  input: {schema: ComparePhotoToCharactersInputSchema},
  output: {schema: ComparePhotoToCharactersOutputSchema},
  prompt: `당신은 사용자의 사진과 주어진 캐릭터 이미지를 **시각적으로 비교**하여 가장 닮은 캐릭터를 찾아내는 전문 AI입니다. 분석은 유머를 담아 재치있게 표현해주세요.

  **지시사항:**
  1.  **시각적 분석 우선:** 사용자의 사진과 각 캐릭터의 이미지를 면밀히 비교하여, 얼굴 형태, 표정, 헤어스타일, 옷차림 등 **시각적 공통점**을 최우선으로 찾으세요.
  2.  **설명은 보조 수단:** 시각적 유사성을 찾은 후에만, 캐릭터 설명을 활용하여 닮은 이유를 더 재미있게 꾸며주세요. **시각적으로 전혀 닮지 않았다면 설명을 기반으로 억지로 연결하지 마세요.**
  3.  **전체 캐릭터 분석 및 순위 부여:** 제공된 모든 캐릭터에 대해 개별 분석을 제공하고, **시각적으로 가장 닮은 순서대로** 순위를 매겨주세요.
  4.  **창의적인 결과:** 분석 결과를 바탕으로, 각 캐릭터와 닮은 이유를 창의적이고 유머러스한 한국어로 작성해주세요.
  
  사용자의 사진:
  {{media url=photoDataUri}}
  
  캐릭터 목록 (이미지를 중심으로 분석하세요):
  {{#each characterData}}
  - 이름: {{this.name}}
    이미지: {{media url=this.imageDataUri}}
    설명: {{this.description}}
  {{/each}}
  
  
  **최종 출력:**
  분석이 끝나면, 사용자와 가장 닮았다고 생각하는 순서대로 캐릭터 목록을 정렬하여 결과를 반환해야 합니다. 가장 닮은 캐릭터가 목록의 첫 번째에 와야 합니다.
  `,
  config: {
    temperature: 1,
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
