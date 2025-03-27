import { NextResponse } from 'next/server';
import { fetchStudentData } from '@/lib/api';
import { generateSkillsBars, generateErrorSVG } from '@/lib/generators/skillsGenerator';

/**
 * Cache control constants
 */
const CACHE_MAX_AGE = 60 * 60; // 1 hour
const STALE_WHILE_REVALIDATE = 60 * 60 * 24; // 1 day

/**
 * API handler for widget generation
 */
export async function GET(request, { params }) {
  try {
    // Await params before destructuring (Next.js requirement)
    const resolvedParams = await Promise.resolve(params);
    const { type, username } = resolvedParams;
    const searchParams = request.nextUrl.searchParams;
    const theme = searchParams.get('theme') || 'dark';
    
    // Common headers
    const headers = {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
      // Allow cross-origin embedding (important for GitHub and other sites)
      'Access-Control-Allow-Origin': '*',
    };
    
    // Fetch student data (ensure username is properly decoded)
    const decodedUsername = decodeURIComponent(username);
    const studentData = await fetchStudentData(decodedUsername);
    
    // Generate the appropriate widget based on type
    let svgContent;
    
    switch (type) {
      case 'skills-bars':
        svgContent = generateSkillsBars(studentData, theme);
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid widget type' },
          { status: 400 }
        );
    }
    
    return new NextResponse(svgContent, { headers });
  } catch (error) {
    console.error('Widget generation error:', error);
    
    // Return an error SVG
    const errorSvg = generateErrorSVG(error.message || 'Failed to generate widget');
    
    return new NextResponse(errorSvg, {
      headers: { 'Content-Type': 'image/svg+xml' },
      status: 500
    });
  }
}