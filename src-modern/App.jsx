import React from 'react';
import { GameCanvas } from './game/GameCanvas-v2';
import { HUD } from './components/UI/HUD';

function App() {
  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a'
    }}>
      {/* The Pixi.js Game Canvas */}
      <GameCanvas />

      {/* The React UI Overlay */}
      <HUD />
    </div>
  );
}

export default App;
