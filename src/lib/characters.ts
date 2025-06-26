/**
 * @fileOverview Statically defines the character data for the application.
 * Please replace the placeholder data below with your actual character data from your JSON file.
 * Ensure that the `id` is a unique string and `imageDataUri` points to a valid image in the `/public` folder.
 */

export type Character = {
  id: string;
  name: string;
  description: string;
  imageDataUri: string; // This is the public path to the image, e.g., '/character_images/1.png'
};

export const characters: Character[] = [
  {
    id: '1',
    name: '기가채드',
    description: '완벽한 턱선, 걷는 조각상.',
    imageDataUri: '/character_images/1.png',
  },
  {
    id: '2',
    name: '스키비디 토일렛',
    description: '변기에서 불쑥! 예측불허 서프라이즈.',
    imageDataUri: '/character_images/2.png',
  },
  {
    id: '3',
    name: '퉁 퉁 퉁 퉁 퉁 퉁 퉁 퉁 퉁 사후르',
    description: '알 수 없는 춤사위, 멈출 수 없는 흥부자.',
    imageDataUri: '/character_images/3.png',
  },
  {
    id: '4',
    name: '엄준식',
    description: '이름 하나로 모든 걸 설명하는 살아있는 전설.',
    imageDataUri: '/character_images/4.png',
  },
  {
    id: '5',
    name: '개죽이',
    description: '세상만사 태평한 표정, 진정한 힐링의 아이콘.',
    imageDataUri: '/character_images/5.png',
  },
  {
    id: '6',
    name: '브르르 브르르 파타핌',
    description: '역동적인 몸짓, 유쾌함의 화신.',
    imageDataUri: '/character_images/6.png',
  },
  {
    id: '7',
    name: '관짝소년단',
    description: '슬픔도 춤으로 승화시키는 긍정의 아이콘.',
    imageDataUri: '/character_images/7.png',
  },
  {
    id: '8',
    name: '무야호',
    description: '"무야호~!" 시절의 순수함을 간직한 자유로운 영혼.',
    imageDataUri: '/character_images/8.png',
  },
  // Add more character data from your JSON file here, following the same format.
];
