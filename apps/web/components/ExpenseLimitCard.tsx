'use client';

// apps/web/components/ExpenseLimitCard.tsx
//
// The owner's box at the top of the Repair costs page: it shows the expense limit
// and lets the owner change it. A cost up to the limit is approved by itself; a
// bigger one waits for the owner (docs/api-contract.md 4.8). Before any limit is
// set, every cost waits. Bangla digits and commas may be typed. Owned by Mithi.

import { useState } from 'react';
import type { FormEvent } from 'react';
import { MAX_EXPENSE_AMOUNT } from '@garmentpulse/shared';
import { setExpenseLimit, useExpenseLimit } from '../data/useExpenseData';
import { useLanguage } from '../language/LanguageContext';
import { errorSentence } from '../language/errorText';
import { englishDigits, formatTaka } from '../language/format';
import { screenText } from '../language/screenText';
import { Button } from './Button';
import { Card } from './Card';
import { DataGate } from './DataGate';
import { Field, TextInput } from './Field';

/** The typed text as an amount, or null when it is not an allowed limit. */
function parseAmount(text: string): number | null {
  const plain = englishDigits(text).replace(/[,\s]/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(plain)) return null;
  const amount = Number(plain);
  return amount <= MAX_EXPENSE_AMOUNT ? amount : null;
}

export function ExpenseLimitCard() {
  const { language } = useLanguage();
  const limit = useExpenseLimit();
  const [text, setText] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [problem, setProblem] = useState<unknown>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaved(false);
    setProblem(null);
    const amount = parseAmount(text);
    if (amount === null) {
      setInvalid(true);
      return;
    }
    setBusy(true);
    try {
      await setExpenseLimit(amount);
      await limit.reload();
      setText('');
      setSaved(true);
    } catch (error) {
      setProblem(error);
    }
    setBusy(false);
  }

  return (
    <Card className="card-list limit-card">
      <h2>{screenText('limitTitle', language)}</h2>
      <DataGate state={limit}>
        {(current) => (
          <>
            <p className="limit-now">
              {current.amount === null
                ? screenText('limitNone', language)
                : screenText('limitNow', language).replace(
                    '{amount}',
                    formatTaka(current.amount, language),
                  )}
            </p>
            <p className="limit-help">{screenText('limitHelp', language)}</p>
            <form className="limit-form" onSubmit={(event) => void save(event)} noValidate>
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
              <Button type="submit" kind="main" disabled={busy || text.trim() === ''}>
                {screenText(busy ? 'saving' : 'limitSave', language)}
              </Button>
            </form>
            {saved ? (
              <p className="limit-saved" role="status">
                {screenText('limitSaved', language)}
              </p>
            ) : null}
            {problem ? (
              <p className="field-error" role="alert">
                {errorSentence(problem, language)}
              </p>
            ) : null}
          </>
        )}
      </DataGate>
    </Card>
  );
}
