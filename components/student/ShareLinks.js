"use client";

import React, { useState } from 'react';
import { 
  Share2, 
  FileText, 
  FileCode2, 
  Link2, 
  ExternalLink, 
  Users, 
  Eye, 
  Check 
} from 'lucide-react';

/**
 * Enhanced share links component with modern styling and Lucide React icons
 */
const ShareLinks = ({ username, widgetType = 'skills', theme = 'dark' }) => {
  const [copiedFormat, setCopiedFormat] = useState(null);
  
  // Get base URL
  const getBaseUrl = () => {
    return typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://42widgets.vercel.app';
  };
  
  // Generate widget URL - always showing all skills
  const getWidgetUrl = () => {
    const baseUrl = getBaseUrl();
    return `${baseUrl}/api/widget/${widgetType}/${encodeURIComponent(username)}?theme=${theme}`;
  };
  
  // Generate different sharing formats
  const sharingFormats = {
    markdown: {
      label: 'Markdown (GitHub, GitLab)',
      icon: <FileText size={16} />,
      format: `![${username}'s 42 ${widgetType}](${getWidgetUrl()})`
    },
    html: {
      label: 'HTML',
      icon: <FileCode2 size={16} />,
      format: `<img src="${getWidgetUrl()}" alt="${username}'s 42 ${widgetType}" />`
    },
    markdown_linked: {
      label: 'Markdown (With Profile Link)',
      icon: <ExternalLink size={16} />,
      format: `[![${username}'s 42 ${widgetType}](${getWidgetUrl()})](https://profile.intra.42.fr/users/${username})`
    },
    url: {
      label: 'Direct URL',
      icon: <Link2 size={16} />,
      format: getWidgetUrl()
    },
    bbcode: {
      label: 'BBCode (Forums)',
      icon: <Users size={16} />,
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
    <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-5 w-full">
      <div className="flex items-center gap-2 mb-4">
        <Share2 size={16} className="text-purple-400" />
        <h3 className="text-sm font-semibold text-white">Share Options</h3>
      </div>
      
      {/* Format options */}
      <div className="space-y-2">
        {Object.keys(sharingFormats).map((formatKey) => {
          const format = sharingFormats[formatKey];
          return (
            <div key={formatKey} className="group hover:bg-[#1E293B] rounded-lg transition-colors">
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
                      : 'bg-[#1E293B] text-gray-300 hover:bg-[#2D3F58]'
                  }`}
                >
                  {copiedFormat === formatKey ? (
                    <span className="flex items-center gap-1">
                      <Check size={12} />
                      Copied
                    </span>
                  ) : (
                    'Copy'
                  )}
                </button>
              </div>
              <div className="bg-[#0F172A] mx-2 mb-2 p-2 rounded-md overflow-x-auto hidden group-hover:block">
                <code className="text-xs text-gray-400 font-mono whitespace-nowrap">{format.format}</code>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Preview */}
      <div className="mt-5 pt-5 border-t border-[#1E293B]">
        <div className="flex items-center gap-2 mb-3">
          <Eye size={16} className="text-blue-400" />
          <h4 className="text-sm font-semibold text-white">Preview</h4>
        </div>
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-lg overflow-hidden">
          <div className="flex items-center justify-center p-4">
            <img 
              src={getWidgetUrl()} 
              alt={`${username}'s 42 ${widgetType}`} 
              className="max-w-full h-auto transform hover:scale-[1.01] transition-transform duration-300"
              style={{ maxHeight: '180px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareLinks;