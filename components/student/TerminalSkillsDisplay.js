'use client';

import { useState } from 'react';

export default function TerminalSkillsDisplay({ svgWidget, username }) {
  const [copied, setCopied] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('dark');
  
  // Generate GitHub embed code
  const generateGithubCode = () => {
    if (!username) return '';
    
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const widgetUrl = `${baseUrl}/api/widget/skills/${encodeURIComponent(username)}?theme=${selectedTheme}`;
    
    return `![${username}'s 42 Skills](${widgetUrl})`;
  };
  
  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateGithubCode())
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy:', err));
  };
  
  if (!svgWidget) return null;
  
  return (
    <div className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-6 shadow-lg">
      {/* Widget Preview */}
      <div className="border border-[#333] rounded-lg p-3 bg-[#121212] mb-6 overflow-auto">
        <div 
          dangerouslySetInnerHTML={{ __html: svgWidget }} 
          className="transform transition hover:scale-[1.01] duration-200 flex justify-center"
        />
      </div>
      
      <div className="space-y-5">
        {/* Theme Selector */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">Theme</label>
          <div className="flex space-x-3">
            <button
              onClick={() => setSelectedTheme('dark')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                selectedTheme === 'dark' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-[#242424] text-gray-300 hover:bg-[#2d2d2d]'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setSelectedTheme('light')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                selectedTheme === 'light' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-[#242424] text-gray-300 hover:bg-[#2d2d2d]'
              }`}
            >
              Light
            </button>
          </div>
        </div>
        
        {/* GitHub Embed Code */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">GitHub Markdown</label>
          <div className="flex">
            <input
              type="text"
              readOnly
              value={generateGithubCode()}
              className="flex-grow px-3 py-2 bg-[#242424] text-white border border-[#444] rounded-l-md text-xs"
            />
            <button
              onClick={copyToClipboard}
              className={`px-3 py-2 rounded-r-md text-white text-xs font-medium transition-colors ${
                copied 
                  ? 'bg-green-600' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {copied ? (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Copied
                </span>
              ) : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Add this code to your GitHub README.md to display your skills
          </p>
        </div>
        
        {/* Preview Link */}
        <div className="flex justify-center">
          <a
            href={`/api/widget/skills/${username}?theme=${selectedTheme}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 bg-[#242424] text-gray-300 rounded-md hover:bg-[#2d2d2d] text-xs transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open in New Tab
          </a>
        </div>
      </div>
    </div>
  );
}