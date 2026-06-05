/**
 * Power BI publish-to-web embed that *covers* its (positioned) parent regardless
 * of the parent's aspect ratio. The iframe is locked to the report's 16:9 page
 * aspect (`aspectRatio`) so Power BI never letterboxes the map with white bars;
 * it is then over-sized in height — taller than the parent — and centred, so the
 * fixed title bar (top) and footer / zoom slider (bottom) overflow and get
 * clipped, and any leftover width is cropped at the sides. This keeps the map
 * filling both the tall hero card and the wide 16:9 map page with no white edges.
 */
export function MapFrame({ src, title = 'BC WildWatch Map' }: { src: string; title?: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        borderRadius: 'inherit',
      }}
    >
      <iframe
        title={title}
        src={src}
        style={{
          position: 'absolute',
          left: '50%',
          top: '-44px',
          transform: 'translateX(-50%)',
          height: 'calc(100% + 200px)',
          aspectRatio: '16 / 9',
          minWidth: '100%',
          border: 'none',
          display: 'block',
        }}
        allowFullScreen
      />
    </div>
  );
}
