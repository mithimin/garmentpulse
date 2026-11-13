// apps/mobile/src/screens/LoginScreen.tsx
//
// The login screen. It follows Rubaiya's login picture:
//   - the soft factory photo fills the top, with the brown circle in the corner
//     and the language switch on it;
//   - the logo and the name "Garment" (brown) + "Pulse" (blue) sit under it,
//     with the tagline between two thin lines;
//   - one rounded cream card holds the Worker / Technician chooser, an email box
//     and a password box (each with a small icon, the password has a show/hide
//     eye), the brown Log in button, an "or" line, the sign-up link and a small
//     "Secure & Confidential" line;
//   - brown and blue cloth and a brown circle peek in at the bottom corners.
//
// What happens when the person presses "Log in":
//   1. We call the login and show "Loading…" while we wait.
//   2. If it works, we hand the person's profile to the app (`onLoggedIn`).
//   3. If it fails, we show a friendly sentence under the boxes. The sentence
//      comes from the error code, in the language currently chosen.
// Owned by Rubaiya.

import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { ChevronRight, Eye, EyeOff, Lock, LogIn, Mail, ShieldCheck } from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { ROLE_LABELS, getErrorCode } from '@garmentpulse/shared';
import type { Profile, Role } from '@garmentpulse/shared';
import { login } from '../auth/realAuth';
import { LanguageSwitch } from '../components/LanguageSwitch';
import { Logo } from '../components/Logo';
import { BottomDecoration } from '../components/BottomDecoration';
import { useLanguage } from '../language/LanguageContext';
import { ERROR_TEXT, LOGIN_TEXT } from '../language/screenText';
import { COLORS as C, PICTURES, SHARED_COLORS as S } from '../theme';

/** The two roles that may use the phone app. */
type ChoosableRole = Extract<Role, 'worker' | 'technician'>;
const CHOOSABLE_ROLES: readonly ChoosableRole[] = ['worker', 'technician'];

/** The cream of the login picture. The page uses it so the photo melts into the page. */
const LOGIN_CREAM = '#F9EBDF';
/** The soft blue of the sign-up link in the picture. */
const LOGIN_BLUE = '#5B94D3';
/** Size of the cut-out pictures (height / width), used to keep their shape on any phone. */
const TOP_SHAPE = 585 / 738;
const BOTTOM_SHAPE = 138 / 738;
/** The photo is never shorter than this. */
const MIN_HERO = 110;
/** Room needed under the photo for the logo, the card and the bottom cloth (in dp). */
const BELOW_HERO = 600;

type Props = {
  /** Called with the person's profile once login works. */
  onLoggedIn: (profile: Profile) => void;
  /** Called when the person taps the link to the sign-up screen. */
  onGoToSignUp: () => void;
};

