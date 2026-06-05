'use client';

import { Fragment, useMemo, useState } from 'react';
import { Icon } from '@/components/icons';
import { AnimalToken, kindForName } from '@/components/animal-glyph';
import { StatusPill, statusTone, type StatusTone } from '@/components/status-pill';
import { AdminStatusSelect } from '@/components/admin-status-select';
import { AdminDeleteButton } from '@/components/admin-delete-button';
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

export function AdminReportsTable({
  reports,
  canEdit = false,
  canDelete = false,
}: {
  reports: ReportRow[];
  canEdit?: boolean;
  canDelete?: boolean;
}) {
  const [tab, setTab] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

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
        r.location.toLowerCase().includes(q) ||
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
          filtered.map((r) => {
            const open = openId === r.id;
            return (
              <Fragment key={r.id}>
                <div
                  className={`trow${open ? ' is-sel' : ''}`}
                  onClick={() => setOpenId(open ? null : r.id)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={open}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setOpenId(open ? null : r.id);
                    }
                  }}
                >
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
                    <Icon.map size={14} />
                    {r.location || '—'}
                  </span>

                  <span className="muted">{r.reporter}</span>

                  <div
                    style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <StatusPill status={r.status} />
                    {canEdit && <AdminStatusSelect reportId={r.id} status={r.status} />}
                  </div>

                  <span className="trow__time muted">{relativeTime(r.createdOn)}</span>

                  <span className={`trow__act${open ? ' is-open' : ''}`} aria-hidden>
                    <Icon.chevD size={18} />
                  </span>
                </div>

                {open && (
                  <div className="trow-detail">
                    <div className="rdetail">
                      <div className="rdetail__sec">
                        <span className="rdetail__lbl">
                          <Icon.map size={14} /> Location
                        </span>
                        <p>{r.location || 'Not specified'}</p>
                      </div>
                      <div className="rdetail__sec">
                        <span className="rdetail__lbl">
                          <Icon.pin size={14} /> Address description
                        </span>
                        <p>{r.address || 'Not specified'}</p>
                      </div>
                      <div className="rdetail__sec">
                        <span className="rdetail__lbl">
                          <Icon.eye size={14} /> Report description
                        </span>
                        <p>{r.description || 'No description provided'}</p>
                      </div>
                    </div>
                    {r.mediaId && (
                      <div className="rdetail__photo">
                        <ReportPhoto mediaId={r.mediaId} alt={`${r.animal} photo`} size={120} />
                      </div>
                    )}
                    {canDelete && (
                      <div className="rdetail__actions">
                        <AdminDeleteButton reportId={r.id} animal={r.animal} />
                      </div>
                    )}
                  </div>
                )}
              </Fragment>
            );
          })
        )}
      </div>
    </div>
  );
}
