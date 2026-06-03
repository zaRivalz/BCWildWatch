import { RecentSightings } from '@/components/recent-sightings';
import { Hero } from '@/components/hero';

export default function Home() {
  return (
    <div className="space-y-10">
      <Hero />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Recent sightings</h2>
        <RecentSightings />
      </section>
    </div>
  );
}
