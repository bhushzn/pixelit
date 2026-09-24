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
import { FriendsScreen } from './ui/screens/FriendsScreen';
import { PartyLobbyScreen } from './ui/screens/PartyLobbyScreen';
import { GameView } from './ui/screens/GameView';
import { authService } from './services/auth/authService';
import { socialService } from './services/social/socialService';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('title');
  const [selectedMapId, setSelectedMapId] = useState<string>('cloud_climb');
  const [coins, setCoins] = useState<number>(() => authService.getCurrentUser()?.coins ?? 4850);
  const [gems] = useState<number>(() => authService.getCurrentUser()?.gems ?? 120);

  const handleStartRace = (mapId?: string) => {
    if (mapId) {
      setSelectedMapId(mapId);
    }
    setScreen('race');
  };

  const handleBackToLobby = () => {
    const current = authService.getCurrentUser();
    if (current) {
      setCoins(current.coins);
    }
    setScreen('lobby');
  };

  const isNavScreen = screen === 'lobby' || screen === 'modes' || screen === 'friends' || screen === 'party';

  return (
    <div className="min-h-screen w-full flex flex-col font-sans-body bg-[#faf8ff] text-[#131b2e] antialiased">
      {/* Top Header Bar */}
      {isNavScreen && (
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
            onStartGame={() => handleStartRace(selectedMapId)}
            onEnterLobby={() => setScreen('lobby')}
          />
        )}

        {screen === 'lobby' && (
          <LobbyScreen
            onStartRace={() => handleStartRace(selectedMapId)}
            onNavigate={(target) => setScreen(target)}
          />
        )}

        {screen === 'modes' && (
          <PlayModesScreen
            onStartRace={(mapId) => handleStartRace(mapId)}
            onNavigate={(target) => setScreen(target)}
          />
        )}

        {screen === 'friends' && (
          <FriendsScreen
            onNavigate={(target) => setScreen(target)}
            onOpenParty={() => setScreen('party')}
          />
        )}

        {screen === 'party' && (
          <PartyLobbyScreen
            onNavigate={(target) => setScreen(target)}
            onStartRace={(mapId) => handleStartRace(mapId)}
          />
        )}

        {screen === 'race' && (
          <GameView
            onBackToLobby={handleBackToLobby}
            mapId={selectedMapId}
          />
        )}
      </main>

      {/* Bottom Floating Navigation Dock */}
      {isNavScreen && (
        <BottomNavDock
          currentScreen={screen}
          onNavigate={(target) => setScreen(target)}
        />
      )}
    </div>
  );
}
