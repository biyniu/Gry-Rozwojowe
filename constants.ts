
import { GameConfig, GameType } from './types';

export const GAMES_DB: GameConfig[] = [
  // --- KATEGORIA: PAMIĘĆ (MEMORY) ---
  {
    id: 'mem-animals',
    title: 'Zwierzaki',
    description: 'Znajdź pary.',
    icon: '🐶',
    type: GameType.MEMORY,
    category: 'MEMORY',
    minAge: 3,
    difficulty: 1, 
    data: { items: ['🐶', '🐱', '🐭', '🐹', '🐰', '🐻', '🐼', '🐨', '🐯', '🦁'] }
  },
  {
    id: 'mem-fruit',
    title: 'Owoce',
    description: 'Pyszne pary.',
    icon: '🍓',
    type: GameType.MEMORY,
    category: 'MEMORY',
    minAge: 3,
    difficulty: 1, 
    data: { items: ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍍', '🥝', '🍑', '🍐'] }
  },
  {
    id: 'mem-vehicles',
    title: 'Pojazdy',
    description: 'Więcej kart!',
    icon: '🚗',
    type: GameType.MEMORY,
    category: 'MEMORY',
    minAge: 4,
    difficulty: 2, 
    data: { items: ['🚗', '🚕', '🚙', '🚌', '🚒', '🚑', '🚜', '🛵', '🚲', '🛴'] }
  },
  // USUNIĘTO: mem-shapes-hard (Figury i Kolory)
  {
    id: 'mem-math',
    title: 'Cyferki Memory',
    description: 'Połącz wynik.',
    icon: '🔢',
    type: GameType.MEMORY,
    category: 'MEMORY',
    minAge: 6,
    difficulty: 3,
    data: { 
      items: ['1+1', '2', '2+1', '3', '2+2', '4', '3+2', '5', '3+3', '6', '4+4', '8', '5+5', '10', '10-1', '9'], 
      isPairLogic: true 
    }
  },

  // --- KATEGORIA: LOGIKA I WZORY ---
  {
    id: 'match-shadows',
    title: 'Dopasuj Cienie',
    description: 'Znajdź cień zwierzątka.',
    icon: '🌑',
    type: GameType.MATCH_PAIRS,
    category: 'LOGIC',
    minAge: 3,
    difficulty: 1,
    data: { mode: 'shadow', items: ['🐶', '🐱', '🐰', '🐻', '🐘', '🦒'] }
  },
  {
    id: 'match-shapes',
    title: 'Wielkie Dopasowanie',
    description: 'Znajdź takie same obrazki.',
    icon: '🧩',
    type: GameType.MATCH_PAIRS,
    category: 'LOGIC',
    minAge: 4,
    difficulty: 2,
    data: { mode: 'identical', items: ['🚀', '🚁', '🏰', '🌈', '🍕', '🎸', '⚽️', '⏰'] }
  },
  {
    id: 'odd-emotions',
    title: 'Co nie pasuje?',
    description: 'Wesoły czy smutny?',
    icon: '🤔',
    type: GameType.ODD_ONE_OUT,
    category: 'LOGIC',
    minAge: 3,
    difficulty: 1,
    data: { mode: 'emotions' }
  },
  {
    id: 'odd-categories',
    title: 'Intruz',
    description: 'Znajdź co jest inne.',
    icon: '🍎',
    type: GameType.ODD_ONE_OUT,
    category: 'LOGIC',
    minAge: 4,
    difficulty: 2,
    data: { mode: 'categories' }
  },
  {
    id: 'pat-shapes',
    title: 'Wzory: Kształty',
    description: 'Co pasuje tutaj?',
    icon: '🔺',
    type: GameType.PATTERN,
    category: 'LOGIC',
    minAge: 3,
    difficulty: 1,
    data: { patternType: 'visual', theme: 'shapes' }
  },
  {
    id: 'pat-animals',
    title: 'Wzory: Zwierzęta',
    description: 'Jaki zwierzak następny?',
    icon: '🐘',
    type: GameType.PATTERN,
    category: 'LOGIC',
    minAge: 3,
    difficulty: 1,
    data: { patternType: 'visual', theme: 'animals' }
  },
  {
    id: 'pat-fruits',
    title: 'Wzory: Owoce',
    description: 'Dokończ owocowy ciąg.',
    icon: '🍇',
    type: GameType.PATTERN,
    category: 'LOGIC',
    minAge: 4,
    difficulty: 2,
    data: { patternType: 'visual', theme: 'fruits' }
  },
  {
    id: 'pat-numbers',
    title: 'Ciągi Liczbowe',
    description: 'Jaka liczba pasuje?',
    icon: '1️⃣',
    type: GameType.PATTERN,
    category: 'LOGIC',
    minAge: 5,
    difficulty: 3,
    data: { patternType: 'number' }
  },

  // --- KATEGORIA: MATEMATYKA ---
  {
    id: 'math-count-5',
    title: 'Liczenie do 5',
    description: 'Ile widzisz?',
    icon: '🖐',
    type: GameType.MATH,
    category: 'MATH',
    minAge: 3,
    difficulty: 1,
    data: { maxNumber: 5, operation: 'count' }
  },
  {
    id: 'math-add-simple',
    title: 'Dodawanie',
    description: 'Na owocach.',
    icon: '➕',
    type: GameType.MATH,
    category: 'MATH',
    minAge: 4,
    difficulty: 1,
    data: { maxNumber: 6, operation: 'add_visual' }
  },
  {
    id: 'math-add-num',
    title: 'Dodawanie Liczb',
    description: 'Do 10.',
    icon: '🧮',
    type: GameType.MATH,
    category: 'MATH',
    minAge: 5,
    difficulty: 2,
    data: { maxNumber: 10, operation: 'add_number' }
  },
  {
    id: 'math-mixed',
    title: 'Mistrz Liczenia',
    description: 'Dodawanie i odejmowanie.',
    icon: '🎓',
    type: GameType.MATH,
    category: 'MATH',
    minAge: 6,
    difficulty: 3,
    data: { maxNumber: 20, operation: 'mixed' }
  },

  // --- KATEGORIA: RUCH I ZABAWA (ARCADE) ---
  {
    id: 'dodge-racer',
    title: 'Super Rajdowiec',
    description: 'Omijaj przeszkody i dojedź do mety!',
    icon: '🏎️',
    type: GameType.DODGE,
    category: 'ARCADE',
    minAge: 4,
    difficulty: 1,
    data: { duration: 30 }
  },
  {
    id: 'catcher-fruit',
    title: 'Łapacz Owoców',
    description: 'Złap owoce do koszyka!',
    icon: '🧺',
    type: GameType.CATCHER,
    category: 'ARCADE',
    minAge: 3,
    difficulty: 1,
    data: { targetScore: 10 }
  },
  {
    id: 'whack-mole',
    title: 'Wesołe Krety',
    description: 'Kliknij kreta gdy wyskoczy!',
    icon: '🐹',
    type: GameType.WHACK,
    category: 'ARCADE',
    minAge: 4,
    difficulty: 2,
    data: { duration: 30 }
  },
  {
    id: 'bubble-pop',
    title: 'Bąbelkowa Mania',
    description: 'Przebijaj lecące bańki!',
    icon: '🫧',
    type: GameType.BUBBLE,
    category: 'ARCADE',
    minAge: 3,
    difficulty: 1,
    data: { targetScore: 15 }
  },

  // --- KATEGORIA: KREATYWNOŚĆ ---
  {
    id: 'creative-drawing',
    title: 'Mały Artysta',
    description: 'Narysuj coś pięknego!',
    icon: '🎨',
    type: GameType.DRAWING,
    category: 'CREATIVE',
    minAge: 3,
    difficulty: 1,
    data: {}
  },
  {
    id: 'story-creator',
    title: 'Kreator Bajek',
    description: 'Stwórz magiczną historię ze swoim imieniem.',
    icon: '✨',
    type: GameType.STORY_AI,
    category: 'CREATIVE',
    minAge: 3,
    difficulty: 1,
    data: {}
  },
  {
    id: 'magic-mixer',
    title: 'Magiczny Mikser',
    description: 'Połącz dwa przedmioty i zobacz co powstanie!',
    icon: '🧪',
    type: GameType.MAGIC_MIXER,
    category: 'CREATIVE',
    minAge: 4,
    difficulty: 1,
    data: {}
  },
  {
    id: 'riddles',
    title: 'Zgaduj-Zgadula',
    description: 'AI zada Ci zagadkę. Zgadniesz co to?',
    icon: '🕵️',
    type: GameType.RIDDLE,
    category: 'CREATIVE',
    minAge: 4,
    difficulty: 2,
    data: {}
  }
];
