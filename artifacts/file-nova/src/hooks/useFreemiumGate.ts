import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';

const PREMIUM_TOOLS = [
  'aadhaar-mask',
  'ocr',
  'ai-pdf-summary',
  'government-form-fill',
  'compress-pdf-for-upload',
];

const DAILY_LIMIT = 3;
const MAX_FILE_SIZE_FREE_MB = 10;

export function useFreemiumGate(toolSlug?: string) {
  const user = useAuthStore((s) => s.user);

  const checkGate = useCallback(
    (fileSizeMB: number = 0): { allowed: boolean; reason?: string; showUpgrade?: boolean } => {
      const isPremium = typeof toolSlug === 'string' && PREMIUM_TOOLS.includes(toolSlug);

      if (!user) {
        return {
          allowed: false,
          reason: 'Please sign in to use this tool.',
          showUpgrade: false,
        };
      }

      if (isPremium && user.premiumTier === 'free') {
        return {
          allowed: false,
          reason: 'Upgrade to Pro for unlimited access.',
          showUpgrade: true,
        };
      }

      if (!isPremium && fileSizeMB > MAX_FILE_SIZE_FREE_MB) {
        return {
          allowed: false,
          reason: `Free tier limit: ${MAX_FILE_SIZE_FREE_MB}MB per file. Upgrade to Pro for larger files.`,
          showUpgrade: true,
        };
      }

      return { allowed: true };
    },
    [toolSlug, user]
  );

  const enforce = useCallback(
    (fileSizeMB: number = 0) => {
      const gate = checkGate(fileSizeMB);
      if (!gate.allowed) {
        toast.error(gate.reason || 'Access restricted.');
      }
      return gate;
    },
    [checkGate]
  );

  return { checkGate, enforce, isPremium: user ? user.premiumTier !== 'free' : false };
}
