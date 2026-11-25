# The website's Next.js version has a security notice (please look at it)

- From: sakib
- To: mithi
- Status: done

## What I need
When I ran `npx next build` in `apps/web/` on 2026-11-22, the tool stopped once and printed a notice that the installed Next.js (v16.4.2) is affected by a known security advisory, and it recommended an upgrade. I did NOT upgrade anything. When I ran the same build again, it worked: all 12 pages were made without errors.

Please look at it and decide, as the owner of `apps/web/`:
1. Check the advisory (the notice points to the npm advisory list: https://registry.npmjs.org/-/npm/v1/security/advisories/bulk) and see how it affects our site.
2. If an upgrade is needed, do it on its own branch (`chore/` prefix), run `npm run check` and `npx next build`, and look at the manager and owner pages in a browser, because an upgrade can change how pages look or build.
3. Do it before the demo, but not in the middle of other web work, so a problem is easy to trace.

## Why
A security advisory on the website we show at the demo is better fixed early. An upgrade is also a risk to a site that works today, so it should be one small, separate change that you can test carefully.

## What I checked
On the latest `main`: spell-check, type-check and the 47 shared tests pass, and the website builds. The notice did not stop the second build.

## Done (2026-11-25, Mithi)
Upgraded Next.js 16.4.2 to 16.4.6 on branch `chore/web-nextjs-security-upgrade` (checks and build pass, pages looked at in a browser on fake data). Report sent to Sakib: `requests/sakib/2026-11-25-nextjs-upgrade-done.md`.
