// What a report shows, not only where it came from. causes.ts files a report by its tenant; that
// is right for a flipped date, but a report the desk read as a one-day move (desk-notes.json) is not
// a flip at all: the date moved by a day, not day ↔ month. The parser fix does not touch it, so it
// is a problem of its own, with a ticket of its own.
import { causeOf, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day-move';
export const PROBLEMS: readonly Problem[] = ['parser', 'hint', 'one-day-move'];

// Where each problem is tracked. One problem, one ticket.
export const ISSUE_REPO = 'https://github.com/Woookie89/s01e03-4471-split';
export const ISSUE: Record<Problem, number> = { parser: 1, hint: 2, 'one-day-move': 3 };

export const WHAT: Record<Problem, string> = {
  parser: 'day and month swapped: the shared parser reads month first, the tenant writes day first',
  hint: 'day and month swapped: booking-v3 prints MM/DD/YYYY under its date field for day-first tenants',
  'one-day-move': 'date moved by one day, not swapped: shows up across time zones and around one month',
};

export function problemOf(r: Report, t: Tenant | undefined, oneDayMove: readonly string[]): Problem | null {
  if (oneDayMove.includes(r.id)) return 'one-day-move';
  return causeOf(r, t);
}

export type ProblemGroup = {
  problem: Problem | 'unplaced';
  reports: Report[];
  tenants: number;
  channels: Record<string, number>;
  taggedAs: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
};

const tally = (rs: Report[], key: (r: Report) => string) =>
  rs.reduce<Record<string, number>>((n, r) => ({ ...n, [key(r)]: (n[key(r)] ?? 0) + 1 }), {});

export function groupByProblem(
  reports: Report[],
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemGroup[] {
  const by = new Map<ProblemGroup['problem'], Report[]>();
  for (const r of reports) {
    const p = problemOf(r, tenantOf(r), oneDayMove) ?? 'unplaced';
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  return [...by.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        tenants: new Set(rs.map((r) => r.tenant)).size,
        channels: tally(rs, (r) => r.channel),
        taggedAs: tally(rs, (r) => r.meta.intakeTag),
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}
