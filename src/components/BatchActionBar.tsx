import React from 'react';
import {
  CheckSquare,
  X,
  Trash2,
  Heart,
  FolderPlus,
  Download
} from 'lucide-react';
import { Album, Language } from '../types';
import { translations } from '../lib/translations';

interface BatchActionBarProps {
  selectedCount: number;
  totalCount: number;
  albums: Album[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBatchFavorite: () => void;
  onBatchDelete: () => void;
  onBatchMoveToAlbum: (albumId: string) => void;
  onBatchDownload: () => void;
  lang: Language;
}

export const BatchActionBar: React.FC<BatchActionBarProps> = ({
  selectedCount,
  totalCount,
  albums,
  onSelectAll,
  onDeselectAll,
  onBatchFavorite,
  onBatchDelete,
  onBatchMoveToAlbum,
  onBatchDownload,
  lang
}) => {
  const t = translations[lang];

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-3 shadow-2xl shadow-purple-950/40 text-slate-100 flex flex-wrap items-center gap-3 animate-in slide-in-from-bottom duration-300 max-w-xl w-[92vw]">
      <div className="flex items-center gap-2 border-r border-slate-700/60 pr-3 ltr:border-l ltr:border-r-0 ltr:pl-3 ltr:pr-0">
        <span className="font-bold text-xs bg-purple-600 px-2.5 py-1 rounded-full text-white">
          {selectedCount}
        </span>
        <span className="text-xs font-semibold text-slate-200">{t.selectedPhotos}</span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={selectedCount === totalCount ? onDeselectAll : onSelectAll}
          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors flex items-center gap-1"
        >
          <CheckSquare className="w-3.5 h-3.5 text-purple-400" />
          <span>{selectedCount === totalCount ? t.deselectAll : t.selectAll}</span>
        </button>

        {/* Favorite */}
        <button
          onClick={onBatchFavorite}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-pink-600/20 hover:text-pink-400 text-slate-300 transition-colors"
          title={t.batchFavorite}
        >
          <Heart className="w-4 h-4" />
        </button>

        {/* Download */}
        <button
          onClick={onBatchDownload}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          title={t.download}
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Move to Album */}
        <div className="relative">
          <select
            onChange={(e) => {
              if (e.target.value) {
                onBatchMoveToAlbum(e.target.value);
                e.target.value = '';
              }
            }}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="">{t.addToAlbum}</option>
            {albums.map((alb) => (
              <option key={alb.id} value={alb.id}>
                {alb.name}
              </option>
            ))}
          </select>
        </div>

        {/* Delete */}
        <button
          onClick={onBatchDelete}
          className="p-1.5 rounded-xl bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
          title={t.batchDelete}
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Cancel selection */}
        <button
          onClick={onDeselectAll}
          className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
