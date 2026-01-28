import React, { useState, useEffect } from 'react';
import { GameConfig } from '../types';

interface Props {
  game: GameConfig;
  onBack: () => void;
}

interface GameItem {
  id: number;
  content: string;
  isCorrect: boolean;
}

// Data pools
const POOLS = {
  ANIMALS: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐯', '🦁'],
  FRUITS: ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍍', '🥝'],
  VEHICLES: ['🚗', '🚕', '🚌', '🚒', '🚑', '🚜', '🚀', '🚁'],
  HAPPY: ['😀', '😃', '😄', '😆', '😊', '😍', '🥰'],
  SAD_ANGRY: ['😢', '😭', '😤', '😠', '😡', '🤬', '😞'],
};

const OddOneOutGame: React.FC<Props> = ({ game, onBack }) => {
  const [items, setItems] = useState<GameItem[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');

  useEffect(() => {
    generateLevel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.id, score]);

  const generateLevel = () => {
    const mode = game.data.mode; // 'emotions' or 'categories'
    let dominantPool: string[] = [];
    let intruderPool: string[] = [];

    if (mode === 'emotions') {
      const isDominantHappy = Math.random() > 0.5;
      dominantPool = isDominantHappy ? POOLS.HAPPY : POOLS.SAD_ANGRY;
      intruderPool = isDominantHappy ? POOLS.SAD_ANGRY : POOLS.HAPPY;
    } else {
      // Categories mode
      const categories = ['ANIMALS', 'FRUITS', 'VEHICLES'];
      // Pick random dominant category
      const domCatKey = categories[Math.floor(Math.random() * categories.length)];
      // Pick random intruder category (must be different)
      let intCatKey = categories[Math.floor(Math.random() * categories.length)];
      while (intCatKey === domCatKey) {
        intCatKey = categories[Math.floor(Math.random() * categories.length)];
      }

      dominantPool = POOLS[domCatKey as keyof typeof POOLS];
      intruderPool = POOLS[intCatKey as keyof typeof POOLS];
    }

    // Shuffle pools to get random items
    const shuffledDom = [...dominantPool].sort(() => 0.5 - Math.random());
    const shuffledInt = [...intruderPool].sort(() => 0.5 - Math.random());

    // Select 3 items from dominant, 1 from intruder
    const levelItems: GameItem[] = [
      { id: 1, content: shuffledDom[0], isCorrect: false },
      { id: 2, content: shuffledDom[1], isCorrect: false },
      { id: 3, content: shuffledDom[2], isCorrect: false },
      { id: 4, content: shuffledInt[0], isCorrect: true },
    ];

    // Shuffle the final items so intruder position is random
    setItems(levelItems.sort(() => 0.5 - Math.random()));
    setFeedback('idle');
  };

  const handleSelect = (item: GameItem) => {
    if (feedback !== 'idle') return;

    if (item.isCorrect) {
      setFeedback('correct');
      setTimeout(() => {
        setScore(s => s + 1);
        setFeedback('idle');
      }, 1000);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback('idle'), 1000);
    }
  };

  return (
    <div className="flex flex-col items-center pt-8 p-4 min-h-screen text-center">
      <div className="w-full max-w-xl flex justify-between mb-8">
        <button onClick={onBack} className="text-gray-500 font-bold bg-white px-4 py-2 rounded-xl shadow-sm text-lg">⬅ Wyjście</button>
        <span className="text-kidPurple font-bold text-2xl bg-white px-4 py-2 rounded-xl shadow-sm">Punkty: {score}</span>
      </div>

      <h2 className="text-4xl font-bold text-kidBlue mb-3">{game.title}</h2>
      <p className="text-2xl text-gray-500 mb-10 font-comic">{game.description}</p>

      {/* Grid of 4 items - HUGE */}
      <div className="grid grid-cols-2 gap-6 md:gap-8 w-full max-w-xl">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleSelect(item)}
            className={`
              aspect-square rounded-[2rem] shadow-xl border-b-[10px] transition-all transform active:scale-95 flex items-center justify-center
              ${feedback === 'correct' && item.isCorrect ? 'bg-kidGreen border-green-600 scale-105 animate-bounce' : ''}
              ${feedback === 'wrong' && !item.isCorrect ? 'bg-gray-100 opacity-50' : ''}
              ${feedback === 'wrong' && item.isCorrect ? 'bg-kidGreen border-green-600 animate-pulse' : ''}
              ${feedback === 'idle' ? 'bg-white border-gray-200 hover:border-kidBlue hover:bg-blue-50' : ''}
            `}
          >
             <span className="text-8xl md:text-9xl filter drop-shadow-sm">{item.content}</span>
          </button>
        ))}
      </div>

      {feedback === 'correct' && (
        <div className="mt-12 text-5xl font-bold text-kidGreen animate-bounce">
          Brawo! To nie pasuje! 🤩
        </div>
      )}
      
      {feedback === 'wrong' && (
        <div className="mt-12 text-3xl font-bold text-kidPink animate-shake">
          Hmm, to chyba pasuje... 🤔
        </div>
      )}
    </div>
  );
};

export default OddOneOutGame;