/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameScreen } from './types/game';
import { HeaderBar } from './ui/components/HeaderBar';
import { BottomNavDock } from './ui/components/BottomNavDock';
import { TitleScreen } from './ui/screens/TitleScreen';
import { LobbyScreen } from './ui/screens/LobbyScreen';
import { PlayModesScreen } from './ui/screens/PlayModesScreen';
import { GameView } from './ui/screens/GameView';
import { authService } from './services/auth/authService';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('title');
  const [coins, setCoins] = useState<number>(() => authService.getCurrentUser()?.coins ?? 4850);
  const [gems] = useState<number>(() => authService.getCurrentUser()?.gems ?? 120);

  const handleStartRace = () => {
    setScreen('race');
  };

  const handleBackToLobby = () => {
    // Refresh coins from user profile
    const current = authService.getCurrentUser();
    if (current) {
      setCoins(current.coins);
    }
    setScreen('lobby');
  };

  return (
    <div className="min-h-screen w-full flex flex-col font-sans-body bg-[#faf8ff] text-[#131b2e] antialiased">
      {/* Top Header Bar (Shown in Lobby and Modes) */}
      {(screen === 'lobby' || screen === 'modes') && (
        <HeaderBar
          currentScreen={screen}
          onNavigate={(target) => setScreen(target)}
          coins={coins}
          gems={gems}
        />
      )}

      {/* Screen Router */}
      <main className="flex-1 flex flex-col w-full">
        {screen === 'title' && (
          <TitleScreen
            onStartGame={handleStartRace}
            onEnterLobby={() => setScreen('lobby')}
          />
        )}

        {screen === 'lobby' && (
          <LobbyScreen
            onStartRace={handleStartRace}
            onNavigate={(target) => setScreen(target)}
          />
        )}

        {screen === 'modes' && (
          <PlayModesScreen
            onStartRace={handleStartRace}
            onNavigate={(target) => setScreen(target)}
          />
        )}

        {screen === 'race' && (
          <GameView
            onBackToLobby={handleBackToLobby}
            mapId="cloud_climb"
          />
        )}
      </main>

      {/* Bottom Floating Navigation Dock */}
      {(screen === 'lobby' || screen === 'modes') && (
        <BottomNavDock
          currentScreen={screen}
          onNavigate={(target) => setScreen(target)}
        />
      )}
    </div>
  );
}
