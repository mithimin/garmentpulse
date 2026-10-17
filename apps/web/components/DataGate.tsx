'use client';

// apps/web/components/DataGate.tsx
//
// Stops a page from ever being blank while its data loads (design system
// section 12). Give it the result of `useBackendData` and it shows:
//   - "Loading..." until the first answer,
//   - a friendly error sentence with a "Try again" button if the call failed,
//   - otherwise it draws the page part you give it, with the data.
// Owned by Mithi.

import type { ReactNode } from 'react';
import { useLanguage } from '../language/LanguageContext';
import { errorSentence } from '../language/errorText';
import { ErrorMessage, LoadingMessage } from './StateMessage';

type DataState<T> = {
  data: T | null;
  error: unknown;
  loading: boolean;
  reload: () => Promise<void>;
};

export function DataGate<T>({
  state,
  children,
}: {
  state: DataState<T>;
  children: (data: T) => ReactNode;
}) {
  const { language } = useLanguage();
  if (state.error) {
    return (
      <ErrorMessage
        text={errorSentence(state.error, language)}
        onRetry={() => void state.reload()}
      />
    );
  }
  if (state.loading || state.data === null) return <LoadingMessage />;
  return <>{children(state.data)}</>;
}
