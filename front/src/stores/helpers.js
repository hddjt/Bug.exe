export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

export function clampEnergy(v, max = 100) { return clamp(v, 0, max) }
export function clampSan(v, max = 100) { return clamp(v, 0, max) }
export function clampHappiness(v) { return clamp(v, 0, 100) }
export function clampRelation(v) { return clamp(v, 0, 100) }
export function clampStat(v) { return Math.max(0, v) }

const SAVE_VERSION = 1

export function saveWithVersion(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ version: SAVE_VERSION, data }))
    return true
  } catch {
    return false
  }
}

export function loadWithVersion(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && 'version' in parsed && 'data' in parsed) {
      return parsed.data
    }
    if (parsed && typeof parsed === 'object' && !('version' in parsed)) {
      console.warn(`[${key}] 检测到旧版存档格式，尝试兼容读取`)
      return parsed
    }
    return fallback
  } catch {
    console.warn(`[${key}] 存档读取失败，数据可能已损坏`)
    return fallback
  }
}

export function removeStorage(key) {
  try { localStorage.removeItem(key) } catch { /* ignore */ }
}
