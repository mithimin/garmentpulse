// apps/mobile/src/screens/HomePlaceholderScreen.tsx
//
// A temporary screen shown after a successful login. It only says who is logged
// in (name and role) and has a "Log out" button. It will be replaced by the real
// worker screens (step 2) and technician screens (step 3).
// Owned by Rubaiya.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ROLE_LABELS } from '@garmentpulse/shared';
import type { Profile } from '@garmentpulse/shared';
import { LanguageSwitch } from '../components/LanguageSwitch';
import { useLanguage } from '../language/LanguageContext';
import { HOME_TEXT, LOGIN_TEXT } from '../language/screenText';
import { COLORS as C, SIZES } from '../theme';

type Props = {
  profile: Profile;
  onLogout: () => void;
};

export function HomePlaceholderScreen({ profile, onLogout }: Props) {
  const { language } = useLanguage();

  return (
    <View style={styles.page}>
      <View style={styles.bar}>
        <Text style={styles.barTitle}>{LOGIN_TEXT.appName[language]}</Text>
        <LanguageSwitch />
      </View>

      <View style={styles.content}>
        <Text style={styles.small}>{HOME_TEXT.signedInAs[language]}</Text>
        <Text style={styles.name}>{profile.display_name}</Text>
        <Text style={styles.role}>{ROLE_LABELS[profile.role][language]}</Text>
        <Text style={styles.small}>{HOME_TEXT.comingSoon[language]}</Text>

        <Pressable accessibilityRole="button" onPress={onLogout} style={styles.button}>
          <Text style={styles.buttonText}>{HOME_TEXT.logoutButton[language]}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.page },
  bar: {
    backgroundColor: C.bar,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.screenPadding,
    paddingTop: 48,
    paddingBottom: 16,
  },
  barTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  content: { padding: SIZES.screenPadding, gap: 8 },
  small: { color: C.softText, fontSize: 15 },
  name: { color: C.text, fontSize: 24, fontWeight: '600' },
  role: { color: C.text, fontSize: 18 },
  // The "second" button look: near-white with a thin border (design system 9.1).
  button: {
    height: SIZES.buttonHeight,
    backgroundColor: '#F7F9FB',
    borderColor: '#AEB9C8',
    borderWidth: 1,
    borderRadius: SIZES.buttonRadius,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonText: { color: C.text, fontSize: 16, fontWeight: '600' },
});
