import * as amplitude from '@amplitude/analytics-browser'

// Define a type for the event properties
interface EventProperties {
  [key: string]: any
}

interface QueuedEvent {
  eventType: string
  eventProperties?: EventProperties
}

let isInitialized = false
const eventQueue: QueuedEvent[] = []

export const initAmplitude = (userId: string): void => {
  if (typeof window !== 'undefined') {
    amplitude.init(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY as string, {
      defaultTracking: true,
      userId: userId,
    })
    isInitialized = true

    // Send queued events
    eventQueue.forEach((event) => {
      amplitude.track(event.eventType, event.eventProperties)
    })
    eventQueue.length = 0 // Clear the queue
  }
}

export const initAmplitudeAnonymous = () => {
  if (typeof window !== 'undefined') {
    console.log('Initializing Amplitude...')
    try {
      amplitude.init(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY as string, {
        defaultTracking: true,
      })
      isInitialized = true
      console.log('Amplitude initialized successfully')

      // Send queued events
      console.log(`Sending ${eventQueue.length} queued events`)
      eventQueue.forEach((event) => {
        amplitude.track(event.eventType, event.eventProperties)
        console.log(`Sent queued event: ${event.eventType}`, event.eventProperties)
      })
      eventQueue.length = 0 // Clear the queue
    } catch (error) {
      console.error('Error initializing Amplitude:', error)
    }
  } else {
    console.log('Window not available, skipping Amplitude initialization')
  }
}

const trackEventInternal = (eventType: string, eventProperties?: EventProperties): void => {
  if (typeof window !== 'undefined') {
    if (isInitialized) {
      amplitude.track(eventType, eventProperties)
    } else {
      eventQueue.push({ eventType, eventProperties })
    }
  }
}

export const trackEvent = (eventType: string, eventProperties?: EventProperties): void => {
  trackEventInternal(eventType, eventProperties)
}
