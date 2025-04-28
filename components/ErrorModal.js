"use client";

import React from 'react';
import { X, AlertTriangle, UserX, Wifi, ServerCrash, Clock, HelpCircle } from 'lucide-react';

const ErrorModal = ({ isOpen, onClose, errorMessage = '' }) => {
  if (!isOpen) return null;
  
  // Determine error type based on message content with improved detection
  const getErrorType = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // More specific pattern matching for user not found errors
    if (
      lowerMessage.includes('user not found') || 
      lowerMessage.includes('username not found') || 
      lowerMessage.includes('couldn\'t find') || 
      lowerMessage.includes('doesn\'t exist') ||
      lowerMessage.includes('does not exist') ||
      lowerMessage.includes('user \'') ||
      lowerMessage.includes('username \'') ||
      /not found.*username/i.test(lowerMessage) ||
      /username.*not found/i.test(lowerMessage) ||
      lowerMessage.includes('404')
    ) {
      return 'user_not_found';
    } else if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests') || lowerMessage.includes('429')) {
      return 'rate_limit';
    } else if (lowerMessage.includes('network') || lowerMessage.includes('connection') || lowerMessage.includes('timeout')) {
      return 'network';
    } else if (lowerMessage.includes('api') || lowerMessage.includes('service')) {
      return 'api';
    } else {
      return 'general';
    }
  };
  
  // Get error information based on type
  const getErrorInfo = (type, originalMessage) => {
    switch (type) {
      case 'user_not_found':
        return {
          title: 'User Not Found',
          message: 'We couldn\'t find this 42 intra username. Please check the spelling and try again.',
          icon: <UserX size={24} className="text-red-500" />,
          suggestion: 'Make sure you\'re using your intra username, not your email or display name.'
        };
      case 'rate_limit':
        return {
          title: 'Rate Limit Exceeded',
          message: 'You\'ve made too many requests. Please wait a moment before trying again.',
          icon: <Clock size={24} className="text-orange-500" />,
          suggestion: 'The 42 API has request limits. You\'ll be able to try again after a short cooldown period.'
        };
      case 'network':
        return {
          title: 'Network Error',
          message: 'We couldn\'t connect to the 42 API. Please check your internet connection.',
          icon: <Wifi size={24} className="text-yellow-500" />,
          suggestion: 'This might be a temporary connectivity issue. Try refreshing the page.'
        };
      case 'api':
        return {
          title: '42 API Issue',
          message: 'There was a problem with the 42 API service.',
          icon: <ServerCrash size={24} className="text-red-500" />,
          suggestion: 'This might be a temporary issue with the 42 API. Please try again later.'
        };
      default:
        return {
          title: 'Generation Failed',
          message: originalMessage || 'An error occurred while generating the widget.',
          icon: <AlertTriangle size={24} className="text-red-500" />,
          suggestion: 'Please try again or try a different username.'
        };
    }
  };
  
  const { title, message, icon, suggestion } = getErrorInfo(errorType, errorMessage);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm transition-opacity duration-200">
      <div className="bg-[#0D1117] border border-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-[#161B22] px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange-400" />
            <h3 className="text-sm font-semibold text-white">Widget Generation Issue</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-full bg-[#1E293B] flex items-center justify-center">
              {icon}
            </div>
          </div>
          <div className="text-center">
            <h4 className="text-white font-medium text-lg mb-2">{title}</h4>
            <p className="text-gray-300 mb-4">{message}</p>
            
            <div className="bg-[#161B22] border border-gray-700 rounded-md p-3 mb-4 text-left">
              <div className="flex gap-2 text-xs text-gray-400">
                <HelpCircle size={14} className="flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-300 block mb-1">Suggestion:</strong>
                  {suggestion}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#161B22] px-4 py-3 border-t border-gray-800 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-1.5 text-xs rounded-md text-gray-300 bg-[#0D1117] border border-gray-700 hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
          
          {errorType === 'user_not_found' && (
            <button 
              onClick={() => {
                onClose();
                // Focus the username input if possible
                document.getElementById('username')?.focus();
              }}
              className="px-4 py-1.5 text-xs rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Edit Username
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;