export function LoginScreen({ onLoggedIn, onGoToSignUp }: Props) {
  const { language } = useLanguage();
  const { width, height } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      const profile = await login(email, password);
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

  // The photo shrinks on shorter phones, so the whole login box fits on the screen
  // without scrolling. It is cropped (not squashed), keeping the top part.
  const fullHeroHeight = width * TOP_SHAPE;
  const heroHeight = Math.min(fullHeroHeight, Math.max(MIN_HERO, height - BELOW_HERO));
  const fadeHeight = Math.min(110, heroHeight * 0.45);

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View>
          {/* The factory picture. Its lower edge melts into the cream page. */}
          <View style={{ height: heroHeight, overflow: 'hidden' }}>
            <Image
              source={PICTURES.loginTop}
              style={{
                position: 'absolute',
                top: -(fullHeroHeight - heroHeight) * 0.4,
                width,
                height: fullHeroHeight,
              }}
              resizeMode="cover"
            />
            <Svg style={styles.fade} width={width} height={fadeHeight} pointerEvents="none">
              <Defs>
                <LinearGradient id="melt" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={LOGIN_CREAM} stopOpacity="0" />
                  <Stop offset="1" stopColor={LOGIN_CREAM} stopOpacity="1" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width={width} height={fadeHeight} fill="url(#melt)" />
            </Svg>
            <View style={styles.switch}>
              <LanguageSwitch tone="onLight" />
            </View>
          </View>

          {/* Logo, name and tagline */}
          <View style={styles.brand}>
            <Logo size={64} />
            <Text style={styles.name} accessibilityRole="header">
              <Text style={styles.nameFirst}>{LOGIN_TEXT.appNameFirst[language]}</Text>
              <Text style={styles.nameSecond}>{LOGIN_TEXT.appNameSecond[language]}</Text>
            </Text>
            <View style={styles.taglineRow}>
              <View style={styles.taglineLine} />
              <Text style={styles.tagline}>{LOGIN_TEXT.tagline[language]}</Text>
              <View style={styles.taglineLine} />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>{LOGIN_TEXT.loginButton[language]}</Text>

            {/* Worker / Technician chooser. The chosen one is filled in with brown. */}
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

            <View style={styles.field}>
              <Mail color={C.mainButton} size={22} strokeWidth={1.8} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder={LOGIN_TEXT.emailLabel[language]}
                placeholderTextColor={S.inputHint}
                accessibilityLabel={LOGIN_TEXT.emailLabel[language]}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                editable={!loading}
              />
            </View>

            <View style={styles.field}>
              <Lock color={C.mainButton} size={22} strokeWidth={1.8} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder={LOGIN_TEXT.passwordLabel[language]}
                placeholderTextColor={S.inputHint}
                accessibilityLabel={LOGIN_TEXT.passwordLabel[language]}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                textContentType="password"
                editable={!loading}
                onSubmitEditing={handleLogin}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword
                    ? LOGIN_TEXT.hidePassword[language]
                    : LOGIN_TEXT.showPassword[language]
                }
                hitSlop={10}
                onPress={() => setShowPassword((shown) => !shown)}
              >
                {showPassword ? (
                  <Eye color={C.softText} size={22} strokeWidth={1.8} />
                ) : (
                  <EyeOff color={C.softText} size={22} strokeWidth={1.8} />
                )}
              </Pressable>
            </View>

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
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
            >
              <LogIn color={C.mainButtonText} size={22} strokeWidth={1.8} />
              <Text style={styles.buttonText}>
                {loading ? LOGIN_TEXT.loading[language] : LOGIN_TEXT.loginButton[language]}
              </Text>
            </Pressable>

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>{LOGIN_TEXT.or[language]}</Text>
              <View style={styles.orLine} />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>{LOGIN_TEXT.noAccount[language]}</Text>
              <Pressable
                accessibilityRole="link"
                onPress={onGoToSignUp}
                disabled={loading}
                style={styles.switchLinkRow}
              >
                <Text style={styles.switchLink}>{LOGIN_TEXT.goToSignUp[language]}</Text>
                <ChevronRight color={LOGIN_BLUE} size={18} strokeWidth={2} />
              </Pressable>
            </View>

            <View style={styles.secureRow}>
              <ShieldCheck color={C.mainButton} size={18} strokeWidth={2} />
              <Text style={styles.secureText}>{LOGIN_TEXT.secure[language]}</Text>
            </View>
          </View>
        </View>

        {/* Brown and blue cloth, a brown circle and a thread spool with a needle in the bottom-left corner. */}
        <View>
          <Image
            source={PICTURES.loginBottom}
            style={{ width, height: width * BOTTOM_SHAPE }}
            resizeMode="cover"
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
          <View pointerEvents="none" style={styles.threads}>
            <BottomDecoration width={width} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: LOGIN_CREAM },
  // The cloth picture is pushed to the bottom of the screen when the screen is tall.
  content: { flexGrow: 1, justifyContent: 'space-between' },
  threads: { position: 'absolute', left: 0, bottom: 0 },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  switch: { position: 'absolute', top: 44, right: 16 },
  brand: { alignItems: 'center', marginTop: -30, paddingHorizontal: 24 },
  name: { fontSize: 38, fontWeight: '700', marginTop: 4, textAlign: 'center' },
  nameFirst: { color: C.mainButton },
  nameSecond: { color: '#6FA8E8' },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
    marginBottom: 16,
  },
  taglineLine: { flex: 1, height: 1, backgroundColor: '#D9C6B6' },
  tagline: { color: C.text, fontSize: 16, textAlign: 'center' },
  card: {
    marginHorizontal: 36,
    backgroundColor: '#FBF3EB',
    borderColor: '#F1E3D6',
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    shadowColor: C.bar,
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  title: { color: C.text, fontSize: 21, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  roleButton: {
    flex: 1,
    height: 42,
    backgroundColor: '#FCF6F0',
    borderColor: '#EAD9CC',
    borderWidth: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleButtonChosen: { backgroundColor: C.mainButton, borderColor: C.mainButtonBorder },
  roleText: { color: C.text, fontSize: 16, fontWeight: '600' },
  roleTextChosen: { color: C.mainButtonText },
  field: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FCF6F0',
    borderColor: '#EAD9CC',
    borderWidth: 1,
    borderRadius: 999,
    marginBottom: 10,
  },
  input: { flex: 1, height: '100%', fontSize: 15, color: C.text },
  errorBox: {
    backgroundColor: S.errorBackground,
    borderColor: S.errorBorder,
    borderWidth: 1,
    borderRadius: 20,
    padding: 12,
    marginBottom: 14,
  },
  errorText: { color: S.errorText, fontSize: 15, lineHeight: 24 },
  button: {
    height: 50,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: C.mainButton,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonPressed: { opacity: 0.85 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: C.mainButtonText, fontSize: 16, fontWeight: '600' },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 12, marginBottom: 2 },
  orLine: { flex: 1, height: 1, backgroundColor: '#D9C6B6' },
  orText: { color: C.text, fontSize: 15 },
  switchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
  },
  switchText: { color: C.text, fontSize: 15 },
  switchLinkRow: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
  switchLink: { color: LOGIN_BLUE, fontSize: 15, fontWeight: '600' },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  secureText: { color: C.softText, fontSize: 13 },
});
