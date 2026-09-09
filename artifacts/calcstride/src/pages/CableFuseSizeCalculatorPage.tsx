import { useMemo, useState } from 'react';
import '@/styles/advanced-calculator-pages.css';
import { Seo } from '@/pages/AppPages';
import { Shell } from '@/components/FigureNestShell';
import { Link } from '@/components/PublicLink';
import { calculateCableFuseSize, type CableFuseInput } from '@/lib/cable-fuse-size';

const DEFAULTS: CableFuseInput = {
  loadMode: 'amps',
  load: 20,
  supply: 'single-230',
  powerFactor: 1,
  length: 20,
  lengthUnit: 'm',
  material: 'copper',
  installation: 'clipped-direct',
  insulation: 'pvc70',
  ambientC: 30,
  voltageDropLimitPct: 5,
};

const fmt = (value: number, digits = 2) => value.toLocaleString('en-US', { maximumFractionDigits: digits });

export function CableFuseSizeCalculatorPage() {
  const [input, setInput] = useState<CableFuseInput>(DEFAULTS);
  const result = useMemo(() => calculateCableFuseSize(input), [input]);
  const error = 'error' in result ? result.error : undefined;
  const update = <K extends keyof CableFuseInput>(key: K, value: CableFuseInput[K]) => setInput((current) => ({ ...current, [key]: value }));

  return <Shell>
    <Seo path="/calculators/electrical/cable-fuse-size" />
    <div className="advanced-calc-page" data-testid="page-cable-fuse-size">
      <nav aria-label="Breadcrumb" className="mono">
        <Link href="/">Home</Link> / <Link href="/category/electrical">Electrical</Link> / Cable &amp; Fuse Size Calculator
      </nav>

      <div className="advanced-calc-layout">
        <header className="advanced-calc-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> FIGURENEST ELECTRICAL</div>
          <h1>Cable &amp; Fuse Size Calculator<span>.</span></h1>
          <p>Estimate a practical conductor size, protective-device rating, design current and voltage drop for a low-voltage circuit. The calculator supports 230 V single-phase and 400 V three-phase supplies, metres or feet, copper or aluminium, and common installation conditions.</p>
        </header>

        <section className="advanced-calculator-card" aria-labelledby="cable-fuse-card-title">
          <div className="advanced-calc-head"><span id="cable-fuse-card-title" className="mono">CABLE &amp; FUSE SIZE — CALCULATE</span><div className="live-dot"><i /> LIVE RESULT</div></div>
          <div className="advanced-fields">
            <label className="advanced-field"><span>Load entry</span><div><select value={input.loadMode} onChange={(e) => update('loadMode', e.target.value as CableFuseInput['loadMode'])} data-testid="input-cable-fuse-load-mode"><option value="amps">Current (A)</option><option value="watts">Power (W)</option><option value="kw">Power (kW)</option></select></div></label>
            <label className="advanced-field"><span>{input.loadMode === 'amps' ? 'Load current (A)' : input.loadMode === 'kw' ? 'Load power (kW)' : 'Load power (W)'}</span><div><input type="number" min="0" step="any" value={input.load} onChange={(e) => update('load', Number(e.target.value))} data-testid="input-cable-fuse-load" /></div></label>
            <label className="advanced-field"><span>Supply system</span><div><select value={input.supply} onChange={(e) => update('supply', e.target.value as CableFuseInput['supply'])}><option value="single-230">230 V single-phase</option><option value="three-400">400 V three-phase</option></select></div></label>
            <label className="advanced-field"><span>Power factor</span><div><input type="number" min="0.01" max="1" step="0.01" value={input.powerFactor} onChange={(e) => update('powerFactor', Number(e.target.value))} /></div></label>
            <label className="advanced-field"><span>Cable length</span><div><input type="number" min="0" step="any" value={input.length} onChange={(e) => update('length', Number(e.target.value))} /></div></label>
            <label className="advanced-field"><span>Length unit</span><div><select value={input.lengthUnit} onChange={(e) => update('lengthUnit', e.target.value as CableFuseInput['lengthUnit'])}><option value="m">Metres (m)</option><option value="ft">Feet (ft)</option></select></div></label>
            <label className="advanced-field"><span>Conductor material</span><div><select value={input.material} onChange={(e) => update('material', e.target.value as CableFuseInput['material'])}><option value="copper">Copper</option><option value="aluminium">Aluminium</option></select></div></label>
            <label className="advanced-field"><span>Installation method</span><div><select value={input.installation} onChange={(e) => update('installation', e.target.value as CableFuseInput['installation'])}><option value="clipped-direct">Clipped / direct</option><option value="conduit">In conduit</option><option value="insulated">Enclosed by insulation</option></select></div></label>
            <label className="advanced-field"><span>Cable insulation</span><div><select value={input.insulation} onChange={(e) => update('insulation', e.target.value as CableFuseInput['insulation'])}><option value="pvc70">PVC 70 °C</option><option value="xlpe90">XLPE 90 °C</option></select></div></label>
            <label className="advanced-field"><span>Ambient temperature (°C)</span><div><input type="number" min="-20" max="60" step="1" value={input.ambientC} onChange={(e) => update('ambientC', Number(e.target.value))} /></div></label>
            <label className="advanced-field"><span>Voltage-drop limit (%)</span><div><select value={String(input.voltageDropLimitPct)} onChange={(e) => update('voltageDropLimitPct', Number(e.target.value))}><option value="3">3%</option><option value="5">5%</option></select></div></label>
          </div>

          <div className={`advanced-result${error ? ' has-error' : ''}`} data-testid="status-cable-fuse-size">
            <span className="mono">{error ? 'CHECK THE VALUES' : 'RECOMMENDED CABLE'}</span>
            <strong>{error ? error : `${result.cableSizeMm2} mm² ${input.material === 'copper' ? 'Cu' : 'Al'}`}</strong>
            {!error && <p>{result.breakerA ? `Recommended protective device: ${result.breakerA} A. ` : 'No coordinated standard protective-device rating found. '}{result.voltageDropPass ? 'Voltage drop is within the selected limit.' : 'Voltage drop exceeds the selected limit.'}</p>}
          </div>

          {!error && <>
            <div className="advanced-breakdown">
              <div><span>Design current</span><strong>{fmt(result.designCurrentA)} A</strong></div>
              <div><span>Protective device</span><strong>{result.breakerA ? `${result.breakerA} A` : 'Review required'}</strong></div>
              <div><span>Corrected cable capacity</span><strong>{fmt(result.correctedAmpacityA)} A</strong></div>
              <div><span>Voltage drop</span><strong>{fmt(result.voltageDropV)} V</strong></div>
              <div><span>Voltage drop</span><strong>{fmt(result.voltageDropPct)}%</strong></div>
              <div><span>Drop limit</span><strong>{result.voltageDropPass ? 'PASS' : 'FAIL'}</strong></div>
            </div>
            {result.warnings.length > 0 && <div className="advanced-content"><section><div className="eyebrow">WARNINGS</div><h2>Review before using the result.</h2>{result.warnings.map((warning) => <p key={warning}>{warning}</p>)}</section></div>}
          </>}

          <button type="button" className="reset-button mt-6" onClick={() => setInput(DEFAULTS)} data-testid="button-reset-cable-fuse-size">Reset values</button>
        </section>
      </div>

      <div className="advanced-content-grid">
        <article className="advanced-content">
          <section><div className="eyebrow">METHOD</div><h2>How the cable and fuse estimate is built.</h2><p>The tool first calculates design current. For power entries, single-phase current uses I = P ÷ (V × power factor), while three-phase current uses I = P ÷ (√3 × V × power factor). It then applies conservative planning factors for conductor material, insulation temperature rating, ambient temperature and installation method before choosing the smallest supported conductor whose corrected current capacity is at least the design current.</p></section>
          <section><div className="eyebrow">PROTECTION</div><h2>How the breaker or fuse is selected.</h2><p>The calculator chooses the smallest standard protective-device rating that is at least the design current but does not exceed the corrected cable current capacity. If no supported rating satisfies both conditions, the result deliberately reports that manual design review is required instead of recommending an oversized device.</p></section>
          <section><div className="eyebrow">VOLTAGE DROP</div><h2>Length is checked as well as ampacity.</h2><p>For single-phase circuits the estimate uses 2 × I × L × R. For three-phase circuits it uses √3 × I × L × R. Length is normalized to metres and conductor resistance is estimated from conductor material and cross-sectional area. A cable can carry the current but still be too small for a long run, which is why voltage drop is shown separately.</p></section>
          <section><div className="eyebrow">SAFETY</div><h2>This is a planning estimate, not electrical approval.</h2><p>Electrical cable and protective-device selection also depends on exact cable construction, grouping, installation method, fault-loop impedance, short-circuit withstand, disconnection time, RCD requirements, equipment starting current and local rules. Final design and installation must comply with the applicable electrical code, manufacturer instructions and site conditions, and should be checked by a qualified electrical professional.</p></section>
          <section className="advanced-faq"><div className="eyebrow">FAQ</div><h2>Common questions.</h2><details><summary>Why can a longer cable require a larger size?</summary><p>Longer conductors have more resistance, so voltage drop increases even when current stays the same. The calculator therefore reports ampacity and voltage-drop checks separately.</p></details><details><summary>Can I simply fit the next larger fuse?</summary><p>No. A protective device must be coordinated with the conductor and load. This tool will not recommend a standard device whose rating exceeds the corrected cable capacity.</p></details><details><summary>Is this calculator specific to Belgium?</summary><p>The calculator is intended as a conservative IEC-style planning aid for common European low-voltage systems, including 230 V single-phase and 400 V three-phase supplies. It is not a substitute for an AREI/RGIE compliance assessment or an official wiring table.</p></details></section>
          <section><div className="eyebrow">ASSUMPTIONS</div><h2>What is not included.</h2><p>The current version does not calculate grouping factors, harmonic loading, motor starting protection, fault-loop impedance, RCD selection, short-circuit energy withstand or required disconnection time. These are intentionally excluded rather than hidden behind a false “safe” result.</p></section>
        </article>
        <aside><div className="related-tools"><div className="eyebrow">RELATED TOOLS</div><Link href="/calculators/electrical/voltage-drop" className="advanced-aside-link">Voltage Drop Calculator</Link><Link href="/calculators/electrical/ohms-law" className="advanced-aside-link">Ohm's Law Calculator</Link><Link href="/calculators/electrical/electricity" className="advanced-aside-link">Electricity Calculator</Link></div></aside>
      </div>
    </div>
  </Shell>;
}
