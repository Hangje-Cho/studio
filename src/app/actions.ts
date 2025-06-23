'use server';

import fs from 'fs/promises';
import path from 'path';

const getMimeType = (filePath: string): string => {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
};

type CharacterMetadata = {
  name: string;
  description: string;
  imageDataUri: string;
};

// Function to read a file and return a data URI
const fileToDataUri = async (filePath: string): Promise<string> => {
  const imageBuffer = await fs.readFile(filePath);
  const base64Image = imageBuffer.toString('base64');
  const mimeType = getMimeType(filePath);
  return `data:${mimeType};base64,${base64Image}`;
}

export async function getCharacterDataWithImages() {
  const jsonPath = path.join(process.cwd(), 'public', 'characters.json');
  let characters: CharacterMetadata[];

  try {
    const jsonString = await fs.readFile(jsonPath, 'utf-8');
    characters = JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to read or parse characters.json:', error);
    throw new Error(
      '`public/characters.json` 파일을 찾거나 읽는 데 실패했습니다. 파일이 해당 위치에 있는지, JSON 형식이 올바른지 확인해주세요.'
    );
  }
  
  const placeholderPath = path.join(process.cwd(), 'public', 'placeholder.svg');
  let placeholderDataUri: string;
  try {
      placeholderDataUri = await fileToDataUri(placeholderPath);
  } catch (e) {
      console.error("Placeholder image is missing! Fallback will be empty.", e);
      placeholderDataUri = ''; 
  }

  const charactersWithImageData = await Promise.all(
    characters.map(async (char) => {
      const relativeImagePath = char.imageDataUri.startsWith('/')
        ? char.imageDataUri.slice(1)
        : char.imageDataUri;
      const imagePath = path.join(process.cwd(), 'public', relativeImagePath);
      try {
        const dataUri = await fileToDataUri(imagePath);
        return {
          ...char,
          imageDataUriForAi: dataUri, 
          originalImageDataUri: char.imageDataUri,
          imageError: false,
        };
      } catch (error) {
        console.error(`'${char.name}'의 이미지 읽기 실패 (${imagePath}):`, error);
        return {
            ...char,
            imageDataUriForAi: placeholderDataUri,
            originalImageDataUri: '/placeholder.svg',
            imageError: true,
        }
      }
    })
  );

  return charactersWithImageData;
}
