// apps/mobile/src/screens/SignUpScreen.tsx
//
// The sign-up screen for new workers and technicians. It looks like the login
// screen (same blue top bar, language switch and stitched card) and has four
// boxes: full name, email, password and invite code.
//
// An "I am a" Worker / Technician chooser sits at the top, like on the login
// screen. The invite code still decides the real role (docs/api-contract.md 4.7);
// the chooser is only checked against it. If they differ, we stop before any
// account is made and say which button to press.
//
// What happens when the person presses "Sign up":
//   1. We call `signUp` and show "Loading…" while we wait.
//   2. If it works, the person is already logged in, so we hand their profile
//      to the app (`onSignedUp`) and the worker or technician screens open.
//   3. If it fails, we show a friendly sentence under the boxes. We keep the
//      error CODE, so the sentence follows the language switch.
// The Android back button goes back to the login screen.
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
import { ROLE_LABELS, getApiErrorCode } from '@garmentpulse/shared';
import type { ApiErrorCode, Profile, Role } from '@garmentpulse/shared';
import { RoleMismatchError, signUp } from '../auth/realAuth';
import { LanguageSwitch } from '../components/LanguageSwitch';
import { Logo } from '../components/Logo';
import { useBackAction } from '../components/useBackAction';
import { useLanguage } from '../language/LanguageContext';
import {
  ERROR_TEXT,
  LOGIN_TEXT,
  SIGNUP_ERROR_TEXT,
  SIGNUP_TEXT,
  codeIsFor,
} from '../language/screenText';
import { COLORS as C, SHARED_COLORS as S, SIZES } from '../theme';

/** The two roles that may use the phone app. */
type ChoosableRole = Extract<Role, 'worker' | 'technician'>;
const CHOOSABLE_ROLES: readonly ChoosableRole[] = ['worker', 'technician'];

type Props = {
  /** Called with the new person's profile once sign-up works (they are logged in). */
  onSignedUp: (profile: Profile) => void;
  /** Called when the person wants to go back to the login screen. */
  onGoToLogin: () => void;
};

export function SignUpScreen({ onSignedUp, onGoToLogin }: Props) {
  const { language } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorCode, setErrorCode] = useState<ApiErrorCode | null>(null);
  // Which kind of person is signing up. Workers are the most common, so it starts there.
  const [chosenRole, setChosenRole] = useState<ChoosableRole>('worker');
  // Set when the code is for the other role; holds the code's role for the sentence.
  const [codeRole, setCodeRole] = useState<Role | null>(null);

  useBackAction(onGoToLogin);

  async function handleSignUp() {
    if (loading) return;
    setErrorCode(null);
    setCodeRole(null);
    setLoading(true);
    try {
      onSignedUp(await signUp({ fullName, email, password, code, chosenRole }));
    } catch (error) {
      if (error instanceof RoleMismatchError) {
        setCodeRole(error.codeRole);
      } else {
        setErrorCode(getApiErrorCode(error));
      }
      setLoading(false);
    }
  }

  // A sign-up sentence if we have one, otherwise the general one for that code.
  const errorWords = errorCode
    ? (SIGNUP_ERROR_TEXT[errorCode] ??
      (errorCode in ERROR_TEXT
        ? ERROR_TEXT[errorCode as keyof typeof ERROR_TEXT]
        : ERROR_TEXT.UNKNOWN))
    : codeRole
      ? codeIsFor(codeRole)
      : null;

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.bar}>
        <Text style={styles.barTitle}>{LOGIN_TEXT.appName[language]}</Text>
        <LanguageSwitch />
        <View style={styles.barStitch} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View pointerEvents="none" style={styles.cardStitch} />

          <View style={styles.logo}>
            <Logo size={56} />
          </View>
          <Text style={styles.title}>{SIGNUP_TEXT.title[language]}</Text>
          <Text style={styles.intro}>{SIGNUP_TEXT.intro[language]}</Text>

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

          <Text style={styles.label}>{SIGNUP_TEXT.nameLabel[language]}</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder={SIGNUP_TEXT.nameHint[language]}
            placeholderTextColor={S.inputHint}
            autoCapitalize="words"
            textContentType="name"
            maxLength={100}
            editable={!loading}
          />

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
            placeholder={SIGNUP_TEXT.passwordHint[language]}
            placeholderTextColor={S.inputHint}
            secureTextEntry
            autoCapitalize="none"
            textContentType="newPassword"
            editable={!loading}
          />

          <Text style={styles.label}>{SIGNUP_TEXT.codeLabel[language]}</Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder={SIGNUP_TEXT.codeHint[language]}
            placeholderTextColor={S.inputHint}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!loading}
            onSubmitEditing={handleSignUp}
          />

          {errorWords && (
            <View style={styles.errorBox} accessibilityRole="alert">
              <Text style={styles.errorText}>{errorWords[language]}</Text>
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            onPress={handleSignUp}
            disabled={loading}
            style={[styles.button, loading && styles.buttonDisabled]}
          >
            <View pointerEvents="none" style={styles.buttonStitch} />
            <Text style={styles.buttonText}>
              {loading ? LOGIN_TEXT.loading[language] : SIGNUP_TEXT.signUpButton[language]}
            </Text>
          </Pressable>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>{SIGNUP_TEXT.haveAccount[language]}</Text>
            <Pressable accessibilityRole="link" onPress={onGoToLogin} disabled={loading}>
              <Text style={styles.switchLink}>{SIGNUP_TEXT.goToLogin[language]}</Text>
            </Pressable>
          </View>
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
    fontSize: 26,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  intro: {
    color: C.softText,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
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
  switchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    minHeight: SIZES.buttonHeight,
    marginTop: 8,
  },
  switchText: { color: C.softText, fontSize: 15 },
  switchLink: { color: C.mainButton, fontSize: 15, fontWeight: '600' },
});
