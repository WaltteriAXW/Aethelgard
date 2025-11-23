import React, { useState } from 'react';
import { GameCanvas } from './game/GameCanvas-v2';
import { GameCanvasMinimalTest } from './game/GameCanvas-minimal-test';
import { HUD } from './components/UI/HUD';

function App() {
  // Toggle between minimal test and full game
  const [showTest, setShowTest] = useState(false);

  // Press 'T' key to toggle test mode
  React.useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 't' || e.key === 'T') {
        setShowTest(prev => !prev);
        console.log('[App] Test mode:', !showTest);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showTest]);

  if (showTest) {
    return <GameCanvasMinimalTest />;
  }

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
