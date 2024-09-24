import React, { useState, useRef } from 'react';

const ScreenRecorder = () => {
  const [recording, setRecording] = useState(false); // To manage recording state
  const [recordedChunks, setRecordedChunks] = useState([]); // To store recorded video data
  const mediaRecorderRef = useRef(null); // Reference to MediaRecorder

  // Function to start screen recording
  const startRecording = async () => {
    try {
      // Request permission to capture the screen
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true, // Capture video
        audio: true, // Capture system audio (if needed)
      });

      // Initialize MediaRecorder with the screen stream
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp9', // WebM format with VP9 codec
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = handleDataAvailable; // Store each chunk when available

      mediaRecorder.start(); // Start recording
      setRecording(true); // Update recording state

      // Stop recording when the user stops sharing the screen
      stream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };
    } catch (error) {
      console.error('Error accessing display media: ', error);
    }
  };

  // Handle the availability of data
  const handleDataAvailable = (event) => {
    if (event.data.size > 0) {
      setRecordedChunks((prev) => [...prev, event.data]); // Save each recorded chunk
    }
  };

  // Function to stop recording
  const stopRecording = () => {
    mediaRecorderRef.current.stop(); // Stop the MediaRecorder
    setRecording(false); // Update recording state
  };

  // Function to download the recorded video
  const downloadRecording = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' }); // Create a Blob from the recorded chunks
    const url = URL.createObjectURL(blob); // Create a URL for the Blob
    const a = document.createElement('a'); // Create a link element
    a.href = url;
    a.download = 'screen-recording.webm'; // Set the download filename
    document.body.appendChild(a);
    a.click(); // Simulate a click to trigger the download
    document.body.removeChild(a); // Remove the link element
    URL.revokeObjectURL(url); // Revoke the object URL
    setRecordedChunks([]); // Clear the recorded chunks
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Start/Stop Recording Button */}
      <button
        onClick={recording ? stopRecording : startRecording}
        className={`px-4 py-2 text-white rounded ${recording ? 'bg-red-600' : 'bg-green-600'}`}
      >
        {recording ? 'Stop Recording' : 'Start Recording'}
      </button>

      {/* Download Button */}
      {recordedChunks.length > 0 && (
        <button
          onClick={downloadRecording}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Download Video
        </button>
      )}
    </div>
  );
};

export default ScreenRecorder;
