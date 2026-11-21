// apps/mobile/src/components/FirstTimeGuide.tsx
//
// A short guide of three cards that appears ONCE, the first time a worker (or a
// technician) opens the app on this phone: what they will see, what to do, and how
// to follow it. They press "Next" three times (or "Skip"), and the phone remembers
// that it was shown, so it never comes back (the memory is kept on the phone, one
// for workers and one for technicians). If the memory cannot be read, the guide is
// simply not shown.
// Owned by Rubaiya.

import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bell, Eye, MapPin, Megaphone, MonitorSmartphone, Wrench } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useLanguage } from '../language/LanguageContext';
import { COMMON_TEXT } from '../language/screenText';
import { COLORS as C, SIZES } from '../theme';
import { Button } from './Button';

type Props = { role: 'worker' | 'technician' };

type Page = {
  Icon: LucideIcon;
  title: keyof typeof COMMON_TEXT;
  body: keyof typeof COMMON_TEXT;
};

const PAGES: Record<Props['role'], readonly Page[]> = {
  worker: [
    { Icon: MonitorSmartphone, title: 'workerTitle1', body: 'workerBody1' },
    { Icon: Megaphone, title: 'workerTitle2', body: 'workerBody2' },
    { Icon: Eye, title: 'workerTitle3', body: 'workerBody3' },
  ],
  technician: [
    { Icon: Bell, title: 'techTitle1', body: 'techBody1' },
    { Icon: MapPin, title: 'techTitle2', body: 'techBody2' },
    { Icon: Wrench, title: 'techTitle3', body: 'techBody3' },
  ],
};

export function FirstTimeGuide({ role }: Props) {
  const { language } = useLanguage();
  const storageKey = `garmentpulse.guideSeen.${role}`;
  // null = we have not looked yet; true = show the guide
  const [visible, setVisible] = useState<boolean | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(storageKey)
      .then((seen) => {
        if (!cancelled) setVisible(seen === null);
      })
      .catch(() => {
        if (!cancelled) setVisible(false);
      });
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  function finish() {
    setVisible(false);
    AsyncStorage.setItem(storageKey, 'yes').catch(() => {});
  }

  if (!visible) return null;

  const pages = PAGES[role];
  const current = pages[page];
  const isLast = page === pages.length - 1;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={finish}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <current.Icon color={C.mainButtonText} size={34} strokeWidth={1.8} />
          </View>
          <Text style={styles.title} accessibilityRole="header">
            {COMMON_TEXT[current.title][language]}
          </Text>
          <Text style={styles.body}>{COMMON_TEXT[current.body][language]}</Text>

          <View style={styles.dots}>
            {pages.map((_, index) => (
              <View key={index} style={[styles.dot, index === page && styles.dotChosen]} />
            ))}
          </View>

          <View style={styles.buttons}>
            <Button
              label={isLast ? COMMON_TEXT.guideDone[language] : COMMON_TEXT.guideNext[language]}
              onPress={() => (isLast ? finish() : setPage(page + 1))}
            />
            {!isLast && (
              <Button kind="second" label={COMMON_TEXT.guideSkip[language]} onPress={finish} />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(42,24,16,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.screenPadding + 8,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: C.card,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.mainButton,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  title: { color: C.text, fontSize: 22, fontWeight: '700', textAlign: 'center' },
  body: { color: C.softText, fontSize: 16, lineHeight: 24, textAlign: 'center' },
  dots: { flexDirection: 'row', gap: 8, marginVertical: 8 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: C.cardBorder },
  dotChosen: { backgroundColor: C.mainButton, width: 22 },
  buttons: { alignSelf: 'stretch', gap: 10 },
});
