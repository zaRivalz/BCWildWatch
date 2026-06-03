export default function MapPage() {
  const url = process.env.POWERBI_MAP_URL;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Live Sightings Map</h1>
      {url
        ? <iframe title="BC WildWatch Map" src={url} className="h-[70vh] w-full rounded-lg border" allowFullScreen />
        : <p className="text-muted-foreground">Map URL not configured.</p>}
    </div>
  );
}
