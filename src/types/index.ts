export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
}

export interface ConstellationShape {
  id: string;
  name: string;
  trait: string;
  quote: string;
  iconName: string;
  points: { id: number; x: number; y: number; label: string }[];
  lines: [number, number][]; // pairs of point ids
}

export type MoonPhase = 
  | 'new'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full'
  | 'waning_gibbous'
  | 'third_quarter'
  | 'waning_crescent';

export type GameChapter = 
  | 'intro'
  | 'constellations'
  | 'meteors'
  | 'wishes'
  | 'finale';

export interface UserProgress {
  currentChapter: GameChapter;
  constellationsCompleted: string[]; // ids of completed shapes
  meteorDodgeCleared: boolean;
  meteorDodgeAttempts: number;
  wishCatcherCleared: boolean;
  hopeMeter: number;
  unlockedAchievements: string[];
  moonTapCount: number;
  dawnDiscovered: boolean;
  secretCodeRevealed: boolean;
  audioEnabled: boolean;
}
