'use client';

// apps/web/components/PartLimitsCard.tsx
//
// The owner's "Limit for each part" box, shown on the Repair costs page in FAKE
// mode only. It is folded: open it, pick a part from the list, type one new limit
// and press Save. A part up to its limit is approved by itself, a bigger one waits
// for the owner, and a part with no limit waits too. The limits are kept in this
// page's memory only (demo), because the server has one single limit so far. Sakib
// must add per-part limits before this can be saved for real. Owned by Mithi.

import { useState } from 'react';
import type { FormEvent } from 'react';
import { englishDigits, formatTaka } from '../language/format';
import { useLanguage } from '../language/LanguageContext';
import { screenText } from '../language/screenText';
import { Button } from './Button';
import { Card } from './Card';
import { Field, TextInput } from './Field';

type PartKey = 'needles' | 'motorBelt' | 'heatingPlate' | 'heatingWire' | 'other';
type PartLabel =
  'partNeedles' | 'partMotorBelt' | 'partHeatingPlate' | 'partHeatingWire' | 'partOther';

const PARTS: { key: PartKey; label: PartLabel; start: number }[] = [
  { key: 'needles', label: 'partNeedles', start: 500 },
  { key: 'motorBelt', label: 'partMotorBelt', start: 1500 },
  { key: 'heatingPlate', label: 'partHeatingPlate', start: 3000 },
  { key: 'heatingWire', label: 'partHeatingWire', start: 800 },
  { key: 'other', label: 'partOther', start: 0 },
];

/** The typed text as an amount, or null when it is not a valid limit. */
function parseLimit(text: string): number | null {
  const plain = englishDigits(text).replace(/[,\s]/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(plain)) return null;
  return Number(plain);
}

export function PartLimitsCard() {
  const { language } = useLanguage();
  const [limits, setLimits] = useState<Record<PartKey, number>>(
    () => Object.fromEntries(PARTS.map((p) => [p.key, p.start])) as Record<PartKey, number>,
  );
  const [chosen, setChosen] = useState<PartKey>('needles');
  const [text, setText] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [saved, setSaved] = useState(false);

  const current = limits[chosen];

  function save(event: FormEvent) {
    event.preventDefault();
    const amount = parseLimit(text);
    if (amount === null) {
      setInvalid(true);
      setSaved(false);
      return;
    }
    setLimits((all) => ({ ...all, [chosen]: amount }));
    setText('');
    setInvalid(false);
    setSaved(true);
  }

  return (
    <Card className="card-list limit-card part-limit-card">
      <details className="part-limit-fold">
        <summary>
          <h2>{screenText('partLimitsTitle', language)}</h2>
        </summary>
        <p className="limit-help">{screenText('partLimitsHelp', language)}</p>
        <p className="limit-help">{screenText('partLimitsDemo', language)}</p>

        <form className="part-limit-form" onSubmit={save} noValidate>
          <label className="field-label" htmlFor="part-limit-choice">
            {screenText('partChoose', language)}
          </label>
          <select
            id="part-limit-choice"
            className="input"
            value={chosen}
            onChange={(event) => {
              setChosen(event.target.value as PartKey);
              setSaved(false);
            }}
          >
            {PARTS.map((part) => (
              <option key={part.key} value={part.key}>
                {screenText(part.label, language)}
              </option>
            ))}
          </select>
          <p className="limit-help">
            {current === 0
              ? screenText('limitNone', language)
              : screenText('limitNow', language).replace('{amount}', formatTaka(current, language))}
          </p>

          <Field
            label={screenText('limitInputLabel', language)}
            error={invalid ? screenText('limitInvalid', language) : undefined}
          >
            {(id) => (
              <TextInput
                id={id}
                inputMode="decimal"
                autoComplete="off"
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  setInvalid(false);
                  setSaved(false);
                }}
              />
            )}
          </Field>
          <Button type="submit" kind="main" disabled={text.trim() === ''}>
            {screenText('partLimitSave', language)}
          </Button>
          {saved ? (
            <p className="limit-saved" role="status">
              {screenText('limitSaved', language)}
            </p>
          ) : null}
        </form>
      </details>
    </Card>
  );
}
