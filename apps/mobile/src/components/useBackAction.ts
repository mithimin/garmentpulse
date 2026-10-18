// apps/mobile/src/components/useBackAction.ts
//
// Makes the Android phone's own "back" button do the same thing as the back arrow
// in our top bar. Without this, pressing it would close the whole app.
//
// How it works: the screen tells us what "going back" means right now (`goBack`),
// or gives nothing when there is nowhere to go back to (the first screen). While
// `goBack` exists we take over the phone's back button and run it. When it is
// empty we let the phone do its normal thing.
// (iPhones have no such button, so this does nothing there.)
// Owned by Rubaiya.

import { useEffect } from 'react';
import { BackHandler } from 'react-native';

export function useBackAction(goBack: (() => void) | undefined) {
  useEffect(() => {
    if (!goBack) return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      goBack();
      // `true` means "we handled it, do not close the app".
      return true;
    });
    return () => subscription.remove();
  }, [goBack]);
}
