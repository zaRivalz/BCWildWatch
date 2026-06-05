'use client';

import { useMemo, useState } from 'react';
import { Icon } from '@/components/icons';
import { AnimalToken, kindForName } from '@/components/animal-glyph';
import { StatusPill, statusTone, type StatusTone } from '@/components/status-pill';
import { AdminStatusSelect } from '@/components/admin-status-select';
import { ReportPhoto } from '@/components/report-photo';
import { relativeTime } from '@/lib/relativeTime';
import type { ReportRow } from '@/lib/dataverse.helpers';

type Filter = 'all' | StatusTone;

const TABS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'progress', label: 'In progress' },
  { id: 'resolved', label: 'Resolved' },
];

export function AdminReportsTable({ reports }: { reports: ReportRow[] }) {
  const [tab, setTab] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: reports.length, new: 0, progress: 0, resolved: 0 };
    for (const r of reports) c[statusTone(r.status)]++;
    return c;
  }, [reports]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports.filter((r) => {
      if (tab !== 'all' && statusTone(r.status) !== tab) return false;
      if (!q) return true;
      return (
        r.animal.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q) ||
        r.reporter.toLowerCase().includes(q)
      );
    });
  }, [reports, tab, query]);

  return (
    <div className="card admin-table">
      <div className="admin-table__bar">
        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`tabpill${tab === t.id ? ' is-on' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              <span className="tabpill__c">{counts[t.id]}</span>
            </button>
          ))}
        </div>
        <div className="finput-wrap admin-search">
          <span className="finput-ico">
            <Icon.search size={17} />
          </span>
          <input
            className="finput has-ico"
            placeholder="Search reports…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search reports"
          />
        </div>
      </div>

      <div className="thead">
        <span>Report</span>
        <span>Location</span>
        <span>Reporter</span>
        <span>Status</span>
        <span>When</span>
        <span />
      </div>

      <div className="tbody">
        {filtered.length === 0 ? (
          <div className="tempty">
            <Icon.search size={28} />
            <b>No reports match</b>
            <span className="muted">Try a different tab or search term.</span>
          </div>
        ) : (
          filtered.map((r) => (
            <div key={r.id} className="trow">
              <div className="trow__main">
                <div className="trow__thumb">
                  {r.mediaId ? (
                    <ReportPhoto mediaId={r.mediaId} alt={`${r.animal} photo`} size={50} />
                  ) : (
                    <div className="ph">
                      <span className="ph__tag">{r.animal}</span>
                    </div>
                  )}
                  <AnimalToken kind={kindForName(r.animal)} size={24} radius={8} />
                </div>
                <div className="trow__txt">
                  <b>{r.animal}</b>
                  <span className="trow__id mono">#{r.id.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>

              <span className="trow__loc">
                <Icon.pin size={14} />
                {r.address}
              </span>

              <span className="muted">{r.reporter}</span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
                <StatusPill status={r.status} />
                <AdminStatusSelect reportId={r.id} status={r.status} />
              </div>

              <span className="trow__time muted">{relativeTime(r.createdOn)}</span>

              <span className="trow__act" aria-hidden>
                <Icon.dots size={18} />
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
