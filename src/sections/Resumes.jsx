import SectionHeader from '../components/SectionHeader';
import SpotlightCard from '../components/SpotlightCard';
import MagneticButton from '../components/MagneticButton';
import { RESUMES } from '../data/content';

export default function Resumes() {
  return (
    <section id="resumes" className="section">
      <div className="section__inner">
        <SectionHeader num="05" title="Resumes" />

        <p className="section__intro">Download a resume tailored to the role you&apos;re hiring for.</p>

        <div className="grid-2">
          {RESUMES.map((resume, i) => (
            <SpotlightCard key={resume.title} className="resume-card" delay={i * 0.12}>
              <h3 className="card__title">{resume.title}</h3>
              <p className="card__desc">{resume.description}</p>

              <ul className="bullet-list">
                {resume.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>

              <MagneticButton
                variant="primary"
                href={resume.file}
                download
                className="resume-card__download"
              >
                Download PDF
              </MagneticButton>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}
