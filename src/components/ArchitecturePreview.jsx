import useRequestTrace from '../hooks/useRequestTrace';

/*
 * ExpenseTracker's three layers. A request travels client → API →
 * database → back on its own while the stage is on screen.
 */
const NODES = [
  { label: 'Client', title: 'React + TypeScript', detail: 'TanStack Query' },
  { label: 'Application', title: '.NET 8 Web API', detail: 'FluentValidation · AutoMapper' },
  { label: 'Persistence', title: 'PostgreSQL', detail: 'Docker Compose · Migrations' },
];

export default function ArchitecturePreview() {
  const trace = useRequestTrace();
  return <div className={`architecture-preview project-stage${trace.running ? ' is-tracing' : ''}`} ref={trace.element}>
    <div className="architecture-preview__head"><span>ExpenseTracker</span><span>Architecture overview</span></div>
    <div className="architecture-flow">
      {NODES.map((node, index) => <div key={node.label} className="architecture-step" style={{ '--i': index }}>
        {index > 0 && <div className={`architecture-connector${trace.running && (trace.phase === index - 1 || trace.phase === 4 - index) ? ' is-active' : ''}${trace.phase > 1 ? ' is-returning' : ''}`}><i aria-hidden="true" /><span>{index === 1 ? 'HTTP / JSON' : 'Entity Framework Core'}</span></div>}
        <div className={`architecture-node${trace.activeLayer === index ? ' is-active' : ''}`}><span>{node.label}</span><strong>{node.title}</strong><small>{node.detail}</small></div>
      </div>)}
    </div>
    <div className="architecture-action">
      <button type="button" onClick={trace.run} aria-label="Trace a request">Replay<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h13m-5-5 5 5-5 5" /></svg></button>
      <p role="status">{trace.running ? 'Client → API → database → back.' : trace.cycles ? `${trace.cycles} request${trace.cycles === 1 ? '' : 's'} traced. The next one is queued.` : 'Three layers. One connected system.'}</p>
    </div>
  </div>;
}
