import React, { useState } from 'react';
import { GameConfig } from '../types';
import { GoogleGenAI } from "@google/genai";

interface Props {
  game: GameConfig;
  onBack: () => void;
}

// Opcje do wyboru
const CHARACTERS = [
  { label: 'Piesek', icon: '🐶' },
  { label: 'Kotek', icon: '🐱' },
  { label: 'Robot', icon: '🤖' },
  { label: 'Księżniczka', icon: '👸' },
  { label: 'Dinozaur', icon: '🦖' },
  { label: 'Superbohater', icon: '🦸‍♂️' },
];

const PLACES = [
  { label: 'Zamek', icon: '🏰' },
  { label: 'Kosmos', icon: '🚀' },
  { label: 'Las', icon: '🌲' },
  { label: 'Plaża', icon: '🏖️' },
  { label: 'Szkoła', icon: '🏫' },
  { label: 'Dom', icon: '🏠' },
];

const THEMES = [
  { label: 'Radość i Zabawa', icon: '😄', promptInfo: 'o radości i świetnej zabawie' },
  { label: 'Przyjaźń', icon: '🤝', promptInfo: 'o sile przyjaźni i współpracy' },
  { label: 'Złość', icon: '😠', promptInfo: 'o tym jak radzić sobie z dużą złością i nerwami' },
  { label: 'Smutek', icon: '😢', promptInfo: 'o tym, że czasem jest smutno, ale słońce znów wyjdzie' },
  { label: 'Strach', icon: '😨', promptInfo: 'o pokonywaniu strachu i byciu odważnym' },
  { label: 'Dzielenie się', icon: '🎁', promptInfo: 'o tym dlaczego warto się dzielić z innymi' },
];

