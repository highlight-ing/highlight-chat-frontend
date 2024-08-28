import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse, NextRequest } from 'next/server'

const DISABLE_CRON_AUTHENTICATION_CHECK = false

/**
 * This is a cron job that runs every 10 minutes.
 * Right now, its use is to accumulate prompt usages and update the public_prompt_use column.
 */

export async function GET(req: NextRequest) {
  if (!DISABLE_CRON_AUTHENTICATION_CHECK && req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  // We should fetch all prompt usages waiting to be updated
  const supabase = supabaseAdmin()

  let unprocessedPromptUsages: { id: number; promptId: number }[] = []

  do {
    await supabase
      .from('prompt_usages')
      .update({ was_processed: true })
      .in(
        'id',
        unprocessedPromptUsages.map((promptUsage) => promptUsage.id),
      )
      .throwOnError()

    // // Create object with promptId as key and count as value
    const promptUsageCounts = unprocessedPromptUsages.reduce(
      (acc, promptUsage) => {
        acc[promptUsage.promptId] = (acc[promptUsage.promptId] || 0) + 1
        return acc
      },
      {} as Record<number, number>,
    )

    // Select the existing prompt usage counts
    const { data: existingPromptUsageCounts } = await supabase
      .from('prompts')
      .select('id, public_use_number')
      .in(
        'id',
        unprocessedPromptUsages.map((x) => x.promptId),
      )
      .throwOnError()

    let updatePromises: Promise<any>[] = []

    // Loop through and increment the public_use_number
    existingPromptUsageCounts?.forEach((promptUsage) => {
      promptUsage.public_use_number += promptUsageCounts[promptUsage.id]

      // Supabase needs to support bulk updating without inserts.
      updatePromises.push(
        new Promise((resolve, reject) => {
          const promise = supabase
            .from('prompts')
            .update({ public_use_number: promptUsage.public_use_number })
            .eq('id', promptUsage.id)

          resolve(promise)
        }),
      )
    })

    await Promise.all(updatePromises)

    // Store the updated prompt usage counts

    unprocessedPromptUsages = []

    const { data: promptUsages } = await supabase
      .from('prompt_usages')
      .select('*')
      .eq('was_processed', false)
      .throwOnError()

    unprocessedPromptUsages =
      promptUsages?.map((promptUsage) => ({ id: promptUsage.id, promptId: promptUsage.prompt_id })) ?? []
  } while (unprocessedPromptUsages.length > 0)

  //   if (error) {
  //     return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  //   }

  return NextResponse.json({ ok: true })
}
