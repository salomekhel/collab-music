import React, { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import './Track.css';

const getRandomColor = () => {
  const colors = ['#FFA07A', '#20B2AA', '#9370DB', '#FF6347', '#4682B4', '#7B68EE', '#EE82EE', '#FF4500'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const Track = ({ trackName, onDelete, isSoloing, setSoloTrack, isOtherTrackSoloing }) => {
  const [volume, setVolume] = useState(0.5);  // Volume slider state
  const [pan, setPan] = useState(0);  // Pan slider state
  const [bpm, setBpm] = useState(120);  // BPM state (default 120 BPM)
  const [isPlaying, setIsPlaying] = useState(false);  // Play/Pause state
  const [isMuted, setIsMuted] = useState(false);  // Mute state
  const [waveform, setWaveform] = useState(null);  // Store the WaveSurfer instance
  const waveformRef = useRef(null);  // Reference to the waveform container

  const [isEditingTitle, setIsEditingTitle] = useState(false);  // Track if we're editing the title
  const [editableTitle, setEditableTitle] = useState(trackName);  // Local state for the editable title
  const [color, setColor] = useState(getRandomColor());

  useEffect(() => {
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#ddd',
      progressColor: color,
      height: 80,
      responsive: true,
      barWidth: 2,
    });
    setWaveform(wavesurfer);

    return () => {
      if (wavesurfer) wavesurfer.destroy();  // Clean up WaveSurfer on unmount
    };
  }, [color]);

  const handlePlayPause = () => {
    if (isPlaying) {
      waveform.pause();  // Use WaveSurfer for playback
      setIsPlaying(false);
    } else {
      waveform.play();
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (waveform) {
      waveform.setVolume(newVolume);  // Set volume directly in WaveSurfer
    }
  };

  const handlePanChange = (e) => {
    const newPan = parseFloat(e.target.value);
    setPan(newPan);
  };

  const handleBpmChange = (e) => {
    const newBpm = parseFloat(e.target.value);
    setBpm(newBpm);
    if (waveform) {
      const playbackRate = newBpm / 120;  // Calculate playback rate based on BPM (120 BPM as base)
      waveform.setPlaybackRate(playbackRate);  // Change the playback rate in WaveSurfer
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    loadAudio(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    loadAudio(file);
  };

  const loadAudio = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        waveform.load(event.target.result);  // Load the audio file into WaveSurfer
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (waveform) {
      if (isMuted) {
        waveform.setVolume(volume);  // Restore the volume when unmuted
      } else {
        waveform.setVolume(0);  // Mute by setting volume to 0
      }
    }
  };

  const toggleSolo = () => {
    if (!isSoloing) {
      setSoloTrack(editableTitle);
    } else {
      setSoloTrack(null);
    }
  };

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleSave = (e) => {
    if (e.type === 'blur' || (e.type === 'keydown' && e.key === 'Enter')) {
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="track" style={{ backgroundColor: color }} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      <div className="track-header">
        {isEditingTitle ? (
          <input
            type="text"
            value={editableTitle}
            onChange={(e) => setEditableTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={handleTitleSave}
            autoFocus
          />
        ) : (
          <h3 onClick={handleTitleClick} style={{ cursor: 'pointer' }}>{editableTitle}</h3>
        )}
      </div>

      <div className="track-controls">
        <button onClick={handlePlayPause} className="play-button">
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <input type="file" onChange={handleFileUpload} accept="audio/*" />

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

        <div className="track-bpm">
          <label>BPM: {bpm}</label>
          <input 
            type="range" 
            min="60" 
            max="180" 
            step="1" 
            value={bpm} 
            onChange={handleBpmChange}
          />
        </div>
      </div>

      <div className="track-actions">
        <button onClick={toggleMute} className={isMuted ? 'mute-on' : 'mute-off'}>
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
        <button onClick={toggleSolo} className={isSoloing ? 'solo-on' : 'solo-off'}>
          {isSoloing ? 'Unsolo' : 'Solo'}
        </button>
        <button onClick={onDelete} className="delete-button">
          Delete Track
        </button>
      </div>

      <div className="track-waveform" ref={waveformRef}>
        {/* WaveSurfer.js will automatically fill this div with the waveform */}
      </div>
    </div>
  );
};

export default Track;








