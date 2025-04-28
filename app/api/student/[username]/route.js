// Update app/api/student/[username]/route.js

import { NextResponse } from 'next/server';
import { fetchStudentData } from '@/lib/api';

/**
 * API handler for fetching student data
 */
export async function GET(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { username } = resolvedParams;
    
    // Get student data from API
    const studentData = await fetchStudentData(username);
    
    // Return the full student data
    return NextResponse.json(studentData);
  } catch (error) {
    console.error('API Error:', error);
    
    // Enhanced error handling with proper status codes
    let status = 500;
    let errorMessage = error.message || 'Failed to fetch student data';
    
    // Determine error type
    if (errorMessage.toLowerCase().includes('not found') || 
        errorMessage.toLowerCase().includes('doesn\'t exist') ||
        errorMessage.toLowerCase().includes('does not exist')) {
      status = 404;
      // Make sure the error message is explicitly about a username not being found
      if (!errorMessage.toLowerCase().includes('username')) {
        errorMessage = `Username '${params.username}' not found. Please check the spelling.`;
      }
    } else if (errorMessage.toLowerCase().includes('rate limit')) {
      status = 429;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
}