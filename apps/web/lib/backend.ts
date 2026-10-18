// apps/web/lib/backend.ts
//
// The ONE place where the website connects to Sakib's backend (Supabase).
// It needs two PUBLIC values from `apps/web/.env.local` (see `.env.example`):
//   NEXT_PUBLIC_SUPABASE_URL       (the address of the backend)
//   NEXT_PUBLIC_SUPABASE_ANON_KEY  (the public key every browser carries; it is
//                                   NOT a secret, the database rules protect the data)
// If either value is missing, `backendIsReal` is false and the website keeps
// using the FAKE data from @garmentpulse/shared, so nothing breaks.
// The secret "service role" key must never be used here. Owned by Mithi.

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createApi } from '@garmentpulse/shared';
import type { Api } from '@garmentpulse/shared';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when both public values are filled in, so the real backend is used. */
export const backendIsReal = Boolean(url && anonKey);

/** The Supabase client, or null in fake mode. */
export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null;

/** The ready-made typed backend calls (docs/api-contract.md), or null in fake mode. */
export const api: Api | null = supabase ? createApi(supabase) : null;
