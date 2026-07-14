# Contributing & Workflow Guide

Since the team is fully remote, this file is the agreed process — follow it
so progress stays visible to everyone without needing a daily call.

## 1. Branching

- `main` — always deployable. Nothing is pushed here directly.
- `dev` — integration branch. All feature branches merge here first.
- Feature branches: `phase{N}/task-{id}-{short-description}`
  Examples:
  - `phase1/task-1.3-fuzzy-matching`
  - `phase2/task-2.3-search-ui`
  - `phase3/task-3.2-rag-endpoint`

If a second person picks up a task that already has a branch, they branch
off the **existing feature branch**, not off `dev` — this keeps the task's
full history (including the handover) in one place instead of split across
two unrelated branches.

## 2. Commit Messages

Format: `[task-id] short description`

Examples:
```
[1.2] clean composition strings, standardize dosage notation
[2.1] add substitution matching endpoint with tier sorting
[3.2] constrain RAG prompt to retrieved context only
```

If you're picking up someone else's in-progress work, start your first
commit with `[handover]`:
```
[handover][1.3] resume fuzzy matching from Member 3's initial pass, tune threshold to 88
```

## 3. Issues = Tasks

Every task in `TASKS.md` has a matching GitHub Issue (created from the
`Task` issue template in `.github/ISSUE_TEMPLATE/`). The issue is the
detailed, ongoing conversation about the task; `TASKS.md` is the summary.

- **Primary owner** is set as the main assignee when the issue is created.
- If someone else helps, **add them as an additional assignee** — don't
  remove the primary owner. GitHub supports multiple assignees per issue.
- Add a comment on the issue whenever ownership effectively shifts hands,
  e.g. "Picking this up from here — Member 1 will resume tomorrow once DB
  setup (1.4) is done." This creates a timestamped history for free.
- When the task is done, update both the Issue (close it) and `TASKS.md`
  (mark Done + fill Handover Notes if more than one person touched it).

## 4. Weekly Sync Ritual (async-friendly for remote teams)

Every Sunday evening (or your team's chosen day):
1. Each member updates their rows in `TASKS.md`.
2. Each member posts a 3-line update in the team chat: what got done, what's
   blocked, what's next.
3. Move Issues on the Project board to match `TASKS.md` status.

This keeps the three of you in sync without needing to be online at the
same time.

## 5. Pull Requests

- Open a PR from your feature branch into `dev`.
- PR description should reference the task ID, e.g. "Closes task 2.3".
- At least one other member reviews/approves before merging (even a quick
  read-through) — this doubles as informal knowledge-sharing across the
  team, which matters for the viva since everyone should be able to explain
  any part of the system.
- Merge `dev` into `main` only at the end of each phase, once that phase's
  tasks are tested.

## 6. When You're Stuck

Mark the task `Blocked` in `TASKS.md` and on the Issue, with a comment
explaining the blocker. Don't sit on it silently — a task marked `Blocked`
is a signal for another member to jump in and help, exactly the scenario
this workflow is built to handle cleanly.
