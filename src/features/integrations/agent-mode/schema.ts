import { z } from 'zod'

export const enableAgentModeSchema = z
  .object({
    agentInstructions: z.string().min(1),
    agentGoals: z.array(z.string()).min(1),
    url: z.string().min(1),
  })
  .refine(
    (data) => {
      if (data.url) {
        return new URL(data.url)
      }
      return true
    },
    {
      message: 'Invalid URL',
      path: ['url'],
    },
  )
