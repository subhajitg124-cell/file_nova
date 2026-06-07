import React, { useState, useMemo } from 'react';
import { useFileStore } from '@/store/useFileStore';
import { useTranslation } from '@/lib/i18n';
import { FileText, Languages, Sparkles, Info } from 'lucide-react';

export const OCRWorkspace: React.FC = () => {
  const { files, updateOptions, operationOptions } = useFileStore();
  const { tText } = useTranslation();
  const [extractedText, setExtractedText] = useState<string | null>(null);

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleLanguageChange = (lang: string) => {
    updateOptions({ ocrLanguage: lang });
  };

  if (files.length === 0) return null;

  const languages = [
    { code: 'eng', label: 'English', native: 'English' },
    { code: 'hin', label: 'Hindi', native: 'हिन्दी' },
    { code: 'ben', label: 'Bengali', native: 'বাংলা' },
    { code: 'tam', label: 'Tamil', native: 'தமிழ்' },
    { code: 'tel', label: 'Telugu', native: 'తెలుగు' },
    { code: 'mar', label: 'Marathi', native: 'मराठी' },
    { code: 'guj', label: 'Gujarati', native: 'ગુજરાતી' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Languages className="h-4 w-4" />
          Recognition Language
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`px-3 py-2.5 rounded-xl border-2 transition-all text-left ${
                (operationOptions.ocrLanguage || 'eng') === lang.code
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className="text-xs font-bold text-foreground">{lang.label}</div>
              <div className="text-[10px] text-muted-foreground">{lang.native}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Page Range (optional)</label>
        <input
          type="text"
          value={operationOptions.pageRange || 'all'}
          onChange={(e) => updateOptions({ pageRange: e.target.value })}
          className="w-full p-3 bg-card border border-border rounded-xl text-sm font-mono"
          placeholder="all or 1-5, 8"
        />
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
          <FileText className="h-4 w-4" />
          <span>{files[0]?.name} — {formatSize(files[0]?.size)}</span>
        </div>
      </div>

      {extractedText && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            Extracted Text Preview
          </h4>
          <div className="bg-card border border-border rounded-xl p-4 max-h-64 overflow-y-auto">
            <p className="text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed">
              {extractedText.substring(0, 2000)}
              {extractedText.length > 2000 && '...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
