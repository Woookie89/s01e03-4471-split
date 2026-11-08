<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { groupByProblem, ISSUE, ISSUE_REPO, WHAT } from '#lib/kb/problems';

  let { ticket }: { ticket: number } = $props();

  const rows = (reports as Report[]).filter((r) => r.mergedInto === ticket);
  const merged = $derived(uniqueById(rows));
  const groups = $derived(groupByProblem(merged, tenantOf, notes.oneDayMove));
  const list = (m: Record<string, number>) =>
    Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .map(([k, n]) => `${k} ×${n}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{rows.length}</strong> rows in the export · <strong>{merged.length}</strong> unique reports merged into
  #{ticket} · <strong>{groups.length}</strong>
  {groups.length === 1 ? 'problem' : 'problems'}
</p>

<div class="wide"><table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>what it shows</th><th>tenants</th><th>channels</th><th>intake tagged</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td><strong>{g.reports.length}</strong></td>
        <td>{g.problem === 'unplaced' ? 'no tenant on file' : WHAT[g.problem]}</td>
        <td>{g.tenants}</td>
        <td class="small">{list(g.channels)}</td>
        <td class="small">{list(g.taggedAs)}</td>
        <td class="small">{g.firstSeen} → {g.lastSeen}</td>
        <td>
          {#if g.problem === 'unplaced'}—{:else}<a href="{ISSUE_REPO}/issues/{ISSUE[g.problem]}">#{ISSUE[g.problem]}</a>{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table></div>

<style>
  .wide { overflow-x: auto; }
  .sum { font-size: 1.1rem; }
  .small { color: var(--muted); font-size: 0.85em; }
</style>
