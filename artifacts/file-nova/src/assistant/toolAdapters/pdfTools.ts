import { ToolContext, ToolGuidance } from './types';

export const TOOL_ADAPTERS: Record<string, ToolContext> = {
  merge: {
    id: 'merge',
    name: 'Merge PDFs',
    description: 'Combine multiple PDF files into one document',
    category: 'pdf',
    quickTips: [
      'Files are merged in the order shown. Drag to reorder.',
      'Use the number indicator to set merge sequence.',
      'First file becomes the opening pages.',
    ],
    settingsGuide: {
      output_format: 'Choose between single PDF or merged DOCX format.',
    },
    suggestedFollowUps: ['compress', 'protect', 'pdf_to_docx'],
  },
  compress: {
    id: 'compress',
    name: 'Compress PDF',
    description: 'Reduce file size while preserving quality',
    category: 'pdf',
    quickTips: [
      'Target 10-30% of original size for web/email sharing.',
      'For 10MB PDF, aim for 1-3MB output.',
      'Text-heavy PDFs compress better than image-heavy ones.',
    ],
    settingsGuide: {
      quality: 'Lower values = smaller files but reduced image quality.',
    },
    suggestedFollowUps: ['protect', 'split', 'pdf_to_docx'],
  },
  split: {
    id: 'split',
    name: 'Split PDF',
    description: 'Extract pages into separate PDF files',
    category: 'pdf',
    quickTips: [
      'Extract single pages or page ranges.',
      'Each page becomes a separate downloadable file.',
    ],
    settingsGuide: {
      split_range: 'Enter page range like "1-5" or "1,3,5-7".',
    },
    suggestedFollowUps: ['compress', 'merge'],
  },
  remove_bg: {
    id: 'remove_bg',
    name: 'Remove Background',
    description: 'AI-powered background removal for images',
    category: 'image',
    quickTips: [
      'Best results with clear subject boundaries.',
      'Result is transparent PNG format.',
      'Works locally with AI models.',
    ],
    settingsGuide: {},
    suggestedFollowUps: ['resize', 'convert_format', 'to_ico'],
  },
  resize: {
    id: 'resize',
    name: 'Resize Image',
    description: 'Set exact dimensions or scale percentage',
    category: 'image',
    quickTips: [
      'For web: 800x600 or 1024x768.',
      'For print: 300 DPI at required dimensions.',
      'Lock aspect ratio to maintain proportions.',
    ],
    settingsGuide: {
      resize_width: 'Target width in pixels.',
      resize_height: 'Target height in pixels.',
      resize_lock_aspect: 'Maintain original aspect ratio.',
    },
    suggestedFollowUps: ['compress', 'convert_format'],
  },
  ocr: {
    id: 'ocr',
    name: 'OCR PDF',
    description: 'Extract text from scanned documents',
    category: 'pdf',
    quickTips: [
      'Select language for best accuracy.',
      'Higher DPI scans = better OCR results.',
      'PDFs with text layers are skipped.',
    ],
    settingsGuide: {
      language: 'Choose document language. Auto-detect available.',
    },
    suggestedFollowUps: ['pdf_to_docx', 'pdf_to_images'],
  },
  convert_format: {
    id: 'convert_format',
    name: 'Convert Format',
    description: 'Convert between PNG, JPEG, WEBP, etc.',
    category: 'image',
    quickTips: [
      'PNG: Best for transparency.',
      'JPEG: Best for photos.',
      'WEBP: Modern format, smaller size.',
    ],
    settingsGuide: {
      target_format: 'Select output format.',
    },
    suggestedFollowUps: ['compress', 'to_ico', 'svg_to_png'],
  },
};

export function getToolAdapter(toolId: string): ToolContext | undefined {
  return TOOL_ADAPTERS[toolId];
}

export function getToolSettingsGuide(toolId: string): ToolGuidance[] {
  const adapter = TOOL_ADAPTERS[toolId];
  if (!adapter) return [];
  return Object.entries(adapter.settingsGuide).map(([key, description]) => ({
    key,
    description,
  }));
}

export function getSuggestedWorkflow(toolId: string): string[] {
  const adapter = TOOL_ADAPTERS[toolId];
  return adapter?.suggestedFollowUps || [];
}