// apps/mobile/src/components/MachineMap.tsx
//
// The machine map on the worker's Home screen, like the website's Machine map but
// made for a phone:
//   - small tabs for the floors (Floor 1, Floor 2 ...), with a dot on a floor that
//     has a machine that is down;
//   - the rows of the chosen floor, each with its machines as coloured seats;
//   - a legend with the four colours and their words;
//   - tapping a machine opens a small card to report it (or, if it is already
//     down, waiting or being fixed, to read what is happening).
// A short two-tone beep plays once every time a machine turns down.
// All the machine data is FAKE for now (see data/fakeMachineMap.ts) and a note
// says so at the bottom of the card.
// Owned by Rubaiya.

import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MapPinned } from 'lucide-react-native';
import { FAKE_FLOORS, useFakeMachineMap } from '../data/fakeMachineMap';
import type { MapMachine, MapStatus } from '../data/fakeMachineMap';
import { useLanguage } from '../language/LanguageContext';
import { localizeDigits } from '../language/format';
import { MAP_TEXT } from '../language/screenText';
import { COLORS as C, MAP_COLORS } from '../theme';
import { Card } from './Card';
import { MachineReportSheet } from './MachineReportSheet';
import { MachineSeat } from './MachineSeat';
import { mapStatusWord } from './mapStatus';
import { useDownSound } from './useDownSound';

const LEGEND: readonly MapStatus[] = ['ok', 'down', 'waiting', 'in_progress'];

export function MachineMap() {
  const { language } = useLanguage();
  const store = useFakeMachineMap();
  const playDownSound = useDownSound();
  const [floor, setFloor] = useState<number>(FAKE_FLOORS[0]);
  const [openId, setOpenId] = useState<string | null>(null);

  const downCount = store.machines.filter((machine) => machine.status === 'down').length;
  const openMachine = store.machines.find((machine) => machine.id === openId) ?? null;

  // the beep plays once every time MORE machines are down than before
  const previousDown = useRef(downCount);
  useEffect(() => {
    if (downCount > previousDown.current) playDownSound();
    previousDown.current = downCount;
  }, [downCount, playDownSound]);

  function floorHasDown(number: number) {
    return store.machines.some((machine) => machine.floor === number && machine.status === 'down');
  }

  function handleSend(machine: MapMachine, description: string) {
    store.reportDown(machine.id, description);
    setOpenId(null);
  }

  return (
    <Card>
      <View style={styles.titleRow}>
        <MapPinned color={C.mainButton} size={22} strokeWidth={1.8} />
        <Text style={styles.title} accessibilityRole="header">
          {MAP_TEXT.title[language]}
        </Text>
        <View
          style={[
            styles.summary,
            downCount > 0 ? { backgroundColor: MAP_COLORS.down.background } : styles.summaryOk,
          ]}
        >
          <Text
            style={[
              styles.summaryText,
              { color: downCount > 0 ? MAP_COLORS.down.text : MAP_COLORS.ok.text },
            ]}
          >
            {downCount > 0
              ? `${localizeDigits(String(downCount), language)}${language === 'en' ? ' ' : ''}${MAP_TEXT.downCount[language]}`
              : MAP_TEXT.noneDown[language]}
          </Text>
        </View>
      </View>

      {/* floor tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
        accessibilityRole="tablist"
      >
        {FAKE_FLOORS.map((number) => {
          const chosen = number === floor;
          return (
            <Pressable
              key={number}
              accessibilityRole="tab"
              accessibilityState={{ selected: chosen }}
              accessibilityHint={floorHasDown(number) ? MAP_TEXT.downOnFloor[language] : undefined}
              onPress={() => setFloor(number)}
              style={[styles.tab, chosen && styles.tabChosen]}
            >
              <Text style={[styles.tabText, chosen && styles.tabTextChosen]}>
                {MAP_TEXT.floor[language]} {localizeDigits(String(number), language)}
              </Text>
              {floorHasDown(number) && <View style={styles.tabDot} />}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* the rows of this floor */}
      <View style={styles.rows}>
        {store.rowsOfFloor(floor).map(({ row, machines }) => (
          <View key={row} style={styles.row}>
            <Text style={styles.rowLabel}>
              {MAP_TEXT.row[language]} {row}
            </Text>
            <View style={styles.seats}>
              {machines.map((machine) => (
                <MachineSeat
                  key={machine.id}
                  machine={machine}
                  selected={machine.id === openId}
                  onPress={() => setOpenId(machine.id)}
                />
              ))}
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.hint}>{MAP_TEXT.hint[language]}</Text>

      {/* the four colours and their words */}
      <View style={styles.legend}>
        {LEGEND.map((status) => (
          <View key={status} style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                {
                  backgroundColor: MAP_COLORS[status].background,
                  borderColor: MAP_COLORS[status].border,
                },
              ]}
            />
            <Text style={styles.legendText}>{mapStatusWord(status, language)}</Text>
          </View>
        ))}
      </View>

      {/* demo: pretend a machine stopped, so the glow and the beep can be tried */}
      <Pressable
        accessibilityRole="button"
        onPress={store.pretendMachineStops}
        style={styles.demoButton}
      >
        <Text style={styles.demoText}>{MAP_TEXT.demoButton[language]}</Text>
      </Pressable>
      <Text style={styles.demoNote}>{MAP_TEXT.demoNote[language]}</Text>

      <MachineReportSheet
        machine={openMachine}
        onClose={() => setOpenId(null)}
        onSend={handleSend}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  title: { flex: 1, color: C.text, fontSize: 19, fontWeight: '700' },
  summary: { borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 },
  summaryOk: {
    backgroundColor: MAP_COLORS.ok.background,
    borderWidth: 1,
    borderColor: MAP_COLORS.ok.border,
  },
  summaryText: { fontSize: 12, fontWeight: '700' },
  tabs: { gap: 8, paddingBottom: 4 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: MAP_COLORS.ok.background,
    borderWidth: 1,
    borderColor: MAP_COLORS.ok.border,
  },
  tabChosen: { backgroundColor: C.mainButton, borderColor: C.mainButtonBorder },
  tabText: { color: C.text, fontSize: 14, fontWeight: '600' },
  tabTextChosen: { color: C.mainButtonText },
  tabDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: MAP_COLORS.glow },
  rows: { gap: 14, marginTop: 14 },
  row: { gap: 6 },
  rowLabel: { color: C.softText, fontSize: 12, fontWeight: '700' },
  seats: { flexDirection: 'row', gap: 7 },
  hint: { color: C.softText, fontSize: 13, marginTop: 14 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 14, height: 14, borderRadius: 5, borderWidth: 1.5 },
  legendText: { color: C.text, fontSize: 12, fontWeight: '600' },
  demoButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginTop: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: C.cardStitch,
  },
  demoText: { color: C.softText, fontSize: 13, fontWeight: '600' },
  demoNote: { color: C.softText, fontSize: 12, marginTop: 2 },
});
