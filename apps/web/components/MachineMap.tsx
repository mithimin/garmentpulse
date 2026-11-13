'use client';

// apps/web/components/MachineMap.tsx
//
// The MACHINE MAP: every machine on the floor is a small sewing machine on a "seat plan",
// like choosing seats on a cinema or bus ticket website.
//   - Each machine is a rounded SEAT with a small sewing machine and its code (the look of
//     the factory-look draft, see app/factory.css). A machine that is running is a cream
//     seat. A machine that is DOWN (broken, waiting for a technician) is a brown seat with a
//     pulsing white-cream halo, and the page BEEPS when a new one appears (live, thanks to the
//     Realtime updates). A dashed stitched rim = technician assigned. A baby-blue seat = the
//     technician is working on it. A selected seat gets a baby-blue ring.
//   - Filter chips on top (All, Down, Running, Technician busy) fade the other seats.
//   - Click a machine that glows burgundy (down) to select it. A small floating glass card then
//     appears right BESIDE that machine (on its other side when there is no room on the right)
//     with a short count and the "Assign technician" button, so the map itself uses the full
//     width of the page (there is no side box any more). If the machine is not on the floor
//     that is showing, or there is no room beside it (a phone), the same card floats at the bottom
//     of the screen instead. The button opens the same Assign pop-up as the Dashboard
//     (components/AssignDialog.tsx), so the free / busy rules and errors are the same.
//     A technician takes one job at a time, so with several machines selected the first
//     one gets the technician and the others stay in the queue.
//   - Click any other machine to open its report (read-only), or see that it is running.
// The seat logic is in data/machineSeats.ts. The beep needs one click on the page first,
// because browsers keep pages silent until the person has used them.
// FLOORS: the machines are grouped into floors of 3 rows with 5 machines each (see
// data/machineSeats.ts). A row of tabs (Floor 1, Floor 2, ...) chooses the floor to show.
// Every tab carries a live number: how many machines are DOWN on that floor (a tick when
// none), and a line under the tabs says what is happening on the chosen floor right now
// (down, technician busy, running). The Dashboard and the Machines page show the same map.
// The chips, the "machines are down" line and the beep always count ALL machines of ALL floors.
// Only in fake mode (no backend keys) there is a "Demo" button that pretends a worker
// reported a machine, so the alarm can be shown without a phone.
// Owned by Mithi.

import { HardHat, Volume2, VolumeX, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Report, Technician } from '@garmentpulse/shared';
import { STATUS_LABELS } from '@garmentpulse/shared';
import { addFakeReport } from '../data/fakeStore';
import { groupFloors, rowLetter } from '../data/machineSeats';
import type { Seat, SeatState } from '../data/machineSeats';
import { backendIsReal } from '../lib/backend';
import { useLanguage } from '../language/LanguageContext';
import { localizeDigits } from '../language/format';
import { machineName } from '../language/localNames';
import { screenText } from '../language/screenText';
import type { ScreenTextKey } from '../language/screenText';
import { AssignDialog } from './AssignDialog';
import { Button } from './Button';
import { Card } from './Card';
import { ReportDetailsDialog } from './ReportDetailsDialog';

type Filter = 'all' | 'down' | 'running' | 'busy';
const FILTERS: Filter[] = ['all', 'down', 'running', 'busy'];

const CHIP_TEXT: Record<Exclude<Filter, 'all'>, ScreenTextKey> = {
  down: 'seatDown',
  running: 'seatRunning',
  busy: 'chipBusy',
};

/** The small mark on a scope. Always paired with a word (tooltip, legend), never colour alone. */
const SEAT_BADGE: Record<SeatState, string> = {
  running: '',
  assigned: 'T',
  progress: '···',
  down: '!',
};

/** The small sewing machine on a seat: the drawing cut out of the draft picture
 * (public/factory-icon-machine.png), painted in the seat's text colour by factory.css. */
function MiniMachine() {
  return <span aria-hidden="true" className="seat-machine" />;
}

/** Two short beeps, high then low, twice. Silent if the browser has no audio. */
function playAlarm(context: AudioContext) {
  [0, 0.26, 0.6, 0.86].forEach((delay, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + delay;
    oscillator.type = 'square';
    oscillator.frequency.value = index % 2 ? 740 : 920;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.1, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.2);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.22);
  });
}

