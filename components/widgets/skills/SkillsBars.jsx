'use client';

import React, { useState } from 'react';
import themes, { getSkillColor } from '@/lib/themes';

const SkillsBars = ({ studentData, theme = 'dark' }) => {
  const themeConfig = themes[theme] || themes.dark;
  
  // Calculate maximum skills per cursus for consistent spacing
  const maxSkillsPerCursus = Math.max(
    ...Object.values(studentData.skills || {}).map(skills => skills.length || 0),
    1
  );

  return (
    <div className={`rounded-lg shadow-lg ${themeConfig.cssClasses.background} ${themeConfig.cssClasses.text} w-full max-w-3xl mx-auto overflow-hidden`}>
      {/* Header */}
      <div className="p-6 border-b border-opacity-20 ${themeConfig.cssClasses.borderColor}">
        <div className="flex items-center">
          {studentData.image && (
            <img 
              src={studentData.image} 
              alt={studentData.displayName || studentData.login} 
              className="w-12 h-12 rounded-full mr-4"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold">
              {studentData.displayName || studentData.login}'s 42 Skills
            </h2>
            <p className={`text-sm ${themeConfig.cssClasses.textSecondary}`}>
              42 School Programming Skills Visualization
            </p>
          </div>
        </div>
      </div>

      {/* Skills content */}
      <div className="p-6 space-y-6">
        {Object.entries(studentData.skills || {}).map(([cursusName, skills]) => (
          <div key={cursusName} className={`p-4 rounded-lg ${themeConfig.cssClasses.cardBackground}`}>
            <h3 className="text-xl font-semibold mb-4">{cursusName}</h3>
            <div className="space-y-4">
              {skills.map((skill) => (
                <div key={`${cursusName}-${skill.name}`} className="space-y-1">
                  <div className="flex justify-between">
                    <span>{skill.name}</span>
                    <span className="font-mono">{skill.level.toFixed(2)}/10.00</span>
                  </div>
                  <div className={`w-full ${themeConfig.cssClasses.progressBg} rounded-full h-2`}>
                    <div 
                      className={`h-2 rounded-full`} 
                      style={{ 
                        width: `${(skill.level / 10) * 100}%`,
                        backgroundColor: getSkillColor(skill.level, theme)
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div className={`px-6 py-3 border-t ${themeConfig.cssClasses.borderColor} border-opacity-20 text-center ${themeConfig.cssClasses.textSecondary} text-sm`}>
        Powered by 42widgets.io
      </div>
    </div>
  );
};

export default SkillsBars;