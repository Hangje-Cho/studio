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
    description: '완벽한 턱선과 자신감 넘치는 표정을 가진 남성미의 상징. 인터넷 밈(meme)의 제왕.',
    imageDataUri: '/character_images/1.png',
  },
  {
    name: '스키비디 토일렛 (Skibidi Toilet)',
    description: '변기에서 튀어나온 머리가 부르는 중독성 있는 노래. 짧은 영상 형식으로 유행하는 밈.',
    imageDataUri: '/character_images/2.png',
  },
  {
    name: '카피바라 (Capybara)',
    description: '모든 동물과 평화롭게 지내는 온화한 성격. 특유의 평온함으로 인기를 얻고 있는 동물.',
    imageDataUri: '/character_images/3.png',
  },
  {
    name: '엄준식 (Uhm Junsik)',
    description: '특정 인물의 이름에서 유래한 한국 인터넷 밈. 다양한 상황에서 재미를 위해 사용됨.',
    imageDataUri: '/character_images/4.png',
  },
  {
    name: '개죽이 (Gaejooki)',
    description: '대나무에 매달린 강아지 사진으로 유명해진 2000년대 초반 한국의 대표적인 인터넷 밈.',
    imageDataUri: '/character_images/5.png',
  },
  {
    name: '호무랑 (Homurang)',
    description: '만화 캐릭터의 과장된 표정이나 행동을 흉내 내는 밈. 역동적이고 코믹한 상황에 사용됨.',
    imageDataUri: '/character_images/6.png',
  },
];
