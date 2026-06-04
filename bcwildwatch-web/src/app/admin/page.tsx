import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { isAdmin } from '@/lib/authPolicy';
import { getAllReports } from '@/lib/dataverse';
import { AdminStatusSelect } from '@/components/admin-status-select';
import { ReportPhoto } from '@/components/report-photo';
import type { ReportRow } from '@/lib/dataverse.helpers';

export default async function AdminPage() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) redirect('/');

  const dashboardUrl = process.env.POWERBI_DASHBOARD_URL;
  let reports: ReportRow[] = [];
  try { reports = await getAllReports(100); } catch { reports = []; }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        {dashboardUrl
          ? <iframe title="BC WildWatch Dashboard" src={dashboardUrl} className="h-[60vh] w-full rounded-lg border" allowFullScreen />
          : <p className="text-muted-foreground">Dashboard URL not configured.</p>}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">All Reports</h2>
        {reports.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reports found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Photo</th>
                  <th className="py-2 pr-4">Animal</th>
                  <th className="py-2 pr-4">Location</th>
                  <th className="py-2 pr-4">Reporter</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="border-b align-top">
                    <td className="py-2 pr-4 whitespace-nowrap">{new Date(r.createdOn).toLocaleDateString()}</td>
                    <td className="py-2 pr-4">
                      {r.mediaId
                        ? <ReportPhoto mediaId={r.mediaId} alt={`${r.animal} photo`} size={48} />
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="py-2 pr-4">{r.animal}</td>
                    <td className="py-2 pr-4">{r.address}</td>
                    <td className="py-2 pr-4">{r.reporter}</td>
                    <td className="py-2 pr-4"><AdminStatusSelect reportId={r.id} status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
