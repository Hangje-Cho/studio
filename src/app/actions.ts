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
    default:
      return 'application/octet-stream';
  }
};

type CharacterMetadata = {
  name: string;
  description: string;
  imageDataUri: string;
};

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

  const charactersWithImageData = await Promise.all(
    characters.map(async (char) => {
      const relativeImagePath = char.imageDataUri.startsWith('/')
        ? char.imageDataUri.slice(1)
        : char.imageDataUri;
      const imagePath = path.join(process.cwd(), 'public', relativeImagePath);
      try {
        const imageBuffer = await fs.readFile(imagePath);
        const base64Image = imageBuffer.toString('base64');
        const mimeType = getMimeType(imagePath);
        const dataUri = `data:${mimeType};base64,${base64Image}`;
        return {
          ...char,
          imageDataUriForAi: dataUri, 
          originalImageDataUri: char.imageDataUri,
        };
      } catch (error) {
        console.error(`'${char.name}'의 이미지 읽기 실패 (${imagePath}):`, error);
        throw new Error(
          `'${char.name}' 캐릭터의 이미지 파일 ('${char.imageDataUri}')을 찾을 수 없습니다. 파일이 'public' 폴더 내에 정확한 경로로 존재하는지 확인해주세요.`
        );
      }
    })
  );

  return charactersWithImageData;
}
