'use client'

import { backendUrl } from '@/utils/chatBackendUrl'
import { useQuery } from '@tanstack/react-query'

import { useApi } from '@/hooks/useApi'

type FileMetadata = {
  type: string
}

export function useFileMetadata(fileId: string) {
  const { get } = useApi()

  return useQuery({
    queryKey: ['file-metadata', fileId],
    queryFn: async () => {
      // const response = await fetch(`${backendUrl}/api/v4/file/metadata/${fileId}`, {
      //   method: 'GET',
      // })

      const response = await get(`file/metadata/${fileId}`, {
        version: 'v4',
      })

      const metadata = (await response.json()) as FileMetadata

      console.log(metadata)

      return metadata
    },
  })
}
