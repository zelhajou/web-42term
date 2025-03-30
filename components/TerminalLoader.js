// Create a new file components/TerminalLoader.js

"use client";

import React, { useState, useEffect } from 'react';
import { Terminal } from 'lucide-react';

const TerminalLoader = ({ username, widgetType, theme }) => {
  const [loadingText, setLoadingText] = useState('Initializing...');
  const [commandIndex, setCommandIndex] = useState(0);
  
  const commands = [
    { text: `$ cd ./widgets/42term`, delay: 500 },
    { text: `$ ls -la "${username}"`, delay: 1000 },
    { text: `$ ./${widgetType}.terminal --user=${username} --theme=${theme}`, delay: 1500 },
    { text: `connecting to 42 API...`, delay: 2000 },
    { text: `fetching data for ${username}...`, delay: 3000 },
    { text: `generating terminal visualization...`, delay: 4000 },
  ];
  
  useEffect(() => {
    if (commandIndex >= commands.length) return;
    
    const timer = setTimeout(() => {
      setLoadingText(commands[commandIndex].text);
      setCommandIndex(prev => prev + 1);
    }, commands[commandIndex].delay);
    
    return () => clearTimeout(timer);
  }, [commandIndex, commands]);
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6">
      <div className="w-20 h-20 relative">
        {/* Pulsing circle behind the icon */}
        <div className="absolute inset-0 bg-gray-700 rounded-full animate-pulse-slow"></div>
        
        {/* Terminal icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Terminal size={36} className="text-gray-300" />
        </div>
      </div>
      
      {/* Loading text */}
      <div className="font-mono text-sm text-gray-300 flex items-center">
        {loadingText}
        <span className="inline-block w-1.5 h-4 bg-gray-300 ml-1 animate-blink"></span>
      </div>
      
      {/* Loading bar */}
      <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 animate-pulse"
          style={{ 
            width: `${Math.min(100, (commandIndex / commands.length) * 100)}%`,
            transition: 'width 0.5s ease-out'
          }}
        />
      </div>
    </div>
  );
};

export default TerminalLoader;