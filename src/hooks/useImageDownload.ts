import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';

export const useImageDownload = (imageId: string) => {
  const { getImage } = useApi();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchImage = async () => {
      if (!imageId) return;

      setIsLoading(true);
      setError(null);

      try {
        const url = await getImage(`image/${imageId}`);
        if (isMounted) {
          setImageUrl(url);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch image'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageId, getImage]);

  return { imageUrl, isLoading, error };
};