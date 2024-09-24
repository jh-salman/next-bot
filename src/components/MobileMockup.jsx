"use client"
import React, { useState, useEffect, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import CodeEditor from "./CodeEditor";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { IoMdOptions } from "react-icons/io";

// Define themes and languages
const themes = {
  dark: "vs-dark",
  light: "vs-light",
  cobalt: "hc-black",
  "solarized-dark": "solarized-dark",
  "solarized-light": "solarized-light",
  "kimbie-dark": "kimbie.dark",
  monokai: "monokai",
  material: "material",
  horizon: "horizon",
  nord: "nord",
  twilight: "twilight",
};

const languages = {
  html: "html",
  javascript: "javascript",
  css: "css",
  python: "python",
  typescript: "typescript",
  markdown: "markdown",
  json: "json",
};

const MobileMockup = () => {
  const [code, setCode] = useState("");
  const [displayCode, setDisplayCode] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingIndex, setTypingIndex] = useState(0);
  const [theme, setTheme] = useState(themes.dark);
  const [speed, setSpeed] = useState(10);
  const [language, setLanguage] = useState("html");
  const editorRef = useRef(null);
  const typingSound = useRef(null);

  // Recording state
  const [recording, setRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const mediaRecorderRef = useRef(null);
  const mockupRef = useRef(null); // Reference to the mockup area

  useEffect(() => {
    typingSound.current = new Audio("/audio/sound.mp3");
  }, []);

  // Function to start typing effect
  const startTyping = () => {
    setIsTyping(true);
    setTypingIndex(0);
    setDisplayCode("");
  };

  // Typing effect logic
  useEffect(() => {
    if (!isTyping) return;

    if (typingIndex <= code.length) {
      const timeout = setTimeout(() => {
        const newDisplayCode = code.slice(0, typingIndex) + "|";
        setDisplayCode(newDisplayCode);
        setTypingIndex((prev) => prev + 1);

        if (typingSound.current) {
          typingSound.current.currentTime = 0;
          typingSound.current.play();
        }
      }, speed);

      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
      setDisplayCode(code);
    }
  }, [isTyping, typingIndex, code, speed]);

  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current;
      editor.setValue(displayCode);
      editor.revealLineInCenter(editor.getModel().getLineCount());
    }
  }, [displayCode]);

  // Function to start screen recording
 // Function to start screen recording with user selection
const startRecording = async () => {
    try {
      // Prompt the user to select a screen, window, or tab to record
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always", // Include the cursor in the recording
        },
        audio: false, // Set to true if you want to capture audio as well
      });
  
      // Initialize the MediaRecorder with the selected stream
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm; codecs=vp9",
      });
  
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = handleDataAvailable;
      mediaRecorder.start();
      setRecording(true);
  
      // Stop recording when the user stops sharing
      stream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };
    } catch (error) {
      console.error("Error starting screen recording:", error);
    }
  };
  

  // Handle data available event during recording
  const handleDataAvailable = (event) => {
    if (event.data.size > 0) {
      setRecordedChunks((prev) => [...prev, event.data]);
    }
  };

  // Function to stop recording
  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  // Function to download recorded video
  const downloadRecording = () => {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recording.webm";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div ref={mockupRef}> {/* Reference to capture the mockup area */}
      <div className="flex justify-between items-center mx-auto container">
        <div className="flex items-center space-x-2">
          <label htmlFor="theme-selector" className="mr-2">
            Select Theme:
          </label>
          <select
            id="theme-selector"
            value={Object.keys(themes).find((key) => themes[key] === theme)}
            onChange={(e) => setTheme(themes[e.target.value])}
            className="p-2 border border-gray-300 rounded"
          >
            {Object.keys(themes).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="language-selector" className="mr-2">
            Select Language:
          </label>
          <select
            id="language-selector"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          >
            {Object.keys(languages).map((key) => (
              <option key={key} value={languages[key]}>
                {key}
              </option>
            ))}
          </select>
        </div>

        <div className="w-[140px] flex flex-row items-center">
          <IoMdOptions className="text-[40px]" />
          <Slider
            defaultValue={[speed]}
            max={90}
            step={10}
            onValueChange={(value) => setSpeed(value[0])}
          />
          <span className="text-[13px]">{speed}ms</span>
        </div>
      </div>

      <div className="safe-area flex container flex-col md:flex-row items-center p-4 mx-auto">
        <div className="w-1/2">
          <div className="w-full">
            <CodeEditor
              code={code}
              onCodeChange={(newCode) => setCode(newCode)}
              theme={theme}
              language={language}
            />
          </div>
          <Button onClick={startTyping} className="mt-2">
            Start Typing
          </Button>
          {!recording ? (
            <Button onClick={startRecording} className="mt-2">
              Start Recording
            </Button>
          ) : (
            <Button onClick={stopRecording} className="mt-2">
              Stop Recording
            </Button>
          )}
          {recordedChunks.length > 0 && (
            <Button onClick={downloadRecording} className="mt-2">
              Download Recording
            </Button>
          )}
        </div>

        <div className="mockup-phone mt-4 md:mt-0 h-auto">
          <div className="camera"></div>
          <div className="display">
            <div
              className="artboard artboard-demo phone-1 flex justify-between flex-col items-center w-full relative"
              style={{ paddingTop: "177.77%" }}
            >
              <div className="absolute z-20 h-full inset-0 mt-6 pb-6 rounded-lg shadow-lg flex flex-col items-center overflow-hidden">
                <div className="w-full h-full">
                  <MonacoEditor
                    height="100%"
                    language={language}
                    theme={theme}
                    options={{
                      readOnly: true,
                      lineNumbers: "on",
                      wordWrap: "on",
                      fontSize: 13,
                    }}
                    onMount={(editor) => (editorRef.current = editor)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-6">
        <h2 className="text-center text-2xl font-bold">Typed Code</h2>
        <pre className="p-4 bg-gray-200 rounded overflow-auto">{displayCode}</pre>
      </div>
    </div>
  );
};

export default MobileMockup;
