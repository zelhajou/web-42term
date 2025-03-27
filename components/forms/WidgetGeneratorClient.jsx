'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import themes from '@/lib/themes';

const WidgetGeneratorClient = ({ widgetType = 'skills-bars' }) => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [theme, setTheme] = useState('dark');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [embedCode, setEmbedCode] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
  // Get available themes
  const themeOptions = Object.entries(themes).map(([key, theme]) => ({
    value: key,
    label: theme.name
  }));
  
  // Generate widget URL
  const generateWidgetUrl = (username, type, theme) => {
    if (!username) return '';
    return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/widget/${type}/${username}?theme=${theme}`;
  };
  
  // Generate markdown embed code
  const generateEmbedCode = (url) => {
    if (!url) return '';
    return `![42 ${widgetType.replace(/-/g, ' ')}](${url})`;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a valid username');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // First check if the user exists by making an API call
      const response = await fetch(`/api/student/${username}?dataType=skills`);
      
      if (!response.ok) {
        throw new Error(`Error fetching user data: ${response.statusText}`);
      }
      
      // Generate the preview URL and embed code
      const url = generateWidgetUrl(username, widgetType, theme);
      setPreviewUrl(url);
      setEmbedCode(generateEmbedCode(url));
      setShowPreview(true);
      
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error generating widget');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Copy embed code to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode)
      .then(() => {
        alert('Embed code copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Generate Your {widgetType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Widget
        </h2>
        
        {/* Username input */}
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 dark:text-gray-300 mb-2">
            42 Intra Username
          </label>
          <input
            type="text"
            id="username"
            className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. zelhajou"
            required
          />
        </div>
        
        {/* Theme selection */}
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Widget Theme
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {themeOptions.map((themeOption) => (
              <label 
                key={themeOption.value}
                className={`
                  flex items-center justify-center p-3 border rounded-md cursor-pointer
                  ${theme === themeOption.value 
                    ? 'bg-blue-50 dark:bg-blue-900 border-blue-500 dark:border-blue-400' 
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'}
                `}
              >
                <input
                  type="radio"
                  className="sr-only"
                  value={themeOption.value}
                  checked={theme === themeOption.value}
                  onChange={() => setTheme(themeOption.value)}
                />
                <span className={`
                  text-sm font-medium
                  ${theme === themeOption.value 
                    ? 'text-blue-600 dark:text-blue-300' 
                    : 'text-gray-700 dark:text-gray-300'}
                `}>
                  {themeOption.label}
                </span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Submit button */}
        <button
          type="submit"
          className={`
            w-full py-2 px-4 rounded-md text-white font-medium
            ${isLoading
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300'}
            transition duration-150 ease-in-out
          `}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Widget'}
        </button>
        
        {/* Error message */}
        {error && (
          <div className="mt-4 text-red-500 dark:text-red-400">
            {error}
          </div>
        )}
      </form>
      
      {/* Preview and embed code */}
      {showPreview && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
            Widget Preview
          </h3>
          
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-6 overflow-hidden">
            <img 
              src={previewUrl}
              alt={`${username}'s ${widgetType} widget`}
              className="w-full max-w-full mx-auto"
            />
          </div>
          
          <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">
            Embed Code
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Add this to your GitHub README.md or any markdown file:
          </p>
          
          <div className="flex">
            <input
              type="text"
              className="flex-grow px-4 py-2 border rounded-l-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
              value={embedCode}
              readOnly
            />
            <button
              onClick={copyToClipboard}
              className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-r-md hover:bg-gray-300 dark:hover:bg-gray-500"
              type="button"
            >
              Copy
            </button>
          </div>
          
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Direct link: <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Open image in new tab</a>
          </p>
        </div>
      )}
    </div>
  );
};

export default WidgetGeneratorClient;