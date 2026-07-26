import React, { useState, useEffect, useMemo } from 'react';
import {
  Photo,
  Album,
  ViewMode,
  Orientation,
  SortBy,
  Language
} from './types';
import { INITIAL_PHOTOS, INITIAL_ALBUMS } from './data/samplePhotos';
import {
  getAllPhotosFromDB,
  savePhotoToDB,
  saveMultiplePhotosToDB,
  deletePhotoFromDB,
  deleteMultiplePhotosFromDB,
  getAllAlbumsFromDB,
  saveAlbumToDB,
  deleteAlbumFromDB
} from './lib/indexedDb';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PhotoGrid } from './components/PhotoGrid';
import { PhotoLightbox } from './components/PhotoLightbox';
import { ImageEditorModal } from './components/ImageEditorModal';
import { UploadModal } from './components/UploadModal';
import { AlbumModal } from './components/AlbumModal';
import { BatchActionBar } from './components/BatchActionBar';
import { ApkExportModal } from './components/ApkExportModal';

export default function App() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // App UI & Filter state
  const [lang, setLang] = useState<Language>('he');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAlbumId, setActiveAlbumId] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [orientationFilter, setOrientationFilter] = useState<Orientation | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortBy>('dateDesc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Multi-select state
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);

  // Modals state
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewAlbumOpen, setIsNewAlbumOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);

  // Load photos and albums from IndexedDB on startup
  useEffect(() => {
    async function loadData() {
      try {
        let dbPhotos = await getAllPhotosFromDB();
        let dbAlbums = await getAllAlbumsFromDB();

        // Seed with sample data if DB is completely empty on first launch
        if (dbPhotos.length === 0) {
          await saveMultiplePhotosToDB(INITIAL_PHOTOS);
          dbPhotos = INITIAL_PHOTOS;
        }

        if (dbAlbums.length === 0) {
          for (const alb of INITIAL_ALBUMS) {
            await saveAlbumToDB(alb);
          }
          dbAlbums = INITIAL_ALBUMS;
        }

        setPhotos(dbPhotos);
        setAlbums(dbAlbums);
      } catch (err) {
        console.error('Error loading data from IndexedDB, using fallback samples', err);
        setPhotos(INITIAL_PHOTOS);
        setAlbums(INITIAL_ALBUMS);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Sync html dir attribute for RTL / LTR
  useEffect(() => {
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Handle Photo Actions
  const handleToggleFavorite = async (photoId: string) => {
    const updated = photos.map((p) => {
      if (p.id === photoId) {
        const newFav = !p.isFavorite;
        const photoToSave = { ...p, isFavorite: newFav };
        savePhotoToDB(photoToSave);
        return photoToSave;
      }
      return p;
    });
    setPhotos(updated);

    if (lightboxPhoto && lightboxPhoto.id === photoId) {
      setLightboxPhoto((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    await deletePhotoFromDB(photoId);
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    setSelectedPhotoIds((prev) => prev.filter((id) => id !== photoId));
  };

  const handleAddPhotos = async (newPhotos: Photo[]) => {
    await saveMultiplePhotosToDB(newPhotos);
    setPhotos((prev) => [...newPhotos, ...prev]);
  };

  const handleSaveModifiedPhoto = async (modifiedPhoto: Photo, saveAsCopy: boolean) => {
    await savePhotoToDB(modifiedPhoto);

    if (saveAsCopy) {
      setPhotos((prev) => [modifiedPhoto, ...prev]);
    } else {
      setPhotos((prev) => prev.map((p) => (p.id === modifiedPhoto.id ? modifiedPhoto : p)));
    }

    setEditingPhoto(null);
  };

  const handleUpdatePhotoAlbum = async (photoId: string, albumId: string | undefined) => {
    const updated = photos.map((p) => {
      if (p.id === photoId) {
        const photoToSave = { ...p, albumId };
        savePhotoToDB(photoToSave);
        return photoToSave;
      }
      return p;
    });
    setPhotos(updated);

    if (lightboxPhoto && lightboxPhoto.id === photoId) {
      setLightboxPhoto((prev) => (prev ? { ...prev, albumId } : null));
    }
  };

  const handleUpdatePhotoRating = async (photoId: string, rating: number) => {
    const updated = photos.map((p) => {
      if (p.id === photoId) {
        const photoToSave = { ...p, rating };
        savePhotoToDB(photoToSave);
        return photoToSave;
      }
      return p;
    });
    setPhotos(updated);

    if (lightboxPhoto && lightboxPhoto.id === photoId) {
      setLightboxPhoto((prev) => (prev ? { ...prev, rating } : null));
    }
  };

  // Album actions
  const handleCreateAlbum = async (newAlbum: Album) => {
    await saveAlbumToDB(newAlbum);
    setAlbums((prev) => [...prev, newAlbum]);
  };

  const handleDeleteAlbum = async (albumId: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק אלבום זה? (התמונות עצמן לא יימחקו)')) {
      await deleteAlbumFromDB(albumId);
      setAlbums((prev) => prev.filter((a) => a.id !== albumId));
      if (activeAlbumId === albumId) {
        setActiveAlbumId('all');
      }
    }
  };

  // Batch actions
  const handleToggleSelect = (photoId: string) => {
    setSelectedPhotoIds((prev) =>
      prev.includes(photoId) ? prev.filter((id) => id !== photoId) : [...prev, photoId]
    );
  };

  const handleSelectAll = () => {
    setSelectedPhotoIds(filteredPhotos.map((p) => p.id));
  };

  const handleDeselectAll = () => {
    setSelectedPhotoIds([]);
  };

  const handleBatchFavorite = async () => {
    const updated = photos.map((p) => {
      if (selectedPhotoIds.includes(p.id)) {
        const photoToSave = { ...p, isFavorite: true };
        savePhotoToDB(photoToSave);
        return photoToSave;
      }
      return p;
    });
    setPhotos(updated);
    setSelectedPhotoIds([]);
  };

  const handleBatchDelete = async () => {
    if (confirm('האם למחוק את כל התמונות שנבחרו?')) {
      await deleteMultiplePhotosFromDB(selectedPhotoIds);
      setPhotos((prev) => prev.filter((p) => !selectedPhotoIds.includes(p.id)));
      setSelectedPhotoIds([]);
    }
  };

  const handleBatchMoveToAlbum = async (albumId: string) => {
    const updated = photos.map((p) => {
      if (selectedPhotoIds.includes(p.id)) {
        const photoToSave = { ...p, albumId };
        savePhotoToDB(photoToSave);
        return photoToSave;
      }
      return p;
    });
    setPhotos(updated);
    setSelectedPhotoIds([]);
  };

  const handleBatchDownload = () => {
    selectedPhotoIds.forEach((id) => {
      const photo = photos.find((p) => p.id === id);
      if (photo) {
        const link = document.createElement('a');
        link.href = photo.url;
        link.download = `${photo.title}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  };

  // Filter and Sort Logic
  const filteredPhotos = useMemo(() => {
    return photos
      .filter((photo) => {
        // Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = photo.title.toLowerCase().includes(q);
          const matchesDesc = photo.description?.toLowerCase().includes(q);
          const matchesTags = photo.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchesTitle && !matchesDesc && !matchesTags) return false;
        }

        // Album Filter
        if (activeAlbumId === 'favorites') {
          if (!photo.isFavorite) return false;
        } else if (activeAlbumId !== 'all') {
          if (photo.albumId !== activeAlbumId) return false;
        }

        // Tag Filter
        if (selectedTag) {
          if (!photo.tags?.includes(selectedTag)) return false;
        }

        // Orientation Filter
        if (orientationFilter !== 'all') {
          if (photo.orientation !== orientationFilter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'dateDesc') {
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        }
        if (sortBy === 'dateAsc') {
          return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
        }
        if (sortBy === 'titleAsc') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'sizeDesc') {
          return (b.sizeBytes || 0) - (a.sizeBytes || 0);
        }
        if (sortBy === 'ratingDesc') {
          return (b.rating || 0) - (a.rating || 0);
        }
        return 0;
      });
  }, [photos, searchQuery, activeAlbumId, selectedTag, orientationFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-400">טוען את גלריית התמונות...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased">
      {/* Top Navigation Bar */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        orientationFilter={orientationFilter}
        setOrientationFilter={setOrientationFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        isMultiSelect={isMultiSelect}
        setIsMultiSelect={setIsMultiSelect}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        lang={lang}
        setLang={setLang}
        photoCount={filteredPhotos.length}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* Left/Right Sidebar Navigation */}
        <Sidebar
          albums={albums}
          photos={photos}
          activeAlbumId={activeAlbumId}
          setActiveAlbumId={setActiveAlbumId}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          onOpenNewAlbumModal={() => setIsNewAlbumOpen(true)}
          onDeleteAlbum={handleDeleteAlbum}
          onOpenApkModal={() => setIsApkModalOpen(true)}
          lang={lang}
        />

        {/* Center Main Photo Gallery Workspace */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-950/40">
          <PhotoGrid
            photos={filteredPhotos}
            albums={albums}
            viewMode={viewMode}
            selectedPhotoIds={selectedPhotoIds}
            isMultiSelect={isMultiSelect}
            onToggleSelect={handleToggleSelect}
            onToggleFavorite={handleToggleFavorite}
            onOpenLightbox={(photo) => setLightboxPhoto(photo)}
            onOpenEdit={(photo) => setEditingPhoto(photo)}
            onOpenUpload={() => setIsUploadOpen(true)}
            lang={lang}
          />
        </main>
      </div>

      {/* Lightbox / Fullscreen Viewer Modal */}
      {lightboxPhoto && (
        <PhotoLightbox
          photo={lightboxPhoto}
          photos={filteredPhotos}
          albums={albums}
          onClose={() => setLightboxPhoto(null)}
          onSelectPhoto={(p) => setLightboxPhoto(p)}
          onToggleFavorite={handleToggleFavorite}
          onOpenEdit={(p) => {
            setLightboxPhoto(null);
            setEditingPhoto(p);
          }}
          onDeletePhoto={handleDeletePhoto}
          onUpdatePhotoAlbum={handleUpdatePhotoAlbum}
          onUpdatePhotoRating={handleUpdatePhotoRating}
          lang={lang}
        />
      )}

      {/* Canvas Photo Editor Studio Modal */}
      {editingPhoto && (
        <ImageEditorModal
          photo={editingPhoto}
          onClose={() => setEditingPhoto(null)}
          onSaveModifiedPhoto={handleSaveModifiedPhoto}
          lang={lang}
        />
      )}

      {/* Photo Upload Modal */}
      {isUploadOpen && (
        <UploadModal
          albums={albums}
          onClose={() => setIsUploadOpen(false)}
          onAddPhotos={handleAddPhotos}
          lang={lang}
        />
      )}

      {/* Create New Album Modal */}
      {isNewAlbumOpen && (
        <AlbumModal
          onClose={() => setIsNewAlbumOpen(false)}
          onCreateAlbum={handleCreateAlbum}
          lang={lang}
        />
      )}

      {/* APK / GitHub Export Helper Modal */}
      {isApkModalOpen && (
        <ApkExportModal
          onClose={() => setIsApkModalOpen(false)}
          photos={photos}
          lang={lang}
        />
      )}

      {/* Multi-Select Floating Action Bar */}
      {isMultiSelect && (
        <BatchActionBar
          selectedCount={selectedPhotoIds.length}
          totalCount={filteredPhotos.length}
          albums={albums}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onBatchFavorite={handleBatchFavorite}
          onBatchDelete={handleBatchDelete}
          onBatchMoveToAlbum={handleBatchMoveToAlbum}
          onBatchDownload={handleBatchDownload}
          lang={lang}
        />
      )}
    </div>
  );
}
