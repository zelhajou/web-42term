"use client";

import { useState } from 'react';
import axios from 'axios';
import TerminalSkillsDisplay from '@/components/student/TerminalSkillsDisplay';
import ShareLinks from '@/components/student/ShareLinks';
import { generateTerminalSkills, generateErrorSVG } from '@/lib/generators/terminalSkillsGenerator';
import { 
  Github, 
  CircuitBoard, 
  FolderKanban, 
  User, 
  AtSign, 
  InfoIcon, 
  Moon, 
  Sun, 
  Share2, 
  Clipboard, 
  Heart,
  CheckCircle,
  Code,
  Terminal as TerminalIcon
} from 'lucide-react';

export default function HomePage() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [svgContent, setSvgContent] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');
  const [displayType, setDisplayType] = useState('student'); // Start with student profile
  const [selectedTheme, setSelectedTheme] = useState('dark');
  const [showShareOptions, setShowShareOptions] = useState(false);

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
      
      // Generate the SVG URL with proper type, theme and parameters
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      
      // Add maxProjects parameter to ensure we show all validated projects
      // For projects visualization, never include Piscine projects by default 
      const visualizationUrl = `${baseUrl}/api/widget/${displayType}/${encodedUsername}?theme=${selectedTheme}&maxProjects=50`;
      
      // Fetch the SVG directly from the endpoint
      const svgResponse = await axios.get(visualizationUrl);
      const svg = svgResponse.data;
      
      setSvgContent(svg);
      setCurrentUsername(username);
      // Reset share options panel when generating new visualization
      setShowShareOptions(false);
      
    } catch (err) {
      console.error('Error:', err);
      
      // Handle specific error types
      let errorMessage = 'Error generating terminal visualization';
      
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
      setSvgContent(generateErrorSVG(errorMessage, selectedTheme));
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = (theme) => {
    setSelectedTheme(theme);
    if (currentUsername) {
      try {
        // Generate the URL with the selected type and new theme
        const encodedUsername = encodeURIComponent(currentUsername.trim());
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        
        // Keep the maxProjects parameter
        const visualizationUrl = `${baseUrl}/api/widget/${displayType}/${encodedUsername}?theme=${theme}&maxProjects=50`;
        
        // Fetch the updated SVG
        axios.get(visualizationUrl)
          .then(response => {
            setSvgContent(response.data);
          })
          .catch(err => {
            console.error('Error updating theme:', err);
          });
      } catch (err) {
        console.error('Error updating theme:', err);
      }
    }
  };

  // Get appropriate display type name
  const getDisplayTypeName = () => {
    switch(displayType) {
      case 'student': return 'profile';
      case 'projects': return 'projects';
      case 'skills': return 'skills';
      default: return 'visualization';
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-[#1E293B] py-4 px-6 backdrop-blur-sm bg-[#0F172A]/90 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-mono font-bold flex items-center">
            <span className="mr-2 text-green-400">$</span> 
            <span className="text-white">42</span>
            <span className="text-purple-400">term</span>
          </h1>
          <a 
            href="https://github.com/42widgets/terminal" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2"
          >
            <Github size={20} />
            <span className="text-sm hidden sm:inline">GitHub</span>
          </a>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-grow flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4">
        {/* Left sidebar */}
        <div className="w-full md:w-[320px] flex-shrink-0 md:border-r border-[#1E293B] md:pr-6 mb-6 md:mb-0">
          <div className="space-y-6">
            {/* Display Type Toggle */}
            <div className="bg-[#1E293B] rounded-xl overflow-hidden p-1">
              <div className="flex mb-1">
                <button
                  onClick={() => setDisplayType('student')}
                  className={`py-3 px-4 text-sm rounded-lg flex-1 flex flex-col items-center gap-2 transition-colors ${
                    displayType === 'student' 
                      ? 'bg-[#8B5CF6] text-white' 
                      : 'bg-transparent text-gray-400 hover:bg-[#1E293B] hover:text-gray-300'
                  }`}
                >
                  <User size={20} />
                  <span className="text-xs">Profile</span>
                </button>
                <button
                  onClick={() => setDisplayType('projects')}
                  className={`py-3 px-4 text-sm rounded-lg flex-1 flex flex-col items-center gap-2 transition-colors ${
                    displayType === 'projects' 
                      ? 'bg-[#EC4899] text-white' 
                      : 'bg-transparent text-gray-400 hover:bg-[#1E293B] hover:text-gray-300'
                  }`}
                >
                  <FolderKanban size={20} />
                  <span className="text-xs">Projects</span>
                </button>
                <button
                  onClick={() => setDisplayType('skills')}
                  className={`py-3 px-4 text-sm rounded-lg flex-1 flex flex-col items-center gap-2 transition-colors ${
                    displayType === 'skills' 
                      ? 'bg-[#3B82F6] text-white' 
                      : 'bg-transparent text-gray-400 hover:bg-[#1E293B] hover:text-gray-300'
                  }`}
                >
                  <CircuitBoard size={20} />
                  <span className="text-xs">Skills</span>
                </button>
              </div>
            </div>
            
            {/* Username Input */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <div className="flex items-center absolute inset-y-0 left-0 pl-4 pointer-events-none">
                    <AtSign size={16} className="text-gray-500" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    className="w-full pl-10 py-3 bg-[#1E293B] text-white border border-[#2D3F58] rounded-xl focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] text-sm"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter 42 username"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className={`w-full py-3 rounded-xl text-white font-medium text-sm transition-colors ${
                    isLoading 
                      ? 'bg-[#334166] cursor-not-allowed' 
                      : displayType === 'student'
                        ? 'bg-[#8B5CF6] hover:bg-[#7C3AED]' 
                        : displayType === 'projects'
                          ? 'bg-[#EC4899] hover:bg-[#DB2777]' 
                          : 'bg-[#3B82F6] hover:bg-[#2563EB]'
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
                  ) : (
                    <span className="flex items-center justify-center">
                      {displayType === 'student' ? (
                        <User size={16} className="mr-2" />
                      ) : displayType === 'projects' ? (
                        <FolderKanban size={16} className="mr-2" />
                      ) : (
                        <CircuitBoard size={16} className="mr-2" />
                      )}
                      Generate Terminal
                    </span>
                  )}
                </button>
                
                {error && (
                  <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-xl text-red-300 text-sm">
                    <div className="flex items-start">
                      <InfoIcon size={16} className="text-red-400 mr-1.5 mt-0.5 flex-shrink-0" />
                      {error}
                    </div>
                  </div>
                )}
              </form>
            </div>
            
            {/* How to use */}
            <div className="bg-[#1E293B] rounded-xl p-5 border border-[#2D3F58]">
              <div className="flex items-center gap-2 mb-3">
                <InfoIcon size={16} className="text-purple-400" />
                <h3 className="text-sm font-semibold text-white">How to use</h3>
              </div>
              <ol className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[#3B82F6]/20 text-[#3B82F6] text-xs mr-3 mt-0.5">1</span>
                  <span>Enter your 42 intra username</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[#3B82F6]/20 text-[#3B82F6] text-xs mr-3 mt-0.5">2</span>
                  <span>Select visualization type (Profile, Projects, Skills)</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[#3B82F6]/20 text-[#3B82F6] text-xs mr-3 mt-0.5">3</span>
                  <span>Copy the markdown to your GitHub README</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
        
        {/* Main content area - Terminal Display */}
        <div className="flex-grow p-4 flex items-center justify-center overflow-auto">
          {svgContent ? (
            <div className="flex flex-col max-w-full w-full">
              <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-6 mb-4 overflow-hidden shadow-lg">
                <div 
                  dangerouslySetInnerHTML={{ __html: svgContent }} 
                  className="transform hover:scale-[1.01] transition-transform duration-300 flex justify-center"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-[#111827] border border-[#1E293B] rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Theme:</span>
                  <div className="flex gap-1 ml-2">
                    <button 
                      className={`px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5 transition-all ${
                        selectedTheme === 'dark' 
                          ? 'bg-[#1E293B] text-white ring-1 ring-[#3B82F6]' 
                          : 'bg-[#111827] text-gray-400 hover:bg-[#1E293B] hover:text-gray-300'
                      }`}
                      onClick={() => handleThemeChange('dark')}
                    >
                      <Moon size={14} />
                      Dark
                    </button>
                    <button 
                      className={`px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5 transition-all ${
                        selectedTheme === 'light' 
                          ? 'bg-[#1E293B] text-white ring-1 ring-[#3B82F6]' 
                          : 'bg-[#111827] text-gray-400 hover:bg-[#1E293B] hover:text-gray-300'
                      }`}
                      onClick={() => handleThemeChange('light')}
                    >
                      <Sun size={14} />
                      Light
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    className="px-3 py-1.5 text-xs rounded-lg bg-[#8B5CF6] text-white hover:bg-[#7C3AED] flex items-center gap-1.5 flex-1 sm:flex-auto justify-center"
                    onClick={() => setShowShareOptions(!showShareOptions)}
                  >
                    <Share2 size={14} />
                    {showShareOptions ? 'Hide Options' : 'Share Options'}
                  </button>
                  
                  <button 
                    className="px-3 py-1.5 text-xs rounded-lg bg-[#3B82F6] text-white hover:bg-[#2563EB] flex items-center gap-1.5 flex-1 sm:flex-auto justify-center"
                    onClick={() => {
                      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                      const visualizationUrl = `${baseUrl}/api/widget/${displayType}/${encodeURIComponent(currentUsername)}?theme=${selectedTheme}`;
                      const markdown = `![${currentUsername}'s 42 ${getDisplayTypeName()}](${visualizationUrl})`;
                      navigator.clipboard.writeText(markdown);
                    }}
                  >
                    <Clipboard size={14} />
                    Copy Markdown
                  </button>
                </div>
              </div>
              
              {/* Share Options Panel */}
              {showShareOptions && (
                <div className="mt-4">
                  <ShareLinks 
                    username={currentUsername} 
                    widgetType={displayType} 
                    theme={selectedTheme} 
                  />
                </div>
              )}
              
              <div className="text-xs text-gray-500 mt-3 text-center flex items-center justify-center gap-1.5">
                <InfoIcon size={14} />
                After adding to GitHub README, you may need to refresh your profile page to see changes.
              </div>
            </div>
          ) : (
            <div className="w-full max-w-[800px] h-[500px] bg-[#111827] border border-[#1E293B] rounded-xl flex items-center justify-center p-6 shadow-lg">
              <div className="text-center max-w-md">
                <div className="text-gray-600 mb-6">
                  <TerminalIcon size={80} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-3">42Term Visualizations</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Generate beautiful terminal-style visualizations to showcase your 42 School achievements on your GitHub profile.
                </p>
                <div className="inline-block bg-[#1E293B] px-4 py-2 rounded-lg text-xs text-gray-400 font-mono">
                  @username:~$ ls -la ./42skills --beautiful
                </div>
                <div className="mt-6 flex justify-center">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span className="flex items-center">
                      <CheckCircle size={16} className="mr-1 text-green-500" />
                      GitHub Ready
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                    <span className="flex items-center">
                      <Code size={16} className="mr-1 text-blue-500" />
                      SVG Format
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1E293B] py-4 text-center mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between text-xs text-gray-500">
            <div className="flex items-center mb-2 sm:mb-0">
              <span>Created with</span>
              <Heart size={14} className="mx-1 text-red-500" />
              <span>by 42term</span>
            </div>
            <div className="flex items-center gap-3">
              <span>© {new Date().getFullYear()} 42term</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Not affiliated with 42 School</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
