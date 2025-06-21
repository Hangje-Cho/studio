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
  characterName: z.string().describe('The name of the character to search for.'),
});
export type SearchCharacterInfoInput = z.infer<typeof SearchCharacterInfoInputSchema>;

const SearchCharacterInfoOutputSchema = z.object({
  characterInfo: z.string().describe('The information about the character.'),
});
export type SearchCharacterInfoOutput = z.infer<typeof SearchCharacterInfoOutputSchema>;

export async function searchCharacterInfo(input: SearchCharacterInfoInput): Promise<SearchCharacterInfoOutput> {
  return searchCharacterInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'searchCharacterInfoPrompt',
  input: {schema: SearchCharacterInfoInputSchema},
  output: {schema: SearchCharacterInfoOutputSchema},
  prompt: `You are an AI assistant that searches the internet for information about a character.
  The character's name is {{{characterName}}}.
  Please provide a detailed description of the character.
  Try to provide at least 3 paragraphs of information.
  `,config: {
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
