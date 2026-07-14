# MedSub — AI-Assisted Generic Medicine Recommendation System

Final Year B.Tech Project | 3-member team | 2.5-month build

MedSub helps users find affordable, composition-equivalent generic substitutes
for branded medicines, compares prices across branded / branded-generic /
official Jan Aushadhi tiers, and layers AI features (prescription OCR,
symptom-based semantic search, RAG-based explanations) on top of a
deterministic matching engine.

## Team & Roles

| Member | Role | Focus Areas |
|---|---|---|
| Member 1 | Backend & Data | Data cleaning/merging, database, substitution API, price logic, deployment |
| Member 2 | Frontend & UI | React app, search UI, results/detail pages, upload flow |
| Member 3 | AI/ML | Embeddings, vector DB, RAG explanation layer, semantic search, OCR |

> Replace "Member 1/2/3" with actual names in this table once roles are locked in.

## Repo Structure

```
medsub-repo/
├── backend/          # API, database models, substitution & price logic
├── frontend/          # React app
├── ml/                # OCR, embeddings, RAG pipeline, semantic search
├── data/              # raw/ and clean/ datasets (see data/README.md)
├── docs/              # proposal, task breakdown, meeting notes
├── TASKS.md           # master task tracker (mirrors GitHub Issues/Project board)
└── CONTRIBUTING.md    # branching, commit, and handover workflow
```

## Getting Started

See `docs/` for the full proposal and detailed task breakdown documents.
See `TASKS.md` for the live status of every task.
See `CONTRIBUTING.md` before pushing any code — it covers branch naming,
commit messages, and how we handle a task being picked up by more than
one person over its lifetime.

## Progress Tracking

We track progress two ways, kept in sync:
1. **GitHub Issues + Project board** (Kanban: To Do → In Progress → Blocked → Review → Done) — day-to-day tracking.
2. **`TASKS.md`** — a single-glance master table, updated weekly, for a quick overview and for the final report.

See `.github/PROJECT_SETUP.md` for exact steps to set up the board.
