// lib/cache.js

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Cache configuration
const CACHE_DIR = path.resolve('./cache');
const CACHE_MAX_AGE = 60 * 60 * 1000; // 1 hour in milliseconds

// Create cache directory if it doesn't exist
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Generate a cache key from parameters
 */
function generateCacheKey(params) {
  const stringParams = JSON.stringify(params);
  return crypto.createHash('md5').update(stringParams).digest('hex');
}

/**
 * Get cached PNG if it exists and is not expired
 */
export function getCachedPng(params) {
  const cacheKey = generateCacheKey(params);
  const cachePath = path.join(CACHE_DIR, `${cacheKey}.png`);
  
  try {
    // Check if file exists
    if (fs.existsSync(cachePath)) {
      const stats = fs.statSync(cachePath);
      const now = new Date();
      
      // Check if file is not expired
      if (now - stats.mtime < CACHE_MAX_AGE) {
        // Return cached file
        return fs.readFileSync(cachePath);
      }
    }
  } catch (error) {
    console.error('Cache read error:', error);
  }
  
  return null;
}

/**
 * Save PNG to cache
 */
export function savePngToCache(params, pngBuffer) {
  const cacheKey = generateCacheKey(params);
  const cachePath = path.join(CACHE_DIR, `${cacheKey}.png`);
  
  try {
    fs.writeFileSync(cachePath, pngBuffer);
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

export default {
  getCachedPng,
  savePngToCache
};