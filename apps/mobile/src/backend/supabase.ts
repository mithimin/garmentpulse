// apps/mobile/src/backend/supabase.ts
//
// The one place where the phone app connects to the real backend (Supabase).
// It makes:
//   - `supabase`: the connection itself (used for login and live updates),
//   - `api`: the ready-made, typed calls from `@garmentpulse/shared`
//     (listMyReports, createReport, acceptJob, ...). The app never calls backend
//     functions by hand and never writes to tables (docs/api-contract.md 2.1).
//
// The two values it needs come from the private file `apps/mobile/.env`
// (copy the blank form `.env.example`, ask Sakib for the values):
//   EXPO_PUBLIC_SUPABASE_URL        the address of the backend
//   EXPO_PUBLIC_SUPABASE_ANON_KEY   the PUBLIC key (not a secret; the database
//                                   rules protect the data)
// The secret "service role" key must NEVER be used here.
//
// The login is saved on the phone (AsyncStorage) so it survives closing the app.
// Owned by Rubaiya.

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { createApi } from '@garmentpulse/shared';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // A clear message for the builder (not shown to workers): the .env file is missing.
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Copy .env.example to apps/mobile/.env and fill in the two values (ask Sakib).',
  );
}

export const supabase = createClient(url, anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // There is no browser address bar in a phone app, so there is nothing to detect.
    detectSessionInUrl: false,
  },
});

export const api = createApi(supabase);
