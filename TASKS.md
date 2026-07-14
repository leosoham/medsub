# MedSub — Master Task Tracker

Update this file weekly (or right after any task's status changes). This is
the single source of truth alongside the GitHub Project board — if they ever
disagree, this file wins for report purposes.

**Status values:** `Not Started` · `In Progress` · `Blocked` · `In Review` · `Done`

**How to log a handover:** when someone other than the primary owner works on
a task, add their name to "Helped By" and a one-line note in "Handover Notes"
(what they did, what's left, why the owner is resuming). Do not overwrite the
original owner — ownership stays with the primary owner unless the team
explicitly reassigns it here.

---

## Phase 1 — Foundation & Data Pipeline (Week 1–2)

| ID | Task | Primary Owner | Status | Helped By | Handover Notes |
|---|---|---|---|---|---|
| 1.1 | Collect and inspect all datasets | Member 1 | Not Started | — | — |
| 1.2 | Clean and standardize each dataset | Member 1 | Not Started | — | — |
| 1.3 | Merge datasets with fuzzy matching | Member 1 | Not Started | — | — |
| 1.4 | Design and set up relational database | Member 1 | Not Started | — | — |
| 1.5 | Project scaffolding & authentication | Member 2 | Not Started | — | — |
| 1.6 | Environment & tooling setup (ML stack) | Member 3 | Not Started | — | — |

## Phase 2 — Core Substitution Engine (Week 3–5)

| ID | Task | Primary Owner | Status | Helped By | Handover Notes |
|---|---|---|---|---|---|
| 2.1 | Build substitution-matching API | Member 1 | Not Started | — | — |
| 2.2 | Build price comparison logic | Member 1 | Not Started | — | — |
| 2.3 | Build search & results UI | Member 2 | Not Started | — | — |
| 2.4 | Build medicine detail page | Member 2 | Not Started | — | — |
| 2.5 | Begin embedding pipeline design (prototype) | Member 3 | Not Started | — | — |

## Phase 3 — AI Explanation Layer / RAG (Week 6–7)

| ID | Task | Primary Owner | Status | Helped By | Handover Notes |
|---|---|---|---|---|---|
| 3.1 | Chunk and embed the full dataset | Member 3 | Not Started | — | — |
| 3.2 | Build RAG explanation endpoint | Member 3 | Not Started | — | — |
| 3.3 | Integrate explanation into the UI | Member 2 | Not Started | — | — |

## Phase 4 — Semantic Symptom Search (Week 8)

| ID | Task | Primary Owner | Status | Helped By | Handover Notes |
|---|---|---|---|---|---|
| 4.1 | Build symptom-based search endpoint | Member 3 | Not Started | — | — |
| 4.2 | Add symptom search to UI | Member 2 | Not Started | — | — |

## Phase 5 — Prescription OCR (Week 9)

| ID | Task | Primary Owner | Status | Helped By | Handover Notes |
|---|---|---|---|---|---|
| 5.1 | Build OCR extraction endpoint | Member 3 | Not Started | — | — |
| 5.2 | Build upload UI and results flow | Member 2 | Not Started | — | — |

## Phase 6 — Polish, Testing & Deployment (Week 10)

| ID | Task | Primary Owner | Status | Helped By | Handover Notes |
|---|---|---|---|---|---|
| 6.1 | End-to-end testing | All | Not Started | — | — |
| 6.2 | UI polish | Member 2 | Not Started | — | — |
| 6.3 | Deployment | Member 1 | Not Started | — | — |
| 6.4 | Report and demo prep | All | Not Started | — | — |

---

### Example of a filled-in handover row (for reference — delete once real work starts)

| ID | Task | Primary Owner | Status | Helped By | Handover Notes |
|---|---|---|---|---|---|
| 1.3 | Merge datasets with fuzzy matching | Member 1 | In Progress | Member 3 | Member 3 wrote the initial rapidfuzz matching loop on 20 Jul while Member 1 was stuck on DB setup; Member 1 resumed on 22 Jul to tune thresholds and validate matches. |
