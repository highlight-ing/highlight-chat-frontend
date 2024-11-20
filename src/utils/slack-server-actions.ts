'use server'

export async function listConversations(accessToken: string) {
  const response = await fetch('https://backend.highlightai.com/v1/slack/conversations', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    console.warn('Failed to list Slack conversations', response.status, await response.text())
    throw new Error('Failed to list Slack conversations')
  }

  const data = await response.json()

  return data.conversations
}

export async function sendMessage(slackToken: string, channelId: string, message: string) {
  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${slackToken}`,
      'Content-Type': 'application/json',
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
