import React, { useState } from 'react';
import { GameConfig } from '../types';
import { GoogleGenAI } from "@google/genai";

interface Props {
  game: GameConfig;
  onBack: () => void;
}

const INGREDIENTS = [
  '🐱', '🐶', '🦄', '🦖', '🚀', '🌈', '🍦', '🍕', '🚗', '🎈', '🌺', '⚽', '🎸', '⏰', '📱', '💩'
];

const MagicMixerGame: React.FC<Props> = ({ game, onBack }) => {
  const [slot1, setSlot1] = useState<string | null>(null);
  const [slot2, setSlot2] = useState<string | null>(null);
  const [result, setResult] = useState<{name: string, desc: string} | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = (item: string) => {
    if (!slot1) setSlot1(item);
    else if (!slot2 && item !== slot1) setSlot2(item);
  };

  const reset = () => {
    setSlot1(null);
    setSlot2(null);
    setResult(null);
  };

  const mix = async () => {
    if (!slot1 || !slot2) return;
    setLoading(true);
    
    try {
      const apiKey = process.env.API_KEY; 
      if (!apiKey) throw new Error("No API Key");

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Jesteś zabawnym asystentem dla 4-letniego dziecka.
      Połączono dwa obiekty: ${slot1} i ${slot2}.
      Wymyśl:
      1. Zabawną nazwę nowej hybrydy (jako pole 'name').
      2. Jedno krótkie, śmieszne zdanie opisujące co to coś robi (jako pole 'desc').
      
      Zwróć odpowiedź w formacie JSON: { "name": "...", "desc": "..." }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      
      const jsonText = response.text || "{}";
      const data = JSON.parse(jsonText);
      setResult(data);

    } catch (e) {
      console.error(e);
      setResult({ name: "Magiczna Pomyłka", desc: "Coś poszło nie tak, spróbuj innych składników!" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center pt-8 p-4 min-h-screen">
      <div className="w-full max-w-2xl flex justify-between items-center mb-8">
         <button onClick={onBack} className="text-gray-500 font-bold bg-white px-4 py-2 rounded-xl shadow-sm text-lg">⬅ Wyjście</button>
         <h2 className="text-2xl font-bold text-kidPurple">Magiczny Mikser 🧪</h2>
      </div>

      {/* Slots */}
      <div className="flex items-center gap-6 mb-10">
        <div className={`w-32 h-32 md:w-40 md:h-40 rounded-3xl border-8 flex items-center justify-center bg-white shadow-inner transition-all ${slot1 ? 'border-kidBlue' : 'border-gray-200'}`}>
           <span className="text-7xl md:text-8xl">{slot1}</span>
        </div>
        <div className="text-5xl font-bold text-gray-300">+</div>
        <div className={`w-32 h-32 md:w-40 md:h-40 rounded-3xl border-8 flex items-center justify-center bg-white shadow-inner transition-all ${slot2 ? 'border-kidPink' : 'border-gray-200'}`}>
           <span className="text-7xl md:text-8xl">{slot2}</span>
        </div>
      </div>

      {/* Result Area */}
      {loading && (
        <div className="mb-8 text-center animate-pulse">
          <div className="text-8xl mb-4">🌪️</div>
          <p className="font-bold text-kidPurple text-2xl">Mieszam składniki...</p>
        </div>
      )}

      {result && !loading && (
        <div className="mb-10 bg-white p-8 rounded-3xl shadow-2xl border-4 border-kidGreen max-w-lg animate-fade-in text-center relative overflow-hidden">
           <div className="absolute top-[-10px] left-[-10px] text-8xl opacity-20 pointer-events-none">✨</div>
           <h3 className="text-3xl font-bold text-kidPink mb-4">{result.name}</h3>
           <p className="text-2xl text-gray-600 leading-relaxed font-comic mb-6">{result.desc}</p>
           <button onClick={reset} className="bg-kidBlue text-white px-8 py-3 rounded-full font-bold shadow-lg text-lg hover:scale-105 transition-transform">
             Nowa mikstura 🔄
           </button>
        </div>
      )}

      {/* Ingredients Grid */}
      {!result && !loading && (
        <>
          <div className="grid grid-cols-4 gap-4 md:gap-5 max-w-xl mb-10">
            {INGREDIENTS.map((item, i) => (
              <button
                key={i}
                onClick={() => handleSelect(item)}
                disabled={slot1 === item || slot2 === item}
                className={`
                  p-4 rounded-2xl shadow-md border-b-4 active:scale-95 transition-all
                  ${(slot1 === item || slot2 === item) 
                    ? 'bg-gray-100 opacity-20 cursor-not-allowed border-transparent grayscale' 
                    : 'bg-white border-gray-100 hover:border-kidBlue hover:bg-blue-50'}
                `}
              >
                <span className="text-6xl md:text-7xl">{item}</span>
              </button>
            ))}
          </div>

          <button
            onClick={mix}
            disabled={!slot1 || !slot2}
            className={`
              w-full max-w-sm py-5 rounded-full text-2xl font-bold shadow-xl border-b-8 transition-all
              ${(slot1 && slot2) 
                ? 'bg-kidGreen text-white border-green-600 active:translate-y-1 active:border-b-0 animate-bounce-short' 
                : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'}
            `}
          >
            Mieszaj! 🔮
          </button>
        </>
      )}
    </div>
  );
};

export default MagicMixerGame;