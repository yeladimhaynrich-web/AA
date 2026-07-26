import React from 'react';
import { PhotoCard } from './PhotoCard';
import { Photo, ViewMode, Album, Language } from '../types';
import { translations } from '../lib/translations';
import { ImageOff, Upload } from 'lucide-react';

interface PhotoGridProps {
  photos: Photo[];
  albums: Album[];
  viewMode: ViewMode;
  selectedPhotoIds: string[];
  isMultiSelect: boolean;
  onToggleSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenLightbox: (photo: Photo) => void;
  onOpenEdit: (photo: Photo) => void;
  onOpenUpload: () => void;
  lang: Language;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  albums,
  viewMode,
  selectedPhotoIds,
  isMultiSelect,
  onToggleSelect,
  onToggleFavorite,
  onOpenLightbox,
  onOpenEdit,
  onOpenUpload,
  lang
}) => {
  const t = translations[lang];

  if (photos.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center my-auto">
        <div className="w-20 h-20 rounded-3xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center mb-4 text-slate-500 shadow-xl">
          <ImageOff className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-200 mb-2">{t.noPhotosFound}</h3>
        <p className="text-sm text-slate-400 max-w-md mb-6">{t.noPhotosSubtitle}</p>
        <button
          onClick={onOpenUpload}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95"
        >
          <Upload className="w-4 h-4" />
          <span>{t.upload}</span>
        </button>
      </div>
    );
  }

  // Grid classes mapping
  const gridLayout =
    viewMode === 'large'
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6'
      : viewMode === 'list'
      ? 'flex flex-col gap-3'
      : viewMode === 'masonry'
      ? 'columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4'
      : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4';

  return (
    <div className={`p-4 md:p-6 max-w-7xl mx-auto w-full ${gridLayout}`}>
      {photos.map((photo) => {
        const album = albums.find((a) => a.id === photo.albumId);
        const isSelected = selectedPhotoIds.includes(photo.id);

        return (
          <div key={photo.id} className={viewMode === 'masonry' ? 'break-inside-avoid' : ''}>
            <PhotoCard
              photo={photo}
              album={album}
              viewMode={viewMode}
              isSelected={isSelected}
              isMultiSelect={isMultiSelect}
              onToggleSelect={onToggleSelect}
              onToggleFavorite={onToggleFavorite}
              onOpenLightbox={onOpenLightbox}
              onOpenEdit={onOpenEdit}
              lang={lang}
            />
          </div>
        );
      })}
    </div>
  );
};
