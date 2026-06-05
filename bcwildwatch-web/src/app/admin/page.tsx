import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { isAdmin } from '@/lib/authPolicy';
import { getAllReports } from '@/lib/dataverse';
import { AdminReportsTable } from '@/components/admin-reports-table';
import { Icon } from '@/components/icons';
import { statusTone } from '@/components/status-pill';
import type { ReportRow } from '@/lib/dataverse.helpers';

export default async function AdminPage() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) redirect('/');

  const dashboardUrl = process.env.POWERBI_DASHBOARD_URL;
  let reports: ReportRow[] = [];
  try {
    reports = await getAllReports(100);
  } catch {
    reports = [];
  }

  const total = reports.length;
  const fresh = reports.filter((r) => statusTone(r.status) === 'new').length;
  const inProgress = reports.filter((r) => statusTone(r.status) === 'progress').length;
  const resolved = reports.filter((r) => statusTone(r.status) === 'resolved').length;

  const kpis = [
    { tone: 'kpi--high', icon: <Icon.alert size={20} />, num: fresh, label: 'New / awaiting review' },
    { tone: 'kpi--medium', icon: <Icon.clock size={20} />, num: inProgress, label: 'In progress' },
    { tone: 'kpi--ok', icon: <Icon.check size={20} sw={2.4} />, num: resolved, label: 'Resolved' },
    { tone: 'kpi--ok', icon: <Icon.grid size={20} />, num: total, label: 'Total reports' },
  ];

  return (
    <div className="wrap">
      <div className="admin-head">
        <div>
          <div className="eyebrow">
            <Icon.grid size={15} /> Security dashboard
          </div>
          <h1>Campus reports</h1>
        </div>
        <div className="admin-head__actions">
          <span className="badge">
            <span className="dot" /> Live
          </span>
        </div>
      </div>

      <div className="kpis">
        {kpis.map((k, i) => (
          <div key={i} className="card kpi">
            <div className={`kpi__ico ${k.tone}`}>{k.icon}</div>
            <div className="kpi__num">{k.num}</div>
            <div className="kpi__lbl">{k.label}</div>
          </div>
        ))}
      </div>

      <AdminReportsTable reports={reports} />

      {dashboardUrl && (
        <section style={{ marginTop: 28 }}>
          <div className="sec-head">
            <div>
              <div className="eyebrow">
                <Icon.flash size={15} /> Analytics
              </div>
              <h2>Power BI overview</h2>
            </div>
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            <iframe
              title="BC WildWatch Dashboard"
              src={dashboardUrl}
              style={{ width: '100%', height: '60vh', border: 'none', display: 'block' }}
              allowFullScreen
            />
          </div>
        </section>
      )}
    </div>
  );
}
