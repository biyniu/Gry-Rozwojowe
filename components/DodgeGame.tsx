import React, { useState, useEffect, useRef } from 'react';
import { GameConfig } from '../types';

interface Props {
  game: GameConfig;
  onBack: () => void;
}

interface Obstacle {
  id: number;
  lane: -1 | 0 | 1;
  y: number; // Percentage 0-100
  type: string; // Emoji
}

// Custom Car SVG Component for consistent Top-Down View
const CarSVG = () => (
  <svg viewBox="0 0 100 200" className="w-full h-full drop-shadow-xl" style={{ filter: 'drop-shadow(0px 10px 5px rgba(0,0,0,0.3))' }}>
    {/* Wheels */}
    <rect x="5" y="30" width="15" height="35" rx="5" fill="#333" />
    <rect x="80" y="30" width="15" height="35" rx="5" fill="#333" />
    <rect x="5" y="135" width="15" height="35" rx="5" fill="#333" />
    <rect x="80" y="135" width="15" height="35" rx="5" fill="#333" />
    
    {/* Chassis / Shadow */}
    <rect x="15" y="15" width="70" height="170" rx="25" fill="#991B1B" />

    {/* Main Body */}
    <rect x="15" y="15" width="70" height="165" rx="20" fill="#EF4444" />
    
    {/* Hood Detail (Front) */}
    <path d="M 20 20 L 80 20 L 80 50 C 80 55, 20 55, 20 50 Z" fill="#DC2626" />
    
    {/* Windshield */}
    <path d="M 20 55 L 80 55 L 75 80 L 25 80 Z" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2" opacity="0.9" />
    
    {/* Roof */}
    <rect x="22" y="78" width="56" height="55" rx="5" fill="#B91C1C" />
    
    {/* Rear Window */}
    <path d="M 25 130 L 75 130 L 72 145 L 28 145 Z" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2" opacity="0.9" />
    
    {/* Trunk / Rear */}
    <path d="M 20 145 L 80 145 L 80 170 C 80 180, 20 180, 20 170 Z" fill="#DC2626" />

    {/* Headlights (Front is TOP) */}
    <circle cx="25" cy="18" r="6" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1" className="animate-pulse" />
    <circle cx="75" cy="18" r="6" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1" className="animate-pulse" />
    
    {/* Brake Lights (Rear is BOTTOM) */}
    <rect x="20" y="175" width="15" height="5" fill="#7F1D1D" />
    <rect x="65" y="175" width="15" height="5" fill="#7F1D1D" />
    
    {/* Racing Stripe */}
    <rect x="45" y="15" width="10" height="165" fill="white" opacity="0.8" />
  </svg>
);

