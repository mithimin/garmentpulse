# GarmentPulse - Project Plan

**Project:** GarmentPulse
**Course:** CSE327, Group 2
**Document purpose:** This file explains, in simple words, **who** builds GarmentPulse, **when** each part is built, and what could go wrong along the way. Anyone reading it later should understand how the project was organized without asking the team.

**Related documents:**

- [prd.md](prd.md) - **what** the app does and **who** uses it (features, users, pricing).
- [architecture.md](architecture.md) - **how** the app is built (technology, structure, quality rules).

---

## 1. Schedule (8 weeks)

There is a **review checkpoint every 2 weeks**.

| Weeks | Phase | What happens |
|---|---|---|
| 1-2 | Requirements and design | Workflows, database design, permissions |
| 3-4 | Backend development | Login, dispatch, expenses and approval, presence alerts |
| 5-6 | Frontend development | Mobile app, web dashboards, expense and approval screens |
| 7-8 | Integration and deployment | Testing (week 7). Deployment, documentation and demo (week 8). |

The camera module and AI chatbot do not have their own phase. They are built inside the backend, frontend and integration phases.

---

## 2. Team and work split

There is one owner per layer of the stack. All members help with system design, testing and the final presentation.

| Member | Role | Main work |
|---|---|---|
| Rubaiya Binte Reza | Mobile app developer | React Native apps for workers, technicians and owners |
| Rukaia Minhaz Mithi | Web app developer | Next.js manager and owner dashboards, expense and invoice screens |
| Md. Sakibuzzaman | Backend developer | Supabase schema, login, role logic, technician dispatch |

---

## 3. Risks and how we handle them

| Risk | How we handle it |
|---|---|
| A technician misuses money | Every expense needs an invoice and receipt. Owner approves expenses above the limit. |
| All technicians are busy at once | Reports wait in a queue. The manager sees technician availability. |
| Camera accuracy and privacy | Only detect presence, not identity. Tune the 10-minute rule. Inform workers that cameras are used. |
| Scope creep (too many features) | Keep the first version to reporting, dispatch and approval. Camera and chatbot are add-on modules. |
