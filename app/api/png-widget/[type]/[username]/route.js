// app/api/png-widget/[type]/[username]/route.js

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
    
    // Get student data
    const decodedUsername = decodeURIComponent(username);
    const studentData = await fetchStudentData(decodedUsername);
    
    // Calculate appropriate dimensions
    let width = 800;
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
    }
    
    // Generate the SVG based on type
    let svgContent;
    
    if (type === 'projects') {
      svgContent = generateTerminalProjects(studentData, theme, {
        width,
        maxProjects: 80,
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
    
    // Convert SVG to PNG
    const pngBuffer = await convertSvgToPng(svgContent, { width, height });
    
    // Return the PNG
    return new NextResponse(pngBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'max-age=3600',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('PNG conversion error:', error);
    
    // Return a simple error JSON
    return NextResponse.json(
      { error: 'Failed to generate PNG', message: error.message },
      { status: 500 }
    );
  }
}