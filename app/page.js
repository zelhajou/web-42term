'use client';

import { useState } from 'react';
import axios from 'axios';
import TerminalSkillsDisplay from '@/components/student/TerminalSkillsDisplay';
import { generateTerminalSkills, generateErrorSVG } from '@/lib/generators/terminalSkillsGenerator';

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
      const response = await axios.get(`/api/student/${encodedUsername}`);
      const data = response.data;
      
      // Generate the SVG widget
      const svg = generateTerminalSkills(data);
      
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
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      {/* Minimal Navigation Header */}
      <header className="bg-[#1a1a1a] border-b border-[#333] py-4 px-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-400 flex items-center">
            <span className="text-green-400 mr-2">$</span> 
            42<span className="text-purple-400">Term</span>
          </h1>
          <a 
            href="https://github.com/42widgets/terminal" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </header>

      <main className="flex-grow flex flex-col md:flex-row max-w-5xl w-full mx-auto p-4 gap-8">
        <div className="w-full md:w-1/3 flex flex-col">
          {/* Title and Description */}
          <div className="mb-6 mt-4">
            <h2 className="text-2xl font-bold mb-2 text-white">
              <span className="text-green-400">42</span> Skills Terminal
            </h2>
            <p className="text-gray-400 text-sm">
              Create a beautiful terminal visualization of your 42 School skills to showcase on your GitHub profile.
            </p>
          </div>

          {/* Form */}
          <div className="bg-[#1a1a1a] rounded-lg border border-[#333] p-6 mb-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-gray-300 mb-2 text-sm font-medium">
                  42 Intra Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    @
                  </span>
                  <input
                    type="text"
                    id="username"
                    className="w-full pl-8 px-4 py-2 rounded-md bg-[#242424] text-white border border-[#444] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="zelhajou"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`
                  w-full py-2 px-4 rounded-md text-white font-medium transition-colors
                  ${isLoading
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'}
                `}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : 'Generate Widget'}
              </button>
              
              {error && (
                <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded text-red-300 text-sm">
                  <div className="flex">
                    <svg className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 transition-transform hover:translate-y-[-2px]">
              <div className="text-blue-400 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold mb-1">Terminal Style</h3>
              <p className="text-gray-400 text-xs">
                Clean terminal interface that reflects your development environment.
              </p>
            </div>
            
            <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 transition-transform hover:translate-y-[-2px]">
              <div className="text-green-400 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-sm font-bold mb-1">Color-Coded Skills</h3>
              <p className="text-gray-400 text-xs">
                Each skill instantly shows your proficiency with intuitive coloring.
              </p>
            </div>
            
            <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 transition-transform hover:translate-y-[-2px]">
              <div className="text-purple-400 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold mb-1">GitHub Ready</h3>
              <p className="text-gray-400 text-xs">
                Add to your GitHub profile with a single click to copy the markdown.
              </p>
            </div>
          </div>
        </div>

        {/* Widget Display Area */}
        <div className="w-full md:w-2/3 flex items-start justify-center md:sticky md:top-4">
          {svgWidget ? (
            <TerminalSkillsDisplay svgWidget={svgWidget} username={currentUsername} />
          ) : (
            <div className="w-full h-[400px] bg-[#1a1a1a] border border-[#333] rounded-lg flex items-center justify-center p-8">
              <div className="text-center">
                <div className="text-gray-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">Your Skills Terminal</h3>
                <p className="text-gray-500 text-sm max-w-md">
                  Enter your 42 intra username and click "Generate Widget" to create your terminal-style skills visualization.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-[#333] py-4 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <p className="text-gray-500 text-xs">
            Created with ❤️ • Not affiliated with 42 School • © {new Date().getFullYear()} 42widgets
          </p>
        </div>
      </footer>
    </div>
  );
}