# Data Sources

Raw datasets are not committed to git (too large / not ours to redistribute)
— download them yourself into `data/raw/` using the links below. Cleaned
outputs of your own processing go in `data/clean/` (also gitignored by
default; remove that line from `.gitignore` if your team wants small cleaned
CSVs versioned).

| Need | Source |
|---|---|
| Branded medicine price & composition | Kaggle — "India Medicines and Drug Info Dataset" |
| Branded-generic price & composition (cross-check) | GitHub — junioralive/Indian-Medicine-Dataset; Kaggle — "Indian Pharmaceutical Products" |
| Generic substitutes list | Kaggle — "250k Medicines Usage, Side Effects and Substitutes" |
| Descriptions & side effects (AI explanations) | Kaggle — "Indian Medicine Data" |
| Official generic MRP | PMBJP / BPPI Jan Aushadhi product price list (janaushadhi.gov.in) |
| Price ceiling reference | NPPA DPCO price list |

See `docs/` for the full data-sources writeup with more detail on each.
