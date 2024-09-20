import React, { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import MicrophonePlugin from 'wavesurfer.js/src/plugin/microphone'; // Import Microphone Plugin
import './Track.css';

const getRandomColor = () => {
  const colors = ['#FFA07A', '#20B2AA', '#9370DB', '#FF6347', '#4682B4', '#7B68EE', '#EE82EE', '#FF4500'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const Track = ({ trackName, onDelete }) => {
  const [volume, setVolume] = useState(0.5);
  const [pan, setPan] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const waveformRef = useRef(null);
  const mediaRecorderRef = useRef(null);  // MediaRecorder reference
  const recordedChunks = useRef([]);  // Store the recorded audio chunks
  const [waveform, setWaveform] = useState(null);

  const [editableTitle, setEditableTitle] = useState(trackName);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [color, setColor] = useState(getRandomColor());

  useEffect(() => {
    // Initialize WaveSurfer with Microphone Plugin for live input
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#ddd',
      progressColor: color,
      height: 80,
      responsive: true,
      barWidth: 2,
      plugins: [
        MicrophonePlugin.create()  // Add the microphone plugin
      ]
    });

    setWaveform(wavesurfer);

    return () => {
      if (wavesurfer) wavesurfer.destroy();
    };
  }, [color]);

  // Start recording and display live waveform
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      recordedChunks.current = [];  // Clear recorded chunks

      // Start the live microphone plugin
      if (waveform && waveform.microphone) {
        waveform.microphone.start();
      }

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);  // Push audio data to recorded chunks
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  // Stop recording and load into WaveSurfer
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(recordedChunks.current, { type: 'audio/wav' });
        const audioURL = URL.createObjectURL(audioBlob);

        if (waveform) {
          waveform.load(audioURL);  // Load recorded audio into WaveSurfer for playback
        }
      };

      // Stop the live microphone feed
      if (waveform && waveform.microphone) {
        waveform.microphone.stop();
      }

      setIsRecording(false);
    }
  };

  // Handle play/pause functionality
  const handlePlayPause = () => {
    if (isPlaying) {
      waveform.pause();
      setIsPlaying(false);
    } else {
      waveform.play();
      setIsPlaying(true);
    }
  };

  // Volume control
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (waveform) {
      waveform.setVolume(newVolume);
    }
  };

  // Pan control
  const handlePanChange = (e) => {
    const newPan = parseFloat(e.target.value);
    setPan(newPan);
  };

  return (
    <div className="track" style={{ backgroundColor: color }} onDrop={(e) => e.preventDefault()} onDragOver={(e) => e.preventDefault()}>
      <div className="track-header">
        {isEditingTitle ? (
          <div className="title-edit">
            <input
              type="text"
              value={editableTitle}
              onChange={(e) => setEditableTitle(e.target.value)}
              autoFocus
            />
            <button onClick={() => setIsEditingTitle(false)} className="title-save">Save</button>
            <button onClick={() => setIsEditingTitle(false)} className="title-cancel">Cancel</button>
          </div>
        ) : (
          <h3 onClick={() => setIsEditingTitle(true)} className="track-title" style={{ cursor: 'pointer' }}>
            {editableTitle}
          </h3>
        )}
      </div>

      <div className="track-controls">
        <button onClick={handlePlayPause} className="play-button">
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <div className="track-volume-pan">
          <label>Volume: </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
          />
          <label>Pan: </label>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.1"
            value={pan}
            onChange={handlePanChange}
          />
        </div>
      </div>

      <div className="track-actions">
        <button onClick={onDelete} className="delete-button">
          Delete Track
        </button>
      </div>

      <div className="track-waveform" ref={waveformRef}></div>

      <div className="recording-controls">
        <button onClick={startRecording} disabled={isRecording} className="record-button">
          Start Recording
        </button>
        <button onClick={stopRecording} disabled={!isRecording} className="stop-recording-button">
          Stop Recording
        </button>
      </div>
    </div>
  );
};

export default Track;