const StoryGame: React.FC<Props> = ({ game, onBack }) => {
  // Steps: 1: Name, 2: Hero, 3: Place, 4: Theme, 5: Result
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1); 
  
  const [childName, setChildName] = useState('');
  const [hero, setHero] = useState(CHARACTERS[0]);
  const [place, setPlace] = useState(PLACES[0]);
  const [theme, setTheme] = useState(THEMES[0]);
  
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateStory = async () => {
    setStep(5);
    setLoading(true);
    setError('');
    setStory('');

    try {
      const apiKey = process.env.API_KEY; 
      if (!apiKey) {
        throw new Error("Brak klucza API");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const namePart = childName ? `W bajce występuje dziecko o imieniu ${childName}, które towarzyszy bohaterowi.` : '';

      const prompt = `Napisz bajkę terapeutyczną dla przedszkolaka (ok. 150-200 słów).
      Główny bohater: ${hero.label} (${hero.icon}).
      Miejsce akcji: ${place.label} (${place.icon}).
      Temat/Emocja: ${theme.promptInfo} (${theme.label}).
      ${namePart}
      
      WAŻNE INSTRUKCJE:
      1. Używaj prostego, ciepłego języka.
      2. Jeśli tematem jest negatywna emocja (złość, smutek, strach), bajka MUSI wytłumaczyć, że to uczucie jest naturalne, ale pokazać sposób na poradzenie sobie z nim i zakończyć się pozytywnie (happy end).
      3. Dodaj dużo emotikon w tekście, aby był kolorowy.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setStory(response.text || "Nie udało się stworzyć bajki, spróbuj ponownie.");
    } catch (err) {
      console.error(err);
      setError("Ups! Coś poszło nie tak. Sprawdź połączenie.");
    } finally {
      setLoading(false);
    }
  };

  const handleNameSubmit = () => {
    if (childName.trim().length > 0) {
      setStep(2);
    }
  };

  const renderSelectionStep = (
    title: string, 
    options: { label: string, icon: string }[], 
    selected: any, 
    onSelect: (val: any) => void,
    onNext: () => void
  ) => (
    <div className="w-full max-w-4xl animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-kidBlue mb-8">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        {options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => onSelect(opt)}
            className={`
              flex flex-col items-center justify-center p-6 rounded-3xl border-8 transition-all transform active:scale-95
              ${selected.label === opt.label ? 'bg-kidYellow border-yellow-500 shadow-xl scale-105' : 'bg-white border-gray-100 hover:border-kidBlue hover:bg-blue-50'}
            `}
          >
            <span className="text-7xl mb-4">{opt.icon}</span>
            <span className="font-bold text-xl text-gray-700">{opt.label}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-center">
        <button 
          onClick={onNext}
          className="bg-kidGreen text-white text-2xl font-bold py-4 px-16 rounded-full shadow-lg border-b-8 border-green-600 active:translate-y-1 active:border-b-0 hover:scale-105 transition-transform"
        >
          Dalej ➡
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center pt-8 p-4 min-h-screen">
      <div className="w-full max-w-4xl flex justify-between items-center mb-6">
         <button onClick={onBack} className="text-gray-500 font-bold bg-white px-4 py-2 rounded-xl shadow-sm text-lg">⬅ Wyjście</button>
         <div className="text-lg font-bold text-gray-400">Krok {step} z 5</div>
      </div>

      {step === 1 && (
        <div className="w-full max-w-md animate-fade-in flex flex-col items-center text-center mt-10">
          <h2 className="text-4xl font-bold text-kidBlue mb-8">Jak masz na imię?</h2>
          <div className="bg-white p-2 rounded-2xl border-8 border-kidYellow w-full mb-10">
            <input 
              type="text" 
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="Wpisz imię..."
              className="w-full text-center text-4xl p-4 rounded-xl outline-none text-gray-700 font-bold placeholder-gray-300"
              autoFocus
            />
          </div>
          <button 
            onClick={handleNameSubmit}
            disabled={!childName.trim()}
            className={`
              text-2xl font-bold py-4 px-20 rounded-full shadow-lg border-b-8 transition-all
              ${childName.trim() 
                ? 'bg-kidGreen text-white border-green-600 active:translate-y-1 active:border-b-0 hover:scale-105' 
                : 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'}
            `}
          >
            Dalej ➡
          </button>
        </div>
      )}

      {step === 2 && renderSelectionStep('Kto będzie bohaterem?', CHARACTERS, hero, setHero, () => setStep(3))}
      
      {step === 3 && renderSelectionStep('Gdzie dzieje się bajka?', PLACES, place, setPlace, () => setStep(4))}
      
      {step === 4 && renderSelectionStep('O czym ma być bajka?', THEMES, theme, setTheme, generateStory)}

      {step === 5 && (
        <div className="w-full max-w-3xl animate-fade-in text-center">
          {loading ? (
            <div className="py-20">
              <div className="text-8xl animate-bounce mb-6">✨</div>
              <h3 className="text-3xl font-bold text-kidPurple">Piszę bajkę...</h3>
              <p className="text-gray-500 text-xl mt-2">Tworzę historię dla {childName}...</p>
            </div>
          ) : (
            <>
              {error ? (
                <div className="text-red-500 font-bold mb-4">{error}</div>
              ) : (
                <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border-4 border-kidYellow relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl pointer-events-none">{theme.icon}</div>
                  <h2 className="text-3xl font-bold mb-3 text-kidPink">Bajka dla {childName}</h2>
                  <h3 className="text-xl text-gray-400 mb-8 font-bold uppercase tracking-wider">{theme.label}</h3>
                  <p className="text-xl md:text-2xl leading-relaxed whitespace-pre-line font-comic text-gray-800 text-left">
                    {story}
                  </p>
                </div>
              )}
              <button 
                onClick={() => setStep(1)}
                className="mt-10 bg-kidBlue text-white text-2xl font-bold py-4 px-10 rounded-full shadow-lg border-b-8 border-blue-600 active:border-b-0 active:translate-y-1 hover:scale-105 transition-transform"
              >
                Stwórz nową bajkę 🔄
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StoryGame;