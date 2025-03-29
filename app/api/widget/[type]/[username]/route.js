// app/api/widget/[type]/[username]/route.js

import { NextResponse } from 'next/server';
import { fetchStudentData } from '@/lib/api';
import { generateTerminalSkills, generateErrorSVG as generateSkillsErrorSVG } from '@/lib/generators/terminalSkillsGenerator';
import { generateTerminalProjects, generateErrorSVG as generateProjectsErrorSVG } from '@/lib/generators/terminalProjectsGenerator';
import { generateTerminalStudent, generateErrorSVG as generateStudentErrorSVG } from '@/lib/generators/terminalStudentGenerator';

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
    const maxProjects = parseInt(searchParams.get('maxProjects'), 10) || 50;
    
    // Option to include or exclude piscine projects
    const includePiscine = searchParams.get('includePiscine') === 'true';
    
    // CRITICAL: GitHub-friendly headers
    const headers = {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'"
    };
    
    // Fetch student data
    const decodedUsername = decodeURIComponent(username);
    const studentData = await fetchStudentData(decodedUsername);
    
    // Check if student data was fetched successfully
    if (!studentData || !studentData.login) {
      throw new Error(`User '${decodedUsername}' not found or API error`);
    }
    
    // For any widget, fetch the level from studentData
    const level = studentData.directLevelValue || 
                  (studentData.cursus_users?.find(c => c.cursus?.name === '42cursus')?.level) || 
                  0;
    
    // Add level directly to the student data
    if (level > 0) {
      studentData.directLevelValue = level;
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