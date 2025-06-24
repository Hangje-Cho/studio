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

const ComparePhotoToCharactersOutputSchema = z.object({
  resemblanceExplanation: z.string().describe('사용자가 선택된 캐릭터와 닮은 이유에 대한 유머러스하고 재치있는 설명.'),
  characterName: z.string().describe('사용자가 가장 닮은 캐릭터의 이름.'),
});
export type ComparePhotoToCharactersOutput = z.infer<typeof ComparePhotoToCharactersOutputSchema>;

export async function comparePhotoToCharacters(input: ComparePhotoToCharactersInput): Promise<ComparePhotoToCharactersOutput> {
  return comparePhotoToCharactersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'comparePhotoToCharactersPrompt',
  input: {schema: ComparePhotoToCharactersInputSchema},
  output: {schema: ComparePhotoToCharactersOutputSchema},
  prompt: `당신은 사용자의 사진을 보고, 주어진 '이탈리안 브레인롯' 캐릭터 목록과 비교하여 가장 닮은 캐릭터를 찾아주는 유머러스하고 창의적인 AI입니다. 당신의 임무는 단순히 가장 비슷해 보이는 캐릭터를 고르는 것이 아닙니다. **절대로 뻔하거나 가장 명백한 선택을 피하고, 사용자를 놀라게 할 만한 창의적이고 예상치 못한 연결고리를 찾아내는 것**이 당신의 핵심 임무입니다.

  사용자의 사진:
  {{media url=photoDataUri}}

  캐릭터 목록 (이름과 설명):
  {{characterJsonData}}

  사용자의 사진과 **제공된 모든 캐릭터 설명**을 꼼꼼히 비교하세요. 시각적 특징(얼굴 표정, 분위기 등)과 캐릭터 설명을 종합적으로 고려하여, 가장 창의적이고 재미있는 분석을 한국어로 작성해주세요. 반드시 한 명의 가장 닮은 캐릭터만 골라야 합니다.

  예를 들어, 그냥 잘생긴 사람에게 '기가채드'를 연결하는 대신, 사진 속 인물의 미묘한 표정이나 배경의 특정 요소와 캐릭터의 설명을 연결하여 아무도 생각하지 못한 캐릭터를 찾아내세요.

  당신의 답변에는 반드시 주어진 데이터에 있는 캐릭터의 이름이 포함되어야 합니다. 재치와 유머 감각을 마음껏 뽐내주세요!
  `,
  config: {
    temperature: 0.9,
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
