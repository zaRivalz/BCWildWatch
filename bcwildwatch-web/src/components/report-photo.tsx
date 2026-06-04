import Image from 'next/image';

/**
 * Thumbnail for a report's photo, served through the authenticated
 * /api/media/[id] proxy. Uses `unoptimized` so the browser fetches the image
 * directly (carrying the user's session cookie) rather than via Next's
 * server-side optimizer, which would be unauthenticated. Clicking opens the
 * full-size image in a new tab.
 */
export function ReportPhoto({
  mediaId,
  alt,
  size = 64,
}: {
  mediaId: string;
  alt?: string;
  size?: number;
}) {
  const src = `/api/media/${mediaId}`;
  return (
    <a href={src} target="_blank" rel="noopener noreferrer" className="inline-block">
      <Image
        src={src}
        alt={alt ?? 'Report photo'}
        width={size}
        height={size}
        unoptimized
        className="rounded-md border object-cover transition-opacity hover:opacity-80"
        style={{ width: size, height: size }}
      />
    </a>
  );
}
