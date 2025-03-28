'use client';

import { useState } from 'react';
import axios from 'axios';
import TerminalSkillsDisplay from '@/components/student/TerminalSkillsDisplay';
import ShareLinks from '@/components/student/ShareLinks';
import { generateTerminalSkills, generateErrorSVG } from '@/lib/generators/terminalSkillsGenerator';

export default function HomePage() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [svgWidget, setSvgWidget] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');
  const [widgetType, setWidgetType] = useState('skills'); // 'skills' or 'projects'
  const [selectedTheme, setSelectedTheme] = useState('dark');
  const [showShareOptions, setShowShareOptions] = useState(false);

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
      
      // Generate the SVG widget based on selected type
      let svg;
      if (widgetType === 'skills') {
        svg = generateTerminalSkills(data, selectedTheme);
      } else {
        // For future project visualization
        svg = generateTerminalSkills(data, selectedTheme); // Placeholder until project viz is implemented
      }
      
      setSvgWidget(svg);
      setCurrentUsername(username);
      // Reset share options panel when generating new widget
      setShowShareOptions(false);
      
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
      setSvgWidget(generateErrorSVG(errorMessage, selectedTheme));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle theme change
  const handleThemeChange = (theme) => {
    setSelectedTheme(theme);
    if (currentUsername) {
      try {
        // Re-generate the widget with the new theme
        const encodedUsername = encodeURIComponent(currentUsername.trim());
        axios.get(`/api/student/${encodedUsername}`).then(response => {
          const data = response.data;
          setSvgWidget(generateTerminalSkills(data, theme));
        });
      } catch (err) {
        console.error('Error updating theme:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-[#2a2a2a] py-3 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-mono font-bold">
            <span className="text-green-400">$</span> 
            <span className="text-white">42</span>
            <span className="text-purple-400">term</span>
          </h1>
          <a 
            href="https://github.com/42widgets/terminal" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-white transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-grow flex max-w-7xl mx-auto w-full">
        {/* Left sidebar */}
        <div className="w-[320px] flex-shrink-0 border-r border-[#2a2a2a] p-4">
          {/* Widget Type Toggle */}
          <div className="mb-4 bg-[#1a1a1a] border border-[#333] rounded-md overflow-hidden flex">
            <button
              onClick={() => setWidgetType('skills')}
              className={`py-2 px-4 text-sm flex-1 ${widgetType === 'skills' ? 'bg-blue-600 text-white' : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#252525]'}`}
            >
              Skills Terminal
            </button>
            <button
              onClick={() => setWidgetType('projects')}
              className={`py-2 px-4 text-sm flex-1 ${widgetType === 'projects' ? 'bg-blue-600 text-white' : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#252525]'}`}
            >
              Projects Terminal
            </button>
          </div>
          
          {/* Username Input */}
          <div className="mb-5">
            <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-[#333] p-3 rounded-md">
              <div className="relative mb-3">
                <div className="flex items-center absolute inset-y-0 left-0 pl-3 pointer-events-none">
                  <span className="text-gray-500">@</span>
                </div>
                <input
                  type="text"
                  id="username"
                  className="w-full pl-8 py-2 bg-[#242424] text-white border border-[#444] rounded-md focus:outline-none focus:border-blue-500 text-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter 42 username"
                  required
                />
              </div>
              
              <button
                type="submit"
                className={`w-full py-2 rounded-md text-white font-medium text-sm transition-colors ${
                  isLoading ? 'bg-gray-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : 'Generate Widget'}
              </button>
              
              {error && (
                <div className="mt-3 p-2 bg-red-900/30 border border-red-500/50 rounded text-red-300 text-xs">
                  <div className="flex items-start">
                    <svg className="h-4 w-4 text-red-400 mr-1.5 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}
            </form>
          </div>
          
          {/* Features Section */}
          <div className="mb-5 bg-[#1a1a1a] border border-[#333] rounded-md p-3">
            <h3 className="uppercase text-xs text-gray-500 font-semibold mb-2 tracking-wider">Features</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center text-gray-300">
                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-blue-400 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M3.25 3A2.25 2.25 0 001 5.25v9.5A2.25 2.25 0 003.25 17h13.5A2.25 2.25 0 0019 14.75v-9.5A2.25 2.25 0 0016.75 3H3.25zm.943 1.5h11.614a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75H4.193a.75.75 0 01-.75-.75V5.25a.75.75 0 01.75-.75z" clipRule="evenodd" />
                  </svg>
                </span>
                Terminal-style visualization
              </li>
              <li className="flex items-center text-gray-300">
                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-green-400 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.785l-.238-1.192zM6.949 5.684a1 1 0 00-1.898 0l-.683 2.051a1 1 0 01-.633.633l-2.051.683a1 1 0 000 1.898l2.051.684a1 1 0 01.633.632l.683 2.051a1 1 0 001.898 0l.683-2.051a1 1 0 01.633-.633l2.051-.683a1 1 0 000-1.898l-2.051-.683a1 1 0 01-.633-.633L6.95 5.684z" />
                  </svg>
                </span>
                Color-coded by proficiency level
              </li>
              <li className="flex items-center text-gray-300">
                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-purple-400 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M6.28 5.22a.75.75 0 010 1.06L2.56 10l3.72 3.72a.75.75 0 01-1.06 1.06L.97 10.53a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0zm7.44 0a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L17.44 10l-3.72-3.72a.75.75 0 010-1.06z" clipRule="evenodd" />
                  </svg>
                </span>
                GitHub profile ready
              </li>
            </ul>
          </div>
          
          {/* How to use */}
          <div className="bg-[#1a1a1a] border border-[#333] rounded-md p-3">
            <h3 className="uppercase text-xs text-gray-500 font-semibold mb-2 tracking-wider">How to use</h3>
            <ol className="list-decimal ml-5 text-sm space-y-1 text-gray-300">
              <li>Enter your 42 intra username</li>
              <li>Select widget type (Skills/Projects)</li>
              <li>Copy the markdown to your GitHub README</li>
            </ol>
          </div>
        </div>
        
        {/* Main content area - Terminal Display */}
        <div className="flex-grow p-6 flex items-center justify-center overflow-auto">
          {svgWidget ? (
            <div className="flex flex-col max-w-full">
              <div className="bg-[#1a1a1a] border border-[#333] rounded-md p-4 mb-4 overflow-hidden">
                <div 
                  dangerouslySetInnerHTML={{ __html: svgWidget }} 
                  className="transform hover:scale-[1.02] transition-transform duration-300 flex justify-center"
                />
              </div>
              
              <div className="flex gap-4 justify-between items-center bg-[#1a1a1a] border border-[#333] rounded-md p-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-500">THEME:</div>
                  <div className="flex gap-1">
                    <button 
                      className={`px-3 py-1 text-xs rounded ${selectedTheme === 'dark' ? 'bg-blue-600 text-white' : 'bg-[#242424] text-gray-300 hover:bg-[#303030]'}`}
                      onClick={() => handleThemeChange('dark')}
                    >
                      Dark
                    </button>
                    <button 
                      className={`px-3 py-1 text-xs rounded ${selectedTheme === 'light' ? 'bg-blue-600 text-white' : 'bg-[#242424] text-gray-300 hover:bg-[#303030]'}`}
                      onClick={() => handleThemeChange('light')}
                    >
                      Light
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    className="px-3 py-1 text-xs rounded bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-1"
                    onClick={() => setShowShareOptions(!showShareOptions)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                    {showShareOptions ? 'Hide Options' : 'Share Options'}
                  </button>
                  
                  <button 
                    className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => {
                      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                      const widgetUrl = `${baseUrl}/api/widget/${widgetType}/${encodeURIComponent(currentUsername)}?theme=${selectedTheme}`;
                      const markdown = `![${currentUsername}'s 42 ${widgetType}](${widgetUrl})`;
                      navigator.clipboard.writeText(markdown);
                    }}
                  >
                    Copy Markdown
                  </button>
                </div>
              </div>
              
              {/* Share Options Panel */}
              {showShareOptions && (
                <div className="mt-4">
                  <ShareLinks 
                    username={currentUsername} 
                    widgetType={widgetType} 
                    theme={selectedTheme} 
                  />
                </div>
              )}
              
              <div className="text-xs text-gray-500 mt-2 text-center">
                Tip: After adding to GitHub README, you may need to refresh your profile page to see changes.
              </div>
            </div>
          ) : (
            <div className="w-[800px] h-[500px] bg-[#1a1a1a] border border-[#333] rounded-md flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="text-gray-600 mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-3">Your Skills Terminal</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Get a beautiful terminal visualization of your 42 School skills to showcase on your GitHub profile.
                </p>
                <div className="inline-block bg-[#242424] px-4 py-2 rounded-md text-xs text-gray-400 font-mono">
                  @username:~$ ls -la skills --by-cursus
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#2a2a2a] py-3 text-center">
        <p className="text-gray-600 text-xs">
          Created with ❤️ • Not affiliated with 42 School • © {new Date().getFullYear()} 42widgets
        </p>
      </footer>
    </div>
  );
}