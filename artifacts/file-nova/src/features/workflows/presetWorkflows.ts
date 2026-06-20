import type { Workflow } from './types';

/**
 * FileNova-curated starter workflows for the Indian student / CSC audience.
 * These are shown to everyone without any setup.
 */
export const PRESET_WORKFLOWS: Workflow[] = [
  {
    id: 'preset-scholarship-ready',
    name: 'Scholarship application ready',
    description: 'Resize your photo to the exact spec, compress your marksheets, and bundle everything into one submission-ready ZIP.',
    icon: '🎓',
    isPreset: true,
    createdAt: 0,
    steps: [
      {
        id: 'resize-image',
        label: 'Resize photo',
        config: { resize_width: 200, resize_height: 230, resize_format: 'jpeg' },
      },
      {
        id: 'compress-pdf',
        label: 'Compress PDF documents',
        config: { quality: 72, compress_preset: 'standard' },
      },
    ],
  },
  {
    id: 'preset-exam-form-ready',
    name: 'Exam form ready (NEET / JEE / Board)',
    description: 'Resize your photo and signature to exact portal specs, then combine them into a single PDF.',
    icon: '📝',
    isPreset: true,
    createdAt: 0,
    steps: [
      {
        id: 'resize-image',
        label: 'Resize photo to 200×230',
        config: { resize_width: 200, resize_height: 230, resize_format: 'jpeg' },
      },
      {
        id: 'compress-image',
        label: 'Compress to ≤ 50 KB',
        config: { quality: 65, compress_preset: 'web' },
      },
    ],
  },
  {
    id: 'preset-govt-upload-ready',
    name: 'Government portal upload ready',
    description: 'Mask your Aadhaar number, then compress the PDF so it passes the portal\'s file size limit.',
    icon: '🏛️',
    isPreset: true,
    createdAt: 0,
    steps: [
      {
        id: 'aadhaar-mask',
        label: 'Mask Aadhaar number',
        config: {},
      },
      {
        id: 'compress-pdf',
        label: 'Compress for portal upload',
        config: { quality: 68, compress_preset: 'web' },
      },
    ],
  },
  {
    id: 'preset-share-securely',
    name: 'Share securely',
    description: 'Add a visible watermark to prevent misuse, then password-protect so only the recipient can open it.',
    icon: '🔒',
    isPreset: true,
    createdAt: 0,
    steps: [
      {
        id: 'add-watermark-pdf',
        label: 'Add watermark',
        config: {
          watermark_text: 'CONFIDENTIAL',
          watermark_size: 48,
          watermark_opacity: 18,
          watermark_position: 'diagonal',
          watermark_rotation: -45,
        },
      },
      {
        id: 'protect-pdf',
        label: 'Password protect',
        config: { protect_level: 'standard' },
        requiresBackend: true,
        isSecurity: true,
      },
    ],
  },
];
