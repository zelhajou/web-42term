"use client";

import { useState } from 'react';
import { 
  Moon, 
  Sun, 
  Check, 
  Clipboard, 
  ExternalLink, 
  Sliders, 
  Link 
} from 'lucide-react';

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
    <div className="w-full bg-[#111827] border border-[#1E293B] rounded-xl p-5 h-full flex flex-col shadow-lg">
      
      <div className="space-y-4 flex-shrink-0">
        {/* Controls row with theme selector and copy button */}
        <div className="flex gap-4 items-end">
          {/* Theme Selector */}
          <div className="flex-grow">
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sliders size={14} />
              Theme
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTheme('dark')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 ${
                  selectedTheme === 'dark' 
                    ? 'bg-[#1E293B] text-white ring-1 ring-[#3B82F6]' 
                    : 'bg-[#0F172A] text-gray-400 hover:bg-[#1E293B] hover:text-gray-300'
                }`}
              >
                <Moon size={14} />
                Dark
              </button>
              <button
                onClick={() => setSelectedTheme('light')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 ${
                  selectedTheme === 'light' 
                    ? 'bg-[#1E293B] text-white ring-1 ring-[#3B82F6]' 
                    : 'bg-[#0F172A] text-gray-400 hover:bg-[#1E293B] hover:text-gray-300'
                }`}
              >
                <Sun size={14} />
                Light
              </button>
            </div>
          </div>
          
          {/* Copy button */}
          <button
            onClick={copyToClipboard}
            className={`px-3 py-1.5 rounded-lg text-white text-xs transition-colors flex items-center gap-1.5 ${
              copied 
                ? 'bg-green-600' 
                : 'bg-[#3B82F6] hover:bg-[#2563EB]'
            }`}
          >
            {copied ? (
              <>
                <Check size={14} />
                Copied
              </>
            ) : (
              <>
                <Clipboard size={14} />
                Copy Markdown
              </>
            )}
          </button>
        </div>
        
        {/* URL Preview */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Link size={14} />
            Markdown code
          </label>
          <div className="bg-[#0F172A] rounded-lg text-xs text-gray-400 px-3 py-2.5 font-mono overflow-x-auto whitespace-nowrap">
            {generateGithubCode()}
          </div>
        </div>
        
        {/* Open in new tab button */}
        <div className="flex justify-center mt-4">
          <a
            href={`/api/widget/${widgetType}/${username}?theme=${selectedTheme}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 bg-[#1E293B] text-gray-300 rounded-lg text-xs hover:bg-[#2D3F58] transition-colors"
          >
            <ExternalLink size={14} className="mr-1.5" />
            Open in new tab
          </a>
        </div>
      </div>
    </div>
  );
}