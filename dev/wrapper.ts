// dev/wrapper.ts
// You'll need to install express
import express from 'express'
// The proxy is used to proxy the image optimization server
// you don't have to use it, but image request will return 500 error
import proxy from 'express-http-proxy'
import { fork } from 'child_process'

import type { StreamCreator } from 'open-next/http/openNextResponse'
import type { WrapperHandler } from 'open-next/types/open-next'

const wrapper: WrapperHandler = async (handler, converter) => {
  const app = express()
  // To serve static assets
  app.use(express.static('../../assets'))

  //Launch image server fork
  fork('../../image-optimization-function/index.mjs', [], {
    env: {
      NODE_ENV: 'development',
      PORT: '3001',
    },
  })
  app.use('/_next/image', proxy('localhost:3001'))

  app.all('*', async (req, res) => {
    const internalEvent = await converter.convertFrom(req)
    const _res: StreamCreator = {
      writeHeaders: (prelude) => {
        res.writeHead(prelude.statusCode, prelude.headers)
        res.uncork()
        return res
      },
      onFinish: () => {
        // Is it necessary to do something here?
      },
    }
    await handler(internalEvent, _res)
  })

  const server = app.listen(parseInt(process.env.PORT ?? '3000', 10), () => {
    console.log(`Server running on port ${process.env.PORT ?? 3000}`)
  })

  app.on('error', (err) => {
    console.error('error', err)
  })

  return () => {
    server.close()
  }
}

export default {
  wrapper,
  name: 'dev-node',
  supportStreaming: true,
}
