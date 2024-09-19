import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';

const Track = ({ trackName, color, onDelete, isSoloing, setSoloTrack, isOtherTrackSoloing }) => {
  const [volume, setVolume] = useState(0.5);  // Volume slider state
  const [pan, setPan] = useState(0);  // Pan slider state
  const [isPlaying, setIsPlaying] = useState(false);  // Play/Pause state
  const [isMuted, setIsMuted] = useState(false);  // Mute state
  const [player, setPlayer] = useState(null);  // Tone.js Player
  const [isEditingTitle, setIsEditingTitle] = useState(false);  // Track if we're editing the title
  const [editableTitle, setEditableTitle] = useState(trackName);  // Local state for the editable title

  // Initialize the audio player, gain (volume), and panner (pan) when the component mounts
  useEffect(() => {
    const newPlayer = new Tone.Player().toDestination();
    const newPanner = new Tone.Panner(pan).toDestination();

    // Connect the player to panner and output
    newPlayer.connect(newPanner);

    setPlayer(newPlayer);
  }, []);

  // Handle play and pause
  const handlePlayPause = () => {
    if (isPlaying) {
      player.stop();
      setIsPlaying(false);
    } else {
      player.start();
      setIsPlaying(true);
    }
  };

  // Adjust volume based on slider
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (player) {
      player.volume.value = Tone.gainToDb(newVolume);  // Convert gain value to decibels
    }
  };

  // Adjust pan based on slider
  const handlePanChange = (e) => {
    const newPan = parseFloat(e.target.value);
    setPan(newPan);
    if (player) {
      player.pan.value = newPan;
    }
  };

  // File upload for audio track
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (player) {
          player.load(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle mute functionality using player.mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (player) {
      player.mute = !isMuted;  // Use Tone.Player's built-in mute property
    }
  };

  // Handle solo functionality
  const toggleSolo = () => {
    if (!isSoloing) {
      setSoloTrack(editableTitle);  // Set the soloing track
    } else {
      setSoloTrack(null);  // Disable solo
    }
  };

  useEffect(() => {
    if (player) {
      player.mute = isMuted || isOtherTrackSoloing;  // Mute the player if muted or another track is soloing
    }
  }, [isMuted, isOtherTrackSoloing, player]);

  // Handle title edit start (clicking on the title)
  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  // Handle saving the new title (onBlur or Enter key)
  const handleTitleSave = (e) => {
    if (e.type === 'blur' || (e.type === 'keydown' && e.key === 'Enter')) {
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="track" style={{ backgroundColor: color, padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
      {/* Editable Track Title */}
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

      <div>
        <label>Volume: </label>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={volume} 
          onChange={handleVolumeChange}
        />
      </div>
      <div>
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
      <div>
        <button onClick={handlePlayPause}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <input type="file" onChange={handleFileUpload} accept="audio/*" />
      </div>
      <div>
        <button onClick={toggleMute} style={{ marginTop: '10px', backgroundColor: isMuted ? 'gray' : 'green', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '5px' }}>
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
        <button onClick={toggleSolo} style={{ marginTop: '10px', backgroundColor: isSoloing ? 'orange' : 'blue', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '5px', marginLeft: '10px' }}>
          {isSoloing ? 'Unsolo' : 'Solo'}
        </button>
        <button onClick={onDelete} style={{ marginTop: '10px', backgroundColor: 'red', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '5px', marginLeft: '10px' }}>
          Delete Track
        </button>
      </div>
    </div>
  );
};

export default Track;



