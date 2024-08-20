import * as amplitude from '@amplitude/analytics-browser';

// Define a type for the event properties
interface EventProperties {
  [key: string]: any;
}

interface QueuedEvent {
  eventType: string;
  eventProperties: EventProperties;
}

let isInitialized = false;
const eventQueue: QueuedEvent[] = [];

export const initAmplitude = (userId: string): void => {
  if (typeof window !== 'undefined') {
    amplitude.init(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY as string, {
      defaultTracking: true,
      userId: userId,
    });
    isInitialized = true;
    
    // Send queued events
    eventQueue.forEach(event => {
      amplitude.track(event.eventType, event.eventProperties);
    });
    eventQueue.length = 0; // Clear the queue
  }
};

const trackEventInternal = (eventType: string, eventProperties: EventProperties): void => {
  if (typeof window !== 'undefined') {
    if (isInitialized) {
      amplitude.track(eventType, eventProperties);
    } else {
      eventQueue.push({ eventType, eventProperties });
    }
  }
};

export const trackEvent = (eventType: string, eventProperties: EventProperties): void => {
  trackEventInternal(eventType, eventProperties);
}