// dev/queue.ts
import type { Queue } from 'open-next/queue/types'

declare global {
  // This is declared in the global scope so that we can use it in the queue
  // We need to use this one as next overrides the global fetch
  var internalFetch: typeof fetch
}

const queue: Queue = {
  name: 'dev-queue',
  send: async (message) => {
    const prerenderManifest = (await import('open-next/adapters/config/index.js')).PrerenderManifest as any
    const revalidateId: string = prerenderManifest.preview.previewModeId
    await globalThis.internalFetch(`http://localhost:3000${message.MessageBody.url}`, {
      method: 'HEAD',
      headers: {
        'x-prerender-revalidate': revalidateId,
        'x-isr': '1',
      },
    })
    console.log('sending message', message)
  },
}

export default queue
