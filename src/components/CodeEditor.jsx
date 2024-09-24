"use client";
import React, { useState } from 'react';
import MonacoEditor from '@monaco-editor/react';

const CodeEditor = ({ code, onCodeChange }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div className={`bg-card rounded-lg overflow-hidden bg-gray-200 flex flex-col ${isFullScreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className={`bg-card-foreground/10 px-4 py-3 flex items-center justify-between ${isFullScreen ? 'sticky top-0 bg-card' : ''}`}>
        <span className="text-sm font-medium text-card-foreground">Code Editor</span>
        <div className="flex items-center gap-2">
          <button className="text-card-foreground" onClick={toggleFullScreen}>
            <img 
              src={`/icons/${isFullScreen ? 'minimize-icon' : 'maximize-icon'}.svg`} 
              alt={isFullScreen ? 'Minimize' : 'Maximize'} 
              className="w-5 h-5" 
            />
          </button>
        </div>
      </div>
      <div className={`flex-1 p-4 relative ${isFullScreen ? 'overflow-hidden' : ''}`}>
        <MonacoEditor
          height={isFullScreen ? "100%" : "500px"} // Set height based on fullscreen state
          language="javascript" // Set the language you want
          value={code}
          onChange={(value) => onCodeChange(value || '')}
          theme="vs-dark" // You can choose from different themes
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
