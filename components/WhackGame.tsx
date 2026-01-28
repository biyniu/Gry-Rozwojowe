import React, { useState, useEffect, useRef } from 'react';
import { GameConfig } from '../types';

interface Props {
  game: GameConfig;
  onBack: () => void;
}

const WhackGame: React.FC<Props> = ({ game, onBack }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(game.data.duration || 30);
  const [activeHole, setActiveHole] = useState<number | null>(null);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'finished'>('intro');
  const [moleType, setMoleType] = useState<'mole' | 'trap'>('mole'); // trap is cactus

  const timerRef = useRef<number | null>(null);
  const gameLoopRef = useRef<number | null>(null);

  const startGame = () => {
    setScore(0);
    setTimeLeft(game.data.duration || 30);
    setGameState('playing');
    setActiveHole(null);
    
    // Timer
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Mole Spawning Loop
    spawnMole();
  };

  const spawnMole = () => {
    // Random delay between 0.5s and 1.5s
    const delay = Math.random() * 1000 + 500;
    
    gameLoopRef.current = window.setTimeout(() => {
      const hole = Math.floor(Math.random() * 9);
      const isTrap = Math.random() < 0.2; // 20% chance of trap
      
      setActiveHole(hole);
      setMoleType(isTrap ? 'trap' : 'mole');

      // Hide after random time (1s - 2s)
      window.setTimeout(() => {
        setActiveHole(null);
        // Using setGameState callback to access current state to avoid stale closure issues
        setGameState(current => {
             if (current === 'playing' || current === 'intro') {
                 spawnMole();
             }
             return current;
        });
      }, Math.random() * 1000 + 1000);

    }, delay);
  };

  const playSound = (type: 'hit' | 'trap' | 'end') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'hit') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'trap') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'end') {
        const play = (f: number, t: number) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g);
            g.connect(ctx.destination);
            o.frequency.value = f;
            o.start(t);
            g.gain.setValueAtTime(0.1, t);
            g.gain.exponentialRampToValueAtTime(0.001, t+0.3);
            o.stop(t+0.3);
        };
        const now = ctx.currentTime;
        play(523, now);
        play(784, now + 0.2);
        play(1046, now + 0.4);
      }
    } catch(e) {}
  };

  const endGame = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (gameLoopRef.current) window.clearTimeout(gameLoopRef.current);
    setGameState('finished');
    setActiveHole(null);
    playSound('end');
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (gameLoopRef.current) window.clearTimeout(gameLoopRef.current);
    };
  }, []);

  const handleWhack = (index: number) => {
    if (activeHole === index) {
      if (moleType === 'trap') {
         playSound('trap');
         const btn = document.getElementById(`hole-${index}`);
         btn?.classList.add('animate-shake');
         setTimeout(() => btn?.classList.remove('animate-shake'), 500);
      } else {
         playSound('hit');
         setScore(s => s + 1);
         setActiveHole(null); // Hide immediately on hit
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-green-100 p-4 font-sans">
       <div className="flex justify-between items-center mb-4">
         <button onClick={onBack} className="bg-white px-4 py-2 rounded-xl shadow-sm font-bold text-gray-500">⬅ Wyjście</button>
         <div className="flex gap-4">
             <span className="bg-white px-4 py-2 rounded-xl shadow-sm font-bold text-kidPurple">⏰ {timeLeft}s</span>
             <span className="bg-white px-4 py-2 rounded-xl shadow-sm font-bold text-kidGreen">🔨 {score}</span>
         </div>
       </div>

       <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
          <div className="grid grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="aspect-square relative">
                {/* Hole Background */}
                <div className="absolute inset-0 bg-amber-900 rounded-full opacity-30 scale-x-110 scale-y-50 top-[40%]"></div>
                
                {/* Button Area */}
                <button
                   id={`hole-${i}`}
                   onClick={() => handleWhack(i)}
                   className="w-full h-full relative flex items-center justify-center overflow-visible active:scale-95 transition-transform"
                >
                   {activeHole === i ? (
                     <div className="text-7xl md:text-8xl animate-bounce-short">
                        {moleType === 'trap' ? '🌵' : '🐹'}
                     </div>
                   ) : null}
                </button>
              </div>
            ))}
          </div>
       </div>

       {gameState === 'intro' && (
         <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-50">
            <h1 className="text-5xl font-bold text-kidYellow mb-6">Wesołe Krety</h1>
            <p className="text-2xl mb-8">Klikaj chomiki 🐹! Uważaj na kaktusy 🌵!</p>
            <button onClick={startGame} className="bg-kidGreen px-12 py-6 rounded-full text-3xl font-bold shadow-xl animate-pulse">START</button>
         </div>
       )}

       {gameState === 'finished' && (
         <div className="absolute inset-0 bg-kidBlue/90 flex flex-col items-center justify-center text-white z-50">
            <div className="text-8xl mb-4">🏆</div>
            <h2 className="text-5xl font-bold mb-4">Koniec Czasu!</h2>
            <p className="text-3xl mb-8">Wynik: {score}</p>
            <div className="flex gap-4">
               <button onClick={startGame} className="bg-white text-kidBlue px-8 py-4 rounded-full text-2xl font-bold shadow-lg">Jeszcze raz</button>
               <button onClick={onBack} className="bg-black/20 px-8 py-4 rounded-full text-xl font-bold">Menu</button>
            </div>
         </div>
       )}
    </div>
  );
};

export default WhackGame;