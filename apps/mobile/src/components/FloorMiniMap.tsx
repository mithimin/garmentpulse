// apps/mobile/src/components/FloorMiniMap.tsx
//
// A tiny picture of one factory floor for the technician, so the broken machine is
// easy to find: a grid of seats (rows A, B, C ... and places 1, 2, 3 ...) where all
// the machines are plain cream and only the machine of this job glows red with its
// seat name on it. It is worked out from the machine's floor and seat (like "B3"),
// so nothing new is needed from the backend. If the machine has no seat, nothing is
// drawn. The floor has at least 3 rows of 5 places (the test factory), and grows if
// the seat is outside that.
// Owned by Rubaiya.

import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../language/LanguageContext';
import { localizeDigits } from '../language/format';
import { MAP_TEXT } from '../language/screenText';
import { COLORS as C, MAP_COLORS } from '../theme';

type Props = {
  floor?: number | null;
  /** The seat, a row letter and a place number, like "B3". */
  seat?: string | null;
};

const MIN_ROWS = 3;
const MIN_PLACES = 5;

export function FloorMiniMap({ floor, seat }: Props) {
  const { language } = useLanguage();
  const match = seat ? /^([A-Z])(\d{1,2})$/.exec(seat) : null;
  if (!match) return null;

  const rowIndex = match[1].charCodeAt(0) - 65;
  const place = Number.parseInt(match[2], 10);
  const rows = Math.max(MIN_ROWS, rowIndex + 1);
  const places = Math.max(MIN_PLACES, place);

  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityLabel={`${MAP_TEXT.floor[language]} ${floor ?? ''}, ${seat}`}
    >
      {floor != null && (
        <Text style={styles.title}>
          {MAP_TEXT.floor[language]} {localizeDigits(String(floor), language)}
        </Text>
      )}
      {Array.from({ length: rows }, (_, row) => (
        <View key={row} style={styles.row}>
          <Text style={styles.rowLetter}>{String.fromCharCode(65 + row)}</Text>
          {Array.from({ length: places }, (_, index) => {
            const here = row === rowIndex && index + 1 === place;
            return (
              <View key={index} style={[styles.seat, here && styles.seatHere]}>
                {here && (
                  <Text style={styles.seatName}>{localizeDigits(seat ?? '', language)}</Text>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 14, gap: 6 },
  title: { color: C.softText, fontSize: 13, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowLetter: { width: 14, color: C.softText, fontSize: 12, fontWeight: '700' },
  seat: {
    flex: 1,
    height: 30,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: MAP_COLORS.ok.border,
    backgroundColor: MAP_COLORS.ok.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatHere: {
    backgroundColor: '#C23B2E',
    borderColor: '#8F2A20',
    shadowColor: '#E0483A',
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  seatName: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
});
