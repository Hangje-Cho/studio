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

const ComparePhotoToCharactersInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "사용자의 사진. MIME 타입과 Base64 인코딩을 포함하는 데이터 URI 형식이어야 합니다. (예: 'data:<mimetype>;base64,<encoded_data>')"
    ),
  characterJsonData: z.string().describe('캐릭터 객체의 배열을 담고 있는 JSON 문자열. 각 객체는 이름과 설명을 포함합니다.'),
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
  prompt: `당신은 사용자의 사진을 보고, 주어진 '이탈리안 브레인롯' 캐릭터 목록의 **모든 캐릭터**와 비교하여 각각 얼마나 닮았는지 분석하고 순위를 매기는 유머러스하고 창의적인 AI입니다.

  당신의 핵심 임무는 **제공된 모든 캐릭터에 대해 개별적인 분석**을 제공하는 것입니다. 뻔하거나 명백한 선택을 피하고, 사용자를 놀라게 할 만한 창의적이고 예상치 못한 연결고리를 찾아내세요. 각 캐릭터에 대해 완전히 다른 관점에서 분석하여, 설명이 겹치지 않도록 해주세요.

  사용자의 사진:
  {{media url=photoDataUri}}

  캐릭터 목록 (이름과 설명):
  {{characterJsonData}}

  **지시사항:**
  1.  사용자의 사진과 **제공된 모든 캐릭터 설명**을 꼼꼼히 비교하세요.
  2.  **모든 캐릭터 각각에 대해**, 시각적 특징(얼굴 표정, 분위기 등)과 캐릭터 설명을 종합하여 닮은 이유를 창의적이고 재미있는 한국어로 작성해주세요.
  3.  분석이 끝나면, 사용자와 가장 닮았다고 생각하는 순서대로 캐릭터 목록을 정렬하여 결과를 반환해야 합니다. 가장 닮은 캐릭터가 목록의 첫 번째에 와야 합니다.
  4.  당신의 답변에는 반드시 주어진 데이터에 있는 캐릭터의 이름이 포함되어야 합니다. 재치와 유머 감각을 마음껏 뽐내주세요!
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
