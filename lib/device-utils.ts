export interface DeviceInfo {
  deviceType: string
  browser: string
  os: string
  isMobile: boolean
}

export function parseUserAgent(userAgent: string): DeviceInfo {
  const ua = userAgent.toLowerCase()
  
  // Detect device type
  let deviceType = 'Desktop'
  let isMobile = false
  
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone') || ua.includes('ipad')) {
    deviceType = 'Mobile Device'
    isMobile = true
  } else if (ua.includes('tablet')) {
    deviceType = 'Tablet'
    isMobile = true
  }

  // Detect browser
  let browser = 'Unknown Browser'
  if (ua.includes('chrome') && !ua.includes('edg')) {
    browser = 'Chrome'
  } else if (ua.includes('firefox')) {
    browser = 'Firefox'
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari'
  } else if (ua.includes('edge')) {
    browser = 'Edge'
  } else if (ua.includes('opera')) {
    browser = 'Opera'
  } else if (ua.includes('brave')) {
    browser = 'Brave'
  }

  // Detect operating system
  let os = 'Unknown OS'
  if (ua.includes('windows')) {
    os = 'Windows'
  } else if (ua.includes('mac')) {
    os = 'macOS'
  } else if (ua.includes('linux')) {
    os = 'Linux'
  } else if (ua.includes('android')) {
    os = 'Android'
  } else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
    os = 'iOS'
  }

  return {
    deviceType,
    browser,
    os,
    isMobile
  }
}

export function isNewDevice(currentUserAgent: string, previousUserAgents: string[]): boolean {
  if (previousUserAgents.length === 0) {
    return true // First login, consider it a new device
  }

  const currentInfo = parseUserAgent(currentUserAgent)
  
  // Check if any previous user agent has the same device fingerprint
  for (const previousUserAgent of previousUserAgents) {
    const previousInfo = parseUserAgent(previousUserAgent)
    
    // Consider it the same device if browser and OS match (for desktop)
    // or if it's mobile and the OS matches
    if (currentInfo.isMobile && previousInfo.isMobile) {
      if (currentInfo.os === previousInfo.os) {
        return false
      }
    } else if (!currentInfo.isMobile && !previousInfo.isMobile) {
      if (currentInfo.browser === previousInfo.browser && currentInfo.os === previousInfo.os) {
        return false
      }
    }
  }
  
  return true
}
