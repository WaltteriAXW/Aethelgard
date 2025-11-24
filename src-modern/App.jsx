import React, { useState } from 'react';
import { GameCanvas } from './game/GameCanvas-v2';
import { GameCanvasMinimalTest } from './game/GameCanvas-minimal-test';
import { HUD } from './components/UI/HUD';
import { MainMenu, GameOverScreen, PauseMenu } from './components/UI/Menu';

function App() {
  // Game state management
  const [gameState, setGameState] = useState('MENU'); // 'MENU', 'PLAYING', 'PAUSED', 'GAME_OVER'
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [gameStats, setGameStats] = useState(null);

  // Toggle between minimal test and full game
  const [showTest, setShowTest] = useState(false);

  // Press 'T' key to toggle test mode
  React.useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 't' || e.key === 'T') {
        setShowTest(prev => !prev);
        console.log('[App] Test mode:', !showTest);
      }

      // ESC key to pause/unpause
      if (e.key === 'Escape' && gameState === 'PLAYING') {
        setGameState('PAUSED');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showTest, gameState]);

  // Handle start game from menu
  const handleStartGame = (character) => {
    setSelectedCharacter(character);
    setGameState('PLAYING');
    console.log('[App] Starting game with character:', character.id);
  };

  // Handle game over
  const handleGameOver = (stats) => {
    setGameStats(stats);
    setGameState('GAME_OVER');
    console.log('[App] Game over with stats:', stats);
  };

  // Handle restart
  const handleRestart = () => {
    setGameStats(null);
    setGameState('PLAYING');
    console.log('[App] Restarting game with character:', selectedCharacter?.id);
  };

  // Handle return to menu
  const handleReturnToMenu = () => {
    setGameStats(null);
    setSelectedCharacter(null);
    setGameState('MENU');
    console.log('[App] Returning to main menu');
  };

  // Handle resume from pause
  const handleResume = () => {
    setGameState('PLAYING');
    console.log('[App] Resuming game');
  };

  if (showTest) {
    return <GameCanvasMinimalTest />;
  }

  // Show main menu
  if (gameState === 'MENU') {
    return <MainMenu onStartGame={handleStartGame} />;
  }

  // Show game over screen
  if (gameState === 'GAME_OVER') {
    return (
      <GameOverScreen
        stats={gameStats}
        onRestart={handleRestart}
        onMenu={handleReturnToMenu}
      />
    );
  }

  // Show game (with optional pause menu overlay)
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
      <GameCanvas
        key={`game-${selectedCharacter?.id}-${Date.now()}`} // Force re-mount on restart
        selectedCharacter={selectedCharacter}
        onGameOver={handleGameOver}
        isPaused={gameState === 'PAUSED'}
      />

      {/* The React UI Overlay */}
      {gameState === 'PLAYING' && <HUD />}

      {/* Pause Menu Overlay */}
      {gameState === 'PAUSED' && (
        <PauseMenu
          onResume={handleResume}
          onMenu={handleReturnToMenu}
        />
      )}
    </div>
  );
}

export default App;
