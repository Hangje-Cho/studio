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
    name: '기가채드 (Gigachad)',
    description: '완벽한 턱선, 넘치는 자신감. 당신이 바로 인터넷 밈의 제왕!',
    imageDataUri: '/character_images/1.png',
  },
  {
    name: '스키비디 토일렛 (Skibidi Toilet)',
    description: '변기에서 불쑥! 중독성 강한 멜로디의 주인공.',
    imageDataUri: '/character_images/2.png',
  },
  {
    name: '퉁 퉁 퉁 퉁 퉁 퉁 퉁 퉁 퉁 사후르',
    description: '리드미컬한 비트와 함께 등장하는 미스터리한 인물. 멈출 수 없는 중독성.',
    imageDataUri: '/character_images/3.png',
  },
  {
    name: '엄준식 (Uhm Junsik)',
    description: '사람 이름이 어떻게 밈? 그 자체로 유행이 된 신비로운 존재.',
    imageDataUri: '/character_images/4.png',
  },
  {
    name: '개죽이 (Gaejooki)',
    description: '대나무에 매달린 전설의 강아지. 시대를 풍미한 K-밈의 시조새.',
    imageDataUri: '/character_images/5.png',
  },
  {
    name: '호무랑 (Homurang)',
    description: '역동적인 포즈와 익살스러운 표정, 코믹 밈의 대명사.',
    imageDataUri: '/character_images/6.png',
  },
  {
    name: '관짝소년단 (Coffin Dance)',
    description: '네 명의 댄서가 관을 들고 추는 유쾌하고도 엄숙한 춤. 반전 매력의 소유자.',
    imageDataUri: '/character_images/7.png',
  },
  {
    name: '무야호 (Muyaho)',
    description: '산 정상에서 외치는 정겨운 할아버지의 함성. 그 시절 순수함과 유쾌함의 상징.',
    imageDataUri: '/character_images/8.png',
  },
];