type MachineMapProps = {
  seats: readonly Seat[];
  technicians: readonly Technician[];
  /** Asks the page to reload its lists (after an assign, or after the demo report). */
  onChanged: () => void;
  /** A heading for the card (white on a denim strip). The Machines page has its own page title, so it leaves this out. */
  title?: string;
};

export function MachineMap({ seats, technicians, onChanged, title }: MachineMapProps) {
  const { language } = useLanguage();
  const [filter, setFilter] = useState<Filter>('all');
  const [floorNumber, setFloorNumber] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [assigning, setAssigning] = useState<Report | null>(null);
  const [viewing, setViewing] = useState<Report | null>(null);
  const [hint, setHint] = useState('');
  // The machine the floating card is next to, and where that card goes (set after drawing).
  const [anchorId, setAnchorId] = useState<string | null>(null);
  const [pop, setPop] = useState<{
    top: number;
    left?: number;
    right?: number;
    side: 'right' | 'left';
  } | null>(null);
  const layoutRef = useRef<HTMLDivElement | null>(null);
  const [soundOn, setSoundOn] = useState(true);

  const num = (n: number) => localizeDigits(String(n), language);
  const stateWord = (state: SeatState) =>
    state === 'progress'
      ? STATUS_LABELS.in_progress[language]
      : screenText(
          state === 'running' ? 'seatRunning' : state === 'down' ? 'seatDown' : 'seatAssigned',
          language,
        );

  const downSeats = seats.filter((s) => s.state === 'down');
  const selectedSeats = downSeats.filter((s) => selectedIds.includes(s.machine.id));
  const count = (f: Filter) =>
    f === 'all'
      ? seats.length
      : f === 'down'
        ? downSeats.length
        : f === 'running'
          ? seats.filter((s) => s.state === 'running').length
          : seats.filter((s) => s.state === 'assigned' || s.state === 'progress').length;
  const matches = (seat: Seat) =>
    filter === 'all' ||
    (filter === 'down' && seat.state === 'down') ||
    (filter === 'running' && seat.state === 'running') ||
    (filter === 'busy' && (seat.state === 'assigned' || seat.state === 'progress'));

  // Beep when a machine goes down that was not down before. The first load stays quiet.
  const audioRef = useRef<AudioContext | null>(null);
  const knownDown = useRef<Set<string> | null>(null);
  const downKey = downSeats.map((s) => s.machine.id).join('|');
  useEffect(() => {
    const now = new Set(downKey ? downKey.split('|') : []);
    const before = knownDown.current;
    knownDown.current = now;
    if (!before || !soundOn) return;
    if (![...now].some((id) => !before.has(id))) return;
    try {
      audioRef.current ??= new AudioContext();
      playAlarm(audioRef.current);
    } catch {
      // Sound is a bonus: a browser that blocks it just stays silent.
    }
  }, [downKey, soundOn]);

  function clickSeat(seat: Seat) {
    setHint('');
    if (seat.state === 'down') {
      const already = selectedIds.includes(seat.machine.id);
      const next = already
        ? selectedIds.filter((id) => id !== seat.machine.id)
        : [...selectedIds, seat.machine.id];
      setSelectedIds(next);
      // The card goes next to the machine just chosen (or the last one still chosen).
      setAnchorId(already ? (next[next.length - 1] ?? null) : seat.machine.id);
    } else if (seat.report) {
      setViewing(seat.report);
    } else {
      setAnchorId(seat.machine.id);
      setHint(
        screenText('runningHint', language).replace(
          '{machine}',
          `${seat.code} · ${machineName(seat.machine, language)}`,
        ),
      );
    }
  }

  // Works out where the floating card goes: just beside its machine, on the right when there is
  // room and on the left when there is not. If the machine is not on the floor that is showing, there
  // is no spot, and the card floats at the bottom of the screen instead.
  useLayoutEffect(() => {
    function place(next: typeof pop) {
      // Only change the state when the spot really moved, so drawing never loops.
      setPop((prev) =>
        prev === next ||
        (prev &&
          next &&
          prev.top === next.top &&
          prev.left === next.left &&
          prev.right === next.right &&
          prev.side === next.side)
          ? prev
          : next,
      );
    }
    function measure() {
      const layout = layoutRef.current;
      const seat = anchorId
        ? layout?.querySelector<HTMLElement>(`[data-machine-id="${anchorId}"]`)
        : null;
      if (!layout || !seat) {
        place(null);
        return;
      }
      const l = layout.getBoundingClientRect();
      const r = seat.getBoundingClientRect();
      // The small card is about 270px wide; the card with a message is wider.
      const POP_WIDTH = selectedIds.length > 0 ? 280 : 400;
      const top = Math.round(r.top - l.top + r.height / 2);
      if (r.right + 14 + POP_WIDTH <= l.right) {
        place({ top, left: Math.round(r.right - l.left + 14), side: 'right' });
      } else if (r.left - 14 - POP_WIDTH >= l.left) {
        place({ top, right: Math.round(l.right - r.left + 14), side: 'left' });
      } else {
        // No room on either side (a phone): the card floats at the bottom of the screen instead.
        place(null);
      }
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  });

  // The floors: floor 1 first, 3 rows of 5 seats each. A floor that no longer exists is never chosen.
  const floors = groupFloors(seats);
  const floorIndex = Math.min(floorNumber, floors.length) - 1;
  const shownRows: Seat[][] = floors[floorIndex] ?? [];
  const floorSeats = shownRows.flat();
  const floorDown = floorSeats.filter((s) => s.state === 'down').length;
  const floorBusy = floorSeats.filter(
    (s) => s.state === 'assigned' || s.state === 'progress',
  ).length;
  const floorRunning = floorSeats.filter((s) => s.state === 'running').length;
  const first = selectedSeats[0];

  return (
    <div className="map-layout" ref={layoutRef}>
      <Card className="map-card">
        <div className={title ? 'card-head map-banner' : 'card-head'}>
          {title ? (
            <>
              <span className="map-pin" aria-hidden="true" />
              <h2 className="map-title">{title}</h2>
              <span className="map-head-line" aria-hidden="true" />
            </>
          ) : null}
          <p
            className={downSeats.length === 0 ? 'map-down-line map-down-none' : 'map-down-line'}
            aria-live="polite"
          >
            {downSeats.length === 0
              ? screenText('downCountNone', language)
              : downSeats.length === 1
                ? screenText('downCountOne', language)
                : screenText('downCountMany', language).replace('{n}', num(downSeats.length))}
          </p>
        </div>

        <div className="map-tools">
          <div className="map-chips" role="group" aria-label={screenText('filterName', language)}>
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className="map-chip"
                aria-pressed={f === filter}
                onClick={() => setFilter(f)}
              >
                {f === 'all'
                  ? screenText('filterAll', language)
                  : screenText(CHIP_TEXT[f], language)}
                <b>{num(count(f))}</b>
              </button>
            ))}
          </div>
          <div className="map-buttons">
            <Button small aria-pressed={soundOn} onClick={() => setSoundOn((on) => !on)}>
              {screenText(soundOn ? 'soundOn' : 'soundOff', language)}
              {soundOn ? (
                <Volume2 size={18} aria-hidden="true" />
              ) : (
                <VolumeX size={18} aria-hidden="true" />
              )}
            </Button>
            {!backendIsReal ? (
              <Button
                small
                onClick={() => {
                  if (addFakeReport()) onChanged();
                }}
              >
                {screenText('demoReport', language)}
              </Button>
            ) : null}
          </div>
        </div>

        {floors.length > 1 ? (
          <div
            className="map-floors"
            role="group"
            aria-label={screenText('floorName', language).replace('{n}', '')}
          >
            {floors.map((floorRows, i) => {
              const downHere = floorRows.flat().filter((s) => s.state === 'down').length;
              return (
                <button
                  key={i}
                  type="button"
                  className="map-chip floor-tab"
                  aria-pressed={i === floorIndex}
                  onClick={() => setFloorNumber(i + 1)}
                >
                  {screenText('floorName', language).replace('{n}', num(i + 1))}
                  <b className={downHere > 0 ? 'floor-badge floor-badge-down' : 'floor-badge'}>
                    {downHere > 0 ? `${num(downHere)} ${screenText('seatDown', language)}` : '✓'}
                  </b>
                </button>
              );
            })}
          </div>
        ) : null}
        {floors.length > 1 ? (
          <div className="map-floor-now" aria-live="polite">
            <p className="floor-now-title">
              {screenText('floorNow', language).replace('{n}', num(floorIndex + 1))}
            </p>
            <div className="floor-now-stats">
              <div className="floor-stat floor-stat-down">
                <b>{num(floorDown)}</b>
                <span>{screenText('seatDown', language)}</span>
              </div>
              <div className="floor-stat floor-stat-busy">
                <b>{num(floorBusy)}</b>
                <span>{screenText('chipBusy', language)}</span>
              </div>
              <div className="floor-stat floor-stat-run">
                <b>{num(floorRunning)}</b>
                <span>{screenText('seatRunning', language)}</span>
              </div>
            </div>
          </div>
        ) : null}

        <div className="map-desk">{screenText('deskLabel', language)}</div>
        <div className="map-scroll">
          <div className="map-rows">
            {shownRows.map((row, r) => (
              <div className="map-row" key={rowLetter(r)}>
                <span className="map-row-letter">{rowLetter(r)}</span>
                {row.map((seat, k) => {
                  const selected = selectedIds.includes(seat.machine.id) && seat.state === 'down';
                  const classes = [
                    'seat',
                    `seat-${seat.state}`,
                    selected ? 'seat-selected' : '',
                    matches(seat) ? '' : 'seat-faded',
                  ]
                    .filter(Boolean)
                    .join(' ');
                  return (
                    <span className="map-seat-wrap" key={seat.machine.id}>
                      {k === 3 ? <span className="map-aisle" aria-hidden="true" /> : null}
                      <button
                        type="button"
                        className={classes}
                        data-machine-id={seat.machine.id}
                        aria-pressed={seat.state === 'down' ? selected : undefined}
                        aria-label={`${seat.code}, ${machineName(seat.machine, language)}, ${stateWord(seat.state)}`}
                        title={`${seat.code} · ${stateWord(seat.state)}`}
                        onClick={() => clickSeat(seat)}
                      >
                        <span className="scope">
                          <MiniMachine />
                          <span className="seat-label">{seat.code}</span>
                        </span>
                        <span className="seat-badge" aria-hidden="true">
                          {selected ? '✓' : SEAT_BADGE[seat.state]}
                        </span>
                      </button>
                    </span>
                  );
                })}
                <span className="map-row-letter">{rowLetter(r)}</span>
              </div>
            ))}
          </div>
        </div>

        <ul className="map-legend">
          {(['running', 'down', 'assigned', 'progress'] as const).map((state) => (
            <li key={state}>
              <i className={`legend-seat seat-${state}`} aria-hidden="true" />
              {stateWord(state)}
            </li>
          ))}
          <li>
            <i className="legend-seat seat-selected" aria-hidden="true" />
            {screenText('seatSelected', language)}
          </li>
        </ul>
      </Card>

      {selectedSeats.length > 0 || hint ? (
        <div
          className={[
            'assign-bar',
            pop ? `assign-pop assign-pop-${pop.side}` : '',
            selectedSeats.length === 0 ? 'assign-note' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={pop ? { top: pop.top, left: pop.left, right: pop.right } : undefined}
          role="region"
          aria-live="polite"
        >
          {selectedSeats.length > 0 ? (
            <>
              <div className="assign-bar-text">
                <strong>
                  {screenText('selectionCount', language)}: {num(selectedSeats.length)}
                </strong>
                <small>
                  {first ? `${first.code} · ${machineName(first.machine, language)}` : ''}
                  {selectedSeats.length > 1
                    ? ` · ${screenText('selectionQueueNote', language)}`
                    : ''}
                </small>
              </div>
              <Button
                kind="main"
                disabled={!first?.report}
                onClick={() => first?.report && setAssigning(first.report)}
              >
                <HardHat size={22} strokeWidth={2} aria-hidden="true" />
                {screenText('assignSelected', language)}
                {selectedSeats.length > 1 ? (
                  <span className="assign-count">{num(selectedSeats.length)}</span>
                ) : null}
              </Button>
              <button
                type="button"
                className="assign-bar-close"
                aria-label={screenText('removeSelected', language).replace(
                  '{machine}',
                  first?.code ?? '',
                )}
                onClick={() => {
                  setSelectedIds([]);
                  setHint('');
                  setAnchorId(null);
                }}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <div className="assign-bar-text">
                <small>{hint}</small>
              </div>
              <button
                type="button"
                className="assign-bar-close"
                aria-label="OK"
                onClick={() => {
                  setHint('');
                  setAnchorId(null);
                }}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      ) : null}

      {assigning ? (
        <AssignDialog
          report={assigning}
          technicians={technicians}
          onClose={() => setAssigning(null)}
          onAssigned={onChanged}
        />
      ) : null}
      {viewing ? <ReportDetailsDialog report={viewing} onClose={() => setViewing(null)} /> : null}
    </div>
  );
}
