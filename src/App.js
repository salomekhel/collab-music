// src/App.js
import React, { useState } from 'react';
import Track from './components/Track';
import './App.css';

function App() {
  const [tracks, setTracks] = useState([]);
  const [soloTrack, setSoloTrack] = useState(null);

  // Function to add a new track
  const addTrack = () => {
    const newTrack = {
      id: tracks.length + 1,
      name: `Track ${tracks.length + 1}`,
      color: getRandomColor(),
    };
    setTracks([...tracks, newTrack]);
  };

  // Function to delete a track
  const deleteTrack = (id) => {
    setTracks(tracks.filter(track => track.id !== id));
  };

  // Function to generate a random color for track backgrounds
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return (
    <div className="App">
      <h1>Collab-Music</h1>
      <button onClick={addTrack}>Add New Track</button>
      <div className="tracks">
        {tracks.map((track) => (
          <Track 
            key={track.id} 
            trackName={track.name} 
            color={track.color} 
            onDelete={() => deleteTrack(track.id)} 
            isSoloing={soloTrack === track.name} 
            setSoloTrack={setSoloTrack}
            isOtherTrackSoloing={soloTrack !== null && soloTrack !== track.name}
          />
        ))}
      </div>
    </div>
  );
}

export default App;

