// app/api/widget/[type]/[username]/route.js

import { NextResponse } from 'next/server';
import { fetchStudentData } from '@/lib/api';
import { generateTerminalSkills, generateErrorSVG as generateSkillsErrorSVG } from '@/lib/generators/terminalSkillsGenerator';
import { generateTerminalProjects, generateErrorSVG as generateProjectsErrorSVG } from '@/lib/generators/terminalProjectsGenerator';
import { generateTerminalStudent, generateErrorSVG as generateStudentErrorSVG } from '@/lib/generators/terminalStudentGenerator';
import { getUserLevel } from '@/lib/utils/levelFetcher';

/**
 * Cache control constants
 */
const CACHE_MAX_AGE = 60 * 60; // 1 hour
const STALE_WHILE_REVALIDATE = 60 * 60 * 24; // 1 day

/**
 * API handler for the terminal-style widgets with GitHub compatibility
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
    const maxProjects = parseInt(searchParams.get('maxProjects'), 10) || 142;
    
    // Option to include or exclude piscine projects
    const includePiscine = searchParams.get('includePiscine') === 'true';
    
    // CRITICAL: GitHub-friendly headers
    const headers = {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'"
    };
    
    // Environment check - log variables availability
    console.log('Environment check:', {
      apiUrlExists: !!process.env.NEXT_PUBLIC_42_API_URL,
      clientIdExists: !!process.env.FT_CLIENT_ID,
      clientSecretExists: !!process.env.FT_CLIENT_SECRET
    });
    
    // Fetch student data
    const decodedUsername = decodeURIComponent(username);
    const studentData = await fetchStudentData(decodedUsername);
    
    // Check if student data was fetched successfully
    if (!studentData || !studentData.login) {
      throw new Error(`User '${decodedUsername}' not found or API error`);
    }
    
    // Log user data to help debug
    console.log(`Student data check for ${decodedUsername}:`, {
      hasData: !!studentData,
      login: studentData.login,
      correctionPoints: studentData.correction_point || studentData.correctionPoints,
      wallet: studentData.wallet,
      hasProjectsUsers: Array.isArray(studentData.projects_users),
      projectsCount: studentData.projects_users?.length || 0
    });
    
    // For any widget, fetch the level from studentData
    const level = studentData.directLevelValue || 
                  (studentData.cursus_users?.find(c => c.cursus?.name === '42cursus')?.level) || 
                  0;
    
    // Add level directly to the student data
    if (level > 0) {
      studentData.directLevelValue = level;
    }
    
    // Ensure correction points and wallet are properly set
    // The API might return these with different field names, so we handle both cases
    if (!studentData.correction_point && studentData.correctionPoints) {
      studentData.correction_point = studentData.correctionPoints;
    } else if (!studentData.correction_point) {
      console.warn(`No correction points found for ${decodedUsername}, setting to default`);
      studentData.correction_point = 0;
    }
    
    // If generating student widget, also fetch level explicitly from specialized endpoint
    if (type === 'student') {
      try {
        console.log(`Explicitly fetching level for ${decodedUsername}`);
        const userLevel = await getUserLevel(decodedUsername);
        
        // Inject the level into the studentData
        if (userLevel > 0) {
          console.log(`Setting explicit level: ${userLevel} for ${decodedUsername}`);
          
          // Make sure we have a cursus_users array
          if (!studentData.cursus_users) {
            studentData.cursus_users = [];
          }
          
          // Find if we already have a 42cursus entry
          const existingCursus = studentData.cursus_users.find(
            c => c.cursus?.name === '42cursus' || c.cursus?.id === 21
          );
          
          if (existingCursus) {
            // Update the existing entry
            existingCursus.level = userLevel;
          } else {
            // Add a new 42cursus entry
            studentData.cursus_users.push({
              cursus: { name: '42cursus', id: 21 },
              level: userLevel
            });
          }
          
          // Also set directLevelValue for consistency
          studentData.directLevelValue = userLevel;
        }
      } catch (levelError) {
        console.error(`Error fetching level for ${decodedUsername}:`, levelError);
        // We continue anyway, as we can still generate a widget without the level
      }
    }
    
    // Log what level we'll be using
    console.log(`Final level for ${decodedUsername}: ${studentData.directLevelValue || 'Not set'}`);
    
    // Ensure projects_users exists and is properly formatted
    if (!studentData.projects_users) {
      console.warn('No projects_users data found, creating empty array');
      studentData.projects_users = [];
    } else if (!Array.isArray(studentData.projects_users)) {
      console.warn('projects_users is not an array, converting it');
      try {
        // Try to convert if it's JSON string or another format
        studentData.projects_users = Array.isArray(JSON.parse(studentData.projects_users)) 
          ? JSON.parse(studentData.projects_users) 
          : [];
      } catch (e) {
        console.error('Failed to parse projects_users, creating empty array');
        studentData.projects_users = [];
      }
    }
    
    // Generate appropriate SVG based on widget type
    let svgContent;
    
    if (type === 'projects') {
      // Generate terminal-style projects visualization
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
    
    // IMPORTANT: Make sure SVG doesn't contain DOCTYPE or XML declaration
    // This can sometimes cause issues with GitHub's Camo proxy
    if (svgContent.startsWith('<?xml')) {
      svgContent = svgContent.substring(svgContent.indexOf('<svg'));
    }
    
    // Return the SVG with proper headers
    return new NextResponse(svgContent, { headers });
  } catch (error) {
    console.error('Widget generation error:', error);
    
    // Return an error SVG based on widget type
    let errorSvg;
    if (params.type === 'projects') {
      errorSvg = generateProjectsErrorSVG(error.message || 'Failed to generate projects widget');
    } else if (params.type === 'student') {
      errorSvg = generateStudentErrorSVG(error.message || 'Failed to generate student widget');
    } else {
      errorSvg = generateSkillsErrorSVG(error.message || 'Failed to generate skills widget');
    }
    
    // Make sure error SVG is also GitHub-compatible
    if (errorSvg.startsWith('<?xml')) {
      errorSvg = errorSvg.substring(errorSvg.indexOf('<svg'));
    }
    
    return new NextResponse(errorSvg, {
      headers: { 
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options': 'nosniff'
      },
      status: 200 // Return 200 even for errors so GitHub can display the error SVG
    });
  }
}