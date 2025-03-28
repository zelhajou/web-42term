// app/api/widget/[type]/[username]/route.js

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
    const { username, type } = resolvedParams;
    const searchParams = request.nextUrl.searchParams;
    
    // Extract customization options with sensible defaults
    const theme = searchParams.get('theme') || 'dark';
    const width = parseInt(searchParams.get('width'), 10) || 800;
    
    // IMPORTANT: Always set maxSkills to a very high number 
    // to ensure ALL skills are always displayed
    const maxSkills = 100; // Effectively no limit
    
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
    
    // Generate SVG chart with ALL skills
    let svgContent = generateTerminalSkills(studentData, theme, {
      width,
      maxSkills // Always using a high value
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