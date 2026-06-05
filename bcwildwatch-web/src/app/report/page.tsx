import { ReportForm } from '@/components/report-form';
import { PageHead } from '@/components/page-head';
import { Icon } from '@/components/icons';

const TIPS = [
  'Keep your distance — never try to catch or corner an animal.',
  'Add a clear location so security can find it fast.',
  'Photos help, but only if you can take one safely.',
];

export default function ReportPage() {
  return (
    <div className="wrap form-wrap">
      <PageHead
        eyebrow="Report a sighting"
        icon="pin"
        title="Spotted something? Report it."
        sub="Tell us what you saw and where. Your report reaches campus security right away."
      />

      <div className="report-layout">
        <ReportForm />

        <aside className="report-rail">
          <div className="card emergency-card">
            <div className="emergency-card__ico">
              <Icon.phone size={20} />
            </div>
            <h4>In immediate danger?</h4>
            <p className="muted">
              If someone is hurt or at risk, call campus security first — then file this
              report.
            </p>
            <a href="tel:+27105935368" className="btn btn--danger btn--block">
              <Icon.phone size={17} /> Call security
            </a>
          </div>

          <div className="card tips-card">
            <h4>
              <Icon.shield size={18} /> Stay safe while reporting
            </h4>
            <ul>
              {TIPS.map((t) => (
                <li key={t}>
                  <span />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
