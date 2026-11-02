'use client';

// apps/web/components/MachineMap.tsx
//
// The MACHINE MAP: every machine on the floor is a small sewing machine on a "seat plan",
// like choosing seats on a cinema or bus ticket website.
//   - Green seat = running. Red seat = broken, waiting for a technician: it FLASHES and
//     the page BEEPS when a new one appears (live, thanks to the Realtime updates).
//     Amber = technician assigned. Blue = the technician is working on it.
//   - Filter chips on top (All, Down, Running, Technician busy) fade the other seats.
//   - Click a red machine to put it in "Your selection" (the box on the side). The
//     "Assign technician" button there opens the same Assign pop-up as the Dashboard
//     (components/AssignDialog.tsx), so the free / busy rules and errors are the same.
//     A technician takes one job at a time, so with several machines selected the first
//     one gets the technician and the others stay in the queue.
//   - Click any other machine to open its report (read-only), or see that it is running.
// The seat logic is in data/machineSeats.ts. The beep needs one click on the page first,
// because browsers keep pages silent until the person has used them.
// Only in fake mode (no backend keys) there is a "Demo" button that pretends a worker
// reported a machine, so the alarm can be shown without a phone.
// Owned by Mithi.

import { useEffect, useRef, useState } from 'react';
import type { Report, Technician } from '@garmentpulse/shared';
import { STATUS_LABELS } from '@garmentpulse/shared';
import { addFakeReport } from '../data/fakeStore';
import { rowLetter, SEATS_PER_ROW } from '../data/machineSeats';
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

/** A tiny sewing machine (base, arm, needle, hand wheel, thread spool), drawn in the seat colour. */
function MiniMachine() {
  return (
    <svg viewBox="0 0 40 30" aria-hidden="true" className="seat-machine">
      <rect x="2" y="25" width="36" height="4" rx="1.5" />
      <path d="M6 25 V13 Q6 7 12 7 H29 Q35 7 35 13 V19 H30 V13 H14 V25 Z" />
      <rect x="29.5" y="19" width="2" height="6" />
      <circle cx="36" cy="9" r="3" />
      <rect x="9" y="2" width="6" height="4" rx="1.5" />
    </svg>
  );
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

  const rows: Seat[][] = [];
  for (let i = 0; i < seats.length; i += SEATS_PER_ROW)
    rows.push(seats.slice(i, i + SEATS_PER_ROW));
  const first = selectedSeats[0];

  return (
    <div className="map-layout">
      <Card className="map-card">
        <div className={title ? 'card-head map-banner' : 'card-head'}>
          {title ? <h2 className="map-title">{title}</h2> : null}
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

        <div className="map-desk">{screenText('deskLabel', language)}</div>
        <div className="map-scroll">
          <div className="map-rows">
            {rows.map((row, r) => (
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
                        <MiniMachine />
                        <span className="seat-label">{seat.label}</span>
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
          <h2 className="map-side-title">{screenText('selectionTitle', language)}</h2>
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