const DodgeGame: React.FC<Props> = ({ game, onBack }) => {
  // UI State
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'won' | 'lost'>('intro');
  const [renderObstacles, setRenderObstacles] = useState<Obstacle[]>([]);
  const [renderLane, setRenderLane] = useState<-1 | 0 | 1>(0);
  const [progress, setProgress] = useState(0);
  const [countDown, setCountDown] = useState(3);
  
  // Logic Refs
  const obstaclesRef = useRef<Obstacle[]>([]);
  const laneRef = useRef<-1 | 0 | 1>(0);
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const obstacleIdRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  
  const GAME_DURATION = (game.data?.duration || 30) * 1000;
  const OBSTACLE_TYPES = ['🚧', '🪨', '🛑', '🪵'];

  // Game Constants
  const SPAWN_THRESHOLD_Y = 25; // If top obstacle passes this Y value (25%), spawn new one.
  const GAME_SPEED = 0.6; // Slightly faster for smoothness

  useEffect(() => {
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const startGame = () => {
    obstaclesRef.current = [];
    laneRef.current = 0;
    obstacleIdRef.current = 0;
    
    setRenderObstacles([]);
    setRenderLane(0);
    setProgress(0);
    setCountDown(3);
    setGameState('intro');
    
    let count = 3;
    const interval = setInterval(() => {
      count--;
      setCountDown(count);
      if (count === 0) {
        clearInterval(interval);
        setGameState('playing');
        startTimeRef.current = performance.now();
        lastTimeRef.current = performance.now();
        requestRef.current = requestAnimationFrame(loop);
      }
    }, 1000);
  };

  const handleCrash = () => {
    cancelAnimationFrame(requestRef.current);
    setGameState('lost');
    playCrashSound();
  };

  const loop = (time: number) => {
    // 1. Progress
    const elapsed = time - startTimeRef.current;
    const newProgress = Math.min((elapsed / GAME_DURATION) * 100, 100);
    setProgress(newProgress);

    if (newProgress >= 100) {
      setGameState('won');
      playWinSound();
      return;
    }

    // 2. Move Obstacles
    const currentObstacles = obstaclesRef.current;
    const movedObstacles = currentObstacles.map(ob => ({
      ...ob,
      y: ob.y + GAME_SPEED
    }));

    // 3. Collision
    const currentLane = laneRef.current;
    let hit = false;
    
    // Hitbox logic (Car is at bottom ~5-20%)
    // SVG Car visual occupies roughly 75% to 90% of container height.
    for (const ob of movedObstacles) {
      // Check lane match + vertical overlap
      // Obstacle is 10% height. Car is 15% height.
      // Car sits at `bottom: 5%`, so roughly `top: 80%` to `95%`.
      if (ob.lane === currentLane && ob.y > 75 && ob.y < 92) {
        hit = true;
      }
    }

    if (hit) {
      handleCrash();
      return;
    }

    // 4. Cleanup
    const filteredObstacles = movedObstacles.filter(ob => ob.y < 120);

    // 5. Spawn Logic (Distance based)
    // Find the obstacle with the lowest Y (highest on screen)
    // Since we append, usually the last one, but let's sort to be sure.
    // Actually, simple check: Is there any obstacle above threshold?
    
    let highestObstacleY = 1000;
    if (filteredObstacles.length > 0) {
        // Find min Y
        highestObstacleY = Math.min(...filteredObstacles.map(o => o.y));
    } else {
        // No obstacles exists, so effective "last obstacle" is very far down
        highestObstacleY = 1000; 
    }

    // If no obstacles (length 0) OR the highest one has fallen past threshold
    if (filteredObstacles.length === 0 || highestObstacleY > SPAWN_THRESHOLD_Y) {
       // Spawn new one at top
       const lanes: (-1|0|1)[] = [-1, 0, 1];
       const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
       
       filteredObstacles.push({
         id: obstacleIdRef.current++,
         lane: randomLane,
         y: -20, // Start just above view
         type: OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)]
       });
    }

    // 6. Sync
    obstaclesRef.current = filteredObstacles;
    setRenderObstacles(filteredObstacles);

    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(loop);
  };

  const moveLane = (direction: 'left' | 'right') => {
    if (gameState !== 'playing') return;
    
    setRenderLane(prev => {
      const next = direction === 'left' 
        ? (prev > -1 ? prev - 1 : prev) 
        : (prev < 1 ? prev + 1 : prev);
      laneRef.current = next as -1|0|1;
      return next as -1|0|1;
    });
  };

  const playCrashSound = () => {
     try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = 80;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.stop(ctx.currentTime + 0.4);
     } catch(e) {}
  };

  const playWinSound = () => {
    try {
       const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
       const now = ctx.currentTime;
       
       // Play fanfare
       [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
           const osc = ctx.createOscillator();
           const gain = ctx.createGain();
           osc.frequency.value = freq;
           osc.connect(gain);
           gain.connect(ctx.destination);
           osc.start(now + i*0.1);
           gain.gain.setValueAtTime(0.1, now + i*0.1);
           gain.gain.exponentialRampToValueAtTime(0.001, now + i*0.1 + 0.3);
           osc.stop(now + i*0.1 + 0.3);
       });
    } catch(e) {}
 };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-800 relative select-none touch-none">
      {/* HUD */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between z-20 text-white font-bold drop-shadow-md">
         <button onClick={onBack} className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm z-30">⬅ Wyjście</button>
         <div className="flex flex-col items-end z-30">
             <span>Meta:</span>
             <div className="w-32 h-4 bg-gray-600 rounded-full border-2 border-white overflow-hidden mt-1">
                 <div className="h-full bg-kidGreen transition-all duration-200" style={{ width: `${progress}%` }}></div>
             </div>
         </div>
      </div>

      {/* GAME WORLD */}
      <div className="flex-1 relative flex justify-center overflow-hidden bg-gray-700">
         {/* Road */}
         <div className="w-full max-w-md bg-gray-500 h-full relative border-l-8 border-r-8 border-yellow-500 shadow-2xl overflow-hidden">
             
             {/* Asphalt Texture Detail */}
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/asphalt-dark.png')]"></div>

             {/* Moving Road Lines */}
             <div className="absolute inset-0">
                 {/* Left Lane Divider */}
                 <div className="absolute top-0 bottom-0 left-[33%] w-3 bg-dashed-line"></div>
                 {/* Right Lane Divider */}
                 <div className="absolute top-0 bottom-0 right-[33%] w-3 bg-dashed-line"></div>
             </div>

             <style>{`
               .bg-dashed-line {
                 background-image: linear-gradient(to bottom, #ffffff 60%, transparent 60%);
                 background-size: 6px 100px; /* Taller dashes for speed feel */
                 background-repeat: repeat-y;
                 animation: scrollRoad 0.6s linear infinite;
               }
               @keyframes scrollRoad {
                 from { background-position: 0 0; }
                 to { background-position: 0 100px; }
               }
             `}</style>

             {/* Obstacles */}
             {renderObstacles.map(ob => (
                <div 
                   key={ob.id}
                   className="absolute flex items-center justify-center text-6xl md:text-7xl transition-none z-10"
                   style={{
                       left: ob.lane === -1 ? '3%' : ob.lane === 0 ? '36.5%' : '70%',
                       top: `${ob.y}%`,
                       width: '27%',
                       height: '10%'
                   }}
                >
                   {ob.type}
                </div>
             ))}

             {/* PLAYER CAR (SVG) */}
             <div 
                className="absolute bottom-[5%] transition-all duration-200 ease-out z-20"
                style={{
                    left: renderLane === -1 ? '5%' : renderLane === 0 ? '38.5%' : '72%',
                    width: '23%', 
                    height: '18%' // Slightly taller to fit car ratio
                }}
             >
                 <CarSVG />
             </div>
         </div>
      </div>

      {/* CONTROLS AREA */}
      <div className="h-44 bg-gray-900 grid grid-cols-2 gap-4 p-4 z-30 pb-8 border-t-4 border-gray-700">
          <button 
             className="bg-gradient-to-b from-kidBlue to-blue-600 rounded-3xl border-b-[8px] border-blue-800 active:border-b-0 active:translate-y-2 flex items-center justify-center transition-all shadow-lg"
             onTouchStart={(e) => { e.preventDefault(); moveLane('left'); }}
             onClick={() => moveLane('left')}
          >
             <span className="text-8xl text-white drop-shadow-lg transform -scale-x-100">➤</span>
          </button>
          <button 
             className="bg-gradient-to-b from-kidPink to-pink-600 rounded-3xl border-b-[8px] border-pink-800 active:border-b-0 active:translate-y-2 flex items-center justify-center transition-all shadow-lg"
             onTouchStart={(e) => { e.preventDefault(); moveLane('right'); }}
             onClick={() => moveLane('right')}
          >
             <span className="text-8xl text-white drop-shadow-lg">➤</span>
          </button>
      </div>

      {/* OVERLAYS */}
      {gameState === 'intro' && (
          <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center text-white">
             {countDown < 3 && countDown > 0 ? (
                 <div className="text-[12rem] font-bold animate-ping text-kidYellow">{countDown}</div>
             ) : (
                <>
                 <h1 className="text-6xl font-bold text-kidYellow mb-8 tracking-widest drop-shadow-lg">START</h1>
                 <p className="text-2xl mb-12 text-gray-300 font-bold">Omijaj przeszkody!</p>
                 <button onClick={startGame} className="bg-kidGreen px-16 py-8 rounded-full text-4xl font-bold shadow-[0_0_50px_rgba(74,222,128,0.6)] animate-pulse border-b-8 border-green-700 active:border-b-0 active:translate-y-2">
                     JAZDA! 🏁
                 </button>
                </>
             )}
          </div>
      )}

      {gameState === 'lost' && (
          <div className="absolute inset-0 bg-red-600/95 z-50 flex flex-col items-center justify-center text-white animate-fade-in">
             <div className="text-9xl mb-6">💥</div>
             <h2 className="text-6xl font-bold mb-8">BUM!</h2>
             <div className="flex gap-6">
                 <button onClick={startGame} className="bg-white text-red-600 px-10 py-5 rounded-full text-2xl font-bold shadow-xl border-b-4 border-gray-300">
                     Od nowa 🔄
                 </button>
                 <button onClick={onBack} className="bg-black/30 text-white px-10 py-5 rounded-full text-2xl font-bold">
                     Wyjście
                 </button>
             </div>
          </div>
      )}

      {gameState === 'won' && (
          <div className="absolute inset-0 bg-kidBlue/95 z-50 flex flex-col items-center justify-center text-white animate-fade-in">
             <div className="text-9xl mb-6 animate-bounce">🏆</div>
             <h2 className="text-6xl font-bold mb-4 text-kidYellow">META!</h2>
             <p className="text-3xl mb-12">Jesteś Super Kierowcą!</p>
             <button onClick={startGame} className="bg-white text-kidBlue px-14 py-6 rounded-full text-3xl font-bold shadow-2xl border-b-8 border-gray-200 active:translate-y-2 active:border-b-0">
                 Jadę dalej! 🏎️
             </button>
          </div>
      )}

    </div>
  );
};

export default DodgeGame;