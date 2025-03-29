// app/api/widget/with-level/[type]/[username]/route.js

import { NextResponse } from 'next/server';
import axios from 'axios';
import { fetchStudentData } from '@/lib/api';
import { generateTerminalSkills, generateErrorSVG as generateSkillsErrorSVG } from '@/lib/generators/terminalSkillsGenerator';
import { generateTerminalProjects, generateErrorSVG as generateProjectsErrorSVG } from '@/lib/generators/terminalProjectsGenerator';
import { generateTerminalStudent, generateErrorSVG as generateStudentErrorSVG } from '@/lib/generators/terminalStudentGenerator';

// Constants
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
    console.log('Requesting token from 42 API...');
    const response = await axios.post(TOKEN_URL, {
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });

    // Cache the token and set expiry (subtract 5 minutes as safety margin)
    cachedToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 300000;
    console.log('Token obtained successfully');

    return cachedToken;
  } catch (error) {
    console.error('Error getting 42 API token:', error);
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
    console.error(`Error in API request ${endpoint}:`, error);
    throw new Error(`Failed API request: ${error.message}`);
  }
}

/**
 * Get user level directly from the API
 */
async function getCursusLevel(username) {
  try {
    console.log(`Fetching cursus level for ${username}...`);
    
    // Fetch cursus data directly
    const endpoint = `/users/${username}/cursus_users`;
    const cursusData = await fetchDirectFromApi(endpoint);
    
    console.log(`Found ${cursusData.length} cursus entries`);
    
    // Look for 42cursus specifically
    let mainLevel = 0;
    for (const cursus of cursusData) {
      console.log(`Cursus: ${cursus.cursus?.name}, Level: ${cursus.level}`);
      
      // Check for 42cursus by name
      if (cursus.cursus?.name === '42cursus') {
        console.log(`Found 42cursus level: ${cursus.level}`);
        mainLevel = cursus.level;
        break;
      }
      
      // Also check for '42 Cursus' variant
      if (cursus.cursus?.name === '42 Cursus') {
        console.log(`Found 42 Cursus level: ${cursus.level}`);
        mainLevel = cursus.level;
        break;
      }
      
      // Check by cursus ID (21 = 42 main curriculum)
      if (cursus.cursus?.id === 21) {
        console.log(`Found cursus ID 21 level: ${cursus.level}`);
        mainLevel = cursus.level;
        if (!mainLevel) {
          break;
        }
      }
    }
    
    return mainLevel;
  } catch (error) {
    console.error(`Error fetching level for ${username}:`, error);
    return 0;
  }
}

/**
 * API handler for the terminal-style widgets with direct level injection
 */
export async function GET(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { username, type } = resolvedParams;
    const searchParams = request.nextUrl.searchParams;
    
    // Extract customization options with sensible defaults
    const theme = searchParams.get('theme') || 'dark';
    const width = parseInt(searchParams.get('width'), 10) || 800;
    
    // Configure max items to display
    const maxSkills = parseInt(searchParams.get('maxSkills'), 10) || 100;
    const maxProjects = parseInt(searchParams.get('maxProjects'), 10) || 50;
    
    // Option to include or exclude piscine projects
    const includePiscine = searchParams.get('includePiscine') === 'true';
    
    // Common headers for SVG response
    const headers = {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
    };
    
    // Fetch student data
    const decodedUsername = decodeURIComponent(username);
    const studentData = await fetchStudentData(decodedUsername);
    
    // Check if student data was fetched successfully
    if (!studentData || !studentData.login) {
      throw new Error(`User '${decodedUsername}' not found or API error`);
    }
    
    // For any widget, fetch the level directly for more reliable results
    const level = await getCursusLevel(decodedUsername);
    console.log(`Direct API level result for ${decodedUsername}: ${level}`);
    
    // Add level directly to the student data - guarantees it will be used
    if (level > 0) {
      studentData.directLevelValue = level;
    }
    
    // Generate appropriate SVG based on widget type
    let svgContent;
    
    if (type === 'projects') {
      // Generate terminal-style projects visualization with proper options
      svgContent = generateTerminalProjects(studentData, theme, {
        width,
        maxProjects,
        includePiscine
      });
    } else if (type === 'student') {
      // Generate terminal-style student info visualization
      svgContent = generateTerminalStudent(studentData, theme, {
        width
      });
    } else {
      // Default to skills visualization
      svgContent = generateTerminalSkills(studentData, theme, {
        width,
        maxSkills
      });
    }
    
    return new NextResponse(svgContent, { headers });
  } catch (error) {
    console.error('Widget generation error:', error);
    
    // Return an error SVG based on widget type
    let errorSvg;
    if (type === 'projects') {
      errorSvg = generateProjectsErrorSVG(error.message || 'Failed to generate projects widget');
    } else if (type === 'student') {
      errorSvg = generateStudentErrorSVG(error.message || 'Failed to generate student widget');
    } else {
      errorSvg = generateSkillsErrorSVG(error.message || 'Failed to generate skills widget');
    }
    
    return new NextResponse(errorSvg, {
      headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
      status: 500
    });
  }
}