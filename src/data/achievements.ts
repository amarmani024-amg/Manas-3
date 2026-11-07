import { Achievement } from '../types';

export const ALL_ACHIEVEMENTS: Record<string, Achievement> = {
  stargazer: {
    id: 'stargazer',
    title: 'Stargazer',
    description: 'Began the odyssey through the deep navy sky.',
    icon: 'Sparkles',
  },
  master_architect: {
    id: 'master_architect',
    title: 'Master Architect',
    description: 'Connected all four constellations with mathematical poise.',
    icon: 'Boxes',
  },
  meteor_pilot: {
    id: 'meteor_pilot',
    title: 'Cosmic Voyager',
    description: 'Steered with steady composure through the meteor field.',
    icon: 'Compass',
  },
  wish_maker: {
    id: 'wish_maker',
    title: 'Wish Maker',
    description: 'Filled the Hope Meter to 100% with luminous falling stars.',
    icon: 'Star',
  },
  moonwalker: {
    id: 'moonwalker',
    title: 'Moonwalker',
    description: 'Tapped the moon 7 times to unlock its ancient orbit.',
    icon: 'Moon',
  },
  dawn_seeker: {
    id: 'dawn_seeker',
    title: 'Dawn Seeker',
    description: 'Discovered the hidden dawn scene beyond the navy horizon.',
    icon: 'SunMedium',
  },
  starlight_secret: {
    id: 'starlight_secret',
    title: 'Starlight Secret',
    description: 'Spotted the quiet twinkling star tucked away in the corner.',
    icon: 'Flame',
  },
  cipher_breaker: {
    id: 'cipher_breaker',
    title: 'Cosmic Cipher',
    description: 'Dispatched the secret greeting signal ("hello").',
    icon: 'Terminal',
  },
  comet_chaser: {
    id: 'comet_chaser',
    title: 'Comet Chaser',
    description: 'Intercepted a drifting comet in deep space.',
    icon: 'Zap',
  },
  odyssey_complete: {
    id: 'odyssey_complete',
    title: 'STARDUST',
    description: 'Completed the voyage and unlocked the secret code.',
    icon: 'Award',
  },
};
