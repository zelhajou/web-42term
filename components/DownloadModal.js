"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  FileCode2, 
  Image, 
  Terminal,
  Check,
  AlertTriangle
} from 'lucide-react';

const DownloadModal = ({ 
  isOpen, 
  onClose, 
  username, 
  widgetType, 
  theme 
}) => {
  const [downloadStatus, setDownloadStatus] = useState('idle'); // idle, loading, success, error
  const [selectedFormat, setSelectedFormat] = useState('png');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [terminalLines, setTerminalLines] = useState([]);

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setDownloadStatus('idle');
      setSelectedFormat('png');
      setLoadingProgress(0);
      setTerminalLines([]);
    }
  }, [isOpen]);

  // Terminal animation effect
  useEffect(() => {
    if (downloadStatus === 'loading') {
      const lines = [
        { text: `$ cd ./widgets/42term`, delay: 300 },
        { text: `$ ls -la "${username}"`, delay: 800 },
        { text: `-rwxr-xr-x user staff 285 Mar 29 10:42 ${widgetType}.terminal`, delay: 1200 },
        { text: `$ ./${widgetType}.terminal --user=${username} --theme=${theme} --format=${selectedFormat}`, delay: 1600 },
        { text: `generating...`, delay: 2000, special: true },
        { text: `optimizing...`, delay: 3000, special: true },
        { text: `preparing download...`, delay: 4000, special: true },
        { text: `done! ✓`, delay: 4500, special: true }
      ];

      let timeoutIds = [];
      let curLine = 0;

      const addLine = () => {
        if (curLine < lines.length) {
          const line = lines[curLine];
          
          const id = setTimeout(() => {
            setTerminalLines(prev => [...prev, line]);
            curLine++;
            
            // Calculate progress percentage based on current line
            const progress = Math.min(100, Math.round((curLine / lines.length) * 100));
            setLoadingProgress(progress);
            
            // Add next line
            if (curLine < lines.length) {
              addLine();
            } else {
              // All lines added, set success after a short delay
              setTimeout(() => {
                setDownloadStatus('success');
              }, 500);
            }
          }, line.delay);
          
          timeoutIds.push(id);
        }
      };
      
      // Start adding lines
      addLine();
      
      // Cleanup timeouts on unmount
      return () => {
        timeoutIds.forEach(id => clearTimeout(id));
      };
    }
  }, [downloadStatus, username, widgetType, theme, selectedFormat]);

  // Generate download URL
  const getDownloadUrl = (format) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/api/download-widget/${widgetType}/${encodeURIComponent(username)}?theme=${theme}&format=${format}`;
  };

  // Start download process
  const handleDownload = async () => {
    setDownloadStatus('loading');
    
    try {
      // Pre-fetch the resource to trigger generation
      const response = await fetch(getDownloadUrl(selectedFormat));
      
      if (!response.ok) {
        throw new Error('Download generation failed');
      }
      
      // After terminal animation completes, this will allow the actual download
    } catch (error) {
      console.error('Download error:', error);
      setDownloadStatus('error');
    }
  };

  // Trigger actual download after successful preparation
  const triggerDownload = () => {
    const link = document.createElement('a');
    link.href = getDownloadUrl(selectedFormat);
    link.download = `${username}-42-${widgetType}.${selectedFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Close modal after download starts
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  // Get colors based on widget type
  const getTypeColors = () => {
    switch(widgetType) {
      case 'student': return {
        accent: 'text-indigo-400',
        button: 'bg-indigo-600 hover:bg-indigo-700',
        light: 'text-indigo-300',
        progress: 'bg-indigo-600'
      };
      case 'projects': return {
        accent: 'text-pink-400',
        button: 'bg-pink-600 hover:bg-pink-700',
        light: 'text-pink-300',
        progress: 'bg-pink-600'
      };
      case 'skills': return {
        accent: 'text-cyan-400',
        button: 'bg-cyan-600 hover:bg-cyan-700',
        light: 'text-cyan-300',
        progress: 'bg-cyan-600'
      };
      default: return {
        accent: 'text-blue-400',
        button: 'bg-blue-600 hover:bg-blue-700',
        light: 'text-blue-300',
        progress: 'bg-blue-600'
      };
    }
  };

  const typeColors = getTypeColors();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm transition-opacity duration-200">
      <div className="bg-[#0D1117] border border-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-[#161B22] px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download size={16} className={typeColors.accent} />
            <h3 className="text-sm font-semibold text-white">Download Widget</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={downloadStatus === 'loading'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {downloadStatus === 'idle' && (
            <>
              <p className="text-gray-300 text-sm mb-4">
                Select format to download the <span className={typeColors.accent}>{widgetType}</span> widget for <span className="text-white font-medium">{username}</span>
              </p>
              
              <div className="space-y-2 mb-6">
                <label className="flex items-center p-3 border border-gray-800 rounded-lg cursor-pointer hover:bg-[#161B22] transition-colors">
                  <input
                    type="radio"
                    name="format"
                    value="png"
                    checked={selectedFormat === 'png'}
                    onChange={() => setSelectedFormat('png')}
                    className="hidden"
                  />
                  <div className={`w-4 h-4 rounded-full border ${selectedFormat === 'png' ? 'border-0 p-0.5 ring-1 ring-offset-1 ring-offset-[#161B22] ring-white' : 'border-gray-600'} mr-3`}>
                    {selectedFormat === 'png' && (
                      <div className="w-full h-full rounded-full bg-white"></div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-grow">
                    <Image size={16} className="text-gray-400" />
                    <span className="text-sm text-white">PNG Image</span>
                  </div>
                  <span className="text-xs text-gray-500">Best Quality</span>
                </label>
                
                <label className="flex items-center p-3 border border-gray-800 rounded-lg cursor-pointer hover:bg-[#161B22] transition-colors">
                  <input
                    type="radio"
                    name="format"
                    value="svg"
                    checked={selectedFormat === 'svg'}
                    onChange={() => setSelectedFormat('svg')}
                    className="hidden"
                  />
                  <div className={`w-4 h-4 rounded-full border ${selectedFormat === 'svg' ? 'border-0 p-0.5 ring-1 ring-offset-1 ring-offset-[#161B22] ring-white' : 'border-gray-600'} mr-3`}>
                    {selectedFormat === 'svg' && (
                      <div className="w-full h-full rounded-full bg-white"></div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-grow">
                    <FileCode2 size={16} className="text-gray-400" />
                    <span className="text-sm text-white">SVG Vector</span>
                  </div>
                  <span className="text-xs text-gray-500">Scalable</span>
                </label>
              </div>
            </>
          )}

          {downloadStatus === 'loading' && (
            <div className="font-mono">
              {/* Terminal header */}
              <div className="flex items-center gap-2 mb-3">
                <Terminal size={14} className="text-gray-400" />
                <span className="text-xs text-gray-400">terminal — bash</span>
              </div>
              
              {/* Terminal window */}
              <div className="bg-[#0A0C10] border border-gray-800 rounded-md p-3 mb-4 h-48 overflow-y-auto">
                {terminalLines.map((line, index) => (
                  <div key={index} className="text-xs mb-1">
                    {line.special ? (
                      <span className={`${typeColors.accent}`}>{line.text}</span>
                    ) : (
                      <span className="text-gray-300">{line.text}</span>
                    )}
                    {index === terminalLines.length - 1 && (
                      <span className="inline-block w-1.5 h-4 bg-gray-400 ml-1 animate-blink"></span>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Progress bar */}
              <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${typeColors.progress} transition-all duration-300`}
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <div className="mt-2 text-center text-xs text-gray-500">
                Generating {selectedFormat.toUpperCase()} - {loadingProgress}%
              </div>
            </div>
          )}

          {downloadStatus === 'success' && (
            <div className="text-center py-2">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-green-900/20 flex items-center justify-center">
                  <Check size={24} className="text-green-500" />
                </div>
              </div>
              <h4 className="text-white font-medium mb-1">Download Ready!</h4>
              <p className="text-gray-400 text-sm mb-4">Your {selectedFormat.toUpperCase()} file has been successfully generated.</p>
            </div>
          )}

          {downloadStatus === 'error' && (
            <div className="text-center py-2">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-red-900/20 flex items-center justify-center">
                  <AlertTriangle size={24} className="text-red-500" />
                </div>
              </div>
              <h4 className="text-white font-medium mb-1">Generation Failed</h4>
              <p className="text-gray-400 text-sm mb-4">An error occurred while generating your download. Please try again.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#161B22] px-4 py-3 border-t border-gray-800 flex justify-end gap-2">
          {downloadStatus === 'idle' && (
            <>
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs bg-[#0D1117] border border-gray-700 rounded-md text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDownload}
                className={`px-4 py-1.5 text-xs rounded-md text-white flex items-center gap-1.5 ${typeColors.button}`}
              >
                <Download size={14} />
                Download {selectedFormat.toUpperCase()}
              </button>
            </>
          )}
          
          {downloadStatus === 'loading' && (
            <button 
              className="px-4 py-1.5 text-xs rounded-md text-white bg-gray-700 cursor-not-allowed"
              disabled
            >
              Processing...
            </button>
          )}
          
          {downloadStatus === 'success' && (
            <button 
              onClick={triggerDownload}
              className={`px-4 py-1.5 text-xs rounded-md text-white flex items-center gap-1.5 bg-green-600 hover:bg-green-700`}
            >
              <Download size={14} />
              Download Now
            </button>
          )}
          
          {downloadStatus === 'error' && (
            <button 
              onClick={() => setDownloadStatus('idle')}
              className={`px-4 py-1.5 text-xs rounded-md text-white flex items-center gap-1.5 ${typeColors.button}`}
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;