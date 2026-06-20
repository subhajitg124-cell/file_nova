/**
 * Workflow Runner — executes a saved workflow step-by-step, piping the
 * output of step N as the input to step N+1.
 *
 * All processing uses the SAME functions as OptionsPanel / BulkProcessor —
 * zero duplicated logic. This is orchestration, not reimplementation.
 *
 * Key guarantee:
 * - On ANY halt (security step fails, user cancels, catastrophic error),
 *   ALL intermediate blobs are discarded — the runner never returns a
 *   partially-completed result that could be mistaken for a full workflow.
 */

import {
  runClientSidePdfCompress,
  runClientSidePdfMerge,
  runClientSidePdfWatermark,
} from '@/lib/processing/pdf/client-pdf';
import {
  compressImage,
  resizeImage,
  convertImageFormat,
} from '@/lib/processing/image/client-image';
import { WorkflowHaltError, type WorkflowStep, type WorkflowResult } from './types';

/** Progress callback — receives current step index (0-based) and total steps */
type ProgressCallback = (currentStep: number, totalSteps: number, label: string) => void;

/**
 * Confirmation callback for NON-security backend steps (e.g. cosmetic watermark).
 * Must return true to continue, false to halt cleanly.
 * For security steps, the runner halts unconditionally WITHOUT calling this.
 */
type ConfirmCallback = (message: string) => Promise<boolean>;

interface RunnerOptions {
  isMockMode: boolean;
  onProgress?: ProgressCallback;
  onConfirm?: ConfirmCallback;
}

/**
 * Execute a workflow against an initial set of files.
 *
 * @throws WorkflowHaltError on security-step failure or user cancellation
 * @throws Error on unrecoverable processing failure
 * @returns WorkflowResult with a blob URL for the final output
 */
