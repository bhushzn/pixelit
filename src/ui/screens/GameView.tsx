import React, { useEffect, useRef, useState, useCallback } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '../../game/config/gameConfig';
import { RaceScene } from '../../game/scenes/RaceScene';
import { RaceUpdateEvent } from '../../game/systems/RaceManager';
import { RaceStats } from '../../types/game';
import { getMapById } from '../../game/maps/mapRegistry';
import { GameHUD } from '../components/GameHUD';
import { MobileTouchHUD, TouchInputState } from '../components/MobileTouchHUD';
import { ResultsModal } from '../components/ResultsModal';
import { networkClient } from '../../services/networking/NetworkClient';

interface GameViewProps {
  onBackToLobby: () => void;
  mapId?: string;
  isMultiplayer?: boolean;
  roomId?: string;
  displayName?: string;
}

export const GameView: React.FC<GameViewProps> = ({
  onBackToLobby,
  mapId = 'cloud_climb',
  isMultiplayer = false,
  roomId = '',
  displayName = 'Pip',
}) => {
  const activeMap = getMapById(mapId);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<RaceScene | null>(null);

  // HUD State
  const [hudData, setHudData] = useState<RaceUpdateEvent>({
    timeMs: 0,
    coins: 0,
    checkpointReached: false,
    showCheckpointToast: false,
    progressPercent: 0,
    position: 1,
    totalRacers: isMultiplayer ? (networkClient.currentRoom?.playerCount || 2) : 1,
    state: 'READY',
  });

  // Race Finished & Results Modal State
  const [finishedStats, setFinishedStats] = useState<RaceStats | null>(null);

  // Mobile Touch Detection (Desktop must NOT show touch controls)
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [touchInput, setTouchInput] = useState<TouchInputState>({
    left: false,
    right: false,
    jump: false,
    dash: false,
    usePowerUp: false,
  });

  // Detect Touch / Mobile Screen
  useEffect(() => {
    const checkMobile = () => {
      const isDesktop = window.matchMedia('(pointer: fine) and (hover: hover)').matches;
      if (isDesktop) {
        setIsMobile(false);
        return;
      }
      const isCoarse = window.matchMedia('(pointer: coarse)').matches;
      const isHoverNone = window.matchMedia('(hover: none)').matches;
      const hasTouchPoints = navigator.maxTouchPoints > 0;
      setIsMobile(isCoarse || (isHoverNone && hasTouchPoints));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const onTouchStart = () => {
      setIsMobile(true);
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('touchstart', onTouchStart);
    };
  }, []);

  // Update touch input in Phaser scene
  const handleTouchInputChange = useCallback((newInput: TouchInputState) => {
    setTouchInput(newInput);
    if (sceneRef.current) {
      sceneRef.current.setExternalInput(newInput);
    }
  }, []);

  // Initialize Phaser Game
  useEffect(() => {
    if (!containerRef.current) return;

    const config = createGameConfig(containerRef.current, {
      mapId,
      isMultiplayer,
      roomId,
      displayName,
    });
    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Listen for scene ready
    const handleSceneReady = () => {
      const raceScene = game.scene.getScene('RaceScene') as RaceScene;
      if (raceScene) {
        sceneRef.current = raceScene;

        // Hook up Race Manager updates
        if (raceScene.raceManager) {
          raceScene.raceManager.onUpdate((data) => {
            if (isMultiplayer && networkClient.currentRoom) {
              data.totalRacers = Math.max(networkClient.currentRoom.playerCount, data.totalRacers);
            }
            setHudData(data);
          });
        }

        // Hook up Race finish event
        raceScene.events.on('race_finished', (stats: RaceStats) => {
          setFinishedStats(stats);
        });
      }
    };

    // Give time for Phaser scenes to boot
    const timer = setInterval(() => {
      if (game.scene.isActive('RaceScene')) {
        handleSceneReady();
        clearInterval(timer);
      }
    }, 100);

    return () => {
      clearInterval(timer);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        sceneRef.current = null;
      }
    };
  }, [mapId, isMultiplayer, roomId, displayName]);

  const handleRestart = () => {
    setFinishedStats(null);
    setHudData({
      timeMs: 0,
      coins: 0,
      checkpointReached: false,
      showCheckpointToast: false,
      progressPercent: 0,
      position: 1,
      totalRacers: isMultiplayer ? (networkClient.currentRoom?.playerCount || 2) : 1,
      state: 'READY',
    });

    if (sceneRef.current) {
      const scene = sceneRef.current;
      scene.events.once(Phaser.Scenes.Events.CREATE, () => {
        if (scene.raceManager) {
          scene.raceManager.onUpdate((data) => {
            setHudData(data);
          });
        }
        scene.events.on('race_finished', (stats: RaceStats) => {
          setFinishedStats(stats);
        });
      });
      scene.scene.restart({ mapId, isMultiplayer, roomId, displayName });
    }
  };

  const handleExit = () => {
    if (isMultiplayer && networkClient.isConnected) {
      networkClient.send({ type: 'LEAVE_ROOM' });
    }
    onBackToLobby();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#c9e6ff] flex items-center justify-center select-none">
      {/* Phaser Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center overflow-hidden"
      />

      {/* Stitch Race HUD */}
      <GameHUD
        hudData={hudData}
        mapTitle={activeMap.name}
        onExit={handleExit}
        onRestart={handleRestart}
      />

      {/* Mobile Touch Controls Overlay (strictly hidden on Desktop) */}
      {isMobile && (
        <MobileTouchHUD
          onInputChange={handleTouchInputChange}
          inputState={touchInput}
        />
      )}

      {/* Victory / Finish Modal */}
      {finishedStats && (
        <ResultsModal
          stats={finishedStats}
          mapTitle={activeMap.name}
          mapSubtitle={activeMap.subtitle}
          onPlayAgain={handleRestart}
          onBackToLobby={handleExit}
        />
      )}
    </div>
  );
};
