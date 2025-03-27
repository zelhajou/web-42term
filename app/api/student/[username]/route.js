import { NextResponse } from 'next/server';
import { fetchStudentData } from '@/lib/api';
import { mockStudentData } from '@/lib/mock-data';

// Remove the demo mode check since you have credentials
// const isDemoMode = !process.env.FT_CLIENT_ID || !process.env.FT_CLIENT_SECRET;

/**
 * API handler for fetching student data
 */
export async function GET(request, { params }) {
  try {
    // Await params before destructuring (Next.js requirement)
    const resolvedParams = await Promise.resolve(params);
    const { username } = resolvedParams;
    
    // Debug info - log environment variables availability (not their values, just if they exist)
    console.log('Environment check:', {
      apiUrlExists: !!process.env.NEXT_PUBLIC_42_API_URL,
      clientIdExists: !!process.env.FT_CLIENT_ID,
      clientSecretExists: !!process.env.FT_CLIENT_SECRET
      // Remove isDemoMode
    });
    
    // Get the specific data type from query params
    const searchParams = request.nextUrl.searchParams;
    const dataType = searchParams.get('dataType');
    
    // Remove the demo mode conditional and always fetch from the API
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