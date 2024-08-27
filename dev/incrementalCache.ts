// dev/incrementalCache.ts
import type { IncrementalCache } from 'open-next/cache/incremental/types'

import fs from 'node:fs/promises'
import path from 'node:path'

const buildId = process.env.NEXT_BUILD_ID
const basePath = path.resolve(process.cwd(), `../../cache/${buildId}`)

const getCacheKey = (key: string) => {
  return path.join(basePath, `${key}.cache`)
}

const cache: IncrementalCache = {
  name: 'dev-fs',
  get: async (key: string) => {
    const fileData = await fs.readFile(getCacheKey(key), 'utf-8')
    const data = JSON.parse(fileData)
    const { mtime } = await fs.stat(getCacheKey(key))
    return {
      value: data,
      lastModified: mtime.getTime(),
    }
  },
  set: async (key, value, isFetch) => {
    const data = JSON.stringify(value)
    await fs.writeFile(getCacheKey(key), data)
  },
  delete: async (key) => {
    await fs.rm(getCacheKey(key))
  },
}

export default cache
