// apps/mobile/src/components/LanguageSwitch.tsx
//
// The small button in the top-right corner that flips the app between English
// and Bangla. It shows `EN · বাং` with the chosen language in bold, in a
// rounded box like the website's "EN" button.
//   tone="onBar"   (default): for the brown bar (light letters).
//   tone="onLight": for cream screens such as login (brown letters).
// It is 36 px tall with extra invisible tap space, so the tappable area is
// at least 44 px.
// Owned by Rubaiya.

import { Pressable, StyleSheet, Text } from 'react-native';
import { useLanguage } from '../language/LanguageContext';

type Props = { tone?: 'onBar' | 'onLight' };

export function LanguageSwitch({ tone = 'onBar' }: Props) {
  const { language, setLanguage } = useLanguage();
  const next = language === 'en' ? 'bn' : 'en';
  const light = tone === 'onLight';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={language === 'en' ? 'Change language to Bangla' : 'ভাষা ইংরেজি করুন'}
      hitSlop={4}
      onPress={() => setLanguage(next)}
      style={[styles.pill, light ? styles.pillLight : styles.pillBar]}
    >
      <Text style={[styles.part, light ? styles.partLight : styles.partBar]}>
        <Text
          style={language === 'en' ? (light ? styles.chosenLight : styles.chosenBar) : undefined}
        >
          EN
        </Text>
        {' · '}
        <Text
          style={language === 'bn' ? (light ? styles.chosenLight : styles.chosenBar) : undefined}
        >
          বাং
        </Text>
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 36,
    minWidth: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  pillBar: { borderColor: 'rgba(255,255,255,0.35)', backgroundColor: '#6F4C3C' },
  pillLight: { borderColor: '#D8C6AF', backgroundColor: 'rgba(248,238,227,0.9)' },
  part: { fontSize: 13 },
  partBar: { color: '#CDB89E' },
  partLight: { color: '#8D7868' },
  chosenBar: { color: '#FFFFFF', fontWeight: '700' },
  chosenLight: { color: '#392417', fontWeight: '700' },
});
