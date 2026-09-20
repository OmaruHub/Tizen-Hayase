const isAndroid = typeof navigator !== 'undefined' && navigator.userAgent.includes('Android')
const isIOS = typeof navigator !== 'undefined' && /applewebkit\/[\d.]+ \(khtml, like gecko\)(?!.*chrome\/)(?!.*safari\/)/i.test(navigator.userAgent)
const isIPad = typeof navigator !== 'undefined' && (
  navigator.userAgent.includes('iPad') ||
  (navigator.userAgent.includes('Macintosh') && !navigator.userAgent.includes('Chrome') && navigator.maxTouchPoints > 0)
)
const isTizen = typeof navigator !== 'undefined' && /Tizen/i.test(navigator.userAgent)
const isTizenTV = isTizen && (/Smart-?TV/i.test(navigator.userAgent) || /TV/i.test(navigator.userAgent))
const isAndroidTV = typeof navigator !== 'undefined' && navigator.userAgent.includes('AndroidTV')

export default {
  isAndroid,
  isAndroidTV,
  isIOS,
  isIPad,
  isTizen,
  isTizenTV,
  isTV: isAndroidTV || isTizen || isTizenTV,
  isMobile: isAndroid || isIOS || isIPad,
  // @ts-expect-error yeah
  // 32 bit, <4GB of RAM, or any Android TV/Tizen TV
  isUnderPowered: typeof navigator !== 'undefined' && (navigator.platform === 'Linux armv8l' || navigator.deviceMemory < 4 || isAndroidTV || isTizen || isTizenTV)
}
