/**
 * @fileOverview Loads and exports character data from the accompanying JSON file.
 * To update the character list, please edit 'characters.json' directly.
 */
import charactersData from './characters.json';

export type Character = {
  id: string;
  name: string;
  description: string;
  imageDataUri: string; // This is the public path to the image, e.g., '/character_images/1.png'
};

export const characters: Character[] = charactersData;
