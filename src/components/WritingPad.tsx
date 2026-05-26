/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Trash2, Pen } from 'lucide-react';

interface WritingPadProps {
  traceWord?: string; // Faint character to trace behind
}

export default function WritingPad({ traceWord }: WritingPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#6366f1'); // Slate indigo
  const [brushWidth, setBrushWidth] = useState(5.5);
  const [traceOpacity, setTraceOpacity] = useState(0.18); // Faint guide intensity
  const [showTrace, setShowTrace] = useState(true);

  // Draw background Rice Field grid "田" on canvas reload
  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // Draw square borders
    ctx.strokeStyle = '#e2e8f0'; // slate-200
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, width, height);

    // Draw dashed crosshairs inside
    ctx.strokeStyle = '#e11d4822'; // transparent rose red
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Vertical line
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    // Diagonal lines
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width, 0);
    ctx.lineTo(0, height);
    ctx.stroke();

    ctx.setLineDash([]); // Reset dash
  };

  // Draw the tracing text
  const drawTraceText = (ctx: CanvasRenderingContext2D) => {
    if (!showTrace || !traceWord) return;
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    ctx.save();
    ctx.fillStyle = `rgba(15, 23, 42, ${traceOpacity})`; // Slate-900 with opacity
    ctx.font = `bold ${width * 0.72}px "Noto Sans SC", "Microsoft YaHei", "STHeiti", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(traceWord.charAt(0), width / 2, height / 2);
    ctx.restore();
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Re-render guidelines & tracing mask
    drawGrid(ctx);
    drawTraceText(ctx);
  };

  // Force re-draw tracing mask when traceWord resets
  useEffect(() => {
    handleClear();
  }, [traceWord, showTrace, traceOpacity]);

  // Handle drawing coordinates
  const getCoordinates = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Scale back to matches internal resolution
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e.nativeEvent);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    
    // Set line cap and styling
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushWidth;

    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e.nativeEvent);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <div className="flex flex-col gap-3 bg-white border border-slate-200 p-4.5 rounded-2xl w-full shadow-sm" id="writing-pad-panel">
      
      {/* Configuration Header Row */}
      <div className="flex items-center justify-between" id="writing-pad-header">
        <span className="text-xs font-semibold text-slate-800 tracking-wide flex items-center gap-1.5">
          <Pen size={14} className="text-indigo-500" />
          Tập viết chữ Hán
        </span>

        <button
          id="clear-canvas-btn"
          onClick={handleClear}
          className="text-[11px] font-bold text-slate-500 hover:text-rose-500 hover:bg-rose-50 py-1.5 px-2.5 rounded-lg border border-slate-200 hover:border-rose-200 transition flex items-center gap-1 cursor-pointer shadow-sm"
          title="Xóa trắng bảng viết"
        >
          <Trash2 size={12} />
          Xóa viết lại
        </button>
      </div>

      {/* Main interactive HTML5 Canvas element */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={360}
          height={360}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair blockTouchScroll"
        />

        {/* Floating guidance overlay */}
        {traceWord && (
          <div className="absolute top-2.5 left-2.5 bg-white/80 backdrop-blur px-2 py-1 rounded-md text-[10px] text-slate-500 border border-slate-200 shadow-sm select-none">
            Mẫu viết: <strong className="text-slate-800 tracking-wider font-semibold font-sans">{traceWord}</strong>
          </div>
        )}
      </div>

      {/* Visual Tuning Sidebar controls */}
      <div className="flex flex-col gap-2.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-200 text-[11px]" id="writing-settings">
        {/* Brush styling Row */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Tracing Mode trigger */}
          {traceWord && (
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-slate-900">
              <input
                id="toggle-trace-chk"
                type="checkbox"
                checked={showTrace}
                onChange={(e) => setShowTrace(e.target.checked)}
                className="rounded border-slate-300 text-indigo-500 focus:ring-0 cursor-pointer h-3.5 w-3.5 bg-white"
              />
              Hiện chữ in mờ để đồ theo
            </label>
          )}

          {/* Preset brush color dots */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 mr-1">Màu:</span>
            {['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#f4f4f5'].map((color) => (
              <button
                id={`brush-color-${color}`}
                key={color}
                onClick={() => setBrushColor(color)}
                style={{ backgroundColor: color }}
                className={`w-3.5 h-3.5 rounded-full cursor-pointer transition ${
                  brushColor === color ? 'ring-2 ring-indigo-400 ring-offset-1 ring-offset-white scale-110' : 'opacity-80 hover:opacity-100 shadow-sm'
                }`}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Thickness and Opacity triggers */}
        <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-2 shrink-0">
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 flex justify-between">
              <span>Cỡ cọ:</span>
              <strong className="text-slate-700">{brushWidth}px</strong>
            </span>
            <input
              id="range-brush-width"
              type="range"
              min="2"
              max="16"
              step="0.5"
              value={brushWidth}
              onChange={(e) => setBrushWidth(parseFloat(e.target.value))}
              className="accent-indigo-500 bg-slate-200 cursor-pointer w-full h-1 rounded-full appearance-none"
            />
          </div>

          {traceWord && showTrace && (
            <div className="flex flex-col gap-1">
              <span className="text-slate-500 flex justify-between">
                <span>Độ đậm mờ:</span>
                <strong className="text-slate-700">{Math.round(traceOpacity * 100)}%</strong>
              </span>
              <input
                id="range-trace-opacity"
                type="range"
                min="0.05"
                max="0.5"
                step="0.01"
                value={traceOpacity}
                onChange={(e) => setTraceOpacity(parseFloat(e.target.value))}
                className="accent-indigo-500 bg-slate-200 cursor-pointer w-full h-1 rounded-full appearance-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
