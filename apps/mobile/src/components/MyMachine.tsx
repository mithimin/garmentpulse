// apps/mobile/src/components/MyMachine.tsx
//
// The big picture of the worker's OWN machine on the Home screen (no card around
// it, just the picture on the cream page). The picture is a realistic sewing machine
// and it shows what is happening to the machine:
//   cream = OK, red = down (it glows and pulses), yellow = technician assigned,
//   yellow also while it is being fixed, then back to cream when it is repaired.
// Under the picture are the machine's name, where it stands (floor, row, seat) and a
// small label with the status WORD, so the colour is never alone.
// Owned by Rubaiya.

import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import type { Machine } from '@garmentpulse/shared';
import { useLanguage } from '../language/LanguageContext';
import { machineName } from '../language/localNames';
import { machinePlace } from '../language/machinePlace';
import { MY_MACHINE_TEXT } from '../language/screenText';
import { COLORS as C, SIZES } from '../theme';
import { LOGO_ART_HEIGHT, LOGO_ART_WIDTH } from './logoArtSvg';
import { MY_MACHINE_LOOKS } from './myMachineLooks';
import type { MyMachineLook } from './myMachineLooks';

type Props = {
  machine: Machine;
  look: MyMachineLook;
  /** One friendly sentence about what is happening, shown under the status word. */
  sentence: string;
  /** A small badge like "5 days running well", or null to show none. */
  streak: string | null;
};

export function MyMachine({ machine, look, sentence, streak }: Props) {
  const { language } = useLanguage();
  const { width: screenWidth } = useWindowDimensions();
  const looks = MY_MACHINE_LOOKS[look];
  const isDown = look === 'down';

  // the picture fills the screen, but never gets huge on a tablet
  const pictureWidth = Math.min(screenWidth - SIZES.screenPadding * 2, 380);
  const pictureHeight = (pictureWidth * LOGO_ART_HEIGHT) / LOGO_ART_WIDTH;

  // the glow of a machine that is down pulses slowly
  const pulse = useRef(new Animated.Value(0.25)).current;
  useEffect(() => {
    if (!isDown) {
      pulse.setValue(0.25);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.8,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.25,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isDown, pulse]);

  // A smooth blend between two looks (for example red to yellow) instead of a jump.
  const [previousLook, setPreviousLook] = useState<MyMachineLook | null>(null);
  const lastLook = useRef(look);
  const blend = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (lastLook.current === look) return;
    setPreviousLook(lastLook.current);
    lastLook.current = look;
    blend.setValue(0);
    Animated.timing(blend, {
      toValue: 1,
      duration: 700,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setPreviousLook(null);
    });
  }, [look, blend]);

  // The machine moves a little, so it feels alive (the whole picture moves, because
  // the drawing is one piece):
  //   OK = a very slow gentle float; down = a small shake, then a pause;
  //   technician assigned / fixing = a gentle rocking.
  // Nothing moves when the phone's "reduce motion" setting is on.
  const moveX = useRef(new Animated.Value(0)).current;
  const moveY = useRef(new Animated.Value(0)).current;
  const tilt = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    let cancelled = false;
    moveX.setValue(0);
    moveY.setValue(0);
    tilt.setValue(0);
    const to = (value: Animated.Value, target: number, duration: number) =>
      Animated.timing(value, {
        toValue: target,
        duration,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      });
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduce) => {
        if (cancelled || reduce) return;
        if (look === 'ok') {
          loop = Animated.loop(Animated.sequence([to(moveY, -4, 2200), to(moveY, 0, 2200)]));
        } else if (look === 'down') {
          loop = Animated.loop(
            Animated.sequence([
              to(moveX, -4, 60),
              to(moveX, 4, 90),
              to(moveX, -3, 80),
              to(moveX, 3, 80),
              to(moveX, 0, 60),
              Animated.delay(2400),
            ]),
          );
        } else {
          loop = Animated.loop(
            Animated.sequence([to(tilt, 1, 1100), to(tilt, -1, 2200), to(tilt, 0, 1100)]),
          );
        }
        loop.start();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      loop?.stop();
    };
  }, [look, moveX, moveY, tilt]);
  const tiltDegrees = tilt.interpolate({ inputRange: [-1, 1], outputRange: ['-1.5deg', '1.5deg'] });

  const where = machinePlace(machine, language);

  const word = looks.word(language);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{MY_MACHINE_TEXT.title[language]}</Text>

      <View
        style={[styles.stage, { width: pictureWidth, height: pictureHeight + 36 }]}
        accessible
        accessibilityLabel={`${machineName(machine, language)}, ${word}`}
      >
        {/* the soft glow behind the machine: it pulses when the machine is down */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glow,
            {
              width: pictureWidth * 0.86,
              height: pictureHeight * 0.86,
              borderRadius: pictureWidth,
              backgroundColor: looks.glow,
              opacity: isDown ? pulse : 0.35,
              shadowColor: looks.glow,
              shadowOpacity: isDown ? 0.9 : 0.4,
              shadowRadius: isDown ? 34 : 18,
            },
          ]}
        />
        <Animated.View
          style={{
            width: pictureWidth,
            height: pictureHeight,
            transform: [{ translateX: moveX }, { translateY: moveY }, { rotate: tiltDegrees }],
          }}
        >
          {/* when the look changes, the old colours fade out while the new ones fade in */}
          {previousLook && (
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                { opacity: blend.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) },
              ]}
            >
              <SvgXml
                xml={MY_MACHINE_LOOKS[previousLook].art}
                width={pictureWidth}
                height={pictureHeight}
              />
            </Animated.View>
          )}
          <Animated.View style={{ opacity: blend }}>
            <SvgXml xml={looks.art} width={pictureWidth} height={pictureHeight} />
          </Animated.View>
        </Animated.View>
      </View>

      <Text style={styles.name} numberOfLines={2}>
        {machineName(machine, language)}
        {machine.code ? `  ·  ${machine.code}` : ''}
      </Text>
      {where.length > 0 && <Text style={styles.where}>{where}</Text>}

      <View
        style={[
          styles.chip,
          { backgroundColor: looks.chipBackground, borderColor: looks.chipBorder },
        ]}
      >
        <Text style={[styles.chipText, { color: looks.chipText }]}>{word}</Text>
      </View>

      <Text style={styles.sentence}>{sentence}</Text>
      {streak ? (
        <View style={styles.streak}>
          <Text style={styles.streakText}>{streak}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 6 },
  title: { alignSelf: 'flex-start', color: C.softText, fontSize: 14, fontWeight: '700' },
  stage: { alignItems: 'center', justifyContent: 'center', paddingTop: 18 },
  glow: { position: 'absolute', top: 24, elevation: 0 },
  name: { color: C.text, fontSize: 20, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  where: { color: C.softText, fontSize: 14, textAlign: 'center' },
  chip: {
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 18,
  },
  chipText: { fontSize: 15, fontWeight: '700' },
  sentence: {
    color: C.text,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 8,
  },
  streak: {
    marginTop: 4,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 14,
    backgroundColor: '#E8F0DA',
    borderWidth: 1,
    borderColor: '#C9D8AE',
  },
  streakText: { color: '#3F5A1E', fontSize: 13, fontWeight: '700' },
});
