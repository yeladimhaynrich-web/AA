import React from 'react';
import {
  Search,
  Upload,
  LayoutGrid,
  Grid3X3,
  List,
  Sparkles,
  Smartphone,
  Globe,
  CheckSquare,
  Square,
  ArrowUpDown,
  Compass
} from 'lucide-react';
import { ViewMode, Orientation, SortBy, Language } from '../types';
import { translations } from '../lib/translations';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  orientationFilter: Orientation | 'all';
  setOrientationFilter: (o: Orientation | 'all') => void;
  sortBy: SortBy;
  setSortBy: (s: SortBy) => void;
  isMultiSelect: boolean;
  setIsMultiSelect: (v: boolean) => void;
  onOpenUpload: () => void;
  onOpenApkModal: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  photoCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  orientationFilter,
  setOrientationFilter,
  sortBy,
  setSortBy,
  isMultiSelect,
  setIsMultiSelect,
  onOpenUpload,
  onOpenApkModal,
  lang,
  setLang,
  photoCount
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                {t.appTitle}
              </h1>
              <span className="text-xs text-indigo-400 font-medium">
                {photoCount} {t.allPhotos}
              </span>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setLang(lang === 'he' ? 'en' : 'he')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors flex items-center gap-1"
              title="Switch Language"
            >
              <Globe className="w-4 h-4" />
              <span>{lang.toUpperCase()}</span>
            </button>
            <button
              onClick={onOpenUpload}
              className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1 shadow-md shadow-indigo-600/30"
            >
              <Upload className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute right-3.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none ltr:left-3.5 ltr:right-auto" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pr-10 pl-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ltr:pl-10 ltr:pr-4"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-2.5 text-xs text-slate-400 hover:text-white ltr:right-3 ltr:left-auto"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter, View Modes & Actions */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 w-full md:w-auto">
          {/* Orientation Filter */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
            <Compass className="w-3.5 h-3.5 text-slate-400 mx-1.5" />
            <select
              value={orientationFilter}
              onChange={(e) => setOrientationFilter(e.target.value as any)}
              className="bg-transparent text-slate-200 focus:outline-none text-xs cursor-pointer py-1 pr-1 font-medium"
            >
              <option value="all" className="bg-slate-800">{t.allOrientations}</option>
              <option value="landscape" className="bg-slate-800">{t.landscape}</option>
              <option value="portrait" className="bg-slate-800">{t.portrait}</option>
              <option value="square" className="bg-slate-800">{t.square}</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 mx-1.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-200 focus:outline-none text-xs cursor-pointer py-1 pr-1 font-medium"
            >
              <option value="dateDesc" className="bg-slate-800">{t.dateNewest}</option>
              <option value="dateAsc" className="bg-slate-800">{t.dateOldest}</option>
              <option value="titleAsc" className="bg-slate-800">{t.titleAsc}</option>
              <option value="sizeDesc" className="bg-slate-800">{t.sizeDesc}</option>
              <option value="ratingDesc" className="bg-slate-800">{t.ratingDesc}</option>
            </select>
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
              title={t.viewGrid}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('masonry')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'masonry'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
              title={t.viewMasonry}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
              title={t.viewList}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Multi Select Toggle */}
          <button
            onClick={() => setIsMultiSelect(!isMultiSelect)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isMultiSelect
                ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isMultiSelect ? <CheckSquare className="w-4 h-4 text-purple-400" /> : <Square className="w-4 h-4 text-slate-400" />}
            <span>{t.selectedPhotos}</span>
          </button>

          {/* Desktop Language Switcher */}
          <button
            onClick={() => setLang(lang === 'he' ? 'en' : 'he')}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{lang === 'he' ? 'English' : 'עברית'}</span>
          </button>

          {/* APK / GitHub Export Info Button */}
          <button
            onClick={onOpenApkModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 text-xs font-semibold transition-all shadow-sm"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{t.exportApk}</span>
          </button>

          {/* Desktop Upload Button */}
          <button
            onClick={onOpenUpload}
            className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 transition-all active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>{t.upload}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
