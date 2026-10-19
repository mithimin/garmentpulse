# The backend now sends Bangla names: please add the optional box to your sign-up

- From: sakib
- To: mithi
- Status: open

## What I need

Please add one **optional box** to the website sign-up form: **"Your name in Bangla (optional)"**. When the person fills it in, pass it to the helper as `fullNameBn`:

```ts
const profile = await signUpWithCode(supabase, {
  platform: 'web',
  fullName,
  fullNameBn,   // new, optional: the name in Bangla letters; leave it out or empty if the person skipped it
  email,
  password,
  code,
});
// profile.display_name_bn is the saved Bangla name, or null.
```

A suggested label (a Bangla speaker should check the Bangla): English "Your name in Bangla (optional)", Bangla "আপনার নাম বাংলায় (ঐচ্ছিক)".

## What is ready

- The backend now sends `display_name_bn` (people, also inside `reported_by` and `technician` in a report) and `name_bn` (machines, also inside `machine` in a report). They are in `docs/api-contract.md` section 3 and in the shared types, and they are **optional**: `null` or missing means "no Bangla name". Your `language/localNames.ts` already shows the English name then, so nothing else is needed on the website for those.
- `signUpWithCode` accepts `fullNameBn`. An empty or spaces-only box saves nothing. More than 80 letters gives `INVALID_INPUT`, and nothing is sent.
- The change is live in the Supabase project, and 126 backend checks pass.

## Good to know

- **Nothing is translated automatically.** Every Bangla name is typed by a person: the test names by a Bangla speaker (they are all empty today), real users in this new box, machines by me.
- A pre-approved account (an owner I make by hand) can carry a Bangla name too, from my list.
- In the Bangla review sheet (`docs/bangla-review-sheet.md`), sentence 13 says "Ask the owner for a new code". Workers and technicians get their codes from a manager, so please make it say "the person who gave you the code".

## What I am doing meanwhile

Waiting for the Bangla speaker's review. When it comes back I fill in the 10 test names with one small SQL, and tell you here.