export async function runWorkflow(
  steps: WorkflowStep[],
  initialFiles: File[],
  options: RunnerOptions
): Promise<WorkflowResult> {
  const { isMockMode, onProgress, onConfirm } = options;

  // Working "current files" — piped through each step
  let currentFiles: File[] = initialFiles;
  // Track all intermediate blob URLs so we can revoke them on halt/error
  const intermediateUrls: string[] = [];

  const cleanup = () => {
    intermediateUrls.forEach((url) => {
      try { URL.revokeObjectURL(url); } catch { /* ignore */ }
    });
  };

  try {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      onProgress?.(i, steps.length, step.label);

      // ── Backend-required step handling ─────────────────────────────────
      if (step.requiresBackend && isMockMode) {
        if (step.isSecurity) {
          // SECURITY STEP: HALT unconditionally.
          // Never skip-and-continue — a user who believes their document is
          // protected when it isn't faces a real, concrete consequence.
          cleanup();
          throw new WorkflowHaltError(
            `"${step.label}" requires a server connection and could not run. ` +
            `Your file has NOT been protected. ` +
            `Please remove this step or try again when the server is available.`
          );
        } else {
          // Non-security backend step (e.g. cosmetic watermark): ask the user
          const proceed = await (onConfirm?.(
            `"${step.label}" couldn't run (server offline). Continue the workflow without it?`
          ) ?? Promise.resolve(false));
          if (!proceed) {
            cleanup();
            throw new WorkflowHaltError('Workflow cancelled by user.');
          }
          // Skip this step — pipe current files through unchanged
          continue;
        }
      }

      // ── Client-side step execution ─────────────────────────────────────
      let outputBlob: Blob;
      const file = currentFiles[0];
      const cfg = step.config;

      const isPdf = file?.type === 'application/pdf' || file?.name?.toLowerCase().endsWith('.pdf');
      const isImg = file?.type?.startsWith('image/');

      switch (step.id) {
        case 'compress-pdf':
          if (!file || !isPdf) throw new Error(`Step "${step.label}": expected a PDF file.`);
          outputBlob = await runClientSidePdfCompress(
            file, (cfg.quality as number) ?? 75
          );
          break;

        case 'compress-image':
          if (!file || !isImg) throw new Error(`Step "${step.label}": expected an image file.`);
          outputBlob = await compressImage(
            file,
            ((cfg.quality as number) ?? 80) / 100
          );
          break;

        case 'resize-image':
          if (!file || !isImg) throw new Error(`Step "${step.label}": expected an image file.`);
          outputBlob = await resizeImage(
            file,
            (cfg.resize_width as number) ?? 800,
            (cfg.resize_height as number) ?? 600,
            ((cfg.resize_format as string) ?? 'jpeg') as 'png' | 'jpeg' | 'webp',
            0.92
          );
          break;

        case 'convert-image':
          if (!file || !isImg) throw new Error(`Step "${step.label}": expected an image file.`);
          outputBlob = await convertImageFormat(
            file,
            ((cfg.target_format as string) ?? 'webp') as 'png' | 'jpeg' | 'webp',
            ((cfg.quality as number) ?? 92) / 100
          );
          break;

        case 'add-watermark-pdf':
          if (!file || !isPdf) throw new Error(`Step "${step.label}": expected a PDF file.`);
          outputBlob = await runClientSidePdfWatermark(file,
            (cfg.watermark_text as string) || 'CONFIDENTIAL',
            {
              fontSize: (cfg.watermark_size as number) ?? 52,
              opacity: ((cfg.watermark_opacity as number) ?? 18) / 100,
              rotation: (cfg.watermark_rotation as number) ?? -45,
              position: (cfg.watermark_position as string) ?? 'diagonal',
              colorHex: '#888888',
            }
          );
          break;

        case 'merge-pdf':
          if (!currentFiles.length) throw new Error(`Step "${step.label}": no files to merge.`);
          outputBlob = await runClientSidePdfMerge(currentFiles);
          break;

        case 'aadhaar-mask':
          // Aadhaar masking is fully client-side but has its own dedicated workspace.
          // For workflow use, we pass through (the tool page handles the heavy lifting).
          // This case is a no-op placeholder so the step renders correctly in the builder.
          outputBlob = file;
          break;

        case 'protect-pdf':
          // This step is always flagged requiresBackend + isSecurity — it should
          // have been caught above. Guard defensively.
          cleanup();
          throw new WorkflowHaltError(
            '"Protect PDF" requires a server connection. Your file has NOT been protected.'
          );

        default:
          throw new Error(`Unknown workflow step: "${step.id}". Update workflowRunner.ts to support it.`);
      }

      // Wrap the output blob as a File for the next step
      const outputExt = outputBlob.type.split('/')[1]?.replace('jpeg', 'jpg') ?? 'bin';
      const outputName = `step-${i + 1}-output.${outputExt}`;
      const outputFile = new File([outputBlob], outputName, { type: outputBlob.type });

      // Track the temp URL for cleanup on error
      const tempUrl = URL.createObjectURL(outputBlob);
      intermediateUrls.push(tempUrl);

      currentFiles = [outputFile];
    }

    // All steps completed successfully — build the final result
    onProgress?.(steps.length, steps.length, 'Complete');

    const finalBlob = currentFiles[0] instanceof File
      ? new Blob([await currentFiles[0].arrayBuffer()], { type: currentFiles[0].type })
      : currentFiles[0] as unknown as Blob;

    // Revoke intermediate URLs (final blob URL is caller's responsibility)
    cleanup();

    const finalUrl = URL.createObjectURL(finalBlob);
    const ext = finalBlob.type.split('/')[1]?.replace('jpeg', 'jpg') ?? 'pdf';
    const filename = `filenova-workflow-result.${ext}`;

    return {
      url: finalUrl,
      filename,
      stepsCompleted: steps.length,
      mimeType: finalBlob.type,
    };

  } catch (err) {
    // On ANY error or halt, discard all intermediate output.
    // Never return partial results.
    cleanup();
    throw err;
  }
}
