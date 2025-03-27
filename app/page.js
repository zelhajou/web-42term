'use client';

import { useState } from 'react';
import axios from 'axios';
import WidgetDisplay from '@/components/student/WidgetDisplay';
import { generateSkillsBars, generateErrorSVG } from '@/lib/generators/skillsGenerator';
// Remove the import for DemoModeNotice

export default function HomePage() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [svgWidget, setSvgWidget] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a valid username');
      return;
    }
    
    // Validate username format
    if (!/^[a-z0-9-]+$/i.test(username)) {
      setError('Please enter a valid 42 intra username (letters, numbers, and hyphens only)');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Fetch student data from our API with properly encoded username
      const encodedUsername = encodeURIComponent(username.trim());
      const response = await axios.get(`/api/student/${encodedUsername}?dataType=skills`);
      const data = response.data;
      
      // Generate the SVG widget
      const svg = generateSkillsBars(data);
      setSvgWidget(svg);
      setCurrentUsername(username);
      
    } catch (err) {
      console.error('Error:', err);
      
      // Handle specific error types
      let errorMessage = 'Error generating widget';
      
      if (err.response) {
        if (err.response.status === 429) {
          errorMessage = 'Rate limit exceeded. Please try again in a minute.';
        } else if (err.response.status === 404) {
          errorMessage = `Username '${username}' not found. Please check the spelling.`;
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setSvgWidget(generateErrorSVG(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-400">42 Widgets</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Generate Your 42 Widget</h2>
          <p className="text-gray-300">
            Create beautiful widgets to showcase your 42 school skills on GitHub and other platforms.
          </p>
        </div>

        {/* Form */}
        <div className="mb-8">
          <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-md p-6 max-w-md mx-auto">
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-300 mb-2 font-medium">
                42 Intra Username
              </label>
              <input
                type="text"
                id="username"
                className="w-full px-4 py-2 border rounded-md bg-gray-700 text-white border-gray-600"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. zelhajou"
                required
              />
            </div>

            <button
              type="submit"
              className={`
                w-full py-2 px-4 rounded-md text-white font-medium
                ${isLoading
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'}`
              }
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate Widget'}
            </button>
            
            {error && (
              <div className="mt-4 text-red-400">
                {error}
              </div>
            )}
            
            {/* Remove the DemoModeNotice component */}
          </form>
        </div>

        {/* Widget Display */}
        {svgWidget && (
          <WidgetDisplay svgWidget={svgWidget} username={currentUsername} />
        )}

        {/* How to use */}
        <div className="mt-12 bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">How to Use</h3>
          <ol className="list-decimal pl-5 space-y-2 text-gray-300">
            <li>Enter your 42 intra username</li>
            <li>Generate the widget</li>
            <li>Copy the markdown code and paste it into your GitHub README.md</li>
          </ol>
        </div>
      </main>

      <footer className="bg-gray-800 shadow-inner mt-12 py-6">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            Created with ❤️ • Not affiliated with 42 School
          </p>
        </div>
      </footer>
    </div>
  );
}