import type { AssetType } from './types'

export const OS_OPTIONS: Record<AssetType, string[]> = {
  LAPTOP: [
    'Windows 11 Pro',
    'Windows 11 Home',
    'Windows 10 Pro',
    'Windows 10 Home',
    'macOS',
    'Ubuntu Linux',
    'Chrome OS',
  ],
  PHONE: [
    'Android',
    'iOS',
  ],
  TABLET: [
    'Android',
    'iPadOS',
    'Windows 11',
  ],
  MONITOR: [],
  OTHER: [],
}
