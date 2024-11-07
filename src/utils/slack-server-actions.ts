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

export async function sendMessage(slackToken: string, channelId: string, message: string) {
  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${slackToken}`,
    },
    body: JSON.stringify({
      channel: channelId,
      text: message,
    }),
  })

  if (!response.ok) {
    console.warn('Failed to send Slack message', response.status, await response.text())
    throw new Error('Failed to send Slack message')
  }

  const data = await response.json()

  if (!data.ok) {
    console.warn('Failed to send Slack message', data)
    throw new Error('Failed to send Slack message')
  }
}
