import React, { useRef, useState, useEffect } from 'react';
import { GameConfig } from '../types';

interface Props {
  game: GameConfig;
  onBack: () => void;
}

const COLORS = [
  { color: '#000000', label: '⚫' },
  { color: '#EF4444', label: '🔴' }, // Red
  { color: '#3B82F6', label: '🔵' }, // Blue
  { color: '#10B981', label: '🟢' }, // Green
  { color: '#F59E0B', label: '🟡' }, // Yellow
  { color: '#EC4899', label: '🩷' }, // Pink
  { color: '#8B5CF6', label: '💜' }, // Purple
  { color: '#FFFFFF', label: '🧼' }, // Eraser
];

const BRUSH_SIZES = [5, 10, 20];

const DrawingGame: React.FC<Props> = ({ game, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(10);
  
  // Setup canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Set canvas resolution to match display size for sharpness
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
    
    // Resize handler
    const handleResize = () => {
       if (canvasRef.current) {
         // Save current drawing
         const tempCanvas = document.createElement('canvas');
         const tempCtx = tempCanvas.getContext('2d');
         tempCanvas.width = canvasRef.current.width;
         tempCanvas.height = canvasRef.current.height;
         tempCtx?.drawImage(canvasRef.current, 0, 0);

         // Resize
         const rect = canvasRef.current.getBoundingClientRect();
         canvasRef.current.width = rect.width;
         canvasRef.current.height = rect.height;
         
         // Restore
         const ctx = canvasRef.current.getContext('2d');
         if(ctx) {
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, rect.width, rect.height);
            ctx.drawImage(tempCanvas, 0, 0);
         }
       }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in event) {
       clientX = event.touches[0].clientX;
       clientY = event.touches[0].clientY;
    } else {
       clientX = (event as React.MouseEvent).clientX;
       clientY = (event as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    // Prevent scrolling when drawing
    if ('touches' in event) {
        // event.preventDefault(); // Sometimes needed, but React handles passive listeners carefully
    }
    
    const { x, y } = getCoordinates(event);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      setIsDrawing(true);
    }
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const { x, y } = getCoordinates(event);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.closePath();
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      playSound('clear');
    }
  };
  
  const playSound = (type: 'brush' | 'clear') => {
      // Simple click sound placeholder
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        if (type === 'clear') {
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        }
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } catch(e) {}
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 relative select-none touch-none">
       {/* Header */}
       <div className="bg-white p-2 shadow-sm flex justify-between items-center z-10">
         <button onClick={onBack} className="bg-gray-100 px-4 py-2 rounded-xl font-bold text-gray-600">⬅ Wyjście</button>
         <h2 className="text-xl font-bold text-kidBlue hidden md:block">{game.title}</h2>
         <div className="flex gap-2">
            <button onClick={clearCanvas} className="bg-red-100 text-red-500 px-4 py-2 rounded-xl font-bold">🗑️ Wyczyść</button>
         </div>
       </div>

       {/* Canvas Area */}
       <div className="flex-1 relative cursor-crosshair touch-none overflow-hidden bg-white shadow-inner m-4 rounded-3xl border-4 border-dashed border-gray-300">
         <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
         />
       </div>

       {/* Toolbar */}
       <div className="bg-white p-4 pb-8 flex flex-col gap-4 shadow-[0_-5px_15px_rgba(0,0,0,0.1)] z-10 rounded-t-3xl">
          {/* Colors */}
          <div className="flex justify-center gap-3 overflow-x-auto py-2">
             {COLORS.map((c, i) => (
                <button
                   key={i}
                   onClick={() => setColor(c.color)}
                   className={`
                      w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-2xl shadow-md border-4 transition-transform
                      ${color === c.color ? 'scale-110 border-gray-800' : 'border-white'}
                   `}
                   style={{ backgroundColor: c.color === '#FFFFFF' ? '#f0f0f0' : c.color }}
                >
                   {c.label}
                </button>
             ))}
          </div>
          
          {/* Sizes */}
          <div className="flex justify-center gap-6 items-center">
             <span className="font-bold text-gray-400">Pędzel:</span>
             {BRUSH_SIZES.map((size) => (
               <button
                 key={size}
                 onClick={() => setBrushSize(size)}
                 className={`
                    rounded-full bg-gray-800 transition-all
                    ${brushSize === size ? 'bg-kidBlue scale-110 ring-4 ring-blue-100' : ''}
                 `}
                 style={{ width: size + 10, height: size + 10 }}
               />
             ))}
          </div>
       </div>
    </div>
  );
};

export default DrawingGame;