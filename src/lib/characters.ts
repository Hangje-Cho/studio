/**
 * @fileOverview Statically defines the character data for the application.
 * This approach is more robust for deployment environments like Cloudflare Pages
 * as it doesn't rely on filesystem access.
 */

export type Character = {
  name: string;
  description: string;
  imageDataUri: string; // This is the public path to the image
};

export const characters: Character[] = [
  {
    name: '기가채드',
    description: '완벽한 턱선과 자신감, 당신은 걷는 조각상!',
    imageDataUri: '/character_images/1.png',
  },
  {
    name: '스키비디 토일렛',
    description: '변기에서 불쑥! 당신의 등장은 언제나 서프라이즈.',
    imageDataUri: '/character_images/2.png',
  },
  {
    name: '사후르 댄스',
    description: '알 수 없는 춤사위, 당신은 멈출 수 없는 흥부자.',
    imageDataUri: '/character_images/3.png',
  },
  {
    name: '엄준식',
    description: '이름 하나로 모든 것을 설명하는, 당신은 살아있는 전설.',
    imageDataUri: '/character_images/4.png',
  },
  {
    name: '개죽이',
    description: '세상만사 태평한 표정, 당신은 진정한 힐링의 아이콘.',
    imageDataUri: '/character_images/5.png',
  },
  {
    name: '파타핌 댄스',
    description: '역동적인 몸짓, 당신의 유쾌함에 모두가 웃음 폭발!',
    imageDataUri: '/character_images/6.png',
  },
  {
    name: '관짝소년단',
    description: '슬픔도 춤으로 승화시키는, 당신은 진정한 긍정의 아이콘.',
    imageDataUri: '/character_images/7.png',
  },
  {
    name: '무야호',
    description: '"무야호~!"를 외치던 그 시절의 순수함, 당신은 유쾌한 자유로운 영혼.',
    imageDataUri: '/character_images/8.png',
  },
];
