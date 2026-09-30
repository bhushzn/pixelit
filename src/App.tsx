/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameScreen } from './types/game';
import { HeaderBar } from './ui/components/HeaderBar';
import { BottomNavDock } from './ui/components/BottomNavDock';
import { TitleScreen } from './ui/screens/TitleScreen';
import { LobbyScreen } from './ui/screens/LobbyScreen';
import { PlayModesScreen } from './ui/screens/PlayModesScreen';
import { FriendsScreen } from './ui/screens/FriendsScreen';
import { PartyLobbyScreen } from './ui/screens/PartyLobbyScreen';
import { LockerScreen } from './ui/screens/LockerScreen';
import { ShopScreen } from './ui/screens/ShopScreen';
import { GameView } from './ui/screens/GameView';
import { authService } from './services/auth/authService';
import { progressionService } from './services/progression/progressionService';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('title');
  const [selectedMapId, setSelectedMapId] = useState<string>('cloud_climb');
  const [isMultiplayer, setIsMultiplayer] = useState<boolean>(false);
  const [activeRoomId, setActiveRoomId] = useState<string>('');
  const [coins, setCoins] = useState<number>(() => progressionService.getProgression().totalCoins);
  const [gems, setGems] = useState<number>(() => progressionService.getProgression().totalGems);

  useEffect(() => {
    const unsub = progressionService.subscribe((p) => {
      setCoins(p.totalCoins);
      setGems(p.totalGems);
    });
    return () => unsub();
  }, []);

  const handleStartRace = (mapId?: string, multiplayer = false, roomId = '') => {
    if (mapId) {
      setSelectedMapId(mapId);
    }
    setIsMultiplayer(multiplayer);
    setActiveRoomId(roomId);
    setScreen('race');
  };

  const handleBackToLobby = () => {
    setIsMultiplayer(false);
    setActiveRoomId('');
    setScreen('lobby');
  };

  const isNavScreen =
    screen === 'lobby' ||
    screen === 'modes' ||
    screen === 'friends' ||
    screen === 'party' ||
    screen === 'heroes' ||
    screen === 'shop';

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
            onStartGame={() => handleStartRace(selectedMapId, false)}
            onEnterLobby={() => setScreen('lobby')}
          />
        )}

        {screen === 'lobby' && (
          <LobbyScreen
            onStartRace={() => handleStartRace(selectedMapId, false)}
            onNavigate={(target) => setScreen(target)}
          />
        )}

        {screen === 'modes' && (
          <PlayModesScreen
            onStartRace={(mapId, mp, rId) => handleStartRace(mapId, mp, rId)}
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
            onStartRace={(mapId, mp, rId) => handleStartRace(mapId, mp, rId)}
          />
        )}

        {screen === 'heroes' && (
          <LockerScreen
            onNavigate={(target) => setScreen(target)}
          />
        )}

        {screen === 'shop' && (
          <ShopScreen
            onNavigate={(target) => setScreen(target)}
          />
        )}

        {screen === 'race' && (
          <GameView
            onBackToLobby={handleBackToLobby}
            mapId={selectedMapId}
            isMultiplayer={isMultiplayer}
            roomId={activeRoomId}
            displayName={authService.getCurrentUser()?.displayName || 'Pip'}
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
