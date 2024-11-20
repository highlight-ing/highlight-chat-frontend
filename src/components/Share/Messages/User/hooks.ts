'use client'

import { UserMessage } from '@/types'
import { backendUrl } from '@/utils/chatBackendUrl'
import { useQuery } from '@tanstack/react-query'

type FileMetadata = {
  type: string
}

export function useFileMetadata(fileId: UserMessage['file_ids'][0]) {
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
