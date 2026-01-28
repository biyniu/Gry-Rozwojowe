import React, { useState } from 'react';
import { GAMES_DB } from './constants';
import { GameConfig, GameType, GameCategory } from './types';
import MemoryGame from './components/MemoryGame';
import MathGame from './components/MathGame';
import PatternGame from './components/PatternGame';
import StoryGame from './components/StoryGame';
import MagicMixerGame from './components/MagicMixerGame';
import RiddleGame from './components/RiddleGame';
import OddOneOutGame from './components/OddOneOutGame';
import MatchPairsGame from './components/MatchPairsGame';
import DodgeGame from './components/DodgeGame';
import CatcherGame from './components/CatcherGame';
import WhackGame from './components/WhackGame';
import BubbleGame from './components/BubbleGame';
import DrawingGame from './components/DrawingGame';

const App: React.FC = () => {
  const [activeGame, setActiveGame] = useState<GameConfig | null>(null);

  const renderGame = () => {
    if (!activeGame) return null;
    switch (activeGame.type) {
      case GameType.MEMORY: return <MemoryGame game={activeGame} onBack={() => setActiveGame(null)} />;
      case GameType.MATH: return <MathGame game={activeGame} onBack={() => setActiveGame(null)} />;
      case GameType.PATTERN: return <PatternGame game={activeGame} onBack={() => setActiveGame(null)} />;
      case GameType.STORY_AI: return <StoryGame game={activeGame} onBack={() => setActiveGame(null)} />;
      case GameType.MAGIC_MIXER: return <MagicMixerGame game={activeGame} onBack={() => setActiveGame(null)} />;
      case GameType.RIDDLE: return <RiddleGame game={activeGame} onBack={() => setActiveGame(null)} />;
      case GameType.ODD_ONE_OUT: return <OddOneOutGame game={activeGame} onBack={() => setActiveGame(null)} />;
      case GameType.MATCH_PAIRS: return <MatchPairsGame game={activeGame} onBack={() => setActiveGame(null)} />;
      case GameType.DODGE: return <DodgeGame game={activeGame} onBack={() => setActiveGame(null)} />;
      case GameType.CATCHER: return <CatcherGame game={activeGame} onBack={() => setActiveGame(null)} />;
      case GameType.WHACK: return <WhackGame game={activeGame} onBack={() => setActiveGame(null)} />;
      case GameType.BUBBLE: return <BubbleGame game={activeGame} onBack={() => setActiveGame(null)} />;
      case GameType.DRAWING: return <DrawingGame game={activeGame} onBack={() => setActiveGame(null)} />;
      default: return <div>Nieznana gra</div>;
    }
  };

  if (activeGame) {
    return (
      <div className="min-h-screen bg-blue-50 font-sans">
        {renderGame()}
      </div>
    );
  }

  // Group games by category
  const categories: {key: GameCategory, label: string, color: string}[] = [
    { key: 'ARCADE', label: '🏎️ Ruch i Zabawa', color: 'text-orange-500' },
    { key: 'MEMORY', label: '🧠 Trening Pamięci', color: 'text-kidBlue' },
    { key: 'LOGIC', label: '🧩 Logika i Wzory', color: 'text-kidPurple' },
    { key: 'MATH', label: '🔢 Matematyka', color: 'text-kidGreen' },
    { key: 'CREATIVE', label: '🎨 Kreatywność', color: 'text-kidPink' },
  ];

  return (
    <div className="min-h-screen bg-blue-50 font-sans pb-10">
      {/* Header */}
      <header className="bg-white p-4 shadow-sm sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-4xl">🚀</span>
          <h1 className="text-3xl font-bold text-kidBlue tracking-tight">StartKids</h1>
        </div>
      </header>

      {/* Hero */}
      <div className="p-6 text-center">
        <h2 className="text-2xl text-gray-600 font-comic font-bold">
          W co chcesz dzisiaj zagrać? 🎲
        </h2>
      </div>

      {/* Main Content Grouped by Category */}
      <main className="max-w-6xl mx-auto px-4 pb-12">
        {categories.map((cat) => {
          const catGames = GAMES_DB.filter(g => g.category === cat.key);
          if (catGames.length === 0) return null;

          return (
            <div key={cat.key} className="mb-10">
              <h3 className={`text-2xl font-bold mb-6 ml-2 ${cat.color}`}>{cat.label}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {catGames.map(game => (
                  <div 
                    key={game.id}
                    onClick={() => setActiveGame(game)}
                    className="bg-white rounded-3xl p-6 shadow-lg flex flex-col items-center text-center cursor-pointer transform transition-all duration-300 hover:scale-105 active:scale-95 border-b-8 border-gray-100 hover:border-kidBlue h-full group"
                  >
                    <div className="text-7xl mb-4 group-hover:animate-bounce-short transition-transform">{game.icon}</div>
                    <h3 className="font-bold text-gray-800 text-lg leading-tight mb-2">{game.title}</h3>
                    <p className="text-sm text-gray-400 mb-3">{game.description}</p>
                    
                    {/* Difficulty Dots */}
                    <div className="flex gap-2 mt-auto">
                      {[...Array(game.difficulty)].map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-green-400' : i === 1 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </main>
      
      <div className="text-center text-gray-400 pb-8 font-bold">
          Baw się i ucz! 🌟
      </div>
    </div>
  );
};

export default App;