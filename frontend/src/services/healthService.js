/**
 * Health Service
 * Wakes up the backend server and database on login page load
 * 
 * Strategy:
 * - Single wake-up call on login page mount
 * - Debounced to prevent multiple calls
 * - No background intervals (to avoid server overwhelm)
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Configuration
const CONFIG = {
  WAKE_UP_TIMEOUT: 30000, // 30 seconds timeout for cold start
  DEBOUNCE_MS: 10000,     // Minimum 10 seconds between pings
};

// State
let lastPingTime = 0;
let isWakingUp = false;

/**
 * Wake up the backend server and database
 * Called only on login page load
 * @returns {Promise<{ok: boolean, responseTime?: number, error?: string}>}
 */
export const wakeUp = async () => {
  const now = Date.now();
  
  // Debounce: Skip if pinged recently
  if (now - lastPingTime < CONFIG.DEBOUNCE_MS) {
    return { ok: true, skipped: true };
  }

  // Prevent concurrent wake-up calls
  if (isWakingUp) {
    return { ok: true, inProgress: true };
  }

  isWakingUp = true;
  lastPingTime = now;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CONFIG.WAKE_UP_TIMEOUT);

    const startTime = performance.now();
    
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeout);
    
    const responseTime = Math.round(performance.now() - startTime);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Backend alive (${responseTime}ms)`, data.cached ? '(cached)' : '');
      return { ok: true, responseTime, data };
    } else {
      console.warn(`⚠️ Backend responded with ${response.status}`);
      return { ok: false, status: response.status };
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('⏱️ Backend wake-up timeout (cold start may take longer)');
      return { ok: false, error: 'timeout' };
    }
    console.error('❌ Backend unreachable:', error.message);
    return { ok: false, error: error.message };
  } finally {
    isWakingUp = false;
  }
};

/**
 * Quick ping - just checks server is responding (no DB)
 */
export const ping = async () => {
  try {
    const response = await fetch(`${API_URL}/ping`, { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
};

export default { wakeUp, ping };
