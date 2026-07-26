import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Edit3,
  Download,
  Share2,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  Pause,
  Info,
  Star,
  Folder,
  Tag,
  Calendar,
  HardDrive,
  Maximize2
} from 'lucide-react';
import { Photo, Album, Language } from '../types';
import { translations, formatBytes } from '../lib/translations';

interface PhotoLightboxProps {
  photo: Photo;
  photos: Photo[];
  albums: Album[];
  onClose: () => void;
  onSelectPhoto: (photo: Photo) => void;
  onToggleFavorite: (id: string) => void;
  onOpenEdit: (photo: Photo) => void;
  onDeletePhoto: (id: string) => void;
  onUpdatePhotoAlbum: (photoId: string, albumId: string | undefined) => void;
  onUpdatePhotoRating: (photoId: string, rating: number) => void;
  lang: Language;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  photo,
  photos,
  albums,
  onClose,
  onSelectPhoto,
  onToggleFavorite,
  onOpenEdit,
  onDeletePhoto,
  onUpdatePhotoAlbum,
  onUpdatePhotoRating,
  lang
}) => {
  const t = translations[lang];

  // Index navigation
  const currentIndex = photos.findIndex((p) => p.id === photo.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  // Zoom & Pan state
  const [zoom, setZoom] = useState(1);
  const [showInfo, setShowInfo] = useState(false);

  // Slideshow state
  const [isPlaying, setIsPlaying] = useState(false);
  const [slideshowSpeed, setSlideshowSpeed] = useState(3); // seconds
  const slideshowTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset zoom on photo change
  useEffect(() => {
    setZoom(1);
  }, [photo.id]);

  // Slideshow timer handler
  useEffect(() => {
    if (isPlaying) {
      slideshowTimerRef.current = setInterval(() => {
        if (hasNext) {
          onSelectPhoto(photos[currentIndex + 1]);
        } else {
          // Loop back to start
          onSelectPhoto(photos[0]);
        }
      }, slideshowSpeed * 1000);
    } else if (slideshowTimerRef.current) {
      clearInterval(slideshowTimerRef.current);
    }

    return () => {
      if (slideshowTimerRef.current) clearInterval(slideshowTimerRef.current);
    };
  }, [isPlaying, currentIndex, hasNext, photos, slideshowSpeed]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') {
        if (lang === 'he') {
          if (hasPrev) onSelectPhoto(photos[currentIndex - 1]);
        } else {
          if (hasNext) onSelectPhoto(photos[currentIndex + 1]);
        }
      }
      if (e.key === 'ArrowLeft') {
        if (lang === 'he') {
          if (hasNext) onSelectPhoto(photos[currentIndex + 1]);
        } else {
          if (hasPrev) onSelectPhoto(photos[currentIndex - 1]);
        }
      }
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, hasNext, hasPrev, lang, onClose, onSelectPhoto, photos]);

  // Download Image
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = `${photo.title.replace(/\s+/g, '_')}_${photo.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Web Share API
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: photo.title,
          text: photo.description || photo.title,
          url: photo.url
        });
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      navigator.clipboard.writeText(photo.url);
      alert('קישור לתמונה הועתק ללוח!');
    }
  };

  const currentAlbum = albums.find((a) => a.id === photo.albumId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between text-slate-100 overflow-hidden select-none animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/60 border-b border-slate-800 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-full text-slate-300 font-mono">
            {currentIndex + 1} / {photos.length}
          </span>
          <h2 className="font-bold text-sm md:text-base text-white truncate max-w-xs md:max-w-md">
            {photo.title}
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-slate-800/80 rounded-xl p-1 border border-slate-700/60">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs px-2 font-mono text-slate-400">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            {zoom !== 1 && (
              <button
                onClick={() => setZoom(1)}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Slideshow play/pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold border transition-all ${
              isPlaying
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title={isPlaying ? t.paused : t.playing}
          >
            {isPlaying ? <Pause className="w-4 h-4 text-amber-400 fill-amber-400" /> : <Play className="w-4 h-4" />}
            <span className="hidden md:inline">{isPlaying ? t.paused : t.slideshow}</span>
          </button>

          {/* Favorite */}
          <button
            onClick={() => onToggleFavorite(photo.id)}
            className={`p-2 rounded-xl border transition-all ${
              photo.isFavorite
                ? 'bg-pink-600/20 border-pink-500 text-pink-400'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title={t.favorites}
          >
            <Heart className={`w-4 h-4 ${photo.isFavorite ? 'fill-pink-500 text-pink-500' : ''}`} />
          </button>

          {/* Edit */}
          <button
            onClick={() => onOpenEdit(photo)}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
            title={t.editImage}
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Info toggle */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2 rounded-xl border transition-all ${
              showInfo
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title={t.info}
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
            title={t.download}
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
            title={t.share}
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            onClick={() => {
              if (confirm(t.confirmDelete)) {
                onDeletePhoto(photo.id);
                onClose();
              }
            }}
            className="p-2 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 transition-all"
            title={t.delete}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
            title={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden p-4">
        {/* Navigation Arrow Left */}
        {hasPrev && (
          <button
            onClick={() => onSelectPhoto(photos[currentIndex - 1])}
            className="absolute left-4 z-20 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:bg-slate-800 text-white transition-all shadow-xl hover:scale-110 active:scale-95"
            title="Previous Photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Navigation Arrow Right */}
        {hasNext && (
          <button
            onClick={() => onSelectPhoto(photos[currentIndex + 1])}
            className="absolute right-4 z-20 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:bg-slate-800 text-white transition-all shadow-xl hover:scale-110 active:scale-95"
            title="Next Photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Display Image */}
        <div className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-200">
          <img
            src={photo.url}
            alt={photo.title}
            style={{ transform: `scale(${zoom})` }}
            className="max-h-[82vh] max-w-[90vw] object-contain rounded-xl shadow-2xl transition-transform duration-200 ease-out"
          />
        </div>

        {/* Info Drawer Panel */}
        {showInfo && (
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-slate-900/95 backdrop-blur-2xl border-l border-slate-800 p-6 z-30 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-300 ltr:right-0 ltr:left-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">{t.info}</h3>
              <button
                onClick={() => setShowInfo(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                תיאור
              </span>
              <p className="text-sm text-slate-200 leading-relaxed">
                {photo.description || 'ללא תיאור'}
              </p>
            </div>

            {/* Album Selector */}
            <div className="space-y-2">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1">
                <Folder className="w-3.5 h-3.5 text-indigo-400" />
                {t.album}
              </span>
              <select
                value={photo.albumId || ''}
                onChange={(e) => onUpdatePhotoAlbum(photo.id, e.target.value || undefined)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">{t.noAlbum}</option>
                {albums.map((alb) => (
                  <option key={alb.id} value={alb.id}>
                    {alb.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                {t.rating}
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => onUpdatePhotoRating(photo.id, star)}
                    className="p-1 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        (photo.rating || 0) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Details List */}
            <div className="space-y-3 bg-slate-800/50 rounded-2xl p-4 border border-slate-800/80 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                  {t.dimensions}
                </span>
                <span className="font-mono text-slate-200">
                  {photo.width} × {photo.height}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                  {t.fileSize}
                </span>
                <span className="font-mono text-slate-200">{formatBytes(photo.sizeBytes)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  {t.dateAdded}
                </span>
                <span className="text-slate-200">
                  {new Date(photo.dateAdded).toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US')}
                </span>
              </div>
            </div>

            {/* Tags */}
            {photo.tags && photo.tags.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-indigo-400" />
                  {t.tags}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {photo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Thumbnail Navigation Strip */}
      <div className="bg-slate-900/80 border-t border-slate-800 px-4 py-2 flex items-center justify-center gap-2 overflow-x-auto max-w-full">
        {photos.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => onSelectPhoto(p)}
            className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
              p.id === photo.id
                ? 'border-indigo-500 scale-110 shadow-lg'
                : 'border-slate-800 opacity-50 hover:opacity-100'
            }`}
          >
            <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};
