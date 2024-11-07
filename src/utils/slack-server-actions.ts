export async function listChannels(slackToken: string) {
  const response = await fetch('https://slack.com/api/conversations.list', {
    headers: {
      Authorization: `Bearer ${slackToken}`,
    },
  })

  if (!response.ok) {
    console.warn('Failed to list Slack channels', response.status, await response.text())
    throw new Error('Failed to list Slack channels')
  }

  const data = await response.json()

  // TODO: Handle pagination

  return data.channels
}
