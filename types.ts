
export type AgeGroup = 3 | 4 | 5 | 6;

export enum GameType {
  MEMORY = 'MEMORY',
  MATH = 'MATH',
  PATTERN = 'PATTERN',
  STORY_AI = 'STORY_AI',
  MAGIC_MIXER = 'MAGIC_MIXER',
  RIDDLE = 'RIDDLE',
  ODD_ONE_OUT = 'ODD_ONE_OUT',
  MATCH_PAIRS = 'MATCH_PAIRS',
  DODGE = 'DODGE', 
  CATCHER = 'CATCHER',
  WHACK = 'WHACK',
  BUBBLE = 'BUBBLE',
  DRAWING = 'DRAWING', // New
}

export type GameCategory = 'MEMORY' | 'LOGIC' | 'MATH' | 'CREATIVE' | 'ARCADE';

export interface GameConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: GameType;
  category: GameCategory; 
  minAge: number; 
  difficulty: 1 | 2 | 3;
  data?: any; 
}

export interface MemoryCard {
  id: string;
  content: string; 
  isFlipped: boolean;
  isMatched: boolean;
}

export interface PatternItem {
  id: string;
  content: string;
}
