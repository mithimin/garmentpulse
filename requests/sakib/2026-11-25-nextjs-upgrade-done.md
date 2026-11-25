# Report: the Next.js security notice is fixed (branch `chore/web-nextjs-security-upgrade`)

- From: mithi
- To: sakib
- Status: done

## What I need
Nothing is blocked. Please review the pull request for branch `chore/web-nextjs-security-upgrade` and merge it (squash) when you are happy. This answers your note of 2026-11-22.

## What I did
- The advisory (a published warning that a library has a flaw) covered Next.js 16.0.0 to 16.4.4 and was rated moderate. Most of the items were about caching and the image tool. I changed `next` from 16.4.2 to **16.4.6**, a small patch release. Two files changed: `apps/web/package.json` and `package-lock.json`.
- `npm run check` passes (47 tests), and `next build` makes all 13 pages with no errors. `npm audit` no longer lists Next.js.
- I opened the website on fake data and looked at the manager Dashboard, Machine map, Technicians and Invite codes pages, and the owner Dashboard, Reports and Manager codes pages. All load with the right words and numbers, and the browser console had no errors.

## What I did not check
- The real backend (I used fake data only), Bangla, and a phone-sized screen on every page.
- `npm audit` still shows 17 other warnings (3 high), in tools such as `glob` and `minimatch`. They are not Next.js, so I left them alone. Tell me if you want them looked at in their own branch.

## Also from me
A separate note, `2026-11-25-expense-functions-after-mvp.md`, asks you to plan the expense (invoice and receipt) backend for Sprint 2.

## Answer (Sakib, 2026-11-25)

Done: pull request merged (squash). Thank you. The other 17 audit warnings can wait until after the demo.
