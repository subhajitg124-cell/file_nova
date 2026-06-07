import React from 'react';
import { ArrowRight, FileArchive, Lock, ArrowLeftRight, Image, Type, Video, Music, RefreshCw, Scissors, Sparkles, Crop, Shield, Zap } from 'lucide-react';
import { useFileStore } from '@/store/useFileStore';
import { ToolItem } from './ToolGrid';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  icon: any;
  actionName: string;
  category: 'pdf' | 'image' | 'video' | 'office';
  operationType: 'compress' | 'convert' | 'merge' | 'split' | 'resize' | 'edit' | 'enhance';
}

const getPdfRecommendations = (): Recommendation[] => [
  {
    id: 'compress',
    title: 'Compress PDF',
    description: 'Reduce file size for easier sharing',
    icon: FileArchive,
    actionName: 'compress',
    category: 'pdf',
    operationType: 'compress',
  },
  {
    id: 'protect',
    title: 'Protect PDF',
    description: 'Add password security to your document',
    icon: Lock,
    actionName: 'pdf_protect',
    category: 'pdf',
    operationType: 'edit',
  },
  {
    id: 'split',
    title: 'Split PDF',
    description: 'Extract pages into separate files',
    icon: Scissors,
    actionName: 'split',
    category: 'pdf',
    operationType: 'split',
  },
];

const getImageRecommendations = (): Recommendation[] => [
  {
    id: 'resize',
    title: 'Resize Image',
    description: 'Adjust dimensions for your needs',
    icon: Crop,
    actionName: 'resize',
    category: 'image',
    operationType: 'resize',
  },
  {
    id: 'convert',
    title: 'Convert Format',
    description: 'Change to PNG, JPEG, WEBP, or other formats',
    icon: ArrowLeftRight,
    actionName: 'convert_format',
    category: 'image',
    operationType: 'convert',
  },
  {
    id: 'remove-bg',
    title: 'Remove Background',
    description: 'Create transparent PNG images',
    icon: Sparkles,
    actionName: 'remove_bg',
    category: 'image',
    operationType: 'edit',
  },
];

const getVideoRecommendations = (): Recommendation[] => [
  {
    id: 'trim',
    title: 'Trim Video',
    description: 'Cut unwanted parts from your video',
    icon: Scissors,
    actionName: 'trim',
    category: 'video',
    operationType: 'edit',
  },
  {
    id: 'convert-gif',
    title: 'Video to GIF',
    description: 'Create animated GIFs from video clips',
    icon: Video,
    actionName: 'video_to_gif',
    category: 'video',
    operationType: 'convert',
  },
  {
    id: 'extract-audio',
    title: 'Extract Audio',
    description: 'Get MP3 from your video file',
    icon: Music,
    actionName: 'video_to_audio',
    category: 'video',
    operationType: 'convert',
  },
];

const getDocumentRecommendations = (): Recommendation[] => [
  {
    id: 'convert-pdf',
    title: 'Convert to PDF',
    description: 'Create standard PDF from document',
    icon: FileArchive,
    actionName: 'docx_to_pdf',
    category: 'office',
    operationType: 'convert',
  },
  {
    id: 'compress',
    title: 'Compress Document',
    description: 'Reduce file size while preserving quality',
    icon: Zap,
    actionName: 'compress',
    category: 'office',
    operationType: 'compress',
  },
];

export const SmartRecommendations: React.FC = () => {
  const { files, selectedOperation, operationOptions, setOperation, updateOptions, addRawFiles, addFiles } = useFileStore();

  if (files.length === 0) return null;

  const getFileType = (): 'pdf' | 'image' | 'video' | 'document' | null => {
    const type = files[0]?.type || '';
    if (type === 'application/pdf') return 'pdf';
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    return 'document';
  };

  const recommendations = {
    pdf: getPdfRecommendations(),
    image: getImageRecommendations(),
    video: getVideoRecommendations(),
    document: getDocumentRecommendations(),
  }[getFileType() || 'document'];

  const handleSelectRecommendation = (rec: Recommendation) => {
    setOperation(rec.operationType);
    updateOptions({ operation: rec.actionName });
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Recommended Next Steps</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {recommendations.map((rec) => (
          <button
            key={rec.id}
            onClick={() => handleSelectRecommendation(rec)}
            className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-muted/40 transition-all text-left group"
          >
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <rec.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground">{rec.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{rec.description}</p>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default SmartRecommendations;