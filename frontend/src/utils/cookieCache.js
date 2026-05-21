/**
 * Cookie-based Caching Utility
 * Store filtered report snapshots in cookies with TTL
 */

const CACHE_PREFIX = 'crm_report_';
const DEFAULT_TTL_DAYS = 7;

/**
 * Simple hash function for filter objects
 */
const hashFilters = (filters) => {
  const str = JSON.stringify(filters || {});
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
};

/**
 * Generate cache key from report ID and filters
 */
const getCacheKey = (reportId, filters = {}) => {
  const filterHash = hashFilters(filters);
  return `${CACHE_PREFIX}${reportId}_${filterHash}`;
};

/**
 * Set a cookie with expiration
 */
const setCookie = (name, value, days = DEFAULT_TTL_DAYS) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  // Compress large data by storing only essential fields
  const compressed = JSON.stringify(value);
  
  // Check if cookie size is reasonable (<4KB per cookie limit)
  if (compressed.length > 4000) {
    console.warn(`Cookie ${name} is too large (${compressed.length} bytes). Consider using localStorage.`);
    return false;
  }
  
  document.cookie = `${name}=${encodeURIComponent(compressed)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  return true;
};

/**
 * Get a cookie value
 */
const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      try {
        return JSON.parse(decodeURIComponent(c.substring(nameEQ.length, c.length)));
      } catch (e) {
        console.error('Error parsing cookie:', e);
        return null;
      }
    }
  }
  return null;
};

/**
 * Delete a cookie
 */
const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

/**
 * Check if cached data is still valid (not expired)
 */
const isCacheValid = (cachedData, ttlDays = DEFAULT_TTL_DAYS) => {
  if (!cachedData || !cachedData.timestamp) return false;
  
  const now = new Date().getTime();
  const cacheTime = new Date(cachedData.timestamp).getTime();
  const maxAge = ttlDays * 24 * 60 * 60 * 1000;
  
  return (now - cacheTime) < maxAge;
};

/**
 * Store report data in cache
 */
export const cacheReport = (reportId, filters, data) => {
  const key = getCacheKey(reportId, filters);
  const cacheData = {
    data,
    timestamp: new Date().toISOString(),
    filterSnapshot: filters,
  };
  
  return setCookie(key, cacheData);
};

/**
 * Retrieve report data from cache
 */
export const getCachedReport = (reportId, filters) => {
  const key = getCacheKey(reportId, filters);
  const cachedData = getCookie(key);
  
  if (!cachedData) return null;
  
  // Check if cache is still valid
  if (!isCacheValid(cachedData)) {
    deleteCookie(key);
    return null;
  }
  
  return cachedData;
};

/**
 * Invalidate (delete) cached report
 */
export const invalidateReport = (reportId, filters) => {
  const key = getCacheKey(reportId, filters);
  deleteCookie(key);
};

/**
 * Clear all report caches
 */
export const clearAllReportCaches = () => {
  const cookies = document.cookie.split(';');
  
  cookies.forEach(cookie => {
    const name = cookie.split('=')[0].trim();
    if (name.startsWith(CACHE_PREFIX)) {
      deleteCookie(name);
    }
  });
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  const cookies = document.cookie.split(';');
  let totalCaches = 0;
  let totalSize = 0;
  
  cookies.forEach(cookie => {
    const name = cookie.split('=')[0].trim();
    if (name.startsWith(CACHE_PREFIX)) {
      totalCaches++;
      totalSize += cookie.length;
    }
  });
  
  return {
    count: totalCaches,
    sizeBytes: totalSize,
    sizeKB: (totalSize / 1024).toFixed(2),
  };
};

/**
 * Check if a specific report is cached
 */
export const isReportCached = (reportId, filters) => {
  const cached = getCachedReport(reportId, filters);
  return cached !== null;
};

/**
 * Get cache age in hours
 */
export const getCacheAge = (reportId, filters) => {
  const cached = getCachedReport(reportId, filters);
  if (!cached) return null;
  
  const now = new Date().getTime();
  const cacheTime = new Date(cached.timestamp).getTime();
  const ageMs = now - cacheTime;
  
  return {
    hours: (ageMs / (1000 * 60 * 60)).toFixed(1),
    minutes: (ageMs / (1000 * 60)).toFixed(0),
    timestamp: cached.timestamp,
  };
};
