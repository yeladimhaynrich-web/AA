import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  Link as LinkIcon,
  Folder,
  Image as ImageIcon,
  Check,
  Plus
} from 'lucide-react';
import { Album, Photo, Language } from '../types';
import { translations } from '../lib/translations';

interface UploadModalProps {
  albums: Album[];
  onClose: () => void;
  onAddPhotos: (newPhotos: Photo[]) => void;
  lang: Language;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  albums,
  onClose,
  onAddPhotos,
  lang
}) => {
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'files' | 'camera' | 'url'>('files');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('');
  const [urlInput, setUrlInput] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Handle local File Selection
  const handleFilesChosen = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);

    const pendingPhotos: Photo[] = [];
    let processedCount = 0;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
          const w = img.width;
          const h = img.height;
          const orientation = w > h ? 'landscape' : h > w ? 'portrait' : 'square';

          const newPhoto: Photo = {
            id: `p_uploaded_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            title: file.name.replace(/\.[^/.]+$/, ''),
            url: dataUrl,
            width: w,
            height: h,
            sizeBytes: file.size,
            mimeType: file.type,
            dateAdded: new Date().toISOString(),
            albumId: selectedAlbumId || undefined,
            isFavorite: false,
            tags: ['הועלה'],
            orientation
          };

          pendingPhotos.push(newPhoto);
          processedCount++;

          if (processedCount === files.length) {
            onAddPhotos(pendingPhotos);
            setIsProcessing(false);
            onClose();
          }
        };
      };
      reader.readAsDataURL(file);
    });
  };

  // Start Camera Stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      alert('לא ניתן לגשת למצלמה במכשיר זה');
      console.error(err);
    }
  };

  // Capture Photo from Video Stream
  const snapCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    const newPhoto: Photo = {
      id: `p_cam_${Date.now()}`,
      title: `צילום מצלמה ${new Date().toLocaleTimeString()}`,
      url: dataUrl,
      width: canvas.width,
      height: canvas.height,
      sizeBytes: Math.round(dataUrl.length * 0.75),
      mimeType: 'image/jpeg',
      dateAdded: new Date().toISOString(),
      albumId: selectedAlbumId || undefined,
      isFavorite: false,
      tags: ['מצלמה'],
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait'
    };

    // Stop tracks
    const stream = video.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    onAddPhotos([newPhoto]);
    onClose();
  };

  // Import from Image URL
  const handleUrlAdd = () => {
    if (!urlInput.trim()) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = urlInput;
    img.onload = () => {
      const newPhoto: Photo = {
        id: `p_url_${Date.now()}`,
        title: urlTitle.trim() || 'תמונה מקישור',
        url: urlInput,
        width: img.width || 1200,
        height: img.height || 800,
        sizeBytes: 1500000,
        mimeType: 'image/jpeg',
        dateAdded: new Date().toISOString(),
        albumId: selectedAlbumId || undefined,
        isFavorite: false,
        tags: ['קישור'],
        orientation: img.width > img.height ? 'landscape' : 'portrait'
      };

      onAddPhotos([newPhoto]);
      setIsProcessing(false);
      onClose();
    };
    img.onerror = () => {
      alert('לא ניתן לטעון תמונה מכתובת URL זו. אנא ודא שהקישור תקין.');
      setIsProcessing(false);
    };
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white ltr:left-5 ltr:right-auto"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-bold text-xl text-white mb-1 flex items-center gap-2">
          <Upload className="w-5 h-5 text-indigo-400" />
          <span>{t.upload}</span>
        </h3>
        <p className="text-xs text-slate-400 mb-6">{t.supportsImagesOnly}</p>

        {/* Album Selector */}
        <div className="mb-6 bg-slate-800/50 p-3 rounded-2xl border border-slate-800">
          <label className="text-xs text-slate-400 font-semibold mb-1.5 block flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5 text-indigo-400" />
            <span>שיוך לאלבום קיים (אופציונלי):</span>
          </label>
          <select
            value={selectedAlbumId}
            onChange={(e) => setSelectedAlbumId(e.target.value)}
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

        {/* Tabs */}
        <div className="flex bg-slate-800 p-1 rounded-xl mb-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('files')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'files' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>מכשיר מקומי</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('camera');
              startCamera();
            }}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'camera' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>צלם במצלמה</span>
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'url' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>קישור web</span>
          </button>
        </div>

        {/* Local Files Tab */}
        {activeTab === 'files' && (
          <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-800/30 rounded-2xl p-8 text-center transition-all">
            <Upload className="w-10 h-10 text-indigo-400 mx-auto mb-3 animate-bounce" />
            <p className="text-sm font-semibold text-slate-200 mb-1">{t.dropZoneText}</p>
            <p className="text-xs text-slate-400 mb-4">ניתן לבחור מספר תמונות במקביל</p>

            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs cursor-pointer shadow-lg shadow-indigo-600/30 transition-all active:scale-95">
              <span>בחר תמונות מהמכשיר</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFilesChosen(e.target.files)}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Camera Tab */}
        {activeTab === 'camera' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-full h-56 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 relative flex items-center justify-center">
              <video ref={videoRef} className="w-full h-full object-cover" />
            </div>
            <button
              onClick={snapCamera}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-pink-600/30 flex items-center gap-2 active:scale-95 transition-all"
            >
              <Camera className="w-5 h-5" />
              <span>צלם תמונה</span>
            </button>
          </div>
        )}

        {/* URL Tab */}
        {activeTab === 'url' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">שם התמונה (אופציונלי):</label>
              <input
                type="text"
                value={urlTitle}
                onChange={(e) => setUrlTitle(e.target.value)}
                placeholder="למשל: תמונת נוף..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">קישור ישיר לתמונה (URL):</label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={handleUrlAdd}
              disabled={isProcessing || !urlInput.trim()}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>הוסף תמונה</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
