import React, { useState, useEffect } from 'react';
import { GameConfig } from '../types';

interface Props {
  game: GameConfig;
  onBack: () => void;
}

const PatternGame: React.FC<Props> = ({ game, onBack }) => {
  const [sequence, setSequence] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [answer, setAnswer] = useState<string>('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');

  // Emoji pools
  const SHAPES = ['🟥', '🔵', '⭐', '🔺', '🟩', '🟣', '🔶'];
  const ANIMALS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻'];
  const FRUITS = ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍍'];

  useEffect(() => {
    generateLevel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, game.id]);

  const generateLevel = () => {
    const type = game.data.patternType || 'simple'; // simple, complex, number
    let newSeq: string[] = [];
    let correctItem = '';
    let distractors: string[] = [];

    // Helper to get random items
    const getRandom = (arr: string[], count: number) => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };

    if (type === 'number') {
      // Logic: 1, 2, 3, ? or 2, 4, 6, ?
      const start = Math.floor(Math.random() * 5) + 1;
      const step = Math.random() > 0.5 ? 1 : 2;
      newSeq = [
        (start).toString(),
        (start + step).toString(),
        (start + step * 2).toString(),
        (start + step * 3).toString(),
        '?'
      ];
      correctItem = (start + step * 4).toString();
      
      // Generate distractors
      distractors = [
        (start + step * 4 + 1).toString(),
        (start + step * 4 - 1).toString(),
        (start + step * 4 + 2).toString()
      ];
    } else {
      // Visual Patterns
      const pool = game.data.theme === 'animals' ? ANIMALS : 
                   game.data.theme === 'fruits' ? FRUITS : SHAPES;
      
      const items = getRandom(pool, 3); // Pick 3 symbols to use
      const [A, B, C] = items;

      const patternType = Math.floor(Math.random() * 3); // 0: ABAB, 1: AABAAB, 2: ABCABC

      if (patternType === 0) { // AB AB ?
         newSeq = [A, B, A, B, '?'];
         correctItem = A;
      } else if (patternType === 1) { // AA B AA B ?
         newSeq = [A, A, B, A, A, '?'];
         correctItem = B;
      } else { // ABC ABC ?
         newSeq = [A, B, C, A, B, '?'];
         correctItem = C;
      }

      distractors = pool.filter(i => i !== correctItem).slice(0, 2);
    }

    setSequence(newSeq);
    setAnswer(correctItem);
    
    // Mix correct answer with distractors
    const allOptions = [correctItem, ...distractors].slice(0, 3).sort(() => Math.random() - 0.5);
    setOptions(allOptions);
    setFeedback('idle');
  };

  const handleSelect = (val: string) => {
    if (feedback !== 'idle') return;

    if (val === answer) {
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
      <div className="w-full max-w-2xl flex justify-between mb-8">
        <button onClick={onBack} className="text-gray-500 font-bold bg-white px-4 py-2 rounded-xl shadow-sm text-lg">⬅ Wyjście</button>
        <span className="text-kidPurple font-bold text-2xl bg-white px-4 py-2 rounded-xl shadow-sm">Punkty: {score}</span>
      </div>
      
      <h2 className="text-3xl font-bold text-kidBlue mb-4">{game.title}</h2>
      <p className="text-xl text-gray-500 mb-10">{game.description}</p>

      {/* The Pattern Sequence */}
      <div className="flex flex-wrap justify-center gap-3 mb-16 bg-white p-8 rounded-3xl shadow-xl border-4 border-kidPurple min-h-[140px] items-center">
        {sequence.map((item, idx) => (
          <div key={idx} className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center animate-fade-in bg-purple-50 rounded-xl border-2 border-purple-100">
            {item === '?' ? 
              <span className="text-6xl text-kidYellow animate-pulse">❓</span> : 
              <span className="text-6xl md:text-7xl drop-shadow-sm">{item}</span>
            }
          </div>
        ))}
      </div>

      {/* Options */}
      <div className="grid grid-cols-3 gap-6 md:gap-8">
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(opt)}
            className={`
              w-28 h-28 md:w-36 md:h-36 rounded-3xl shadow-lg border-b-8 transition-all transform active:scale-95 flex items-center justify-center font-bold
              ${feedback === 'correct' && opt === answer ? 'bg-kidGreen text-white border-green-600 scale-105' : ''}
              ${feedback === 'wrong' && opt !== answer ? 'bg-gray-100 opacity-50' : ''}
              ${feedback === 'wrong' && opt === answer ? 'bg-kidGreen text-white animate-pulse' : ''}
              ${feedback === 'idle' ? 'bg-white border-gray-200 hover:border-kidBlue hover:bg-blue-50' : ''}
            `}
          >
             <span className="text-6xl md:text-7xl">{opt}</span>
          </button>
        ))}
      </div>
      
      {feedback === 'correct' && <div className="mt-8 text-4xl font-bold text-kidGreen animate-bounce">Brawo! 👏</div>}
      {feedback === 'wrong' && <div className="mt-8 text-4xl font-bold text-kidPink animate-shake">Ojej! Spróbuj inne 🤔</div>}
    </div>
  );
};

export default PatternGame;