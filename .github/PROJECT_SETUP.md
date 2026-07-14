# Setting Up the GitHub Project Board

One-time setup (any team member can do this after the repo is created).

## 1. Create the repo and push this package

```bash
# On GitHub.com: create a new empty repo named "medsub" (no README, no .gitignore — we already have them)

cd medsub-repo
git init
git add .
git commit -m "Initial repo structure, task tracker, and workflow docs"
git branch -M main
git remote add origin https://github.com/<your-username>/medsub.git
git push -u origin main
git checkout -b dev
git push -u origin dev
```

## 2. Create the Project board

1. Go to your repo → **Projects** tab → **New project** → choose **Board** template.
2. Name it "MedSub Build Tracker".
3. Create these columns: `To Do`, `In Progress`, `Blocked`, `In Review`, `Done`.
4. Turn on **auto-add**: Settings → Workflows → "Item added to project" when
   an issue is created in this repo, so every new Issue lands on the board
   automatically.
5. Turn on the built-in automation: closing an Issue moves its card to `Done`.

## 3. Create one Issue per task

For each row in `TASKS.md`, create a GitHub Issue using the **Task** issue
template (`.github/ISSUE_TEMPLATE/task.yml`). Fill in:
- Task ID (must match `TASKS.md`, e.g. `1.3`)
- Phase
- Primary owner (also set as Assignee)
- Description / steps (copy from the detailed task breakdown doc)

Label it with:
- `phase-1` … `phase-6`
- `member-1` / `member-2` / `member-3` (primary owner)
- Add `handover` label if a second person joins later

## 4. Daily/weekly usage

- Move your own cards across columns as you work — this is the live view
  the whole team (and your guide, if you show them the board) can check
  without a meeting.
- When someone else helps on a task, add them as an additional **Assignee**
  on the Issue (don't remove the original owner) and drop a comment
  explaining what's been done and what's left — see `CONTRIBUTING.md`
  section 3 for the exact convention.
