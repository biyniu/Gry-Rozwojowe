import React, { useState, useEffect, useRef } from 'react';
import { GameConfig } from '../types';

interface Props {
  game: GameConfig;
  onBack: () => void;
}

const MathGame: React.FC<Props> = ({ game, onBack }) => {
  const [question, setQuestion] = useState<string>('');
  const [options, setOptions] = useState<(number | string)[]>([]);
  const [answer, setAnswer] = useState<number | string>('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  
  // Keep track of previous answer to ensure variety
  const lastAnswerRef = useRef<number | string | null>(null);

  useEffect(() => {
    generateQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.id, score]);

  const generateQuestion = () => {
    const max = game.data.maxNumber || 5;
    const op = game.data.operation;
    let q = '';
    let a: number | string = 0;
    
    // Attempt to generate a unique question (different from last one)
    let attempts = 0;
    do {
        if (op === 'count') {
          const num = Math.floor(Math.random() * max) + 1;
          q = '🖐'.repeat(num);
          a = num;
        } else if (op === 'add_visual') {
          const n1 = Math.floor(Math.random() * (max/2)) + 1;
          const n2 = Math.floor(Math.random() * (max/2)) + 1;
          q = `${'🍎'.repeat(n1)} + ${'🍎'.repeat(n2)}`;
          a = n1 + n2;
        } else if (op === 'add_number') {
          const n1 = Math.floor(Math.random() * (max/2));
          const n2 = Math.floor(Math.random() * (max/2));
          q = `${n1} + ${n2} = ?`;
          a = n1 + n2;
        } else if (op === 'sub_number') {
          const n1 = Math.floor(Math.random() * max) + 1;
          const n2 = Math.floor(Math.random() * n1);
          q = `${n1} - ${n2} = ?`;
          a = n1 - n2;
        } else { // mixed
          const isAdd = Math.random() > 0.5;
          if (isAdd) {
            const n1 = Math.floor(Math.random() * (max/2));
            const n2 = Math.floor(Math.random() * (max/2));
            q = `${n1} + ${n2} = ?`;
            a = n1 + n2;
          } else {
            const n1 = Math.floor(Math.random() * max) + 1;
            const n2 = Math.floor(Math.random() * n1);
            q = `${n1} - ${n2} = ?`;
            a = n1 - n2;
          }
        }
        attempts++;
    } while (a === lastAnswerRef.current && attempts < 10);

    lastAnswerRef.current = a;
    setQuestion(q);
    setAnswer(a);

    // Generate options
    const opts = new Set<number | string>();
    opts.add(a);
    while (opts.size < 3) {
      let r = Math.floor(Math.random() * max) + 1;
      if (op === 'add_number' || op === 'mixed') r = Math.floor(Math.random() * max); 
      if (r !== a) opts.add(r);
    }
    setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
    setFeedback('idle');
  };

  const handleSelect = (val: number | string) => {
    if (feedback !== 'idle') return;
    if (val === answer) {
      setFeedback('correct');
      setTimeout(() => setScore(s => s + 1), 1000);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback('idle'), 1000);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[80vh] p-4 text-center justify-start pt-10">
      <div className="w-full max-w-lg flex justify-between mb-8">
        <button onClick={onBack} className="text-gray-500 font-bold bg-white px-4 py-2 rounded-xl shadow-sm text-lg">⬅ Wyjście</button>
        <span className="text-kidPurple font-bold text-2xl bg-white px-4 py-2 rounded-xl shadow-sm">Punkty: {score}</span>
      </div>

      <div className="bg-white p-10 rounded-[2rem] shadow-xl w-full max-w-2xl mb-12 border-4 border-kidBlue flex items-center justify-center min-h-[200px]">
        <h2 className="text-6xl md:text-7xl font-bold text-gray-700 tracking-wider break-words leading-relaxed">
          {question}
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-6 w-full max-w-2xl">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(opt)}
            className={`
              p-8 rounded-3xl text-5xl md:text-6xl font-bold shadow-lg border-b-8 transition-all transform active:scale-95
              ${feedback === 'correct' && opt === answer ? 'bg-kidGreen text-white border-green-600 scale-105' : ''}
              ${feedback === 'wrong' && opt !== answer ? 'bg-gray-200 opacity-50 border-gray-300' : ''}
              ${feedback === 'wrong' && opt === answer ? 'bg-kidGreen text-white animate-pulse' : ''}
              ${feedback === 'idle' ? 'bg-kidYellow text-white border-yellow-500 hover:bg-yellow-400' : ''}
            `}
          >
            {opt}
          </button>
        ))}
      </div>
      
      {feedback === 'correct' && <div className="mt-8 text-5xl animate-bounce">🌟 Super!</div>}
      {feedback === 'wrong' && <div className="mt-8 text-5xl animate-shake">😕 Spróbuj jeszcze raz</div>}
    </div>
  );
};

export default MathGame;