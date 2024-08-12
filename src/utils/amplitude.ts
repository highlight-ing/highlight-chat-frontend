import * as amplitude from '@amplitude/analytics-browser';


 // Define a type for the event properties
 interface EventProperties {
   [key: string]: any;
 }

 // Debug mode constant
 export const IS_DEBUG = process.env.NEXT_PUBLIC_AMPLITUDE_DEBUG_MODE === 'true';

 export const initAmplitude = (): void => {
   if (typeof window !== 'undefined') {
     amplitude.init(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY as string, {
       defaultTracking: true,
     });
   }
 };

 const trackEventInternal = (eventType: string, eventProperties: EventProperties): void => {
   if (typeof window !== 'undefined') {
     amplitude.track(eventType, eventProperties);
   }
 };

 export const trackEvent = (eventType: string, eventProperties: EventProperties): void => {
   trackEventInternal(eventType, eventProperties);
 }