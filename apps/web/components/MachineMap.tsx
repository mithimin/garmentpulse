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
//   - Click a machine that glows burgundy (down) to put it in "Your selection" (the box on the side). The
//     "Assign technician" button there opens the same Assign pop-up as the Dashboard
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

import { HardHat, UserRound, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Report, Technician } from '@garmentpulse/shared';
import { STATUS_LABELS } from '@garmentpulse/shared';
import { addFakeReport } from '../data/fakeStore';
import { groupFloors, rowLetter } from '../data/machineSeats';
import type { Seat, SeatState } from '../data/machineSeats';
import { backendIsReal } from '../lib/backend';
import { useLanguage } from '../language/LanguageContext';
import { formatDateTime, localizeDigits } from '../language/format';
import { machineName, personName } from '../language/localNames';
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

  // On a narrow screen "Your selection" sits BELOW the map, out of sight. After a machine is
  // chosen, scroll to it. On a wide screen (both side by side) the page stays where it is.
  const sideRef = useRef<HTMLElement | null>(null);
  function showSelection() {
    requestAnimationFrame(() => {
      const stacked = window.matchMedia('(max-width: 1000px)').matches;
      const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      sideRef.current?.scrollIntoView({
        behavior: calm ? 'auto' : 'smooth',
        block: stacked ? 'start' : 'nearest',
      });
    });
  }

  function clickSeat(seat: Seat) {
    setHint('');
    if (seat.state === 'down') {
      const wasSelected = selectedIds.includes(seat.machine.id);
      setSelectedIds((ids) =>
        ids.includes(seat.machine.id)
          ? ids.filter((id) => id !== seat.machine.id)
          : [...ids, seat.machine.id],
      );
      if (!wasSelected) showSelection();
    } else if (seat.report) {
      setViewing(seat.report);
    } else {
      showSelection();
      setHint(
        screenText('runningHint', language).replace(
          '{machine}',
          `${seat.code} · ${machineName(seat.machine, language)}`,
        ),
      );
    }
  }

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
    <div className="map-layout">
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
          <p className="map-floor-now" aria-live="polite">
            <strong>{screenText('floorNow', language).replace('{n}', num(floorIndex + 1))}:</strong>{' '}
            <span>
              {screenText('seatDown', language)} {num(floorDown)}
            </span>
            <span>
              {screenText('chipBusy', language)} {num(floorBusy)}
            </span>
            <span>
              {screenText('seatRunning', language)} {num(floorRunning)}
            </span>
          </p>
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

      <aside ref={sideRef} className="map-side" aria-label={screenText('selectionTitle', language)}>
        <Card>
          <div className="map-side-head">
            <UserRound className="map-side-icon" size={30} strokeWidth={2.2} aria-hidden="true" />
            <h2 className="map-side-title">{screenText('selectionTitle', language)}</h2>
            <span className="map-head-line" aria-hidden="true" />
          </div>
          {selectedSeats.length === 0 ? (
            <p className="map-empty">{screenText('selectionEmpty', language)}</p>
          ) : (
            <ul className="map-selected">
              {selectedSeats.map((seat) => (
                <li key={seat.machine.id}>
                  <div>
                    <strong>
                      {seat.code} · {machineName(seat.machine, language)}
                    </strong>
                    {seat.report ? (
                      <small>
                        {seat.report.description} · {personName(seat.report.reported_by, language)}{' '}
                        · {formatDateTime(seat.report.created_at, language)}
                      </small>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="map-remove"
                    aria-label={screenText('removeSelected', language).replace(
                      '{machine}',
                      seat.code,
                    )}
                    onClick={() =>
                      setSelectedIds((ids) => ids.filter((id) => id !== seat.machine.id))
                    }
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="map-total">
            <span>{screenText('selectionCount', language)}</span>
            <strong>{num(selectedSeats.length)}</strong>
          </p>
          <Button
            kind="main"
            disabled={!first?.report}
            onClick={() => first?.report && setAssigning(first.report)}
          >
            <HardHat size={22} strokeWidth={2} aria-hidden="true" />
            {screenText('assignSelected', language)}
          </Button>
          {selectedSeats.length > 1 ? (
            <p className="map-note">{screenText('selectionQueueNote', language)}</p>
          ) : null}
          {hint ? <p className="map-note">{hint}</p> : null}
        </Card>
      </aside>

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
