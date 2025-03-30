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
  Check,
  Download,
  Image
} from 'lucide-react';
import DownloadModal from '@/components/DownloadModal';

/**
 * ShareLinks component with terminal style
 */
const ShareLinks = ({ username, widgetType = 'skills', theme = 'dark' }) => {
  const [copiedFormat, setCopiedFormat] = useState(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  
  // Get base URL
  const getBaseUrl = () => {
    return typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://42term.vercel.app';
  };
  
  // Generate widget URL
  const getWidgetUrl = () => {
    const baseUrl = getBaseUrl();
    return `${baseUrl}/api/widget/${widgetType}/${encodeURIComponent(username)}?theme=${theme}`;
  };
  
  // Get type colors based on selected display type
  const getTypeColors = () => {
    switch(widgetType) {
      case 'student': return {
        bg: 'bg-indigo-600',
        hoverBg: 'hover:bg-indigo-700',
        text: 'text-indigo-400',
        border: 'border-indigo-500/50',
        badge: 'bg-indigo-600/20'
      };
      case 'projects': return {
        bg: 'bg-pink-600',
        hoverBg: 'hover:bg-pink-700',
        text: 'text-pink-400',
        border: 'border-pink-500/50',
        badge: 'bg-pink-600/20'
      };
      case 'skills': return {
        bg: 'bg-cyan-600',
        hoverBg: 'hover:bg-cyan-700',
        text: 'text-cyan-400',
        border: 'border-cyan-500/50',
        badge: 'bg-cyan-600/20'
      };
      default: return {
        bg: 'bg-blue-600',
        hoverBg: 'hover:bg-blue-700',
        text: 'text-blue-400',
        border: 'border-blue-500/50',
        badge: 'bg-blue-600/20'
      };
    }
  };
  
  // Generate different sharing formats
  const sharingFormats = {
    markdown: {
      label: 'Markdown (GitHub, GitLab)',
      icon: <FileText size={14} />,
      format: `[![${username}'s 42 ${widgetType}](${getWidgetUrl()})](${getBaseUrl()})`
    },
    html: {
      label: 'HTML',
      icon: <FileCode2 size={14} />,
      format: `<a href="${getBaseUrl()}"><img src="${getWidgetUrl()}" alt="${username}'s 42 ${widgetType}" /></a>`
    },
    markdown_linked: {
      label: 'Markdown (With Profile Link)',
      icon: <ExternalLink size={14} />,
      format: `[![${username}'s 42 ${widgetType}](${getWidgetUrl()})](https://profile.intra.42.fr/users/${username})`
    },
    url: {
      label: 'Direct URL',
      icon: <Link2 size={14} />,
      format: getWidgetUrl()
    },
  };
  
  // Copy format to clipboard
  const copyToClipboard = (format) => {
    navigator.clipboard.writeText(sharingFormats[format].format);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const typeColors = getTypeColors();

  return (
    <div className="bg-[#161B22] border border-gray-800 rounded-lg p-4 w-full shadow-md">
      <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Share2 size={16} className={typeColors.text} />
          <h3 className="text-sm font-semibold text-white">Share Options</h3>
        </div>
        <div className={`text-xs py-0.5 px-2 rounded-md ${typeColors.badge} ${typeColors.text}`}>
          {widgetType.charAt(0).toUpperCase() + widgetType.slice(1)}
        </div>
      </div>
      
      {/* Format options */}
      <div className="space-y-2">
        {Object.keys(sharingFormats).map((formatKey) => {
          const format = sharingFormats[formatKey];
          return (
            <div key={formatKey} className="group hover:bg-[#1E293B] rounded-md transition-colors">
              <div className="flex items-center justify-between gap-2 p-2">
                <div className="flex items-center gap-2">
                  <span className={typeColors.text}>{format.icon}</span>
                  <span className="text-sm text-gray-300">{format.label}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(formatKey)}
                  className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                    copiedFormat === formatKey
                      ? 'bg-green-600 text-white'
                      : `bg-[#0D1117] border border-gray-800 text-gray-300 hover:text-white hover:${typeColors.bg}`
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
              <div className="bg-[#0D1117] mx-2 mb-2 p-2 rounded-md overflow-x-auto hidden group-hover:block">
                <code className="text-xs text-gray-400 font-mono whitespace-nowrap">{format.format}</code>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Download options */}
      <div className="mt-6 border-t border-gray-800 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Download size={16} className={typeColors.text} />
          <h4 className="text-sm font-semibold text-white">Download Options</h4>
        </div>
        
        <button 
          onClick={() => setShowDownloadModal(true)}
          className={`w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-white ${typeColors.bg} ${typeColors.hoverBg} rounded-md text-sm transition-colors`}
        >
          <Download size={14} />
          Download Widget
        </button>
      </div>
      
      {/* Download Modal */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        username={username}
        widgetType={widgetType}
        theme={theme}
      />
    </div>
  );
};

export default ShareLinks;