import React, { useState, useEffect, useRef } from 'react';
import { GameConfig } from '../types';

interface Props {
  game: GameConfig;
  onBack: () => void;
}

interface Item {
  id: number;
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  type: string;
  isBad: boolean;
}

const CatcherGame: React.FC<Props> = ({ game, onBack }) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'won' | 'lost'>('intro');
  const [basketX, setBasketX] = useState(50);
  const [score, setScore] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  
  const requestRef = useRef<number>(0);
  const itemIdRef = useRef<number>(0);
  
  const TARGET_SCORE = game.data.targetScore || 10;
  const FRUITS = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉'];
  const BAD_ITEMS = ['🕷️', '💣', '🌵'];

  useEffect(() => {
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const playSound = (type: 'catch' | 'bad' | 'win') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'catch') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'bad') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'win') {
        // Simple Win arpeggio
        const playNote = (f: number, t: number) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.value = f;
          o.start(t);
          g.gain.setValueAtTime(0.1, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
          o.stop(t + 0.2);
        }
        const now = ctx.currentTime;
        playNote(523, now);
        playNote(659, now + 0.15);
        playNote(783, now + 0.3);
        playNote(1046, now + 0.5);
      }
    } catch(e) {}
  };

  // --- REFACTORED REF LOOP LOGIC ---
  const stateRef = useRef({ items: [] as Item[], score: 0, basketX: 50, gameState: 'intro' });
  
  useEffect(() => {
    stateRef.current.basketX = basketX;
  }, [basketX]);

  const gameLoop = () => {
    if (stateRef.current.gameState !== 'playing') return;

    // Spawn
    if (Math.random() < 0.02) {
      const isBad = Math.random() < 0.2;
      const type = isBad 
        ? BAD_ITEMS[Math.floor(Math.random() * BAD_ITEMS.length)]
        : FRUITS[Math.floor(Math.random() * FRUITS.length)];
      
      stateRef.current.items.push({
        id: itemIdRef.current++,
        x: Math.random() * 80 + 10,
        y: -10,
        type,
        isBad
      });
    }

    // Move & Collide
    const nextItems: Item[] = [];
    let crashed = false;

    stateRef.current.items.forEach(item => {
      item.y += 0.5; // Speed

      // Check collision
      // Basket Center: stateRef.current.basketX
      // Basket Width approx 20% -> radius 10%
      if (item.y > 82 && item.y < 92 && Math.abs(item.x - stateRef.current.basketX) < 10) {
        if (item.isBad) {
          crashed = true;
          playSound('bad');
        } else {
          stateRef.current.score += 1;
          setScore(stateRef.current.score); // Sync UI
          playSound('catch');
        }
      } else if (item.y < 105) {
        nextItems.push(item);
      }
    });

    stateRef.current.items = nextItems;
    setItems([...nextItems]); // Sync UI

    if (crashed) {
      setGameState('lost');
      stateRef.current.gameState = 'lost';
    } else if (stateRef.current.score >= TARGET_SCORE) {
      setGameState('won');
      stateRef.current.gameState = 'won';
      playSound('win');
    } else {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
  };

  const startRefGame = () => {
    stateRef.current = { items: [], score: 0, basketX: 50, gameState: 'playing' };
    setScore(0);
    setGameState('playing');
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const moveBasket = (dir: -1 | 1) => {
    setBasketX(prev => {
      const n = prev + dir * 15;
      return Math.max(10, Math.min(90, n));
    });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-blue-200 relative select-none touch-none">
       {/* HUD */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between z-20 text-gray-700 font-bold">
         <button onClick={onBack} className="bg-white/50 px-4 py-2 rounded-xl backdrop-blur-sm shadow-sm">⬅ Wyjście</button>
         <div className="text-2xl bg-white/50 px-6 py-2 rounded-xl shadow-sm">
             🍎 {score} / {TARGET_SCORE}
         </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative overflow-hidden">
         {/* Sky */}
         <div className="absolute top-10 left-10 text-6xl opacity-50 animate-bounce delay-700">☁️</div>
         <div className="absolute top-20 right-20 text-6xl opacity-50 animate-bounce">☁️</div>

         {/* Items */}
         {items.map(item => (
           <div 
             key={item.id}
             className="absolute text-5xl transition-none"
             style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translateX(-50%)' }}
           >
             {item.type}
           </div>
         ))}

         {/* Basket */}
         <div 
           className="absolute bottom-[5%] text-8xl transition-all duration-100 ease-out"
           style={{ left: `${basketX}%`, transform: 'translateX(-50%)' }}
         >
           🧺
         </div>
      </div>

      {/* Controls */}
      <div className="h-32 bg-white/30 grid grid-cols-2 gap-2 p-2 pb-6">
        <button 
           className="bg-white/80 rounded-2xl text-6xl shadow-lg active:scale-95" 
           onTouchStart={(e) => { e.preventDefault(); moveBasket(-1); }}
           onClick={() => moveBasket(-1)}
        >
          ⬅️
        </button>
        <button 
           className="bg-white/80 rounded-2xl text-6xl shadow-lg active:scale-95" 
           onTouchStart={(e) => { e.preventDefault(); moveBasket(1); }}
           onClick={() => moveBasket(1)}
        >
          ➡️
        </button>
      </div>

      {/* Overlays */}
      {gameState === 'intro' && (
        <div className="absolute inset-0 bg-black/60 z-50 flex flex-col items-center justify-center text-white text-center p-4">
          <div className="text-8xl mb-4">🧺</div>
          <h1 className="text-5xl font-bold text-kidYellow mb-4">Łapacz Owoców</h1>
          <p className="text-2xl mb-8">Złap {TARGET_SCORE} owoców. Unikaj pająków!</p>
          <button onClick={startRefGame} className="bg-kidGreen px-10 py-5 rounded-full text-3xl font-bold shadow-xl animate-pulse">START</button>
        </div>
      )}

      {gameState === 'lost' && (
        <div className="absolute inset-0 bg-red-500/90 z-50 flex flex-col items-center justify-center text-white text-center">
          <div className="text-9xl mb-4">🕷️</div>
          <h2 className="text-5xl font-bold mb-4">Ojej!</h2>
          <p className="text-2xl mb-8">Złapałeś coś niedobrego!</p>
          <button onClick={startRefGame} className="bg-white text-red-500 px-8 py-4 rounded-full text-2xl font-bold shadow-lg">Spróbuj jeszcze raz</button>
        </div>
      )}

      {gameState === 'won' && (
        <div className="absolute inset-0 bg-kidGreen/90 z-50 flex flex-col items-center justify-center text-white text-center">
          <div className="text-9xl mb-4">🥗</div>
          <h2 className="text-5xl font-bold mb-4">Pysznie!</h2>
          <p className="text-2xl mb-8">Masz pełny koszyk zdrowia!</p>
          <button onClick={onBack} className="bg-white text-kidGreen px-8 py-4 rounded-full text-2xl font-bold shadow-lg">Super!</button>
        </div>
      )}

    </div>
  );
};

export default CatcherGame;