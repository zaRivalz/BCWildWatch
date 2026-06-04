import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isAllowedEmail } from '@/lib/authPolicy';
import { getMediaFileUrl } from '@/lib/dataverse';
import { downloadMedia } from '@/lib/graph';
import { isGuid } from '@/lib/dataverse.helpers';

/**
 * Authenticated image proxy. Streams a report's photo to signed-in campus users
 * by looking up the media record's SharePoint URL and fetching the bytes
 * app-only via Graph. The caller only ever supplies a media GUID — never a raw
 * URL — so this cannot be used to fetch arbitrary resources (no SSRF).
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!isAllowedEmail(session?.user?.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!isGuid(id)) {
    return NextResponse.json({ error: 'Invalid media id.' }, { status: 400 });
  }

  try {
    const media = await getMediaFileUrl(id);
    if (!media) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    const { bytes, contentType } = await downloadMedia(media.fileUrl, media.filename);
    return new NextResponse(bytes as unknown as BodyInit, {
      headers: {
        'Content-Type': contentType,
        // Private: tied to the signed-in user; cache in their browser only.
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load image.' }, { status: 502 });
  }
}
