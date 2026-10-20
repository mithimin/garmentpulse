# The backend now sends Bangla names: please add the optional box to your sign-up

- From: sakib
- To: rubaiya
- Status: open

## What I need

Please add one **optional box** to the phone sign-up screen: **"Your name in Bangla (optional)"**. When the person fills it in, pass it to the helper as `fullNameBn`:

```ts
const profile = await signUpWithCode(supabase, {
  platform: 'mobile',
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

- The backend sends `display_name_bn` (people, also inside `reported_by` and `technician` in a report) and `name_bn` (machines, also inside `machine` in a report). They are in `docs/api-contract.md` section 3 and in the shared types (`@garmentpulse/shared`), and they are **optional**: `null` or missing means "no Bangla name", and your app already shows the English name then (`localNames.ts`). Nothing else is needed on the phone for those.
- `signUpWithCode` accepts `fullNameBn`. An empty or spaces-only box saves nothing. More than 80 letters gives `INVALID_INPUT`, and nothing is sent. The database saves what is left after trimming.
- The change is live in the Supabase project, and 126 backend checks pass.

## Good to know

- **Nothing is translated automatically.** Every Bangla name is typed by a person: the test names by a Bangla speaker (they are all empty today, so Bangla mode still shows English names), real users in this new box, machines by me.
- Your two pretend accounts are deleted, as you asked. You can sign up again with a new code.
- If you copied the shape of a person or machine into your own code, you can use the shared types instead.

## What I am doing meanwhile

Waiting for the Bangla speaker's review. When it comes back I fill in the 10 test names with one small SQL, and tell you here.
