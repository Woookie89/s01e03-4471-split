# #4471, split

The support desk merged 412 reports about dates into one ticket, #4471, and marked it known: one parser bug, fix queued. Read the reports and they show three problems:

| problem | reports | ticket |
|---|---|---|
| `parser`: the shared parser reads day-first dates month first; day and month come out swapped | 374 | [#1](https://github.com/Woookie89/s01e03-4471-split/issues/1) |
| `hint`: the `booking-v3` form prints `MM/DD/YYYY` to day-first tenants; people type month first | 33 | [#2](https://github.com/Woookie89/s01e03-4471-split/issues/2) |
| `one-day-move`: dates move by one day across time zones; not a swap, a parser fix leaves them | 5 | [#3](https://github.com/Woookie89/s01e03-4471-split/issues/3) |

427 rows in the export, 412 unique report ids.

## The page

- Source: [`support-kb/src/routes/kb/incidents/4471-split/+page.svx`](support-kb/src/routes/kb/incidents/4471-split/+page.svx), signed with the course ticket (desk ref `DR-19VM-G06M`).
- Its logic: [`problems.ts`](support-kb/src/lib/kb/problems.ts) and [`ProblemTable.svelte`](support-kb/src/lib/kb/ProblemTable.svelte). Every number on the page is computed from the export data.
- As the desk sees it: [`rendered/kb__incidents__4471-split.html`](rendered/kb__incidents__4471-split.html) (self-contained, built from the source).

`support-kb/` is the kb export as handed over, plus those three files. `rendered/` holds every kb page as built.

## Build

The export has no build setup, so [`render/`](render/) adds one (SvelteKit + mdsvex, static). It copies `support-kb/src`, builds it and writes `rendered/`:

```sh
cd render && npm ci && npm run build
```
