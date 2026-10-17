// apps/mobile/src/screens/LoginScreen.tsx
//
// The login screen: a dark blue top bar with the language switch in the corner,
// and one card with the logo, a Worker / Technician chooser, an email box, a
// password box and one Main button.
// It uses the "manager blue" colours because nobody has a role yet
// (design system section 10.1).
//
// What happens when the person presses "Log in":
//   1. We call the (fake) login and show "Loading…" while we wait.
//   2. If it works, we hand the person's profile to the app (`onLoggedIn`).
//   3. If it fails, we show a friendly sentence under the boxes. The sentence
//      comes from the error code, in the language currently chosen.
// Owned by Rubaiya.

import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ROLE_LABELS, getErrorCode } from '@garmentpulse/shared';
import type { Profile, Role } from '@garmentpulse/shared';
import { fakeLogin } from '../auth/fakeAuth';
import { LanguageSwitch } from '../components/LanguageSwitch';
import { Logo } from '../components/Logo';
import { useLanguage } from '../language/LanguageContext';
import { ERROR_TEXT, LOGIN_TEXT } from '../language/screenText';
import { LOGIN_COLORS as C, SHARED_COLORS as S, SIZES } from '../theme';

/** The two roles that may use the phone app. */
type ChoosableRole = Extract<Role, 'worker' | 'technician'>;
const CHOOSABLE_ROLES: readonly ChoosableRole[] = ['worker', 'technician'];

type Props = {
  /** Called with the person's profile once login works. */
  onLoggedIn: (profile: Profile) => void;
};

export function LoginScreen({ onLoggedIn }: Props) {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // We keep the error CODE (not the sentence), so the sentence follows the
  // language if the person flips the switch after seeing the error.
  const [errorCode, setErrorCode] = useState<ReturnType<typeof getErrorCode> | null>(null);
  // Which kind of person is logging in. Workers are the most common, so it starts there.
  const [chosenRole, setChosenRole] = useState<ChoosableRole>('worker');
  // True when the account's real role is different from the button the person chose.
  const [roleMismatch, setRoleMismatch] = useState(false);

  async function handleLogin() {
    if (loading) return;
    setErrorCode(null);
    setRoleMismatch(false);
    setLoading(true);
    try {
      const profile = await fakeLogin(email, password);
      if (profile.role !== chosenRole) {
        // The account exists but is the other role. Do not log in; ask them to choose again.
        setRoleMismatch(true);
        setLoading(false);
        return;
      }
      onLoggedIn(profile);
    } catch (error) {
      setErrorCode(getErrorCode(error));
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top bar: logo name on the left, language switch on the right. */}
      <View style={styles.bar}>
        <Text style={styles.barTitle}>{LOGIN_TEXT.appName[language]}</Text>
        <LanguageSwitch />
        <View style={styles.barStitch} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {/* The stitch line: a dashed box drawn just inside the card edge. */}
          <View pointerEvents="none" style={styles.cardStitch} />

          <View style={styles.logo}>
            <Logo size={72} />
          </View>
          <Text style={styles.title}>{LOGIN_TEXT.appName[language]}</Text>
          <Text style={styles.tagline}>{LOGIN_TEXT.tagline[language]}</Text>

          {/* Worker / Technician chooser. The chosen one is filled in with the main colour. */}
          <Text style={styles.label}>{LOGIN_TEXT.roleLabel[language]}</Text>
          <View style={styles.roleRow} accessibilityRole="radiogroup">
            {CHOOSABLE_ROLES.map((role) => {
              const chosen = role === chosenRole;
              return (
                <Pressable
                  key={role}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: chosen }}
                  disabled={loading}
                  onPress={() => setChosenRole(role)}
                  style={[styles.roleButton, chosen && styles.roleButtonChosen]}
                >
                  <Text style={[styles.roleText, chosen && styles.roleTextChosen]}>
                    {ROLE_LABELS[role][language]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>{LOGIN_TEXT.emailLabel[language]}</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder={LOGIN_TEXT.emailHint[language]}
            placeholderTextColor={S.inputHint}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            editable={!loading}
          />

          <Text style={styles.label}>{LOGIN_TEXT.passwordLabel[language]}</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder={LOGIN_TEXT.passwordHint[language]}
            placeholderTextColor={S.inputHint}
            secureTextEntry
            autoCapitalize="none"
            textContentType="password"
            editable={!loading}
            onSubmitEditing={handleLogin}
          />

          {(errorCode || roleMismatch) && (
            <View style={styles.errorBox} accessibilityRole="alert">
              <Text style={styles.errorText}>
                {errorCode ? ERROR_TEXT[errorCode][language] : LOGIN_TEXT.roleMismatch[language]}
              </Text>
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            onPress={handleLogin}
            disabled={loading}
            style={[styles.button, loading && styles.buttonDisabled]}
          >
            <View pointerEvents="none" style={styles.buttonStitch} />
            <Text style={styles.buttonText}>
              {loading ? LOGIN_TEXT.loading[language] : LOGIN_TEXT.loginButton[language]}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  barStitch: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 4,
    borderBottomWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: C.barStitch,
  },
  content: { flexGrow: 1, justifyContent: 'center', padding: SIZES.screenPadding },
  card: {
    backgroundColor: C.card,
    borderColor: C.cardBorder,
    borderWidth: 1,
    borderRadius: SIZES.cardRadius,
    padding: SIZES.cardPadding,
  },
  cardStitch: {
    position: 'absolute',
    top: 7,
    left: 7,
    right: 7,
    bottom: 7,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: C.cardStitch,
    borderRadius: SIZES.cardRadius - 5,
  },
  logo: { alignSelf: 'center' },
  title: {
    color: C.text,
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
  },
  tagline: { color: C.softText, fontSize: 15, textAlign: 'center', marginBottom: 24 },
  label: { color: C.text, fontSize: 13, fontWeight: '600', marginBottom: 4 },
  roleRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  roleButton: {
    flex: 1,
    height: SIZES.buttonHeight,
    backgroundColor: '#F7F9FB',
    borderColor: S.inputBorder,
    borderWidth: 1,
    borderRadius: SIZES.buttonRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleButtonChosen: { backgroundColor: C.mainButton, borderColor: C.mainButtonBorder },
  roleText: { color: C.text, fontSize: 16, fontWeight: '600' },
  roleTextChosen: { color: C.mainButtonText },
  input: {
    height: SIZES.inputHeight,
    backgroundColor: S.white,
    borderColor: S.inputBorder,
    borderWidth: 1,
    borderRadius: SIZES.inputRadius,
    paddingHorizontal: 12,
    fontSize: 15,
    color: C.text,
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: S.errorBackground,
    borderColor: S.errorBorder,
    borderWidth: 1,
    borderRadius: SIZES.inputRadius,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: S.errorText, fontSize: 15, lineHeight: 24 },
  button: {
    height: SIZES.buttonHeight,
    backgroundColor: C.mainButton,
    borderColor: C.mainButtonBorder,
    borderWidth: 1,
    borderRadius: SIZES.buttonRadius,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonStitch: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.45)',
    borderRadius: SIZES.buttonRadius - 4,
  },
  buttonText: { color: C.mainButtonText, fontSize: 16, fontWeight: '600' },
});
