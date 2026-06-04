import { auth } from '@/auth';
import { getMyReports } from '@/lib/dataverse';
import { Card } from '@/components/ui/card';
import { Reveal } from '@/components/reveal';
import { statusBadgeClass, statusLabel } from '@/lib/reportStatus';
import type { ReportRow } from '@/lib/dataverse.helpers';

export default async function MyReportsPage() {
  const session = await auth();
  const email = session?.user?.email;
  let reports: ReportRow[] = [];
  if (email) {
    try { reports = await getMyReports(email); } catch { reports = []; }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Reports</h1>
      {reports.length === 0 ? (
        <p className="text-sm text-muted-foreground">You haven&apos;t submitted any reports yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {reports.map((r, i) => (
            <Reveal key={r.id} delay={i * 0.05}>
              <Card className="space-y-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{r.animal}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(r.status)}`}>
                    {statusLabel(r.status)}
                  </span>
                </div>
                <div className="text-sm">{r.address}</div>
                {r.description && <div className="text-sm text-muted-foreground">{r.description}</div>}
                <div className="text-xs text-muted-foreground">{new Date(r.createdOn).toLocaleString()}</div>
              </Card>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
