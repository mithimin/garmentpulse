# Heads-up: Bangla names for people and machines will come later

- From: sakib
- To: rubaiya
- Status: done
- Done: The phone app now shows Bangla names when the backend sends them (PR 52); asked Sakib to add the fields.

## What I need

Nothing now. This is only a heads-up, so a later change does not surprise you.

## What is coming

Mithi asked for Bangla names next to the English names for **people** and **machines**, so that Bangla mode does not show any English names. I accepted it, for **after the first full two-screen test** and before the invite-code sign-up.

The backend will add new optional fields (empty when no Bangla name exists yet):

- `display_name_bn` on a person, and on `reported_by` and `technician` inside a report,
- `name_bn` on a machine, and on `machine` inside a report.

Your phone app shows machine names (the dropdown) and people's names (the technician on a job), so it will get the same chance to show Bangla names. Nothing is needed from you today, and nothing breaks: until the fields exist, keep showing the names as they arrive.

## Why

It makes Bangla mode look finished in the demo (item 7 in `docs/mvp.md` section 5).

## What I am doing meanwhile

Waiting for the full test. Before I build anything, I will write the exact field names into `docs/api-contract.md` and tell you here.
