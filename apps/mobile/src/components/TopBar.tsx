// apps/mobile/src/components/TopBar.tsx
//
// The dark blue bar at the top of every screen after login. First row: the app
// name on the left (or a back arrow on inner screens) and the language switch
// in the top-right corner. Second row: the title of the current page.
// A dashed gold "stitch line" runs along the bottom edge (design system 9.5).
// Owned by Rubaiya.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { LanguageSwitch } from './LanguageSwitch';
import { useLanguage } from '../language/LanguageContext';
import { LOGIN_TEXT, WORKER_TEXT } from '../language/screenText';
import { COLORS as C, SIZES } from '../theme';

type Props = {
  /** The title of the page, shown under the first row. */
  title: string;
  /** When given, a back arrow is shown instead of the app name. */
  onBack?: () => void;
};

export function TopBar({ title, onBack }: Props) {
  const { language } = useLanguage();
  return (
    <View style={styles.bar}>
      <View style={styles.row}>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={WORKER_TEXT.back[language]}
            onPress={onBack}
            style={styles.back}
          >
            <ChevronLeft color={C.mainButtonText} size={24} strokeWidth={1.8} />
          </Pressable>
        ) : (
          <Text style={styles.appName}>{LOGIN_TEXT.appName[language]}</Text>
        )}
        <LanguageSwitch />
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <View pointerEvents="none" style={styles.stitch} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: C.bar,
    paddingHorizontal: SIZES.screenPadding,
    paddingTop: 48,
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: SIZES.minTap,
  },
  appName: { color: C.barText, fontSize: 15, fontWeight: '600' },
  back: {
    width: SIZES.minTap,
    height: SIZES.minTap,
    marginLeft: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: C.mainButtonText, fontSize: 28, fontWeight: '600', marginTop: 4 },
  stitch: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 4,
    borderBottomWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: C.barStitch,
  },
});
