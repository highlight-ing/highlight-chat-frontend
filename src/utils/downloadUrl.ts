import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import * as amplitudeRoot from '@amplitude/analytics-browser'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// export function buildDownloadURL(platform: 'intel-mac' | 'arm-mac' | 'windows' | null, appSlug?: string) {
//   const deviceId = amplitudeRoot.getDeviceId()

//   const queryParams = new URLSearchParams()

//   if (deviceId) {
//     queryParams.set('amp_id', deviceId)
//   }

//   if (appSlug) {
//     queryParams.set('app_slug', appSlug)
//   }

//   switch (platform) {
//     case 'windows':
//       queryParams.set('architecture', 'x64')
//       queryParams.set('platform', 'windows')
//       break
//     case 'intel-mac':
//       queryParams.set('architecture', 'x64')
//       queryParams.set('platform', 'darwin')
//       break
//     case 'arm-mac':
//       queryParams.set('architecture', 'arm64')
//       queryParams.set('platform', 'darwin')
//       break
//     default:
//       throw new Error('Invalid platform')
//   }

//   return `/api/download?${queryParams.toString()}`
// }

export function buildDownloadURL(platform: 'windows' | 'mac-intel' | 'mac-silicon'): string {
  const baseUrl = 'https://download.highlight.ing'
  switch (platform) {
    case 'windows':
      return `${baseUrl}/windows`
    case 'mac-intel':
      return `${baseUrl}/mac`
    case 'mac-silicon':
      return `${baseUrl}/arm64`
    default:
      return baseUrl
  }
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
