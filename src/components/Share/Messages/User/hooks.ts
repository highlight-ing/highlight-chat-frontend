'use client'

import { useQuery } from '@tanstack/react-query'

import { backendUrl } from '@/utils/chatBackendUrl'

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
