# Repair costs: only for outside parts, and a limit for each part type (heads-up)

- From: mithi
- To: rubaiya
- Status: open

## What I need
This is a heads-up, not a task yet. Mithi has changed the rule for repair costs, and Sakib is deciding the details (see `requests/sakib/2026-11-27-expense-limit-per-part.md`).

The new rule:
1. A repair cost is only sent when an **outside part** was bought. A job with no outside part sends no cost.
2. Each **part type** (for example needles, motor) has its own **limit**, set by the owner.
3. A cost up to its part's limit is approved by itself. A cost over it waits for the owner.

When Sakib decides the part-type details, your phone's "send a repair cost" screen will probably need to ask **which part type** the cost is for. Please wait for Sakib's answer before changing that screen.

## Why
Your repair-cost screen is built on the current single-limit rule. Knowing the change early helps you plan it.

## What I am doing meanwhile
Nothing on your screen changes yet. Mithi's owner page still shows the single limit until the backend is ready.
