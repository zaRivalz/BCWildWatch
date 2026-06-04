import { Card } from '@/components/ui/card';
import { Reveal } from '@/components/reveal';
import { WildWatchAssistant } from '@/components/wildwatch-assistant';
import { SAFETY_TIPS, EMERGENCY_CONTACTS, dangerBadgeClass } from '@/lib/safetyTips';

export default function SafetyPage() {
  const chatbotUrl = process.env.CHATBOT_URL;

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold">Safety Info</h1>
        <p className="text-sm text-muted-foreground">
          What to do if you encounter wildlife on campus. When in doubt, keep your
          distance and report the sighting so security can respond.
        </p>
      </section>

      <section className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
        <h2 className="mb-2 text-sm font-semibold text-red-800 dark:text-red-300">In an emergency</h2>
        <ul className="space-y-1 text-sm">
          {EMERGENCY_CONTACTS.map((c) => (
            <li key={c.label}>
              <span className="font-medium">{c.label}:</span>{' '}
              <span className="text-muted-foreground">{c.value}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Animal safety guide</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {SAFETY_TIPS.map((tip, i) => (
            <Reveal key={tip.animal} delay={i * 0.05}>
              <Card className="space-y-3 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 font-semibold">
                    <span aria-hidden>{tip.emoji}</span>
                    {tip.animal}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${dangerBadgeClass(tip.danger)}`}>
                    {tip.danger} risk
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Do</p>
                  <ul className="ml-4 list-disc text-sm">
                    {tip.whatToDo.map((t) => <li key={t}>{t}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Avoid</p>
                  <ul className="ml-4 list-disc text-sm">
                    {tip.avoid.map((t) => <li key={t}>{t}</li>)}
                  </ul>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Ask the WildWatch assistant</h2>
        {chatbotUrl ? (
          <iframe
            title="BC WildWatch Assistant"
            src={chatbotUrl}
            className="h-[60vh] w-full rounded-lg border"
          />
        ) : (
          <WildWatchAssistant />
        )}
      </section>
    </div>
  );
}
