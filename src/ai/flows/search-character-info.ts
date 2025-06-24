'use server';

/**
 * @fileOverview An AI agent that searches the internet for information about a character.
 *
 * - searchCharacterInfo - A function that handles the character information search process.
 * - SearchCharacterInfoInput - The input type for the searchCharacterInfo function.
 * - SearchCharacterInfoOutput - The return type for the searchCharacterInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SearchCharacterInfoInputSchema = z.object({
  characterName: z.string().describe('검색할 캐릭터의 이름.'),
});
export type SearchCharacterInfoInput = z.infer<typeof SearchCharacterInfoInputSchema>;

const SearchCharacterInfoOutputSchema = z.object({
  characterInfo: z.string().describe('캐릭터에 대한 재미있고 상세한 정보.'),
});
export type SearchCharacterInfoOutput = z.infer<typeof SearchCharacterInfoOutputSchema>;

export async function searchCharacterInfo(input: SearchCharacterInfoInput): Promise<SearchCharacterInfoOutput> {
  return searchCharacterInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'searchCharacterInfoPrompt',
  input: {schema: SearchCharacterInfoInputSchema},
  output: {schema: SearchCharacterInfoOutputSchema},
  prompt: `당신은 특정 캐릭터에 대한 정보를 인터넷에서 찾아 정리해주는 AI 전문가입니다. 검색 결과를 단순히 나열하는 것이 아니라, 캐릭터의 매력이 드러나도록 흥미진진하고 재미있게 설명해주세요.

  캐릭터 이름: {{{characterName}}}

  이 캐릭터에 대한 자세한 정보를 한국어로 설명해주세요. 캐릭터의 유래, 특징, 관련된 밈(meme)이나 재미있는 사실들을 포함하여 최소 3문단 이상의 풍부한 내용으로 구성해주세요. 말투는 정보를 전달하면서도 재치와 유머를 잃지 마세요.
  `,
    config: {
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

const searchCharacterInfoFlow = ai.defineFlow(
  {
    name: 'searchCharacterInfoFlow',
    inputSchema: SearchCharacterInfoInputSchema,
    outputSchema: SearchCharacterInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
