import React, { useState, useEffect, useRef } from 'react';
import { GameConfig } from '../types';

interface Props {
  game: GameConfig;
  onBack: () => void;
}

interface Bubble {
  id: number;
  x: number; // 0-100%
  y: number; // 0-100%
  size: number;
  speed: number;
  color: string;
}

const BubbleGame: React.FC<Props> = ({ game, onBack }) => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'won'>('intro');
  
  const requestRef = useRef<number>(0);
  const bubbleIdRef = useRef<number>(0);
  const TARGET = game.data.targetScore || 15;
  const COLORS = ['bg-blue-400', 'bg-pink-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400'];

  useEffect(() => {
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  useEffect(() => {
    if (gameState === 'won') {
      playWinSound();
    }
  }, [gameState]);

  const startGame = () => {
    setScore(0);
    setBubbles([]);
    setGameState('playing');
    requestRef.current = requestAnimationFrame(loop);
  };

  const loop = () => {
    setBubbles(prev => {
       // 1. Move Bubbles Up
       let nextBubbles = prev.map(b => ({
         ...b,
         y: b.y - b.speed,
         // Small sine wave movement for "floating" effect
         x: b.x + Math.sin(b.y / 10) * 0.2 
       })).filter(b => b.y > -20); // Remove if off screen top

       // 2. Spawn new
       if (Math.random() < 0.03 && nextBubbles.length < 8) {
         nextBubbles.push({
           id: bubbleIdRef.current++,
           x: Math.random() * 80 + 10,
           y: 110,
           size: Math.random() * 60 + 60, // 60px - 120px
           speed: Math.random() * 0.3 + 0.2,
           color: COLORS[Math.floor(Math.random() * COLORS.length)]
         });
       }

       return nextBubbles;
    });

    if (score < TARGET) {
      requestRef.current = requestAnimationFrame(loop);
    }
  };

  const playPopSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      // Random pitch for variety
      osc.frequency.setValueAtTime(400 + Math.random() * 300, ctx.currentTime);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  };

  const playWinSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playNote = (freq: number, time: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.start(time);
        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
        osc.stop(time + 0.3);
      };
      
      const now = ctx.currentTime;
      playNote(523.25, now);       // C
      playNote(659.25, now + 0.1); // E
      playNote(783.99, now + 0.2); // G
      playNote(1046.50, now + 0.4); // C high
    } catch (e) {}
  };

  const popBubble = (id: number) => {
    playPopSound();
    setScore(s => {
       const newScore = s + 1;
       if (newScore >= TARGET) setGameState('won');
       return newScore;
    });
    setBubbles(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-300 to-blue-500 overflow-hidden relative select-none touch-none">
       {/* HUD */}
       <div className="absolute top-0 w-full p-4 flex justify-between z-20 text-white font-bold drop-shadow-md">
         <button onClick={onBack} className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">⬅ Wyjście</button>
         <div className="text-2xl bg-white/20 px-6 py-2 rounded-xl">
             🫧 {score} / {TARGET}
         </div>
       </div>

       {/* Bubbles Area */}
       <div className="flex-1 relative">
          {/* Underwater decoration */}
          <div className="absolute bottom-0 w-full h-32 opacity-30 pointer-events-none">
             <div className="absolute bottom-0 left-10 text-8xl">🌿</div>
             <div className="absolute bottom-0 right-20 text-8xl">🪸</div>
             <div className="absolute bottom-10 left-1/2 text-6xl">🐠</div>
          </div>

          {bubbles.map(b => (
            <div
              key={b.id}
              onClick={() => popBubble(b.id)}
              className={`absolute rounded-full ${b.color} opacity-80 shadow-inner flex items-center justify-center cursor-pointer active:scale-110 active:opacity-0 transition-transform`}
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: `${b.size}px`,
                height: `${b.size}px`,
                transform: 'translate(-50%, -50%)',
                boxShadow: 'inset -10px -10px 20px rgba(0,0,0,0.1), inset 10px 10px 20px rgba(255,255,255,0.4)'
              }}
            >
              <div className="w-1/4 h-1/4 bg-white rounded-full absolute top-1/4 left-1/4 opacity-60"></div>
            </div>
          ))}
       </div>

       {/* Overlays */}
       {gameState === 'intro' && (
         <div className="absolute inset-0 bg-blue-900/80 z-50 flex flex-col items-center justify-center text-white text-center">
            <div className="text-9xl mb-6 animate-bounce">🫧</div>
            <h1 className="text-5xl font-bold text-kidYellow mb-6">Bąbelkowa Mania</h1>
            <p className="text-2xl mb-10">Przebij {TARGET} baniek!</p>
            <button onClick={startGame} className="bg-kidPink px-12 py-6 rounded-full text-3xl font-bold shadow-xl">START</button>
         </div>
       )}

       {gameState === 'won' && (
         <div className="absolute inset-0 bg-kidGreen/90 z-50 flex flex-col items-center justify-center text-white text-center">
            <div className="text-9xl mb-6">🎉</div>
            <h2 className="text-5xl font-bold mb-4">Brawo!</h2>
            <p className="text-2xl mb-10">Wszystkie bańki prysły!</p>
            <button onClick={onBack} className="bg-white text-kidGreen px-10 py-5 rounded-full text-3xl font-bold shadow-lg">Super!</button>
         </div>
       )}
    </div>
  );
};

export default BubbleGame;