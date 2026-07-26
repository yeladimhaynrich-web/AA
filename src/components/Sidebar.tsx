import React from 'react';
import {
  Images,
  Heart,
  FolderPlus,
  Folder,
  Tag,
  HardDrive,
  Trash2,
  Smartphone,
  Plus
} from 'lucide-react';
import { Album, Photo, Language } from '../types';
import { translations, formatBytes } from '../lib/translations';

interface SidebarProps {
  albums: Album[];
  photos: Photo[];
  activeAlbumId: string;
  setActiveAlbumId: (id: string) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  onOpenNewAlbumModal: () => void;
  onDeleteAlbum: (albumId: string) => void;
  onOpenApkModal: () => void;
  lang: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({
  albums,
  photos,
  activeAlbumId,
  setActiveAlbumId,
  selectedTag,
  setSelectedTag,
  onOpenNewAlbumModal,
  onDeleteAlbum,
  onOpenApkModal,
  lang
}) => {
  const t = translations[lang];

  const favoriteCount = photos.filter((p) => p.isFavorite).length;

  // Extract all unique tags
  const allTags = Array.from(new Set(photos.flatMap((p) => p.tags || []))).slice(0, 12);

  // Calculate total size
  const totalSizeBytes = photos.reduce((acc, p) => acc + (p.sizeBytes || 0), 0);

  return (
    <aside className="w-full md:w-64 bg-slate-900/60 border-b md:border-b-0 md:border-l border-slate-800 text-slate-300 p-4 flex flex-col gap-6 ltr:md:border-r ltr:md:border-l-0 shrink-0">
      {/* Quick Views */}
      <div className="space-y-1">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
          {t.allPhotos}
        </div>
        <button
          onClick={() => {
            setActiveAlbumId('all');
            setSelectedTag(null);
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeAlbumId === 'all' && !selectedTag
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
              : 'hover:bg-slate-800/80 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Images className="w-4 h-4 text-indigo-400" />
            <span>{t.allPhotos}</span>
          </div>
          <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400 border border-slate-700">
            {photos.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveAlbumId('favorites');
            setSelectedTag(null);
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeAlbumId === 'favorites' && !selectedTag
              ? 'bg-pink-600/20 text-pink-300 border border-pink-500/30 font-semibold'
              : 'hover:bg-slate-800/80 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500/30" />
            <span>{t.favorites}</span>
          </div>
          <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-pink-400 border border-slate-700 font-semibold">
            {favoriteCount}
          </span>
        </button>
      </div>

      {/* Albums Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {t.albums}
          </span>
          <button
            onClick={onOpenNewAlbumModal}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1 text-xs"
            title={t.newAlbum}
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          {albums.map((album) => {
            const albumPhotoCount = photos.filter((p) => p.albumId === album.id).length;
            const isSelected = activeAlbumId === album.id && !selectedTag;

            return (
              <div
                key={album.id}
                className={`group flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 text-indigo-300 border border-slate-700 font-medium'
                    : 'hover:bg-slate-800/60 text-slate-300'
                }`}
                onClick={() => {
                  setActiveAlbumId(album.id);
                  setSelectedTag(null);
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {album.coverPhotoUrl ? (
                    <img
                      src={album.coverPhotoUrl}
                      alt={album.name}
                      className="w-6 h-6 rounded-md object-cover border border-slate-700 shrink-0"
                    />
                  ) : (
                    <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <span className="truncate">{album.name}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs bg-slate-800/80 px-1.5 py-0.5 rounded text-slate-400">
                    {albumPhotoCount}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteAlbum(album.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-slate-500 transition-opacity"
                    title={t.delete}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          <button
            onClick={onOpenNewAlbumModal}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-dashed border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-800/40 transition-all mt-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.newAlbum}</span>
          </button>
        </div>
      </div>

      {/* Tags Section */}
      {allTags.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3">
            {t.tags}
          </div>
          <div className="flex flex-wrap gap-1.5 px-2">
            {allTags.map((tag) => {
              const isTagSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(isTagSelected ? null : tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 transition-all ${
                    isTagSelected
                      ? 'bg-indigo-600 text-white font-medium shadow-sm'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                  }`}
                >
                  <Tag className="w-3 h-3 text-slate-400" />
                  <span>#{tag}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile APK Modal Trigger */}
      <div className="sm:hidden mt-auto">
        <button
          onClick={onOpenApkModal}
          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-semibold text-xs"
        >
          <Smartphone className="w-4 h-4" />
          <span>{t.exportApk}</span>
        </button>
      </div>

      {/* Storage Indicator */}
      <div className="mt-auto bg-slate-800/50 rounded-2xl p-3 border border-slate-800">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <div className="flex items-center gap-1.5 text-slate-400">
            <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t.storageUsed}</span>
          </div>
          <span className="font-semibold text-slate-200">{formatBytes(totalSizeBytes)}</span>
        </div>
        <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.max(5, (totalSizeBytes / (50 * 1024 * 1024)) * 100))}%`
            }}
          />
        </div>
      </div>
    </aside>
  );
};
