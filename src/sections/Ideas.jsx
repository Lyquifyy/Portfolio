import SectionHeader from '../components/SectionHeader';
import SpotlightCard from '../components/SpotlightCard';
import { IDEAS } from '../data/content';

export default function Ideas() {
  return (
    <section id="ideas" className="section">
      <div className="section__inner">
        <SectionHeader num="06" title="Future Ideas" />

        <p className="section__intro">
          Projects I&apos;m planning to build next, with rough scope and timelines.
        </p>

        <div className="grid-2">
          {IDEAS.map((idea, i) => (
            <SpotlightCard key={idea.title} className="idea-card" delay={(i % 2) * 0.1}>
              <div className="card__head">
                <h3 className="card__title">{idea.title}</h3>
                <span className="pill pill--accent">{idea.timeline}</span>
              </div>

              <p className="card__desc">{idea.description}</p>

              <div className="tags tags--spaced">
                {idea.features.map((f) => (
                  <span key={f} className="tag tag--outline">
                    {f}
                  </span>
                ))}
              </div>

              <div className="tags">
                {idea.techs.map((t) => (
                  <span key={t} className="tag tag--muted">
                    {t}
                  </span>
                ))}
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}
