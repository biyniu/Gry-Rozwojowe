import React, { useState, useEffect } from 'react';
import { GameConfig, MemoryCard } from '../types';

interface Props {
  game: GameConfig;
  onBack: () => void;
}

const MemoryGame: React.FC<Props> = ({ game, onBack }) => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matches, setMatches] = useState<number>(0);
  const [isWon, setIsWon] = useState(false);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    initializeGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.id]);

  useEffect(() => {
    if (isWon) {
      playWinSound();
    }
  }, [isWon]);

  const playWinSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const playNote = (freq: number, startTime: number, duration: number, type: 'sine' | 'triangle' = 'sine') => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      // Simple cheerful arpeggio: C5, E5, G5, C6
      playNote(523.25, now, 0.1);       // C5
      playNote(659.25, now + 0.1, 0.1); // E5
      playNote(783.99, now + 0.2, 0.1); // G5
      playNote(1046.50, now + 0.3, 0.4, 'triangle'); // C6
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  const initializeGame = () => {
    const allItems = game.data.items as string[];
    // Determine grid size based on difficulty/game config
    let numPairs = 4; // Default easy (8 cards)
    if (game.difficulty === 2) numPairs = 6; // Medium (12 cards)
    if (game.difficulty === 3) numPairs = 8; // Hard (16 cards)
    
    // If items provided aren't enough, cycle them or limit pairs
    const selectedItems = allItems.slice(0, Math.min(allItems.length, numPairs));

    let deck: MemoryCard[] = [];
    const pairLogic = game.data.isPairLogic;

    if (pairLogic) {
        // For Math Memory where items are pairs like ['2+2', '4']
        // We expect items to be flat array [Q1, A1, Q2, A2...]
        for(let i=0; i<selectedItems.length; i+=2) {
             deck.push({ id: `p${i}-a`, content: selectedItems[i], isFlipped: false, isMatched: false });
             deck.push({ id: `p${i}-b`, content: selectedItems[i+1], isFlipped: false, isMatched: false });
        }
    } else {
        // Standard identical pairs
        selectedItems.forEach((item, index) => {
            deck.push({ id: `${index}-a`, content: item, isFlipped: false, isMatched: false });
            deck.push({ id: `${index}-b`, content: item, isFlipped: false, isMatched: false });
        });
    }

    // Shuffle
    deck.sort(() => Math.random() - 0.5);
    setCards(deck);
    setFlipped([]);
    setMatches(0);
    setMoves(0);
    setIsWon(false);
  };

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const idx1 = newFlipped[0];
      const idx2 = newFlipped[1];
      
      // Check match logic
      let isMatch = false;
      if (game.data.isPairLogic) {
         isMatch = cards[idx1].id.split('-')[0] === cards[idx2].id.split('-')[0];
      } else {
         isMatch = cards[idx1].content === cards[idx2].content;
      }

      if (isMatch) {
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[idx1].isMatched = true;
          matchedCards[idx2].isMatched = true;
          setCards(matchedCards);
          setFlipped([]);
          setMatches(m => m + 1);
          if (matches + 1 === cards.length / 2) setIsWon(true);
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[idx1].isFlipped = false;
          resetCards[idx2].isFlipped = false;
          setCards(resetCards);
          setFlipped([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {isWon ? (
        <div className="text-center animate-fade-in bg-white p-8 rounded-3xl shadow-2xl border-4 border-kidGreen">
          <h2 className="text-7xl mb-6">🏆</h2>
          <h2 className="text-4xl font-bold text-kidGreen mb-4">Wspaniale!</h2>
          <p className="text-xl mb-6 text-gray-600">Udało Ci się znaleźć wszystkie pary w {moves} ruchach.</p>
          <div className="flex flex-col gap-3">
             <button 
                onClick={initializeGame}
                className="bg-kidGreen text-white text-xl font-bold py-3 px-8 rounded-full shadow-lg border-b-4 border-green-600 active:translate-y-1 active:border-b-0"
              >
                Zagraj jeszcze raz 🔄
              </button>
              <button 
                onClick={onBack}
                className="bg-gray-200 text-gray-600 text-xl font-bold py-3 px-8 rounded-full shadow-md"
              >
                Wróć do Menu
              </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 flex justify-between w-full max-w-xl items-center">
             <button onClick={onBack} className="text-gray-500 font-bold bg-white px-4 py-2 rounded-xl shadow-sm text-lg">⬅ Wyjście</button>
             <h2 className="text-2xl font-bold text-kidBlue">{game.title}</h2>
             <span className="font-bold text-kidPurple bg-white px-4 py-2 rounded-xl shadow-sm text-lg">Pary: {matches} / {cards.length / 2}</span>
          </div>
          <div className={`grid gap-4 w-full max-w-2xl ${cards.length > 12 ? 'grid-cols-4' : 'grid-cols-3'}`}>
            {cards.map((card, index) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(index)}
                className={`aspect-square cursor-pointer transition-all duration-500 transform ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}`}
                style={{ perspective: '1000px' }}
              >
                <div className={`w-full h-full flex items-center justify-center rounded-2xl shadow-lg border-b-4 select-none transition-colors duration-300
                  ${card.isMatched ? 'bg-green-100 border-green-200 opacity-50 scale-95' : card.isFlipped ? 'bg-white border-kidBlue' : 'bg-kidBlue border-blue-600'}`}
                >
                   {/* Increased font size */}
                   <span className="text-5xl md:text-6xl">
                    {(card.isFlipped || card.isMatched) ? card.content : '❓'}
                   </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MemoryGame;