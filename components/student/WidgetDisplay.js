'use client';

import { useState } from 'react';

export default function WidgetDisplay({ svgWidget, username }) {
  const [copied, setCopied] = useState(false);
  
  // Generate embed code
  const generateEmbedCode = () => {
    if (!username) return '';
    // Make sure we're using the full, absolute URL (including http/https)
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/api/widget/skills-bars/${username}?theme=dark`;
    return `![42 skills bars](${url})`;
  };
  
  // Copy embed code to clipboard
  const copyToClipboard = () => {
    const embedCode = generateEmbedCode();
    
    navigator.clipboard.writeText(embedCode)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };
  
  if (!svgWidget) return null;
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-xl font-bold mb-3">Your Widget</h3>
      
      <div className="border border-gray-600 rounded-lg p-3 overflow-hidden mb-4">
        <div dangerouslySetInnerHTML={{ __html: svgWidget }} />
      </div>
      
      <h4 className="font-bold mb-2">Embed Code</h4>
      <div className="flex mb-3">
        <input
          type="text"
          className="flex-grow px-3 py-1 text-sm border rounded-l-md bg-gray-700 text-white border-gray-600"
          value={generateEmbedCode()}
          readOnly
        />
        <button
          onClick={copyToClipboard}
          className="bg-gray-600 text-white px-3 py-1 rounded-r-md hover:bg-gray-500 text-sm"
          type="button"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      
      <p className="text-xs text-gray-400">
        Add this code to your GitHub README.md file
      </p>
    </div>
  );
}