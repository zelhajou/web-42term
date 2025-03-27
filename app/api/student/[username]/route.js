import { NextResponse } from 'next/server';
import { fetchStudentData } from '@/lib/api';

/**
 * API handler for fetching student data
 */
export async function GET(request, { params }) {
  try {
    // Await params before destructuring (Next.js requirement)
    const resolvedParams = await Promise.resolve(params);
    const { username } = resolvedParams;
    
    // Get the specific data type from query params
    const searchParams = request.nextUrl.searchParams;
    const dataType = searchParams.get('dataType');
    
    // Fetch comprehensive student data
    const studentData = await fetchStudentData(username);
    
    // Return only specific data if requested
    if (dataType) {
      switch (dataType) {
        case 'skills':
          return NextResponse.json({
            login: studentData.login,
            displayName: studentData.displayName,
            image: studentData.image,
            skills: studentData.skills
          });
        
        case 'projects':
          return NextResponse.json({
            login: studentData.login,
            displayName: studentData.displayName,
            image: studentData.image,
            projects: studentData.projects
          });
        
        case 'coalition':
          return NextResponse.json({
            login: studentData.login,
            displayName: studentData.displayName,
            image: studentData.image,
            coalition: studentData.coalition
          });
          
        default:
          break;
      }
    }
    
    // Return the full student data by default
    return NextResponse.json(studentData);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch student data' },
      { status: 500 }
    );
  }
}