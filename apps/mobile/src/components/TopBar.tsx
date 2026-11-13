// apps/mobile/src/components/TopBar.tsx
//
// The chocolate-brown bar at the top of every screen after login, like the
// website's top bar. First row: the logo tile and app name on the left (or a
// rounded back button on inner screens) and the language switch in the
// top-right corner. Second row: the title of the current page.
// The bottom corners are rounded so the bar looks like a soft cloth fold.
// Owned by Rubaiya.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { LanguageSwitch } from './LanguageSwitch';
import { LogoTile } from './Logo';
import { useLanguage } from '../language/LanguageContext';
import { LOGIN_TEXT, WORKER_TEXT } from '../language/screenText';
import { COLORS as C, SIZES } from '../theme';

type Props = {
  /** The title of the page, shown under the first row. */
  title: string;
  /** When given, a back button is shown instead of the logo. */
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
          <View style={styles.brand}>
            <LogoTile size={44} />
            <Text style={styles.appName}>{LOGIN_TEXT.appName[language]}</Text>
          </View>
        )}
        <LanguageSwitch />
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: C.bar,
    paddingHorizontal: SIZES.screenPadding,
    paddingTop: 44,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    zIndex: 2,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: SIZES.minTap,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  appName: { color: C.barText, fontSize: 17, fontWeight: '600' },
  back: {
    width: SIZES.minTap,
    height: SIZES.minTap,
    borderRadius: 14,
    backgroundColor: '#6F4C3C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: C.mainButtonText, fontSize: 28, fontWeight: '600', marginTop: 10 },
});
