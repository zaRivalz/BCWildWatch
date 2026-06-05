import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isValidStatusValue } from '@/lib/reportStatus';
import { updateReportStatus, deleteReport, getEffectiveRole } from '@/lib/dataverse';
import { canEditReports, canDeleteReports } from '@/lib/roles';
import { isGuid } from '@/lib/dataverse.helpers';

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = await getEffectiveRole(session?.user?.email);
  if (!canEditReports(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  let body: unknown;
  try { body = await req.json(); } catch { body = null; }
  const reportId = (body as { reportId?: unknown })?.reportId;
  const status = (body as { status?: unknown })?.status;
  if (!isGuid(reportId) || !isValidStatusValue(status)) {
    return NextResponse.json({ error: 'Invalid reportId or status.' }, { status: 400 });
  }
  try {
    await updateReportStatus(reportId, status);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update status.' }, { status: 502 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  const role = await getEffectiveRole(session?.user?.email);
  if (!canDeleteReports(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  let body: unknown;
  try { body = await req.json(); } catch { body = null; }
  const reportId = (body as { reportId?: unknown })?.reportId;
  if (!isGuid(reportId)) {
    return NextResponse.json({ error: 'Invalid reportId.' }, { status: 400 });
  }
  try {
    await deleteReport(reportId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete report.' }, { status: 502 });
  }
}
