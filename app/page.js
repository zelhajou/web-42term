"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import TerminalSkillsDisplay from "@/components/student/TerminalSkillsDisplay";
import ShareLinks from "@/components/student/ShareLinks";
import {
  generateTerminalSkills,
  generateErrorSVG,
} from "@/lib/generators/terminalSkillsGenerator";
import {
  Github,
  CircuitBoard,
  FolderKanban,
  User,
  AtSign,
  Info,
  Moon,
  Sun,
  Share2,
  Clipboard,
  Heart,
  CheckCircle,
  Code,
  Terminal as TerminalIcon,
  ChevronRight,
  HeartHandshake,
  Download,
  Check,
} from "lucide-react";
import DownloadModal from "@/components/DownloadModal";
import TerminalLoader from "@/components/TerminalLoader";
import ErrorModal from "@/components/ErrorModal";

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [svgContent, setSvgContent] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [displayType, setDisplayType] = useState("student"); // Start with student profile
  const [selectedTheme, setSelectedTheme] = useState("dark");
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [typedCommand, setTypedCommand] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [isThemeChanging, setIsThemeChanging] = useState(false);
  const [themeCache, setThemeCache] = useState({});
  

  const [showErrorModal, setShowErrorModal] = useState(false);
const [errorMessage, setErrorMessage] = useState('');

  // Typing animation for the default terminal
  useEffect(() => {
    if (!svgContent) {
      const textToType = "Enter your 42 username to start...";
      let index = 0;
      const typingInterval = setInterval(() => {
        if (index <= textToType.length) {
          setTypedCommand(textToType.substring(0, index));
          index++;
        } else {
          clearInterval(typingInterval);
          setTimeout(() => {
            setTypedCommand("");
            index = 0;
          }, 3000);
        }
      }, 100);

      // Cursor blink effect
      const cursorInterval = setInterval(() => {
        setShowCursor((prev) => !prev);
      }, 500);

      return () => {
        clearInterval(typingInterval);
        clearInterval(cursorInterval);
      };
    }
  }, [svgContent]);

  const CopiedToast = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
      <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 animate-fade-in z-50">
        <Check size={16} />
        <span className="text-sm">Copied to clipboard!</span>
      </div>
    );
  };

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
    // Clear theme cache when submitting a new username
    setThemeCache({});
    
    try {
      // Fetch student data from our API with properly encoded username
      const encodedUsername = encodeURIComponent(username.trim());
      const response = await axios.get(`/api/student/${encodedUsername}`);
      
      // If we have an error property in the response, it means the API returned an error
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      // Generate the SVG URL with proper type, theme and parameters
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      
      // Add maxProjects parameter to ensure we show all validated projects
      // For projects visualization, never include Piscine projects by default 
      const visualizationUrl = `${baseUrl}/api/widget/${displayType}/${encodedUsername}?theme=${selectedTheme}&maxProjects=200`;
      
      // Fetch the SVG directly from the endpoint
      const svgResponse = await axios.get(visualizationUrl);
      const svg = svgResponse.data;
      
      setSvgContent(svg);
      setCurrentUsername(username);
      // Reset share options panel when generating new visualization
      setShowShareOptions(false);
      
    } catch (err) {
      console.error('Error:', err);
      
      // Handle specific error types with better messaging
      let errorMessage = 'Error generating terminal visualization';
      
      if (err.response) {
        if (err.response.status === 429) {
          errorMessage = 'Rate limit exceeded. Please try again in a minute.';
        } else if (err.response.status === 404) {
          // Make this explicitly about the username not being found
          errorMessage = `Username '${username}' not found. Please check the spelling.`;
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err.message) {
        // Check for common error patterns
        if (err.message.includes('404') || 
            err.message.toLowerCase().includes('not found')) {
          errorMessage = `Username '${username}' not found. Please check the spelling.`;
        } else {
          errorMessage = err.message;
        }
      }
      
      // Set error for the inline message
      setError(errorMessage);
      
      // Show the error modal for better visibility
      setErrorMessage(errorMessage);
      setShowErrorModal(true);
      
      // Clear any previous SVG content so we don't show error SVG
      setSvgContent('');
      
    } finally {
      setIsLoading(false);
    }
  };
  const handleThemeChange = (theme) => {
    setSelectedTheme(theme);
    setIsThemeChanging(true);

    if (currentUsername) {
      // Create a cache key from username, displayType and theme
      const cacheKey = `${currentUsername}-${displayType}-${theme}`;

      // Check if we have a cached version
      if (themeCache[cacheKey]) {
        setSvgContent(themeCache[cacheKey]);
        setIsThemeChanging(false);
        return;
      }

      try {
        // Generate the URL with the selected type and new theme
        const encodedUsername = encodeURIComponent(currentUsername.trim());
        const baseUrl =
          typeof window !== "undefined" ? window.location.origin : "";

        // Keep the maxProjects parameter
        const visualizationUrl = `${baseUrl}/api/widget/${displayType}/${encodedUsername}?theme=${theme}&maxProjects=200`;

        // Fetch the updated SVG
        axios
          .get(visualizationUrl)
          .then((response) => {
            // Store in cache
            setThemeCache((prev) => ({
              ...prev,
              [cacheKey]: response.data,
            }));
            setSvgContent(response.data);
            setIsThemeChanging(false);
          })
          .catch((err) => {
            console.error("Error updating theme:", err);
            setIsThemeChanging(false);
          });
      } catch (err) {
        console.error("Error updating theme:", err);
        setIsThemeChanging(false);
      }
    } else {
      setIsThemeChanging(false);
    }
  };

  // Get appropriate display type name
  const getDisplayTypeName = () => {
    switch (displayType) {
      case "student":
        return "profile";
      case "projects":
        return "projects";
      case "skills":
        return "skills";
      default:
        return "visualization";
    }
  };

  // Get type colors based on selected display type
  const getTypeColors = () => {
    switch (displayType) {
      case "student":
        return {
          bg: "bg-indigo-600",
          hoverBg: "hover:bg-indigo-700",
          text: "text-indigo-400",
          border: "border-indigo-600/50",
          badge: "bg-indigo-600/20",
        };
      case "projects":
        return {
          bg: "bg-pink-600",
          hoverBg: "hover:bg-pink-700",
          text: "text-pink-400",
          border: "border-pink-600/50",
          badge: "bg-pink-600/20",
        };
      case "skills":
        return {
          bg: "bg-cyan-600",
          hoverBg: "hover:bg-cyan-700",
          text: "text-cyan-400",
          border: "border-cyan-600/50",
          badge: "bg-cyan-600/20",
        };
      default:
        return {
          bg: "bg-blue-600",
          hoverBg: "hover:bg-blue-700",
          text: "text-blue-400",
          border: "border-blue-600/50",
          badge: "bg-blue-600/20",
        };
    }
  };

  const typeColors = getTypeColors();

  return (
    <div className="min-h-screen bg-[#0D1117] text-white flex flex-col font-mono">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#161B22] py-3 px-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="ml-2 text-xl font-bold">
              <span className="text-green-400">$</span>
              <span className="text-white">42</span>
              <span className={typeColors.text}>term</span>
            </span>
          </div>
          <a
            href="https://github.com/zelhajou/web-42term"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2"
          >
            <Github size={18} />
            <span className="text-sm hidden sm:inline">GitHub</span>
          </a>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-grow flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4">
        {/* Left sidebar */}
        <div className="w-full md:w-[320px] flex-shrink-0 md:border-r border-gray-800 md:pr-6 mb-6 md:mb-0">
          <div className="space-y-6">
            {/* Display Type Toggle */}
            <div className="bg-[#161B22] rounded-lg overflow-hidden p-1 shadow-md">
              <div className="flex">
                <button
                  onClick={() => {
                    setDisplayType("student");
                    // Clear theme cache when changing display type
                    setThemeCache({});
                  }}
                  className={`py-3 px-4 text-sm rounded-md flex-1 flex flex-col items-center gap-2 transition-colors ${
                    displayType === "student"
                      ? "bg-indigo-600/90 text-white"
                      : "bg-transparent text-gray-400 hover:bg-[#1E293B] hover:text-gray-300"
                  }`}
                >
                  <User size={20} />
                  <span className="text-xs">Profile</span>
                </button>
                <button
                  onClick={() => setDisplayType("projects")}
                  className={`py-3 px-4 text-sm rounded-md flex-1 flex flex-col items-center gap-2 transition-colors ${
                    displayType === "projects"
                      ? "bg-pink-600/90 text-white"
                      : "bg-transparent text-gray-400 hover:bg-[#1E293B] hover:text-gray-300"
                  }`}
                >
                  <FolderKanban size={20} />
                  <span className="text-xs">Projects</span>
                </button>
                <button
                  onClick={() => setDisplayType("skills")}
                  className={`py-3 px-4 text-sm rounded-md flex-1 flex flex-col items-center gap-2 transition-colors ${
                    displayType === "skills"
                      ? "bg-cyan-600/90 text-white"
                      : "bg-transparent text-gray-400 hover:bg-[#1E293B] hover:text-gray-300"
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
                    className="w-full pl-10 py-3 bg-[#161B22] text-white border border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-offset-0 focus:ring-offset-transparent focus:ring-indigo-500 text-sm"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter 42 username"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className={`flex-grow py-3 rounded-lg text-white font-medium text-sm transition-colors ${
                      isLoading
                        ? "bg-gray-700 cursor-not-allowed"
                        : `${typeColors.bg} ${typeColors.hoverBg}`
                    }`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Generating...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        {displayType === "student" ? (
                          <User size={16} className="mr-2" />
                        ) : displayType === "projects" ? (
                          <FolderKanban size={16} className="mr-2" />
                        ) : (
                          <CircuitBoard size={16} className="mr-2" />
                        )}
                        Generate Terminal
                      </span>
                    )}
                  </button>

                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => handleThemeChange("dark")}
                      className={`px-3 py-1 rounded-l-lg text-xs flex items-center gap-1.5 transition-colors ${
                        selectedTheme === "dark"
                          ? "bg-gray-700 text-white"
                          : "bg-[#161B22] text-gray-400 hover:text-gray-300 border border-gray-800"
                      }`}
                    >
                      <Moon size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleThemeChange("light")}
                      className={`px-3 py-1 rounded-r-lg text-xs flex items-center gap-1.5 transition-colors ${
                        selectedTheme === "light"
                          ? "bg-gray-700 text-white"
                          : "bg-[#161B22] text-gray-400 hover:text-gray-300 border-y border-r border-gray-800"
                      }`}
                    >
                      <Sun size={14} />
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-xs">
                    <div className="flex items-start">
                      <Info
                        size={14}
                        className="text-red-400 mr-1.5 mt-0.5 flex-shrink-0"
                      />
                      {error}
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* How to use */}
            <div className="bg-[#161B22] rounded-lg p-4 border border-gray-800 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <TerminalIcon size={16} className="text-gray-400" />
                <h3 className="text-sm font-semibold text-white">How to use</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[#1E293B] text-indigo-400 text-xs mr-2 mt-0.5">
                    1
                  </span>
                  <span className="text-gray-300">
                    Enter your 42 intra username
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[#1E293B] text-pink-400 text-xs mr-2 mt-0.5">
                    2
                  </span>
                  <span className="text-gray-300">
                    Select visualization type (Profile, Projects, Skills)
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[#1E293B] text-cyan-400 text-xs mr-2 mt-0.5">
                    3
                  </span>
                  <span className="text-gray-300">
                    Copy the markdown to your GitHub README
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="inline-block bg-[#0D1117] px-3 py-1.5 rounded text-xs text-gray-400 font-mono w-full overflow-x-auto">
                  $ ./generate.sh --user=username --type={displayType}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-grow p-4 flex items-center justify-center overflow-auto">
          {svgContent ? (
            <div className="flex flex-col max-w-full w-full h-full">
              {/* SVG content display */}
              <div className="bg-[#161B22] border border-gray-800 rounded-lg p-6 mb-4 overflow-hidden shadow-lg flex-grow relative">
                {isThemeChanging && (
                  <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                  </div>
                )}
                <div
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                  className={`transform hover:scale-[1.01] transition-transform duration-300 flex justify-center h-full ${
                    isThemeChanging ? "opacity-40" : "opacity-100"
                  }`}
                />
              </div>

              {/* Controls section */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-[#161B22] border border-gray-800 rounded-lg p-4 shadow-md">
                {/* Theme controls */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">
                    Theme:
                  </span>
                  <div className="flex gap-1 ml-2">
                    <button
                      className={`px-3 py-1.5 text-xs rounded-md flex items-center gap-1.5 transition-all ${
                        selectedTheme === "dark"
                          ? "bg-[#1E293B] text-white ring-1 ring-gray-700"
                          : "bg-[#0D1117] text-gray-400 hover:bg-[#1E293B] hover:text-gray-300"
                      }`}
                      onClick={() => handleThemeChange("dark")}
                    >
                      <Moon size={14} />
                      Dark
                    </button>
                    <button
                      className={`px-3 py-1.5 text-xs rounded-md flex items-center gap-1.5 transition-all ${
                        selectedTheme === "light"
                          ? "bg-[#1E293B] text-white ring-1 ring-gray-700"
                          : "bg-[#0D1117] text-gray-400 hover:bg-[#1E293B] hover:text-gray-300"
                      }`}
                      onClick={() => handleThemeChange("light")}
                    >
                      <Sun size={14} />
                      Light
                    </button>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    className="px-3 py-1.5 text-xs rounded-md bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 flex-1 sm:flex-auto justify-center"
                    onClick={() => setShowShareOptions(!showShareOptions)}
                  >
                    <Share2 size={14} />
                    {showShareOptions ? "Hide Options" : "Share Options"}
                  </button>

                  <button
                    className={`px-3 py-1.5 text-xs rounded-md text-white flex items-center gap-1.5 flex-1 sm:flex-auto justify-center ${typeColors.bg} ${typeColors.hoverBg}`}
                    onClick={() => {
                      if (!currentUsername) return;

                      const baseUrl =
                        typeof window !== "undefined"
                          ? window.location.origin
                          : "";
                      const visualizationUrl = `${baseUrl}/api/widget/${displayType}/${encodeURIComponent(
                        currentUsername
                      )}?theme=${selectedTheme}`;

                      // Generate markdown with link to application root domain
                      const markdown = `[![${currentUsername}'s 42 ${getDisplayTypeName()}](${visualizationUrl})](${baseUrl})`;

                      navigator.clipboard.writeText(markdown);

                      // Show toast notification
                      setShowCopiedToast(true);
                      setTimeout(() => setShowCopiedToast(false), 2000);
                    }}
                  >
                    <Clipboard size={14} />
                    Copy Markdown
                  </button>

                  {/* Download button */}
                  <button
                    onClick={() => {
                      if (currentUsername) {
                        setShowDownloadModal(true);
                      }
                    }}
                    className="px-3 py-1.5 text-xs rounded-md bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 flex-1 sm:flex-auto justify-center"
                    disabled={!currentUsername}
                    title="Download image"
                  >
                    <Download size={14} />
                    Download
                  </button>
                </div>
              </div>

              {/* Share options */}
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
                <Info size={14} />
                After adding to GitHub README, you may need to refresh your
                profile page to see changes.
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-[#0A0C10] border border-gray-800 rounded-lg flex flex-col shadow-lg overflow-hidden">
              {/* Terminal Header */}
              <div className="bg-[#161B22] px-4 py-2 border-b border-gray-800 flex items-center">
                <div className="flex gap-1.5 mr-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-xs text-gray-400 flex-grow text-center font-mono">
                  42term — bash — 800×40
                </div>
              </div>

              {/* Terminal Content */}
              <div className="flex-grow flex flex-col justify-center items-center relative overflow-hidden bg-gradient-to-b from-[#0A0C10] to-[#0F1723]">
                {isLoading ? (
                  // Show terminal loader when loading
                  <TerminalLoader
                    username={username || "user"}
                    widgetType={displayType}
                    theme={selectedTheme}
                  />
                ) : (
                  // Show the default terminal UI when not loading
                  <>
                    {/* Terminal Background Animation */}
                    <div className="absolute inset-0 overflow-hidden opacity-5">
                      <div className="typing-animation font-mono text-sm text-gray-400 p-8">
                        <div>$ cd ~/42school</div>
                        <div>$ ls -la</div>
                        <div className="text-green-400">total 24</div>
                        <div>drwxr-xr-x 3 user staff 96 Mar 29 10:42 .</div>
                        <div>drwxr-xr-x 5 user staff 160 Mar 29 09:12 ..</div>
                        <div>
                          -rwxr-xr-x 1 user staff 285 Mar 29 10:42
                          profile.terminal
                        </div>
                        <div>
                          -rwxr-xr-x 1 user staff 312 Mar 29 10:42
                          projects.terminal
                        </div>
                        <div>
                          -rwxr-xr-x 1 user staff 248 Mar 29 10:42
                          skills.terminal
                        </div>
                        <div>$ ./profile.terminal --user=student</div>
                        <div className="text-green-400">generating...</div>
                        <div>$ ./projects.terminal --user=student</div>
                        <div className="text-green-400">generating...</div>
                        <div>$ ./skills.terminal --user=student</div>
                        <div className="text-green-400">generating...</div>
                        <div>$ echo $?</div>
                        <div className="text-green-400">0</div>
                      </div>
                    </div>

                    {/* Main Command Terminal */}
                    <div className="z-10 py-6 w-full max-w-xl">
                      <div className="w-full bg-[#161B22] border border-gray-800 rounded-md shadow-lg overflow-hidden mx-auto">
                        <div className="bg-[#1E293B] px-3 py-1.5 border-b border-gray-800 flex items-center justify-between">
                          <div className="text-xs text-gray-500 font-mono">
                            command
                          </div>
                          <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-gray-700"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-700"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-700"></div>
                          </div>
                        </div>

                        {/* Basic command sequence */}
                        <div className="p-4 font-mono text-gray-300 text-sm space-y-2">
                          <div className="flex items-start">
                            <span className="text-indigo-500 mr-2 w-4 flex-shrink-0">
                              $
                            </span>
                            <span>pwd</span>
                          </div>
                          <div className="flex items-start">
                            <span className="text-indigo-500 mr-2 w-4 flex-shrink-0">
                              $
                            </span>
                            <span>cd 42term</span>
                          </div>
                          <div className="flex items-start">
                            <span className="text-indigo-500 mr-2 w-4 flex-shrink-0">
                              $
                            </span>
                            <span>chmod +x generate.sh</span>
                          </div>
                          <div className="flex items-start">
                            <span className="text-indigo-500 mr-2 w-4 flex-shrink-0">
                              $
                            </span>
                            <span className="typing-terminal">
                              ./generate.sh --user=
                              <span className="text-cyan-400">username</span>{" "}
                              --type=
                              <span className="text-pink-400">
                                {displayType}
                              </span>{" "}
                              --theme=
                              <span className="text-green-400">
                                {selectedTheme}
                              </span>
                              <span
                                className={`inline-block w-2 h-5 bg-indigo-400 ml-0.5 ${
                                  showCursor ? "opacity-100" : "opacity-0"
                                }`}
                              ></span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Minimalist Feature Indicators */}
                    <div className="z-10 mt-8 flex justify-center gap-8 text-gray-600 text-xs">
                      <button
                        onClick={() => setDisplayType("student")}
                        className={`flex flex-col items-center gap-1 ${
                          displayType === "student"
                            ? "text-indigo-400"
                            : "hover:text-indigo-400"
                        } transition-colors`}
                      >
                        <User size={20} />
                        <span>profile</span>
                      </button>
                      <button
                        onClick={() => setDisplayType("projects")}
                        className={`flex flex-col items-center gap-1 ${
                          displayType === "projects"
                            ? "text-pink-400"
                            : "hover:text-pink-400"
                        } transition-colors`}
                      >
                        <FolderKanban size={20} />
                        <span>projects</span>
                      </button>
                      <button
                        onClick={() => setDisplayType("skills")}
                        className={`flex flex-col items-center gap-1 ${
                          displayType === "skills"
                            ? "text-cyan-400"
                            : "hover:text-cyan-400"
                        } transition-colors`}
                      >
                        <CircuitBoard size={20} />
                        <span>skills</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Terminal Footer */}
              <div className="bg-[#161B22] px-4 py-1.5 border-t border-gray-800 flex justify-between items-center text-[10px] text-gray-500">
                <div>{isLoading ? "loading" : "ready"}</div>
                <div className="flex items-center gap-2">
                  <span>bash</span>
                  <span>|</span>
                  <span>utf-8</span>
                </div>
                <div>terminal</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-3 text-center bg-[#161B22]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between text-xs text-gray-500">
            <div className="flex items-center mb-2 sm:mb-0">
              <span>Created with</span>
              <Heart size={12} className="mx-1 text-red-500" />
              <span>by Zelhajou 1337 student</span>
            </div>
            <div className="flex items-center gap-3">
              <span>© {new Date().getFullYear()} 42term</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">
                Not affiliated with 42 School Projects
              </span>
            </div>
          </div>
        </div>
      </footer>
      {/* Download Modal */}
      {svgContent && (
        <DownloadModal
          isOpen={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          username={currentUsername}
          widgetType={displayType}
          theme={selectedTheme}
        />
      )}

      <CopiedToast isVisible={showCopiedToast} />

     {/* Error Modal */}
      <ErrorModal 
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        errorMessage={errorMessage}
      />
    </div>
  );
}
