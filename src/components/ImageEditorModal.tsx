import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Sliders,
  Sparkles,
  Save,
  Copy,
  Check
} from 'lucide-react';
import { Photo, EditAdjustments, Language } from '../types';
import { translations } from '../lib/translations';

interface ImageEditorModalProps {
  photo: Photo;
  onClose: () => void;
  onSaveModifiedPhoto: (modifiedPhoto: Photo, saveAsCopy: boolean) => void;
  lang: Language;
}

const DEFAULT_ADJUSTMENTS: EditAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
  sepia: 0,
  grayscale: 0,
  hueRotate: 0,
  rotation: 0,
  flipH: false,
  flipV: false
};

const PRESET_FILTERS = [
  { id: 'original', name: 'מקורי', adj: DEFAULT_ADJUSTMENTS },
  {
    id: 'vintage',
    name: 'וינטג׳',
    adj: { ...DEFAULT_ADJUSTMENTS, sepia: 40, contrast: 20, brightness: 5 }
  },
  {
    id: 'dramatic',
    name: 'דרמטי',
    adj: { ...DEFAULT_ADJUSTMENTS, contrast: 45, saturation: 25 }
  },
  {
    id: 'noir',
    name: 'נואר (שחור לבן)',
    adj: { ...DEFAULT_ADJUSTMENTS, grayscale: 100, contrast: 35 }
  },
  {
    id: 'sunset',
    name: 'שקיעה חמה',
    adj: { ...DEFAULT_ADJUSTMENTS, hueRotate: 15, saturation: 35, brightness: 10 }
  },
  {
    id: 'cool',
    name: 'קר וצלול',
    adj: { ...DEFAULT_ADJUSTMENTS, hueRotate: 180, saturation: -10, brightness: 5 }
  }
];

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  photo,
  onClose,
  onSaveModifiedPhoto,
  lang
}) => {
  const t = translations[lang];

  const [adj, setAdj] = useState<EditAdjustments>(DEFAULT_ADJUSTMENTS);
  const [activeTab, setActiveTab] = useState<'adjust' | 'presets'>('adjust');
  const [isSaving, setIsSaving] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Load image into HTMLImageElement
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = photo.url;
    img.onload = () => {
      imgRef.current = img;
      renderCanvas();
    };
  }, [photo.url]);

  // Render canvas whenever adjustments change
  useEffect(() => {
    if (imgRef.current) {
      renderCanvas();
    }
  }, [adj]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle 90/270 deg rotation canvas dimension swaps
    const isRotated90 = adj.rotation % 180 !== 0;
    canvas.width = isRotated90 ? img.height : img.width;
    canvas.height = isRotated90 ? img.width : img.height;

    ctx.save();

    // Move origin to canvas center for transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Rotation
    ctx.rotate((adj.rotation * Math.PI) / 180);

    // Flips
    ctx.scale(adj.flipH ? -1 : 1, adj.flipV ? -1 : 1);

    // CSS Filters string
    const brightnessVal = 100 + adj.brightness;
    const contrastVal = 100 + adj.contrast;
    const saturateVal = 100 + adj.saturation;

    const filterString = `
      brightness(${brightnessVal}%)
      contrast(${contrastVal}%)
      saturate(${saturateVal}%)
      blur(${adj.blur}px)
      sepia(${adj.sepia}%)
      grayscale(${adj.grayscale}%)
      hue-rotate(${adj.hueRotate}deg)
    `.trim();

    ctx.filter = filterString;

    // Draw centered image
    ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);

    ctx.restore();
  };

  // Export edited canvas image
  const handleSave = (saveAsCopy: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsSaving(true);

    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

      const modifiedPhoto: Photo = {
        ...photo,
        id: saveAsCopy ? `p_edited_${Date.now()}` : photo.id,
        title: saveAsCopy ? `${photo.title} (ערוך)` : photo.title,
        url: dataUrl,
        width: canvas.width,
        height: canvas.height,
        dateAdded: saveAsCopy ? new Date().toISOString() : photo.dateAdded,
        sizeBytes: Math.round(dataUrl.length * 0.75) // estimated bytes
      };

      onSaveModifiedPhoto(modifiedPhoto, saveAsCopy);
      setIsSaving(false);
      onClose();
    } catch (err) {
      console.error('Failed to export edited image canvas', err);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
        {/* Left/Main Canvas Preview Area */}
        <div className="flex-1 bg-slate-950 p-6 flex flex-col items-center justify-center relative min-h-[350px]">
          <canvas
            ref={canvasRef}
            className="max-h-[60vh] max-w-full object-contain rounded-2xl shadow-2xl border border-slate-800"
          />

          {/* Canvas Controls overlay */}
          <div className="absolute bottom-4 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setAdj((prev) => ({ ...prev, rotation: (prev.rotation - 90 + 360) % 360 }))}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white"
              title={t.rotateLeft}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setAdj((prev) => ({ ...prev, rotation: (prev.rotation + 90) % 360 }))}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white"
              title={t.rotateRight}
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-700" />
            <button
              onClick={() => setAdj((prev) => ({ ...prev, flipH: !prev.flipH }))}
              className={`p-1.5 rounded-lg ${adj.flipH ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
              title={t.flipHorizontal}
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={() => setAdj((prev) => ({ ...prev, flipV: !prev.flipV }))}
              className={`p-1.5 rounded-lg ${adj.flipV ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
              title={t.flipVertical}
            >
              <FlipVertical className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-700" />
            <button
              onClick={() => setAdj(DEFAULT_ADJUSTMENTS)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-amber-400 hover:text-amber-300 text-xs font-medium"
            >
              {t.reset}
            </button>
          </div>
        </div>

        {/* Right Editing Sidebar */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-800 p-6 flex flex-col justify-between bg-slate-900 ltr:md:border-r ltr:md:border-l-0 shrink-0">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                <span>{t.editImage}</span>
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex bg-slate-800 p-1 rounded-xl mb-6 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('adjust')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'adjust' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>התאמות</span>
              </button>
              <button
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'presets' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>פילטרים</span>
              </button>
            </div>

            {/* Adjustments Sliders */}
            {activeTab === 'adjust' ? (
              <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1 text-xs">
                {/* Brightness */}
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>{t.brightness}</span>
                    <span className="font-mono text-indigo-400">{adj.brightness}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={adj.brightness}
                    onChange={(e) => setAdj({ ...adj, brightness: Number(e.target.value) })}
                    className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Contrast */}
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>{t.contrast}</span>
                    <span className="font-mono text-indigo-400">{adj.contrast}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={adj.contrast}
                    onChange={(e) => setAdj({ ...adj, contrast: Number(e.target.value) })}
                    className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Saturation */}
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>{t.saturation}</span>
                    <span className="font-mono text-indigo-400">{adj.saturation}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={adj.saturation}
                    onChange={(e) => setAdj({ ...adj, saturation: Number(e.target.value) })}
                    className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Blur */}
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>{t.blur}</span>
                    <span className="font-mono text-indigo-400">{adj.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={adj.blur}
                    onChange={(e) => setAdj({ ...adj, blur: Number(e.target.value) })}
                    className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Sepia */}
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>{t.sepia}</span>
                    <span className="font-mono text-indigo-400">{adj.sepia}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={adj.sepia}
                    onChange={(e) => setAdj({ ...adj, sepia: Number(e.target.value) })}
                    className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Grayscale */}
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>{t.grayscale}</span>
                    <span className="font-mono text-indigo-400">{adj.grayscale}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={adj.grayscale}
                    onChange={(e) => setAdj({ ...adj, grayscale: Number(e.target.value) })}
                    className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              /* Preset Filters List */
              <div className="grid grid-cols-2 gap-2 max-h-[45vh] overflow-y-auto pr-1">
                {PRESET_FILTERS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setAdj(preset.adj)}
                    className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:bg-slate-700 text-right text-xs transition-all flex flex-col gap-1 hover:border-indigo-500"
                  >
                    <span className="font-bold text-slate-100">{preset.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Save Actions */}
          <div className="pt-4 border-t border-slate-800 space-y-2 mt-4">
            <button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Copy className="w-4 h-4 text-indigo-400" />
              <span>{t.saveAsNew}</span>
            </button>

            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{t.overwriteOriginal}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
