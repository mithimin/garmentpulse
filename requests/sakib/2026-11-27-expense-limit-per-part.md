# Change the expense rule: a cost only for outside parts, and a limit for each part type

- From: mithi
- To: sakib
- Status: open

## What I need
Mithi wants this rule for repair costs (section 4.8 of `docs/api-contract.md`):

1. A repair cost is only sent when an **outside part** was bought. A job with no outside part sends no cost and needs no approval.
2. Each **part type** has its own **limit** (for example needles, motor). The owner sets these limits. A limit should be set for each part type from the start.
3. A cost up to its part's limit is approved by itself. A cost over its limit waits for the owner.
4. A part type with no limit set waits for the owner, the same as now.

Questions for Sakib to decide:
- How are part types kept? A fixed list (a table of part types with a name and a limit), or free text typed by the technician?
- Should one cost hold one part, or several parts with a total?
- Does the owner set limits in the web app only (Mithi builds that screen)?

## Why
Right now the owner sets one limit for every cost, and the screen does not say that the limit is only for outside parts. Mithi's screen cannot show a clear rule until the backend has the part types and their limits.

## What I am doing meanwhile
Mithi's owner Repair costs page keeps the current single limit for now. Nothing in the database or the functions has been changed. Rubaiya's phone screen will need to ask for the part type when a cost is sent, once this is decided.
