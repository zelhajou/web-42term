// First, let's create an API endpoint to handle the download conversion (SVG to PNG)
// Create a new file: app/api/download-widget/[type]/[username]/route.js

import { NextResponse } from 'next/server';
import { fetchStudentData } from '@/lib/api';
import { generateTerminalSkills } from '@/lib/generators/terminalSkillsGenerator';
import { generateTerminalProjects } from '@/lib/generators/terminalProjectsGenerator';
import { generateTerminalStudent } from '@/lib/generators/terminalStudentGenerator';
import { convertSvgToPng } from '@/lib/svgToPng';

export async function GET(request, { params }) {
  try {
    const { username, type } = params;
    const searchParams = request.nextUrl.searchParams;
    const theme = searchParams.get('theme') || 'dark';
    const format = searchParams.get('format') || 'png'; // Default to PNG
    
    // Get student data
    const decodedUsername = decodeURIComponent(username);
    const studentData = await fetchStudentData(decodedUsername);
    
    // Calculate appropriate dimensions
    let width = parseInt(searchParams.get('width'), 10) || 800;
    let height = 600;
    
    // Adjust dimensions based on widget type
    if (type === 'projects') {
      // Project widgets tend to be taller
      const projectCount = studentData.projects_users?.filter(p => 
        p.status === 'finished' && (p.validated === true || p["validated?"] === true)
      ).length || 0;
      
      height = Math.max(300, Math.min(1200, 200 + (projectCount * 30)));
    } else if (type === 'skills') {
      // Skills widgets scale with skill count
      const skillCount = Object.values(studentData.skills || {})
        .reduce((count, skills) => count + skills.length, 0);
      
      height = Math.max(300, Math.min(1000, 200 + (skillCount * 25)));
    } else if (type === 'student') {
      // Student profile has more fixed height
      height = 550;
    }
    
    // Generate the SVG based on type
    let svgContent;
    
    if (type === 'projects') {
      svgContent = generateTerminalProjects(studentData, theme, {
        width,
        maxProjects: 200,
        includePiscine: false
      });
    } else if (type === 'student') {
      svgContent = generateTerminalStudent(studentData, theme, {
        width
      });
    } else {
      // Default to skills
      svgContent = generateTerminalSkills(studentData, theme, {
        width,
        maxSkills: 100
      });
    }
    
    // Strip XML declaration for better compatibility
    if (svgContent.startsWith('<?xml')) {
      svgContent = svgContent.substring(svgContent.indexOf('<svg'));
    }
    
    // If SVG format is requested, return the SVG with appropriate headers
    if (format === 'svg') {
      return new NextResponse(svgContent, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Content-Disposition': `attachment; filename="${decodedUsername}-${type}.svg"`,
          'Cache-Control': 'max-age=3600',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // For PNG format, convert SVG to PNG
    const pngBuffer = await convertSvgToPng(svgContent, { width, height });
    
    // Return the PNG with download headers
    return new NextResponse(pngBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${decodedUsername}-42-${type}.png"`,
        'Cache-Control': 'max-age=3600',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Download conversion error:', error);
    
    // Return a JSON error response instead of an error image
    return NextResponse.json(
      { 
        error: 'Failed to generate downloadable image', 
        message: error.message || 'An unexpected error occurred'
      },
      { 
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}