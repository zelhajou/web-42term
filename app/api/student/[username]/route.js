import { NextResponse } from 'next/server';
import { fetchStudentData } from '@/lib/api';

/**
 * API handler for fetching student data
 */
export async function GET(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { username } = resolvedParams;
    
    // Debug info - log environment variables availability
    console.log('Environment check:', {
      apiUrlExists: !!process.env.NEXT_PUBLIC_42_API_URL,
      clientIdExists: !!process.env.FT_CLIENT_ID,
      clientSecretExists: !!process.env.FT_CLIENT_SECRET
    });
    
    // Get student data from API
    const studentData = await fetchStudentData(username);
    
    // Return the full student data
    return NextResponse.json(studentData);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch student data' },
      { status: 500 }
    );
  }
}