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
      "A photo of a user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  characterData: z
    .array(
      z.object({
        id: z.string().describe('The unique identifier for the character.'),
        imageDataUri: z
          .string()
          .describe('The data URI of the character image.'),
      })
    )
    .describe('An array of characters to analyze.'),
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
      'A score from 0 to 100 representing the visual similarity between the user and the character. Higher scores mean a stronger resemblance.'
    ),
});

const ComparePhotoToCharactersOutputSchema = z.object({
  results: z
    .array(CharacterMatchSchema)
    .describe(
      'An array of analysis results for each character provided in the input.'
    ),
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
  prompt: `You are an AI expert specializing in analyzing the visual similarity between a user's photo and a list of character images.

**Instructions:**
1.  **ID Accuracy (Crucial):** You MUST include the unique 'id' for each character in the result. Return the 'id' exactly as you received it in the result object. This is the most important instruction.
2.  **Visual Analysis & Scoring:** Visually compare the user's photo with each character's image. Consider facial features, expressions, hairstyle, and overall style. Assign a 'resemblanceScore' from 0 to 100 for each character. A higher score indicates a stronger resemblance.

**User's Photo:**
{{media url=photoDataUri}}

**Character List to Analyze (ensure you include the id for each in the result):**
{{#each characterData}}
- ID: {{this.id}}
  Image: {{media url=this.imageDataUri}}
{{/each}}
`,
  config: {
    temperature: 0.2,
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
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
