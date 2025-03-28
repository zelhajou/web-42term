'use client';

import { useState } from 'react';

export default function TerminalSkillsDisplay({ svgWidget, username, widgetType = 'skills' }) {
  const [copied, setCopied] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('dark');
  
  // Generate GitHub embed code
  const generateGithubCode = () => {
    if (!username) return '';
    
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const widgetUrl = `${baseUrl}/api/widget/${widgetType}/${encodeURIComponent(username)}?theme=${selectedTheme}`;
    
    return `![${username}'s 42 ${widgetType}](${widgetUrl})`;
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
    <div className="w-full bg-[#1a1a1a] border border-[#333] rounded-md p-4 h-full flex flex-col">
      {/* Widget Preview */}
      <div className="border border-[#333] rounded-md p-2 bg-[#121212] mb-4 overflow-auto flex-grow flex items-center justify-center">
        <div 
          dangerouslySetInnerHTML={{ __html: svgWidget }} 
          className="transform transition hover:scale-[1.01] duration-200"
        />
      </div>
      
      <div className="space-y-3 flex-shrink-0">
        {/* Controls row with theme selector and copy button */}
        <div className="flex gap-3 items-end">
          {/* Theme Selector */}
          <div className="flex-grow">
            <label className="block text-[10px] text-gray-500 mb-1">THEME</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTheme('dark')}
                className={`px-2 py-1 rounded text-xs transition-colors flex-1 ${
                  selectedTheme === 'dark' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-[#242424] text-gray-400 hover:bg-[#2d2d2d]'
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => setSelectedTheme('light')}
                className={`px-2 py-1 rounded text-xs transition-colors flex-1 ${
                  selectedTheme === 'light' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-[#242424] text-gray-400 hover:bg-[#2d2d2d]'
                }`}
              >
                Light
              </button>
            </div>
          </div>
          
          {/* Copy button */}
          <button
            onClick={copyToClipboard}
            className={`px-3 py-1 rounded text-white text-xs transition-colors h-[26px] flex items-center ${
              copied 
                ? 'bg-green-600' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {copied ? (
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Copied
              </span>
            ) : 'Copy Markdown'}
          </button>
        </div>
        
        {/* URL Preview */}
        <div>
          <label className="block text-[10px] text-gray-500 mb-1">MARKDOWN CODE</label>
          <div className="bg-[#242424] rounded text-xs text-gray-400 px-2 py-1.5 font-mono overflow-x-auto whitespace-nowrap">
            {generateGithubCode()}
          </div>
        </div>
        
        {/* New Tab Link */}
        <div className="text-center">
          <a
            href={`/api/widget/${widgetType}/${username}?theme=${selectedTheme}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-2 py-1 bg-[#242424] text-gray-400 rounded text-xs hover:bg-[#2d2d2d] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open in new tab
          </a>
        </div>
      </div>
    </div>
  );
}