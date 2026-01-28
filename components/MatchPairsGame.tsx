import React, { useState, useEffect } from 'react';
import { GameConfig } from '../types';

interface Props {
  game: GameConfig;
  onBack: () => void;
}

interface MatchItem {
  id: string;
  pairId: string; // The ID shared between matching pairs
  content: string;
  isShadow: boolean;
  state: 'idle' | 'selected' | 'matched' | 'wrong';
}

const MatchPairsGame: React.FC<Props> = ({ game, onBack }) => {
  const [items, setItems] = useState<MatchItem[]>([]);
  const [matches, setMatches] = useState(0);
  const [isWon, setIsWon] = useState(false);

  useEffect(() => {
    initializeGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.id]);

  const initializeGame = () => {
    const pool = game.data.items as string[];
    const mode = game.data.mode || 'identical';
    // Difficulty determines how many pairs: 1->4, 2->6, 3->8
    const numPairs = game.difficulty === 1 ? 4 : game.difficulty === 2 ? 6 : 8;
    
    // Select subset
    const selected = pool.slice(0, Math.min(pool.length, numPairs));
    
    let newItems: MatchItem[] = [];

    selected.forEach((emoji, idx) => {
      // First item of pair
      newItems.push({
        id: `i-${idx}-a`,
        pairId: `pair-${idx}`,
        content: emoji,
        isShadow: false,
        state: 'idle'
      });

      // Second item of pair
      newItems.push({
        id: `i-${idx}-b`,
        pairId: `pair-${idx}`,
        content: emoji,
        isShadow: mode === 'shadow', // If shadow mode, mark this one
        state: 'idle'
      });
    });

    // Shuffle
    setItems(newItems.sort(() => Math.random() - 0.5));
    setMatches(0);
    setIsWon(false);
  };

  const handleItemClick = (id: string) => {
    // Find clicked item
    const clickedIdx = items.findIndex(i => i.id === id);
    if (clickedIdx === -1) return;
    const clickedItem = items[clickedIdx];

    // If already matched or wrong state, ignore
    if (clickedItem.state === 'matched' || clickedItem.state === 'wrong') return;

    // Check if any other item is currently selected
    const selectedIdx = items.findIndex(i => i.state === 'selected' && i.id !== id);

    if (selectedIdx === -1) {
      // No other item selected: Toggle selection of this one
      const newItems = [...items];
      // If clicking already selected one, deselect
      if (clickedItem.state === 'selected') {
         newItems[clickedIdx].state = 'idle';
      } else {
         newItems[clickedIdx].state = 'selected';
      }
      setItems(newItems);
    } else {
      // One item is already selected. Check match.
      const otherItem = items[selectedIdx];
      
      if (otherItem.pairId === clickedItem.pairId) {
        // MATCH!
        const newItems = [...items];
        newItems[clickedIdx].state = 'matched';
        newItems[selectedIdx].state = 'matched';
        setItems(newItems);
        
        // Update score/win status
        const currentMatches = matches + 1;
        setMatches(currentMatches);
        if (currentMatches === items.length / 2) {
          setTimeout(() => setIsWon(true), 500);
        }
      } else {
        // NO MATCH
        const newItems = [...items];
        newItems[clickedIdx].state = 'wrong';
        newItems[selectedIdx].state = 'wrong';
        setItems(newItems);

        // Reset after short delay
        setTimeout(() => {
          setItems(prev => prev.map(item => {
             if (item.state === 'wrong') return { ...item, state: 'idle' };
             return item;
          }));
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center pt-8 p-4 min-h-screen">
      {isWon ? (
        <div className="text-center animate-fade-in mt-10 bg-white p-8 rounded-3xl shadow-2xl border-4 border-kidGreen max-w-lg">
          <div className="text-8xl mb-6">🎉</div>
          <h2 className="text-4xl font-bold text-kidGreen mb-4">Brawo!</h2>
          <p className="text-2xl text-gray-600 mb-8">Wszystkie pary odnalezione!</p>
          <div className="flex flex-col gap-4">
            <button 
              onClick={initializeGame}
              className="bg-kidGreen text-white text-2xl font-bold py-4 px-10 rounded-full shadow-lg border-b-4 border-green-600 active:translate-y-1 active:border-b-0"
            >
              Jeszcze raz 🔄
            </button>
            <button 
              onClick={onBack}
              className="bg-gray-200 text-gray-600 text-2xl font-bold py-4 px-10 rounded-full shadow-md"
            >
              Wróć
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="w-full max-w-2xl flex justify-between items-center mb-8">
            <button onClick={onBack} className="text-gray-500 font-bold bg-white px-4 py-2 rounded-xl shadow-sm text-lg">⬅ Wyjście</button>
            <h2 className="text-2xl font-bold text-kidPurple">{game.title}</h2>
            <span className="font-bold text-kidBlue bg-white px-4 py-2 rounded-xl shadow-sm text-lg">Pary: {matches}</span>
          </div>

          <div className="grid grid-cols-4 gap-4 md:gap-6 w-full max-w-2xl">
            {items.map((item) => {
              // Determine style based on state
              let baseStyle = "bg-white border-gray-200";
              if (item.state === 'selected') baseStyle = "bg-blue-100 border-kidBlue ring-4 ring-blue-200 scale-105";
              if (item.state === 'matched') baseStyle = "bg-green-100 border-green-300 opacity-0 scale-50 pointer-events-none"; // Disappear effect
              if (item.state === 'wrong') baseStyle = "bg-red-100 border-kidPink animate-shake";

              // Shadow effect for emojis
              const contentStyle = item.isShadow 
                ? { color: 'transparent', textShadow: '0 0 0 rgba(0,0,0,0.6)' } 
                : {};

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    aspect-square rounded-3xl flex items-center justify-center shadow-lg border-b-8 transition-all duration-300
                    ${baseStyle}
                  `}
                >
                  <span style={contentStyle} className="select-none pointer-events-none text-6xl md:text-7xl">
                    {item.content}
                  </span>
                </button>
              );
            })}
          </div>
          
          <div className="mt-8 text-center text-gray-500 text-xl font-bold">
             {game.data.mode === 'shadow' ? 'Znajdź pasujący cień!' : 'Znajdź taki sam obrazek!'}
          </div>
        </>
      )}
    </div>
  );
};

export default MatchPairsGame;