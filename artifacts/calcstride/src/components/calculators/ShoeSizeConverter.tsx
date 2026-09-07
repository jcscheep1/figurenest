import { useMemo, useState } from 'react';
import '@/styles/advanced-calculator-pages.css';
import { Shell } from '@/components/FigureNestShell';
import { Seo } from '@/pages/AppPages';

type Group = 'baby' | 'kids' | 'women' | 'men';
type Region = 'US' | 'UK' | 'EU';
type ShoeRow = { us: number; uk: number; eu: number; cm: number };

const tables: Record<Group, ShoeRow[]> = {
  baby: [
    { us: 1, uk: 0.5, eu: 16, cm: 9.5 }, { us: 2, uk: 1, eu: 17, cm: 10.2 },
    { us: 3, uk: 2, eu: 18, cm: 10.8 }, { us: 4, uk: 3, eu: 19, cm: 11.4 },
    { us: 5, uk: 4, eu: 20, cm: 12.1 }, { us: 5.5, uk: 4.5, eu: 21, cm: 12.7 },
    { us: 6, uk: 5, eu: 22, cm: 13.3 }, { us: 7, uk: 6, eu: 23, cm: 14.0 },
  ],
  kids: [
    { us: 8, uk: 7, eu: 24, cm: 14.6 }, { us: 9, uk: 8, eu: 25, cm: 15.2 },
    { us: 9.5, uk: 8.5, eu: 26, cm: 15.9 }, { us: 10, uk: 9, eu: 27, cm: 16.5 },
    { us: 11, uk: 10, eu: 28, cm: 17.1 }, { us: 11.5, uk: 10.5, eu: 29, cm: 17.8 },
    { us: 12, uk: 11, eu: 30, cm: 18.4 }, { us: 13, uk: 12, eu: 31, cm: 19.1 },
    { us: 1, uk: 13, eu: 32, cm: 19.7 }, { us: 2, uk: 1, eu: 33, cm: 20.3 },
    { us: 3, uk: 2, eu: 34, cm: 21.0 }, { us: 3.5, uk: 2.5, eu: 35, cm: 21.6 },
    { us: 4, uk: 3, eu: 36, cm: 22.2 }, { us: 5, uk: 4, eu: 37, cm: 22.9 },
    { us: 6, uk: 5, eu: 38, cm: 23.5 }, { us: 7, uk: 6, eu: 39, cm: 24.1 },
  ],
  women: [
    { us: 5, uk: 3, eu: 35.5, cm: 22.0 }, { us: 5.5, uk: 3.5, eu: 36, cm: 22.5 },
    { us: 6, uk: 4, eu: 36.5, cm: 23.0 }, { us: 6.5, uk: 4.5, eu: 37.5, cm: 23.5 },
    { us: 7, uk: 5, eu: 38, cm: 24.0 }, { us: 7.5, uk: 5.5, eu: 38.5, cm: 24.5 },
    { us: 8, uk: 6, eu: 39, cm: 25.0 }, { us: 8.5, uk: 6.5, eu: 40, cm: 25.5 },
    { us: 9, uk: 7, eu: 40.5, cm: 26.0 }, { us: 9.5, uk: 7.5, eu: 41, cm: 26.5 },
    { us: 10, uk: 8, eu: 42, cm: 27.0 }, { us: 10.5, uk: 8.5, eu: 42.5, cm: 27.5 },
    { us: 11, uk: 9, eu: 43, cm: 28.0 }, { us: 12, uk: 10, eu: 44.5, cm: 29.0 },
  ],
  men: [
    { us: 6, uk: 5, eu: 38.5, cm: 24.0 }, { us: 6.5, uk: 5.5, eu: 39, cm: 24.5 },
    { us: 7, uk: 6, eu: 40, cm: 25.0 }, { us: 7.5, uk: 6.5, eu: 40.5, cm: 25.5 },
    { us: 8, uk: 7, eu: 41, cm: 26.0 }, { us: 8.5, uk: 7.5, eu: 42, cm: 26.5 },
    { us: 9, uk: 8, eu: 42.5, cm: 27.0 }, { us: 9.5, uk: 8.5, eu: 43, cm: 27.5 },
    { us: 10, uk: 9, eu: 44, cm: 28.0 }, { us: 10.5, uk: 9.5, eu: 44.5, cm: 28.5 },
    { us: 11, uk: 10, eu: 45, cm: 29.0 }, { us: 11.5, uk: 10.5, eu: 45.5, cm: 29.5 },
    { us: 12, uk: 11, eu: 46, cm: 30.0 }, { us: 13, uk: 12, eu: 47.5, cm: 31.0 },
    { us: 14, uk: 13, eu: 48.5, cm: 32.0 }, { us: 15, uk: 14, eu: 49.5, cm: 33.0 },
  ],
};

const groupLabels: Record<Group, string> = { baby: 'Baby / toddler', kids: 'Children / youth', women: 'Women', men: 'Men' };
const keyForRegion: Record<Region, keyof ShoeRow> = { US: 'us', UK: 'uk', EU: 'eu' };
const fmt = (n: number) => Number.isInteger(n) ? String(n) : n.toFixed(1);

export function ShoeSizeConverter() {
  const [group, setGroup] = useState<Group>('men');
  const [region, setRegion] = useState<Region>('EU');
  const [size, setSize] = useState('42.5');
  const rows = tables[group];
  const result = useMemo(() => {
    const value = Number(size);
    if (!size.trim() || !Number.isFinite(value)) return undefined;
    const key = keyForRegion[region];
    return rows.reduce((best, row) => Math.abs(Number(row[key]) - value) < Math.abs(Number(best[key]) - value) ? row : best, rows[0]);
  }, [group, region, rows, size]);

  const changeGroup = (next: Group) => {
    setGroup(next);
    const row = tables[next][Math.floor(tables[next].length / 2)];
    setSize(fmt(Number(row[keyForRegion[region]])));
  };

  return <Shell><Seo path="/converters/shoe-size" /><div className="advanced-calc-page shoe-size-page" data-testid="page-shoe-size">
    <div className="advanced-calc-layout">
      <header className="advanced-calc-copy"><div className="eyebrow"><span className="eyebrow-dot" /> FIGURENEST CONVERTERS</div><h1>Shoe Size Converter<span>.</span></h1><p>Convert shoe sizes across US, UK and EU systems for babies, children, women and men using age-group-specific reference tables.</p><div className="date-method-notes" role="note"><p><strong>Fit note:</strong> Shoe sizing is not perfectly standardized between brands. Use the conversion as a reference, then check the manufacturer’s size chart and measured foot length.</p></div></header>
      <section className="advanced-calculator-card" aria-label="Shoe size converter">
        <div className="advanced-calc-head"><span className="mono">SHOE SIZE — CONVERT</span><div className="live-dot"><i /> LOCAL RESULT</div></div>
        <div className="advanced-fields">
          <label className="advanced-field"><span>Who is the shoe for?</span><div><select value={group} onChange={(e)=>changeGroup(e.target.value as Group)} data-testid="select-shoe-group">{(Object.keys(groupLabels) as Group[]).map((key)=><option key={key} value={key}>{groupLabels[key]}</option>)}</select></div></label>
          <label className="advanced-field"><span>Input sizing system</span><div><select value={region} onChange={(e)=>{const next=e.target.value as Region;setRegion(next);const row=result??rows[0];setSize(fmt(Number(row[keyForRegion[next]])));}} data-testid="select-shoe-region"><option value="US">US</option><option value="UK">UK</option><option value="EU">EU</option></select></div></label>
          <label className="advanced-field"><span>Shoe size</span><div><input type="number" step="0.5" value={size} onChange={(e)=>setSize(e.target.value)} data-testid="input-shoe-size" /></div></label>
        </div>
        <div className={`shoe-result-panel${!result?' has-error':''}`}>
          <div className="advanced-result"><span className="mono">{result?'CLOSEST REFERENCE SIZE':'CHECK THE SIZE'}</span><strong className="advanced-result-output">{result ? `${groupLabels[group]} · EU ${fmt(result.eu)}` : 'Enter a valid size'}</strong><p>{result ? `Closest table match for ${region} ${size}. Brand-specific sizing may differ.` : 'Enter a numeric shoe size to convert.'}</p></div>
          {result && <div className="advanced-breakdown"><div><span>US size</span><strong>{fmt(result.us)}</strong></div><div><span>UK size</span><strong>{fmt(result.uk)}</strong></div><div><span>EU size</span><strong>{fmt(result.eu)}</strong></div><div><span>Approx. foot length</span><strong>{fmt(result.cm)} cm</strong></div></div>}
        </div>
        <button type="button" className="reset-button mt-6" onClick={()=>{setGroup('men');setRegion('EU');setSize('42.5');}}>Reset values</button>
      </section>
    </div>
    <div className="advanced-content-grid"><article className="advanced-content"><section><div className="eyebrow">HOW TO USE IT</div><h2>Choose the correct sizing group first.</h2><p>Baby and toddler, children and youth, women, and men use different size sequences. Select the group printed on the footwear or appropriate for the wearer, then choose the sizing system and enter the labelled size.</p></section><section><div className="eyebrow">ACCURACY</div><h2>Why shoe conversions are references, not exact formulas.</h2><p>Regional labels do not map through one reliable universal equation. This converter therefore uses separate reference rows instead of the previous single adult arithmetic formula. Half sizes and EU labels are matched to the closest reference row.</p><p>For the best fit, measure the foot while standing, measure both feet, use the larger measurement, and compare it with the specific brand’s current chart. Width, shoe last, socks, materials and intended activity can change the size that feels correct.</p></section><section className="advanced-faq"><div className="eyebrow">FAQ</div><h2>Common shoe-size questions.</h2><details><summary>Does this converter include children?</summary><p>Yes. It has separate Baby / toddler and Children / youth modes in addition to Women and Men.</p></details><details><summary>Why can two brands fit differently at the same size?</summary><p>Shoe-size labels are nominal. Last shape, width, construction and brand-specific grading can all change fit, so the manufacturer chart remains the final reference.</p></details></section></article></div>
  </div></Shell>;
}
