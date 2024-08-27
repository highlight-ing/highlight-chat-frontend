// open-next.local.config.ts -
// A good practice would be to use a different name so that it doesn't conflict
// with your existing open-next.config.ts i.e. open-next.local.config.ts
import type { OpenNextConfig } from 'open-next/types/open-next.js'

const config = {
  default: {
    override: {
      // We use a custom wrapper so that we can use static assets and image optimization locally
      wrapper: () => import('./dev/wrapper').then((m) => m.default),
      // ISR and SSG won't work properly locally without this - Remove if you only need SSR
      incrementalCache: () => import('./dev/incrementalCache').then((m) => m.default),
      // ISR requires a queue to work properly - Remove if you only need SSR or SSG
      queue: () => import('./dev/queue').then((m) => m.default),
      converter: 'node',
    },
  },
  // You don't need this part if you don't use image optimization or don't need it in your test
  imageOptimization: {
    // Image optimization only work on linux, and you have to use the correct architecture for your system
    arch: 'x64',
    override: {
      wrapper: 'node',
      converter: 'node',
    },
    // If you need to test with local assets, you'll have to override the imageLoader as well
  },

  dangerous: {
    // We disable the cache tags as it will usually not be needed locally for testing
    // It's only used for next/cache revalidateTag and revalidatePath
    // If you need it you'll have to override the tagCache as well
    disableTagCache: true,

    // You can uncomment this line if you only need to test SSR
    //disableIncrementalCache: true,
  },
  // You can override the build command so that you don't have to rebuild the app every time
  // You need to have run the default build command at least once
  buildCommand: 'echo "no build command"',
  edgeExternals: ['./dev/wrapper', './dev/incrementalCache', './dev/queue'],
} satisfies OpenNextConfig

export default config
