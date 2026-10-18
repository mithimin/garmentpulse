# Please add Bangla names for people and machines (later, after the first test)

- From: mithi
- To: sakib
- Status: done

## What I need
When it fits your plan, please let the backend keep a Bangla name next to the English one for **people** (`display_name`) and **machines** (`name`), for example `display_name_bn` and `name_bn`, and return them in the same shapes the website already uses. Tell me the exact field names and I will show them when the language is Bangla.

## Why
In Bangla mode the buttons and labels are already Bangla, but people and machine names come from the database in English letters ("Farhan Kabir", "Sewing machine 02"), so a little English still shows. The words workers type into a report (the description) will stay as typed.

## What I am doing meanwhile
Nothing special. The website shows names exactly as the backend sends them. I removed my own temporary Bangla spelling of the test names, so there is one source of truth: your backend.

## Done

Accepted on 2026-10-19, for after the first end-to-end test. Order: first test, then Bangla names, then the invite-code sign-up. The proposed field names and the plan are in `requests/mithi/2026-10-19-bangla-names-accepted.md`. (Sakib)
