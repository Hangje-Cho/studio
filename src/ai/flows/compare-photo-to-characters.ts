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
      'A photo of the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  characterJsonData: z.string().describe('A JSON string containing an array of character objects, each with a name, description, and imageDataUri.'),
});
export type ComparePhotoToCharactersInput = z.infer<typeof ComparePhotoToCharactersInputSchema>;

const ComparePhotoToCharactersOutputSchema = z.object({
  resemblanceExplanation: z.string().describe('A humorous explanation of why the user resembles the chosen character.'),
  characterName: z.string().describe('The name of the character the user resembles most.'),
  characterImageDataUri: z.string().describe('The data URI of the character image.'),
});
export type ComparePhotoToCharactersOutput = z.infer<typeof ComparePhotoToCharactersOutputSchema>;

export async function comparePhotoToCharacters(input: ComparePhotoToCharactersInput): Promise<ComparePhotoToCharactersOutput> {
  return comparePhotoToCharactersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'comparePhotoToCharactersPrompt',
  input: {schema: ComparePhotoToCharactersInputSchema},
  output: {schema: ComparePhotoToCharactersOutputSchema},
  prompt: `You are an AI that compares a user's photo to a set of Italian Brainrot characters and provides a humorous explanation of the similarities.

  Here is the user's photo:
  {{media url=photoDataUri}}

  Here are the characters:
  {{characterJsonData}}

  Based on the user's photo and the character data, determine which character the user most resembles and provide a funny explanation of the similarities. Only return one most similar character.

  Ensure that the characterName and characterImageDataUri fields are populated with the correct values from the characterJsonData.
  `,
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
