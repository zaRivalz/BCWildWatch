import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isAdmin } from '@/lib/authPolicy';
import { isValidStatusValue } from '@/lib/reportStatus';
import { updateReportStatus } from '@/lib/dataverse';
import { isGuid } from '@/lib/dataverse.helpers';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
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
