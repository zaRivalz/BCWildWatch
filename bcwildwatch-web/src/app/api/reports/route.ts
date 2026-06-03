import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isAllowedEmail } from '@/lib/authPolicy';
import { validateReport } from '@/lib/reportValidation';
import { upsertUser, createReport, linkMedia, getRecentReports } from '@/lib/dataverse';
import { uploadMedia } from '@/lib/graph';

const MAX_FILE_BYTES = 10 * 1024 * 1024;

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    return NextResponse.json({ reports: await getRecentReports(10) });
  } catch {
    return NextResponse.json({ error: 'Failed to load reports.' }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email || !isAllowedEmail(email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const form = await req.formData();
  const v = validateReport({
    animalId: (form.get('animalId') as string) || null,
    addressDescription: (form.get('addressDescription') as string) ?? '',
    description: (form.get('description') as string) ?? '',
    latitude: form.get('latitude') ? Number(form.get('latitude')) : null,
    longitude: form.get('longitude') ? Number(form.get('longitude')) : null,
  });
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

  try {
    const userId = await upsertUser(email, session.user?.name ?? email);
    const reportId = await createReport({ userId, ...v.value });

    const file = form.get('photo') as File | null;
    if (file && file.size > 0) {
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json({ error: 'File too large (max 10MB).' }, { status: 413 });
      }
      const bytes = Buffer.from(await file.arrayBuffer());
      const url = await uploadMedia(file.name, bytes);
      await linkMedia(reportId, url);
    }
    return NextResponse.json({ success: true, reportId });
  } catch {
    return NextResponse.json({ error: 'Failed to submit the report.' }, { status: 502 });
  }
}
