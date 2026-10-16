import { useState } from 'react';
import useRequestTrace from '../hooks/useRequestTrace';
import useTilt from '../hooks/useTilt';
import useProgress from '../motion/useProgress';

/*
 * The exploded software stack. It assembles on load, then requests cycle
 * through it on their own. Resting the pointer on a layer or its label
 * selects it; the whole drawing leans towards the pointer and the layers
 * drift further apart as the intro scrolls away.
 */
const LAYERS = [
  { name: 'Interface', tools: 'React · SwiftUI', detail: 'Interfaces that make the complicated feel simple.', position: -108 },
  { name: 'Logic', tools: 'C# / .NET · TypeScript', detail: 'Business logic and integrations that do the heavy lifting.', position: 0 },
  { name: 'Data', tools: 'PostgreSQL · Oracle', detail: 'A dependable foundation, from schema to access control.', position: 108 },
];
const SIGNALS = ['M90 121H62V229H90', 'M90 229H62V337H90', 'M90 337H62V229H90', 'M90 229H62V121H90'];
const STEPS = ['Interface sends a request', 'Logic processes the request', 'Data returns a result', 'Logic prepares the response', 'Interface renders the result'];

export default function SystemSketch() {
  const [selected, setSelected] = useState(1);
  const trace = useRequestTrace();
  const tilt = useTilt({ max: 7 });
  const progress = useProgress({ start: ['top', 0.3], end: ['bottom', 0] });
  const highlighted = trace.running ? trace.activeLayer : selected;

  const setRefs = (node) => { trace.element.current = node; tilt.current = node; progress.current = node; };
  const choose = (i) => { trace.stop(); setSelected(i); };

  return (
    <figure className={`system-sketch${trace.running ? ' is-tracing' : ''}`} ref={setRefs}>
      <svg className="system-sketch__drawing" viewBox="0 0 600 540" role="img" aria-label={`An exploded software stack with the ${LAYERS[highlighted].name.toLowerCase()} layer highlighted`}>
        <defs>
          <pattern id="sketch-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="currentColor" opacity=".18" />
          </pattern>
        </defs>
        <g className="sketch-guides" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 7">
          <path d="M90 116V403 M290 20V512 M500 125V412" />
          <path d="M26 385L295 540 574 379 M26 167L295 12 574 167" />
        </g>
        {[2, 1, 0].map(i => (
          <g
            key={i}
            className={`sketch-layer sketch-layer--${i}${highlighted === i ? ' is-selected' : ''}`}
            style={{ '--layer-y': `${LAYERS[i].position}px`, '--depth': i - 1 }}
            onPointerEnter={() => choose(i)}
          >
            <path className="sketch-layer__edge" d="M90 245L290 360 500 239V223L290 343 90 229Z" />
            <path className="sketch-layer__face" d="M90 229L290 113 500 223 290 343Z" />
            <path className="sketch-layer__inset" d="M118 229L290 130 470 223 290 325Z" />
            {i === 0 && <g className="sketch-glyph" fill="none" strokeWidth="2">
              <path d="M180 225L278 169 397 231 300 287Z M196 216L315 278 M212 206L331 269" />
              <path d="M245 220L285 197 344 228 304 251Z M260 264L290 247 M269 269L300 252" />
              <circle cx="199" cy="225" r="2" /><circle cx="210" cy="231" r="2" />
            </g>}
            {i === 1 && <g className="sketch-glyph" fill="none" strokeWidth="2">
              <path d="M217 223L260 198 303 221 260 246Z M310 273L353 248 397 271 353 296Z M313 169L356 144 399 167 356 192Z" />
              <path d="M303 221L329 207 329 178 M260 246L285 260 310 246 332 258 M399 167L426 182 426 230 375 258" />
              <circle cx="260" cy="222" r="5" /><circle cx="354" cy="169" r="5" /><circle cx="353" cy="273" r="5" />
            </g>}
            {i === 2 && <g className="sketch-glyph" fill="none" strokeWidth="2">
              <path d="M225 212L288 176 368 219 306 256Z M225 225L306 269 368 232 M225 238L306 282 368 245 M225 212V238 M306 256V282 M368 219V245" />
              <path d="M247 211L289 187 345 217 M316 251V268 M327 245V261 M339 238V255" />
            </g>}
            <circle className="sketch-layer__pin" cx="90" cy="229" r="4" />
            <path className="sketch-label-line" d="M500 223H542" />
            <text className="sketch-label" x="548" y="228">{['UI', 'API', 'DB'][i]}</text>
          </g>
        ))}
        {trace.running && trace.phase < 4 && <path key={trace.phase} className="sketch-signal" d={SIGNALS[trace.phase]} pathLength="1" fill="none" />}
      </svg>
      <figcaption>
        <div className="sketch-selector" role="group" aria-label="Explore the software stack">
          {LAYERS.map((layer, i) => (
            <button key={layer.name} type="button" aria-pressed={highlighted === i} onPointerEnter={() => choose(i)} onFocus={() => choose(i)} onClick={() => choose(i)}>{layer.name}</button>
          ))}
        </div>
        <div className="sketch-explanation" aria-live={trace.running ? 'off' : 'polite'}>
          <p>{LAYERS[highlighted].detail}</p>
          <span>{LAYERS[highlighted].tools}</span>
        </div>
        <div className="trace-control">
          <span className="trace-control__live" aria-hidden="true">
            <i className={trace.running ? 'is-on' : ''} />
            {trace.running ? STEPS[trace.phase] : trace.cycles ? `${trace.cycles} request${trace.cycles === 1 ? '' : 's'} completed · the next is on its way` : 'Requests run through the stack on their own.'}
          </span>
          <button type="button" onClick={trace.run} aria-label="Run a request through the software stack"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 8 6-8 6Z" /></svg>Replay</button>
          <span className="sr-only" role="status">{trace.hasRun && !trace.running ? 'Request complete: interface, logic, data, and back.' : ''}</span>
        </div>
      </figcaption>
    </figure>
  );
}
