import React, { useState } from 'react';
import {
  Heart,
  Edit2,
  Maximize2,
  Star,
  Tag,
  CheckCircle2,
  Circle,
  ImageOff
} from 'lucide-react';
import { Photo, ViewMode, Language, Album } from '../types';
import { translations, formatBytes } from '../lib/translations';

interface PhotoCardProps {
  photo: Photo;
  viewMode: ViewMode;
  isSelected: boolean;
  isMultiSelect: boolean;
  onToggleSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenLightbox: (photo: Photo) => void;
  onOpenEdit: (photo: Photo) => void;
  album?: Album;
  lang: Language;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  viewMode,
  isSelected,
  isMultiSelect,
  onToggleSelect,
  onToggleFavorite,
  onOpenLightbox,
  onOpenEdit,
  album,
  lang
}) => {
  const t = translations[lang];
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Layout styling based on ViewMode
  const isList = viewMode === 'list';
  const isLarge = viewMode === 'large';

  return (
    <div
      className={`group relative rounded-2xl overflow-hidden bg-slate-800/80 border transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 ${
        isSelected
          ? 'border-purple-500 ring-2 ring-purple-500/50'
          : 'border-slate-700/60 hover:border-slate-600'
      } ${isList ? 'flex items-center gap-4 p-3' : 'flex flex-col'}`}
      onClick={() => {
        if (isMultiSelect) {
          onToggleSelect(photo.id);
        } else {
          onOpenLightbox(photo);
        }
      }}
    >
      {/* Multi-Select Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect(photo.id);
        }}
        className={`absolute top-3 right-3 z-20 p-1.5 rounded-full backdrop-blur-md transition-all ltr:right-auto ltr:left-3 ${
          isSelected
            ? 'bg-purple-600 text-white opacity-100 shadow-md'
            : isMultiSelect
            ? 'bg-slate-900/80 text-slate-300 opacity-100 hover:text-white'
            : 'bg-slate-900/60 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white'
        }`}
      >
        {isSelected ? (
          <CheckCircle2 className="w-5 h-5 text-white fill-purple-600" />
        ) : (
          <Circle className="w-5 h-5" />
        )}
      </button>

      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(photo.id);
        }}
        className={`absolute top-3 left-3 z-20 p-2 rounded-full backdrop-blur-md transition-all ltr:left-auto ltr:right-3 ${
          photo.isFavorite
            ? 'bg-pink-600/90 text-white opacity-100 shadow-md shadow-pink-600/30'
            : 'bg-slate-900/60 text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-slate-900/90 hover:text-pink-400'
        }`}
        title={t.favorites}
      >
        <Heart className={`w-4 h-4 ${photo.isFavorite ? 'fill-white' : ''}`} />
      </button>

      {/* Image Container */}
      <div
        className={`relative overflow-hidden bg-slate-950 ${
          isList
            ? 'w-24 h-24 sm:w-32 sm:h-32 rounded-xl shrink-0'
            : isLarge
            ? 'h-80 sm:h-96'
            : viewMode === 'masonry'
            ? 'min-h-48'
            : 'h-52 sm:h-60'
        }`}
      >
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-900 p-4 text-center">
            <ImageOff className="w-8 h-8 mb-2 text-slate-600" />
            <span className="text-xs">{t.noPhotosFound}</span>
          </div>
        ) : (
          <img
            src={photo.url}
            alt={photo.title}
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Hover Gradient Overlay for Grid Modes */}
        {!isList && (
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <div className="flex items-center justify-between gap-2 text-white mb-1">
              <h3 className="font-bold text-sm truncate">{photo.title}</h3>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenEdit(photo);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-indigo-600 text-slate-200 hover:text-white transition-colors"
                  title={t.editImage}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenLightbox(photo);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-indigo-600 text-slate-200 hover:text-white transition-colors"
                  title={t.info}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
              {album && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-600/80 text-indigo-100 font-medium text-[10px]">
                  {album.name}
                </span>
              )}
              <span className="text-slate-400 text-[11px]">
                {formatBytes(photo.sizeBytes)} • {photo.width}×{photo.height}
              </span>
            </div>

            {photo.tags && photo.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {photo.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] bg-slate-800/80 px-1.5 py-0.5 rounded text-slate-300 flex items-center gap-0.5"
                  >
                    <Tag className="w-2.5 h-2.5 text-slate-400" />
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* List View Content */}
      {isList && (
        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="font-bold text-base text-slate-100 truncate">{photo.title}</h3>
              {album && (
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-medium text-xs">
                  {album.name}
                </span>
              )}
            </div>
            {photo.description && (
              <p className="text-xs text-slate-400 line-clamp-1 mb-2">{photo.description}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-2 border-t border-slate-700/40">
            <span>
              {photo.width} × {photo.height} • {formatBytes(photo.sizeBytes)}
            </span>

            {photo.rating && (
              <div className="flex items-center gap-0.5 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span className="font-semibold text-slate-200">{photo.rating}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEdit(photo);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs flex items-center gap-1 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{t.editImage}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
