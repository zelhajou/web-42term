// app/api/github-badge/[username]/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

// API configuration
const API_URL = "https://api.intra.42.fr/v2";
const TOKEN_URL = "https://api.intra.42.fr/oauth/token";
const CLIENT_ID = "u-s4t2ud-3ea24e9ed293f8655a8d8da5a1baec9b372b9dd1c795a79e246436c7335c5dfe";
const CLIENT_SECRET = "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";

// Cache control constants
const CACHE_MAX_AGE = 60 * 60; // 1 hour
const STALE_WHILE_REVALIDATE = 60 * 60 * 24; // 1 day

// Token caching
let cachedToken = null;
let tokenExpiry = null;

/**
 * Get an authentication token from the 42 API
 */
async function getToken() {
  // Check if we have a valid cached token
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const response = await axios.post(TOKEN_URL, {
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });

    // Cache the token and set expiry (subtract 5 minutes as safety margin)
    cachedToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 300000;

    return cachedToken;
  } catch (error) {
    throw new Error(`Failed to get 42 API token: ${error.message}`);
  }
}

/**
 * Make an authenticated request to the 42 API
 */
async function fetchDirectFromApi(endpoint) {
  try {
    const token = await getToken();
    
    const response = await axios({
      url: `${API_URL}${endpoint}`,
      headers: { 
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    throw new Error(`Failed API request: ${error.message}`);
  }
}

/**
 * Get user level directly from the API
 */
async function getUserLevel(username) {
  try {
    // Fetch cursus data directly
    const endpoint = `/users/${username}/cursus_users`;
    const cursusData = await fetchDirectFromApi(endpoint);
    
    // Look for 42cursus specifically
    let mainLevel = 0;
    for (const cursus of cursusData) {
      // Check for 42cursus by name
      if (cursus.cursus?.name === '42cursus') {
        mainLevel = cursus.level;
        break;
      }
      
      // Try other variations
      if (cursus.cursus?.name === '42 Cursus') {
        mainLevel = cursus.level;
        break;
      }
      
      if (cursus.cursus?.id === 21) {
        mainLevel = cursus.level;
        if (!mainLevel) {
          break;
        }
      }
    }
    
    return mainLevel;
  } catch (error) {
    return 0;
  }
}

/**
 * Helper to escape XML special characters
 */
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, c => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;'
  }[c]));
}

/**
 * Generate a very simple, GitHub-friendly SVG badge
 */
function generateSimpleBadge(username, level, theme = 'dark') {
  // Set colors based on theme
  const colors = theme === 'dark' 
    ? { bg: '#0D1117', text: '#FFFFFF', accentText: '#39D353', border: '#30363D' }
    : { bg: '#F6F8FA', text: '#24292E', accentText: '#1A7F37', border: '#D0D7DE' };
  
  // Format the level with 2 decimal places
  const formattedLevel = level.toFixed(2);
  
  // Calculate badge width based on username length
  const usernameWidth = Math.max(username.length * 8, 60);
  const totalWidth = usernameWidth + 140;
  
  // Create a simple badge-style SVG without animations, filters, or styles
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="28" 
     viewBox="0 0 ${totalWidth} 28" fill="none">
  <rect width="${totalWidth}" height="28" rx="4" fill="${colors.bg}" stroke="${colors.border}" stroke-width="1"/>
  <text x="10" y="18" font-family="Arial, sans-serif" font-size="12" fill="${colors.text}">${escapeXml(username)}</text>
  <text x="${usernameWidth + 20}" y="18" font-family="Arial, sans-serif" font-size="12" fill="${colors.accentText}">
    Level: ${formattedLevel}
  </text>
</svg>`;
}

/**
 * API handler for GitHub-friendly badges
 */
export async function GET(request, { params }) {
  try {
    const { username } = params;
    const searchParams = request.nextUrl.searchParams;
    const theme = searchParams.get('theme') || 'dark';
    
    // Get decodedUsername
    const decodedUsername = decodeURIComponent(username);
    
    // Fetch level directly from API
    const level = await getUserLevel(decodedUsername);
    
    // Generate simple SVG badge
    const svgContent = generateSimpleBadge(decodedUsername, level, theme);
    
    // Common headers for SVG response - critical for GitHub compatibility
    const headers = {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*',
    };
    
    return new NextResponse(svgContent, { headers });
  } catch (error) {
    // Generate error badge
    const svgContent = generateSimpleBadge(params.username, 0, 'dark');
    
    return new NextResponse(svgContent, {
      headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
      status: 200 // Still return 200 to show the badge with "Level: 0.00"
    });
  }
}