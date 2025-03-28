import React, { useState } from 'react';

/**
 * Component to generate different sharing formats for the terminal widget
 */
const ShareLinks = ({ username, widgetType = 'skills', theme = 'dark' }) => {
  const [copiedFormat, setCopiedFormat] = useState(null);
  
  // Base URL for the widget
  const getBaseUrl = () => {
    return typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://42widgets.vercel.app';
  };
  
  // Generate the widget URL
  const getWidgetUrl = () => {
    const baseUrl = getBaseUrl();
    return `${baseUrl}/api/widget/${widgetType}/${encodeURIComponent(username)}?theme=${theme}`;
  };
  
  // Generate different sharing formats
  const sharingFormats = {
    markdown: {
      label: 'Markdown (GitHub, GitLab)',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M14.85 3H1.15C.52 3 0 3.52 0 4.15v7.69C0 12.48.52 13 1.15 13h13.69c.64 0 1.15-.52 1.15-1.15v-7.7C16 3.52 15.48 3 14.85 3zM9 11H7V8L5.5 9.92 4 8v3H2V5h2l1.5 2L7 5h2v6zm2.99.5L9.5 8H11V5h2v3h1.5l-2.51 3.5z" />
        </svg>
      ),
      format: `![${username}'s 42 ${widgetType}](${getWidgetUrl()})`
    },
    html: {
      label: 'HTML',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z" />
        </svg>
      ),
      format: `<img src="${getWidgetUrl()}" alt="${username}'s 42 ${widgetType}" />`
    },
    url: {
      label: 'Direct URL',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
        </svg>
      ),
      format: getWidgetUrl()
    },
    bbcode: {
      label: 'BBCode (Forums)',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1z" />
        </svg>
      ),
      format: `[img]${getWidgetUrl()}[/img]`
    }
  };
  
  // Copy format to clipboard
  const copyToClipboard = (format) => {
    navigator.clipboard.writeText(sharingFormats[format].format);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-md p-3 w-full space-y-3">
      <h3 className="uppercase text-xs text-gray-500 font-semibold mb-2 tracking-wider">Share Your Terminal</h3>
      
      {/* Format options */}
      {Object.keys(sharingFormats).map((formatKey) => {
        const format = sharingFormats[formatKey];
        return (
          <div key={formatKey} className="group hover:bg-[#242424] rounded-md transition-colors">
            <div className="flex items-center justify-between gap-2 p-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">{format.icon}</span>
                <span className="text-sm text-gray-300">{format.label}</span>
              </div>
              <button
                onClick={() => copyToClipboard(formatKey)}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  copiedFormat === formatKey
                    ? 'bg-green-600 text-white'
                    : 'bg-[#323232] text-gray-300 hover:bg-[#383838]'
                }`}
              >
                {copiedFormat === formatKey ? (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                    Copied
                  </span>
                ) : (
                  'Copy'
                )}
              </button>
            </div>
            <div className="bg-[#121212] mx-2 mb-2 p-2 rounded overflow-x-auto hidden group-hover:block">
              <code className="text-xs text-gray-400 font-mono whitespace-nowrap">{format.format}</code>
            </div>
          </div>
        );
      })}
      
      {/* Preview */}
      <div className="mt-4 pt-4 border-t border-[#333]">
        <h4 className="text-xs text-gray-500 uppercase mb-2">Preview</h4>
        <div className="bg-[#121212] border border-[#222] rounded overflow-hidden">
          <div className="flex items-center justify-center p-3">
            <img 
              src={getWidgetUrl()} 
              alt={`${username}'s 42 ${widgetType}`} 
              className="max-w-full h-auto transform hover:scale-[1.01] transition-transform duration-300"
              style={{ maxHeight: '180px' }}
            />
          </div>
        </div>
      </div>
      
      {/* Custom settings */}
      <div className="mt-4 pt-4 border-t border-[#333]">
        <h4 className="text-xs text-gray-500 uppercase mb-2">Options</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <a
              href={`${getWidgetUrl()}&width=600`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:underline"
            >
              Custom width
            </a>
            <span className="text-gray-500 text-xs">|</span>
            <a
              href={`${getWidgetUrl()}&maxSkills=5`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:underline"
            >
              Limit skills
            </a>
          </div>
          <p className="text-xs text-gray-500">
            Tip: Add <code className="bg-[#242424] px-1 rounded">&width=600</code> or <code className="bg-[#242424] px-1 rounded">&maxSkills=5</code> to customize your widget.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareLinks;