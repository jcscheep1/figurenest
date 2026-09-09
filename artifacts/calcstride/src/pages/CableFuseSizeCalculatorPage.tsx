import { useEffect, useMemo, useState } from 'react';
import '@/styles/advanced-calculator-pages.css';
import { Seo } from '@/pages/AppPages';
import { Shell } from '@/components/FigureNestShell';
import { Link } from '@/components/PublicLink';
import { ElectricalPreferencesSelector } from '@/components/ElectricalPreferencesSelector';
import { calculateCableFuseSize, type CableFuseInput } from '@/lib/cable-fuse-size';
import { useElectricalPreferences } from '@/lib/electrical-preferences';

const DEFAULTS: Omit<CableFuseInput, 'voltage' | 'phase'> = {
  loadMode: 'amps',
  load: 20,
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
  const { preferences } = useElectricalPreferences();
  const [input, setInput] = useState<CableFuseInput>(() => ({ ...DEFAULTS, voltage: preferences.voltage, phase: preferences.phase }));
  useEffect(() => {
    setInput((current) => ({ ...current, voltage: preferences.voltage, phase: preferences.phase }));
  }, [preferences.phase, preferences.voltage]);
  const result = useMemo(() => calculateCableFuseSize(input), [input]);
  const validResult = 'error' in result ? undefined : result;
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
          <p>Estimate a practical conductor size, protective-device rating, design current and voltage drop for a low-voltage circuit. Supply voltage and phase use the shared FigureNest electrical preference, with common international voltages or a custom value.</p>
        </header>

        <section className="advanced-calculator-card" aria-labelledby="cable-fuse-card-title">
          <div className="advanced-calc-head"><span id="cable-fuse-card-title" className="mono">CABLE &amp; FUSE SIZE — CALCULATE</span><div className="live-dot"><i /> LIVE RESULT</div></div>
          <div className="date-method-notes" role="note"><p><strong>Electrical supply preference:</strong> Change voltage or phase here and the same preference is used by other applicable FigureNest electrical calculators.</p></div>
          <ElectricalPreferencesSelector idPrefix="cable-fuse-supply" />
          <div className="advanced-fields">
            <label className="advanced-field"><span>Load entry</span><div><select value={input.loadMode} onChange={(e) => update('loadMode', e.target.value as CableFuseInput['loadMode'])} data-testid="input-cable-fuse-load-mode"><option value="amps">Current (A)</option><option value="watts">Power (W)</option><option value="kw">Power (kW)</option></select></div></label>
            <label className="advanced-field"><span>{input.loadMode === 'amps' ? 'Load current (A)' : input.loadMode === 'kw' ? 'Load power (kW)' : 'Load power (W)'}</span><div><input type="number" min="0" step="any" value={input.load} onChange={(e) => update('load', Number(e.target.value))} data-testid="input-cable-fuse-load" /></div></label>
            <label className="advanced-field"><span>Power factor</span><div><input type="number" min="0.01" max="1" step="0.01" value={input.powerFactor} onChange={(e) => update('powerFactor', Number(e.target.value))} /></div></label>
            <label className="advanced-field"><span>Cable length</span><div><input type="number" min="0" step="any" value={input.length} onChange={(e) => update('length', Number(e.target.value))} /></div></label>
            <label className="advanced-field"><span>Length unit</span><div><select value={input.lengthUnit} onChange={(e) => update('lengthUnit', e.target.value as CableFuseInput['lengthUnit'])}><option value="m">Metres (m)</option><option value="ft">Feet (ft)</option></select></div></label>
            <label className="advanced-field"><span>Conductor material</span><div><select value={input.material} onChange={(e) => update('material', e.target.value as CableFuseInput['material'])}><option value="copper">Copper</option><option value="aluminium">Aluminium</option></select></div></label>
            <label className="advanced-field"><span>Installation method</span><div><select value={input.installation} onChange={(e) => update('installation', e.target.value as CableFuseInput['installation'])}><option value="clipped-direct">Clipped / direct</option><option value="conduit">In conduit</option><option value="insulated">Enclosed by insulation</option></select></div></label>
            <label className="advanced-field"><span>Cable insulation</span><div><select value={input.insulation} onChange={(e) => update('insulation', e.target.value as CableFuseInput['insulation'])}><option value="pvc70">PVC 70 °C</option><option value="xlpe90">XLPE 90 °C</option></select></div></label>
            <label className="advanced-field"><span>Ambient temperature (°C)</span><div><input type="number" min="-20" max="60" step="1" value={input.ambientC} onChange={(e) => update('ambientC', Number(e.target.value))} /></div></label>
            <label className="advanced-field"><span>Voltage-drop limit (%)</span><div><select value={String(input.voltageDropLimitPct)} onChange={(e) => update('voltageDropLimitPct', Number(e.target.value))}><option value="3">3%</option><option value="5">5%</option></select></div></label>
          </div>

          <div className={`advanced-result${error ? ' has-error' : ''}`} data-testid="status-cable-fuse-size" role="status" aria-live="polite" aria-atomic="true">
            <span className="mono">{error ? 'CHECK THE VALUES' : 'RECOMMENDED CABLE'}</span>
            <strong>{error ? error : `${validResult!.cableSizeMm2} mm² ${input.material === 'copper' ? 'Cu' : 'Al'}`}</strong>
            {validResult && <p>{validResult.breakerA ? `Recommended protective device: ${validResult.breakerA} A. ` : 'No coordinated standard protective-device rating found. '}{validResult.voltageDropPass ? 'Voltage drop is within the selected limit.' : 'Voltage drop exceeds the selected limit.'}</p>}
          </div>

          {validResult && <>
            <div className="advanced-breakdown">
              <div><span>Supply basis</span><strong>{input.voltage} V · {input.phase === 'single' ? 'single-phase' : 'three-phase'}</strong></div>
              <div><span>Design current</span><strong>{fmt(validResult.designCurrentA)} A</strong></div>
              <div><span>Protective device</span><strong>{validResult.breakerA ? `${validResult.breakerA} A` : 'Review required'}</strong></div>
              <div><span>Corrected cable capacity</span><strong>{fmt(validResult.correctedAmpacityA)} A</strong></div>
              <div><span>Voltage drop</span><strong>{fmt(validResult.voltageDropV)} V</strong></div>
              <div><span>Voltage drop</span><strong>{fmt(validResult.voltageDropPct)}%</strong></div>
              <div><span>Drop limit</span><strong>{validResult.voltageDropPass ? 'PASS' : 'FAIL'}</strong></div>
            </div>
            {validResult.warnings.length > 0 && <div className="advanced-content"><section><div className="eyebrow">WARNINGS</div><h2>Review before using the result.</h2>{validResult.warnings.map((warning: string) => <p key={warning}>{warning}</p>)}</section></div>}
          </>}

          <button type="button" className="reset-button mt-6" onClick={() => setInput({ ...DEFAULTS, voltage: preferences.voltage, phase: preferences.phase })} data-testid="button-reset-cable-fuse-size">Reset values</button>
        </section>
      </div>

      <div className="advanced-content-grid">
        <article className="advanced-content">
          <section><div className="eyebrow">METHOD</div><h2>How the cable and fuse estimate is built.</h2><p>The tool first calculates design current. For power entries, single-phase current uses I = P ÷ (V × power factor), while three-phase current uses I = P ÷ (√3 × V × power factor). The shared supply voltage therefore changes the calculated current when power rather than amperage is entered.</p></section>
          <section><div className="eyebrow">PROTECTION</div><h2>How the breaker or fuse is selected.</h2><p>The calculator chooses the smallest standard protective-device rating that is at least the design current but does not exceed the corrected cable current capacity. If no supported rating satisfies both conditions, the result deliberately reports that manual design review is required instead of recommending an oversized device.</p></section>
          <section><div className="eyebrow">VOLTAGE DROP</div><h2>Length and supply voltage are both checked.</h2><p>For single-phase circuits the estimate uses 2 × I × L × R. For three-phase circuits it uses √3 × I × L × R. The voltage-drop percentage is then calculated against the selected supply voltage, so the same volt loss represents a larger percentage on a lower-voltage system.</p></section>
          <section><div className="eyebrow">SAFETY</div><h2>This is a planning estimate, not electrical approval.</h2><p>Electrical cable and protective-device selection also depends on exact cable construction, grouping, installation method, fault-loop impedance, short-circuit withstand, disconnection time, RCD requirements, equipment starting current and local rules. Final design and installation must comply with the applicable electrical code, manufacturer instructions and site conditions, and should be checked by a qualified electrical professional.</p></section>
          <section className="advanced-faq"><div className="eyebrow">FAQ</div><h2>Common questions.</h2><details><summary>Why can a longer cable require a larger size?</summary><p>Longer conductors have more resistance, so voltage drop increases even when current stays the same. The calculator therefore reports ampacity and voltage-drop checks separately.</p></details><details><summary>Can I simply fit the next larger fuse?</summary><p>No. A protective device must be coordinated with the conductor and load. This tool will not recommend a standard device whose rating exceeds the corrected cable capacity.</p></details><details><summary>Which supply voltages can I use?</summary><p>FigureNest provides common international presets from 110 V through 480 V plus a custom voltage option. Select single-phase or three-phase separately and verify that the chosen value matches the actual system being designed.</p></details></section>
          <section><div className="eyebrow">ASSUMPTIONS</div><h2>What is not included.</h2><p>The current version does not calculate grouping factors, harmonic loading, motor starting protection, fault-loop impedance, RCD selection, short-circuit energy withstand or required disconnection time. These are intentionally excluded rather than hidden behind a false “safe” result.</p></section>
        </article>
        <aside><div className="related-tools"><div className="eyebrow">RELATED TOOLS</div><Link href="/calculators/electrical/voltage-drop" className="advanced-aside-link">Voltage Drop Calculator</Link><Link href="/calculators/electrical/ohms-law" className="advanced-aside-link">Ohm's Law Calculator</Link><Link href="/calculators/electrical/electricity" className="advanced-aside-link">Electricity Calculator</Link></div></aside>
      </div>
    </div>
  </Shell>;
}
