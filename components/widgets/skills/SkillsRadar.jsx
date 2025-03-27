'use client';

import React, { useEffect, useRef } from 'react';
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import themes from '@/lib/themes';

// Register required Chart.js components
Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Tooltip, Legend);

const SkillsRadar = ({ studentData, theme = 'dark' }) => {
  const themeConfig = themes[theme] || themes.dark;
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    // Clean up previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Extract all unique skills and prepare data for the radar chart
    const allSkills = [];
    const cursusData = [];
    
    Object.entries(studentData.skills || {}).forEach(([cursusName, skills]) => {
      const skillValues = [];
      const skillNames = [];
      
      skills.forEach((skill) => {
        if (!skillNames.includes(skill.name)) {
          skillNames.push(skill.name);
        }
        if (!allSkills.includes(skill.name)) {
          allSkills.push(skill.name);
        }
        skillValues.push(skill.level);
      });
      
      cursusData.push({
        name: cursusName,
        skills: skillNames,
        values: skillValues
      });
    });
    
    // Limit to top 8 skills if there are more for readability
    let displaySkills = allSkills;
    if (allSkills.length > 8) {
      // Find the most common skills across cursus
      const skillCounts = {};
      const skillMaxValues = {};
      
      Object.values(studentData.skills || {}).forEach(skills => {
        skills.forEach(skill => {
          skillCounts[skill.name] = (skillCounts[skill.name] || 0) + 1;
          skillMaxValues[skill.name] = Math.max(skillMaxValues[skill.name] || 0, skill.level);
        });
      });
      
      // Sort by frequency and then by highest level
      displaySkills = allSkills
        .sort((a, b) => {
          const countDiff = skillCounts[b] - skillCounts[a];
          if (countDiff !== 0) return countDiff;
          return skillMaxValues[b] - skillMaxValues[a];
        })
        .slice(0, 8);
    }
    
    // Prepare datasets for Chart.js
    const datasets = [];
    
    // Define colors for each cursus based on theme
    const colorSets = [
      { borderColor: themeConfig.colors.accent, backgroundColor: `${themeConfig.colors.accent}33` },
      { borderColor: themeConfig.colors.success, backgroundColor: `${themeConfig.colors.success}33` },
      { borderColor: themeConfig.colors.warning, backgroundColor: `${themeConfig.colors.warning}33` }
    ];
    
    // Create a dataset for each cursus
    Object.entries(studentData.skills || {}).forEach(([cursusName, skills], index) => {
      // Map skill values to the selected display skills
      const dataValues = displaySkills.map(skillName => {
        const skill = skills.find(s => s.name === skillName);
        return skill ? skill.level : 0;
      });
      
      datasets.push({
        label: cursusName,
        data: dataValues,
        borderColor: colorSets[index % colorSets.length].borderColor,
        backgroundColor: colorSets[index % colorSets.length].backgroundColor,
        borderWidth: 2,
        pointBackgroundColor: colorSets[index % colorSets.length].borderColor,
        pointRadius: 4
      });
    });
    
    // Create the radar chart
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: displaySkills,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: themeConfig.colors.text,
              font: {
                family: themeConfig.fontFamily,
                size: 14
              },
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: themeConfig.colors.cardBackground,
            titleColor: themeConfig.colors.text,
            bodyColor: themeConfig.colors.text,
            borderColor: themeConfig.colors.border,
            borderWidth: 1,
            displayColors: true,
            padding: 10,
            titleFont: {
              family: themeConfig.fontFamily,
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              family: themeConfig.fontFamily,
              size: 12
            },
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || '';
                return `${label}: ${context.raw.toFixed(2)}/10`;
              }
            }
          }
        },
        scales: {
          r: {
            min: 0,
            max: 10,
            ticks: {
              stepSize: 2,
              backdropColor: 'transparent',
              color: themeConfig.colors.textSecondary,
              font: {
                family: themeConfig.fontFamily,
                size: 10
              }
            },
            grid: {
              color: `${themeConfig.colors.border}66`, // 40% opacity
            },
            angleLines: {
              color: `${themeConfig.colors.border}66`, // 40% opacity
            },
            pointLabels: {
              color: themeConfig.colors.text,
              font: {
                family: themeConfig.fontFamily,
                size: 12
              }
            }
          }
        }
      }
    });
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [studentData, theme]);
  
  return (
    <div className={`rounded-lg shadow-lg ${themeConfig.cssClasses.background} ${themeConfig.cssClasses.text} w-full max-w-3xl mx-auto overflow-hidden`}>
      {/* Header */}
      <div className={`p-6 border-b border-opacity-20 ${themeConfig.cssClasses.borderColor}`}>
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
              {studentData.displayName || studentData.login}'s Skills Radar
            </h2>
            <p className={`text-sm ${themeConfig.cssClasses.textSecondary}`}>
              42 School Skills Visualization
            </p>
          </div>
        </div>
      </div>

      {/* Chart content */}
      <div className="p-6">
        <div className="w-full aspect-square">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
      
      {/* Footer */}
      <div className={`px-6 py-3 border-t ${themeConfig.cssClasses.borderColor} border-opacity-20 text-center ${themeConfig.cssClasses.textSecondary} text-sm`}>
        Powered by 42widgets.io
      </div>
    </div>
  );
};

export default SkillsRadar;