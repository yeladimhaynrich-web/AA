import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Github,
  Code2,
  CheckCircle2,
  Copy,
  Download,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { Language, Photo } from '../types';
import { translations } from '../lib/translations';

interface ApkExportModalProps {
  onClose: () => void;
  photos: Photo[];
  lang: Language;
}

export const ApkExportModal: React.FC<ApkExportModalProps> = ({
  onClose,
  photos,
  lang
}) => {
  const t = translations[lang];
  const [copiedCmd, setCopiedCmd] = useState(false);

  const capacitorCommands = `npm run build
npx @capacitor/cli init "ImageGallery" "com.imagegallery.app" --web-dir "dist"
npm install @capacitor/core @capacitor/android
npx cap add android
npx cap copy android
npx cap open android`;

  const handleCopyCommands = () => {
    navigator.clipboard.writeText(capacitorCommands);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(photos, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `gallery_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white ltr:left-5 ltr:right-auto"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-white">{t.exportApkTitle}</h3>
            <p className="text-xs text-slate-400">
              מדריך שלב-אחר-שלב ליצירת קובץ APK מהקבצים של פרויקט גלריית התמונות
            </p>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-4 my-6 text-sm">
          {/* Step 1: GitHub & Folder naming warning */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-800 flex gap-3">
            <div className="w-7 h-7 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-xs text-indigo-300 shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h4 className="font-bold text-slate-200 mb-1 flex items-center gap-2">
                <Github className="w-4 h-4 text-slate-400" />
                <span>העלאת הקבצים ל-GitHub (חשוב: שם תיקיית הקוד)</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                וודאו שתיקיית הקוד נקראת <strong className="text-amber-400 font-mono">src</strong> באנגלית (אם תרגום הדפדפן העלה אותה בשם <strong className="text-red-400 font-mono">מקור</strong>, שנה את השם חזרה ל-src).
              </p>
            </div>
          </div>

          {/* Step 2: Automated GitHub Actions APK */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 flex gap-3">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-xs text-amber-300 shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h4 className="font-bold text-amber-200 mb-1 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>בנייה אוטומטית ב-GitHub Actions</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                הוספנו לפרויקט קובץ <code className="text-emerald-300 font-mono">.github/workflows/build-apk.yml</code>. ברגע שתעלו את כל קבצי הפרויקט ל-GitHub, כנסו לכרטיסיית <strong>Actions (פעולות)</strong> - הבנייה תרוץ אוטומטית ותוכלו להוריד את קובץ ה-<strong>APK</strong> המוכן!
              </p>
            </div>
          </div>

          {/* Step 3: Local Capacitor option */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-800 flex gap-3">
            <div className="w-7 h-7 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-xs text-emerald-300 shrink-0 mt-0.5">
              3
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-200 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>אפשרות מקומית: בנייה עם Capacitor</span>
                </h4>
                <button
                  onClick={handleCopyCommands}
                  className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-emerald-300 flex items-center gap-1 transition-colors"
                >
                  {copiedCmd ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCmd ? 'הועתק!' : 'העתק פקודות'}</span>
                </button>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800 dir-ltr">
                <pre>{capacitorCommands}</pre>
              </div>
            </div>
          </div>

          {/* Step 3: Android Studio Build APK */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-800 flex gap-3">
            <div className="w-7 h-7 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-xs text-purple-300 shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h4 className="font-bold text-slate-200 mb-1 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-purple-400" />
                <span>יצירת קובץ ה-APK להתקנה</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                ב-Android Studio שנפתח, לחץ בתפריט העליון על:
                <br />
                <code className="text-indigo-300 font-mono">Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</code>
                <br />
                וקבל את קובץ ה-APK המוכן להתקנה ישירות בטלפון הנייד!
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleExportJson}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>גיבוי לקבלת כל נתוני התמונות (JSON)</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/25 transition-all"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
