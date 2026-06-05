import { PageHead } from '@/components/page-head';
import { WildWatchAssistant } from '@/components/wildwatch-assistant';
import { AnimalToken, kindForName, type RiskTone } from '@/components/animal-glyph';
import { RiskBadge } from '@/components/status-pill';
import { Icon } from '@/components/icons';
import { SAFETY_TIPS, type DangerLevel } from '@/lib/safetyTips';

const RISK_FOR: Record<DangerLevel, RiskTone> = {
  High: 'high',
  Moderate: 'medium',
  Low: 'low',
};

export default function SafetyPage() {
  return (
    <div className="wrap">
      <PageHead
        eyebrow="Safety guide"
        icon="shield"
        title="What to do when wildlife shows up"
        sub="When in doubt, keep your distance and report the sighting so security can respond. Here's how to stay safe with the animals most common on campus."
      />

      <div className="safety-layout">
        <div className="safety-cards">
          {SAFETY_TIPS.map((tip) => (
            <article key={tip.animal} className="card safety-card rise">
              <div className="safety-card__head">
                <span className="safety-card__tok">
                  <AnimalToken kind={kindForName(tip.animal)} size={56} />
                </span>
                <div>
                  <h3>{tip.animal}</h3>
                  <RiskBadge risk={RISK_FOR[tip.danger]} />
                </div>
              </div>

              <div className="dd-grid">
                <div className="dd dd--do">
                  <div className="dd__h">
                    <Icon.check size={14} sw={2.4} /> Do
                  </div>
                  <ul>
                    {tip.whatToDo.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div className="dd dd--dont">
                  <div className="dd__h">
                    <Icon.x size={14} sw={2.4} /> Avoid
                  </div>
                  <ul>
                    {tip.avoid.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="safety-ai">
          <WildWatchAssistant />
        </aside>
      </div>
    </div>
  );
}
