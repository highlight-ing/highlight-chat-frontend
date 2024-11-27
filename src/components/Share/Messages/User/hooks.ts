'use client'

import { backendUrl } from '@/utils/chatBackendUrl'
import { useQuery } from '@tanstack/react-query'

type FileMetadata = {
  file_type: string
}

export function useFileMetadata(fileId: string) {
  return useQuery({
    queryKey: ['file-metadata', fileId],
    queryFn: async () => {
      const response = await fetch(`${backendUrl}/api/v4/file/metadata/${fileId}`, {
        method: 'GET',
      })

      const metadata = (await response.json()) as FileMetadata

      return metadata
    },
  })
}
