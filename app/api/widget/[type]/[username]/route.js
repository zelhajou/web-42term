// app/api/widget/skills/[username]/route.js

import { NextResponse } from 'next/server';
import { fetchStudentData } from '@/lib/api';
import { generateTerminalSkills, generateErrorSVG } from '@/lib/generators/terminalSkillsGenerator';

/**
 * Cache control constants
 */
const CACHE_MAX_AGE = 60 * 60; // 1 hour
const STALE_WHILE_REVALIDATE = 60 * 60 * 24; // 1 day

/**
 * API handler for the terminal-style skills widget
 */
export async function GET(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { username } = resolvedParams;
    const searchParams = request.nextUrl.searchParams;
    
    // Extract customization options
    const theme = searchParams.get('theme') || 'dark';
    const width = parseInt(searchParams.get('width'), 10) || 600;
    const maxSkills = parseInt(searchParams.get('maxSkills'), 10) || 8;
    
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
    
    // Generate SVG chart
    const svgContent = generateTerminalSkills(studentData, theme, {
      width,
      maxSkills
    });
    
    return new NextResponse(svgContent, { headers });
  } catch (error) {
    console.error('Widget generation error:', error);
    
    // Return an error SVG
    const errorSvg = generateErrorSVG(error.message || 'Failed to generate widget');
    
    return new NextResponse(errorSvg, {
      headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
      status: 500
    });
  }
}