import React, { useState, useEffect } from 'react';
import { GameConfig } from '../types';
import { GoogleGenAI } from "@google/genai";

interface Props {
  game: GameConfig;
  onBack: () => void;
}

const ITEMS = ['🌞', '🚗', '🐶', '🍕', '⚽', '🌲', '👑', '🚀', '🧸', '🚲', '🍎', '🕰️', '👓', '🍦'];

const RiddleGame: React.FC<Props> = ({ game, onBack }) => {
  const [target, setTarget] = useState<string>('');
  const [options, setOptions] = useState<string[]>([]);
  const [riddle, setRiddle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    startNewRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startNewRound = async () => {
    setLoading(true);
    setRevealed(false);
    
    // 1. Pick target and distractors
    const shuffled = [...ITEMS].sort(() => Math.random() - 0.5);
    const newTarget = shuffled[0];
    const distractors = shuffled.slice(1, 3);
    const roundOptions = [newTarget, ...distractors].sort(() => Math.random() - 0.5);

    setTarget(newTarget);
    setOptions(roundOptions);

    // 2. Get Riddle from AI
    try {
       const apiKey = process.env.API_KEY; 
       if (!apiKey) throw new Error("No API Key");

       const ai = new GoogleGenAI({ apiKey });
       const prompt = `Napisz bardzo prostą zagadkę (max 2 zdania) dla 3-letniego dziecka opisującą ten obiekt: ${newTarget}.
       Zasada: NIE używaj nazwy tego obiektu w tekście zagadki!
       Język: Prosty, ciepły polski.`;

       const response = await ai.models.generateContent({
         model: 'gemini-3-flash-preview',
         contents: prompt,
       });

       setRiddle(response.text || "Zgadnij co to jest?");
    } catch (e) {
      setRiddle("Jestem okrągłe i wesołe... (Błąd połączenia, zgadnij z obrazków!)");
    } finally {
      setLoading(false);
    }
  };

  const handleGuess = (guess: string) => {
    if (revealed) return;
    
    if (guess === target) {
      setRevealed(true);
      setScore(s => s + 1);
      setTimeout(startNewRound, 2500);
    } else {
      const btn = document.getElementById(`opt-${guess}`);
      if(btn) {
          btn.classList.add('opacity-50', 'scale-90');
      }
    }
  };

  return (
    <div className="flex flex-col items-center pt-8 p-4 min-h-screen">
       <div className="w-full max-w-xl flex justify-between items-center mb-8">
         <button onClick={onBack} className="text-gray-500 font-bold bg-white px-4 py-2 rounded-xl shadow-sm text-lg">⬅ Wyjście</button>
         <span className="text-kidPurple font-bold text-2xl bg-white px-4 py-2 rounded-xl shadow-sm">Punkty: {score}</span>
      </div>

      <div className="w-full max-w-xl mb-12">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border-4 border-kidYellow relative min-h-[180px] flex items-center justify-center text-center">
            {loading ? (
                <div className="animate-pulse flex flex-col items-center">
                    <span className="text-6xl mb-4">🤔</span>
                    <span className="text-gray-400 font-bold text-xl">Wymyślam zagadkę...</span>
                </div>
            ) : (
                <div>
                   <span className="absolute top-[-25px] left-[-15px] text-7xl transform -rotate-12">❓</span>
                   <p className="text-2xl md:text-3xl font-comic text-gray-700 leading-relaxed font-bold">
                       {riddle}
                   </p>
                </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 w-full max-w-2xl">
        {options.map((opt, i) => (
            <button
              id={`opt-${opt}`}
              key={i}
              onClick={() => handleGuess(opt)}
              disabled={loading}
              className={`
                aspect-square rounded-3xl flex items-center justify-center shadow-lg border-b-8 transition-all transform active:scale-95
                ${revealed && opt === target ? 'bg-kidGreen border-green-600 scale-110' : 'bg-white border-gray-200 hover:border-kidBlue hover:bg-blue-50'}
              `}
            >
                <span className="text-7xl md:text-8xl">{opt}</span>
            </button>
        ))}
      </div>

      {revealed && (
          <div className="mt-10 text-4xl font-bold text-kidGreen animate-bounce">
              Brawo! To {target}! 🎉
          </div>
      )}
    </div>
  );
};

export default RiddleGame;