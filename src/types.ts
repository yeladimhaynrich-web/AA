export type Orientation = 'landscape' | 'portrait' | 'square';

export interface Photo {
  id: string;
  title: string;
  description?: string;
  url: string; // Data URL or external link
  thumbnailUrl?: string;
  width: number;
  height: number;
  sizeBytes: number; // File size in bytes
  mimeType: string;
  dateAdded: string; // ISO string
  takenDate?: string;
  albumId?: string; // Belongs to album
  isFavorite: boolean;
  tags: string[];
  rating?: number; // 1 to 5
  orientation: Orientation;
  location?: string;
}

export interface Album {
  id: string;
  name: string;
  description?: string;
  coverPhotoUrl?: string;
  createdAt: string;
  color?: string;
}

export type ViewMode = 'grid' | 'masonry' | 'large' | 'list';

export type SortBy = 'dateDesc' | 'dateAsc' | 'titleAsc' | 'sizeDesc' | 'ratingDesc';

export interface FilterState {
  searchQuery: string;
  albumId: string | 'all' | 'favorites';
  selectedTag: string | null;
  orientation: Orientation | 'all';
  sortBy: SortBy;
}

export interface EditAdjustments {
  brightness: number; // -100 to 100 (default 0)
  contrast: number; // -100 to 100 (default 0)
  saturation: number; // -100 to 100 (default 0)
  blur: number; // 0 to 20 (default 0)
  sepia: number; // 0 to 100 (default 0)
  grayscale: number; // 0 to 100 (default 0)
  hueRotate: number; // 0 to 360 (default 0)
  rotation: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
}

export type Language = 'he' | 'en';
