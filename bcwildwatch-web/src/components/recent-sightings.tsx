import { getRecentReports } from '@/lib/dataverse';
import { Card } from '@/components/ui/card';

export async function RecentSightings() {
  let reports: Awaited<ReturnType<typeof getRecentReports>> = [];
  try { reports = await getRecentReports(6); } catch { reports = []; }
  if (reports.length === 0) return <p className="text-sm text-muted-foreground">No recent sightings yet.</p>;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {reports.map((r: { id: string; address: string; createdOn: string; animal: string }) => (
        <Card key={r.id} className="p-4">
          <div className="font-semibold">{r.animal} · {r.address}</div>
          <div className="text-xs text-muted-foreground">{new Date(r.createdOn).toLocaleString()}</div>
        </Card>
      ))}
    </div>
  );
}
