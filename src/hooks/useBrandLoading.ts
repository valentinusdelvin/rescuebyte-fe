import { useState, useCallback } from 'react';

export interface UseBrandLoadingReturn {
  isLoading: boolean;
  loadingTitle: string;
  loadingSubtitle: string;
  triggerLoading: (title?: string, subtitle?: string, durationMs?: number) => Promise<void>;
  startLoading: (title?: string, subtitle?: string) => void;
  stopLoading: () => void;
}

/**
 * Custom hook for controlling the brand loading overlay.
 * Follows .agents/docs/architecture.md and .agents/docs/typescript.md.
 */
export function useBrandLoading(): UseBrandLoadingReturn {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingTitle, setLoadingTitle] = useState<string>('Menyimpan Perubahan...');
  const [loadingSubtitle, setLoadingSubtitle] = useState<string>('Sinkronisasi data ke sistem RescueByte');

  const startLoading = useCallback((title?: string, subtitle?: string) => {
    if (title) setLoadingTitle(title);
    if (subtitle) setLoadingSubtitle(subtitle);
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const triggerLoading = useCallback(
    (
      title: string = 'Menyimpan Perubahan...',
      subtitle: string = 'Sinkronisasi data ke sistem RescueByte',
      durationMs: number = 1000
    ): Promise<void> => {
      setLoadingTitle(title);
      setLoadingSubtitle(subtitle);
      setIsLoading(true);

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setIsLoading(false);
          resolve();
        }, durationMs);
      });
    },
    []
  );

  return {
    isLoading,
    loadingTitle,
    loadingSubtitle,
    triggerLoading,
    startLoading,
    stopLoading,
  };
}
