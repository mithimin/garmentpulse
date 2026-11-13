// apps/mobile/src/components/useDownSound.ts
//
// Gives you a function that plays the short two-tone alert beep (the sound a
// machine makes when it goes down). It also lets the beep play when the phone is
// on silent on an iPhone, because a stopped machine matters in a loud factory.
// If the sound cannot play for any reason, nothing breaks.
// Owned by Rubaiya.

import { useCallback, useEffect } from 'react';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { SOUNDS } from '../theme';

export function useDownSound() {
  const player = useAudioPlayer(SOUNDS.machineDown);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  return useCallback(() => {
    try {
      player.seekTo(0);
      player.play();
    } catch {
      // a beep that does not play must never stop the screen from working
    }
  }, [player]);
}
