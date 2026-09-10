import { useMemo, useState } from 'react';
import '@/styles/advanced-calculator-pages.css';
import { Shell } from '@/components/FigureNestShell';
import { Seo } from '@/pages/AppPages';
import {
  findShoeSizeMatch,
  formatShoeSize,
  shoeGroupLabels,
  shoeKeyForRegion,
  shoeSizeTables,
  type ShoeGroup,
  type ShoeRegion,
} from '@/lib/shoe-size';

export function ShoeSizeConverter() {
  const [group, setGroup] = useState<ShoeGroup>('men');
  const [region, setRegion] = useState<ShoeRegion>('EU');
  const [size, setSize] = useState('42.5');
  const rows = shoeSizeTables[group];
  const supported = useMemo(() => {
    const key = shoeKeyForRegion[region];
    return rows.map((row) => Number(row[key]));
  }, [region, rows]);
  const range = useMemo(() => ({ min: Math.min(...supported), max: Math.max(...supported) }), [supported]);
  const result = useMemo(() => {
    const value = Number(size);
    if (!size.trim() || !Number.isFinite(value)) return undefined;
    return findShoeSizeMatch(group, region, value);
  }, [group, region, size]);

  const changeGroup = (next: ShoeGroup) => {
    setGroup(next);
    const row = shoeSizeTables[next][Math.floor(shoeSizeTables[next].length / 2)];
    setSize(formatShoeSize(Number(row[shoeKeyForRegion[region]])));
  };
  const changeRegion = (next: ShoeRegion) => {
    if (next === region) return;
    const matched = result;
    setRegion(next);
    if (matched) setSize(formatShoeSize(Number(matched[shoeKeyForRegion[next]])));
  };

  return <Shell><Seo path="/converters/shoe-size" /><div className="advanced-calc-page shoe-size-page" data-testid="page-shoe-size">
    <div className="advanced-calc-layout">
      <header className="advanced-calc-copy"><div className="eyebrow"><span className="eyebrow-dot" /> FIGURENEST CONVERTERS</div><h1>Shoe Size Converter<span>.</span></h1><p>Convert shoe sizes across US, UK and EU systems for babies, toddlers, little kids, big kids, women and men using stage-specific reference tables.</p><div className="date-method-notes" role="note"><p><strong>Fit note:</strong> Shoe sizing is not perfectly standardized between brands. Use the conversion as a reference, then check the manufacturer’s size chart and measured foot length.</p></div></header>
      <section className="advanced-calculator-card" aria-label="Shoe size converter">
        <div className="advanced-calc-head"><span className="mono">SHOE SIZE — CONVERT</span><div className="live-dot"><i /> LOCAL RESULT</div></div>
        <div className="advanced-fields">
          <label className="advanced-field"><span>Who is the shoe for?</span><div><select value={group} onChange={(e)=>changeGroup(e.target.value as ShoeGroup)} data-testid="select-shoe-group">{(Object.keys(shoeGroupLabels) as ShoeGroup[]).map((key)=><option key={key} value={key}>{shoeGroupLabels[key]}</option>)}</select></div></label>
          <label className="advanced-field"><span>Input sizing system</span><div><select value={region} onChange={(e)=>changeRegion(e.target.value as ShoeRegion)} data-testid="select-shoe-region"><option value="US">US</option><option value="UK">UK</option><option value="EU">EU</option></select></div></label>
          <label className="advanced-field"><span>Shoe size</span><div><input type="number" step="0.5" min={range.min} max={range.max} value={size} onChange={(e)=>setSize(e.target.value)} data-testid="input-shoe-size" /></div><small>Supported {shoeGroupLabels[group]} {region} reference sizes: {supported.map(formatShoeSize).join(', ')}.</small></label>
        </div>
        <div className={`shoe-result-panel${!result?' has-error':''}`} role="status" aria-live="polite">
          <div className="advanced-result"><span className="mono">{result?'REFERENCE SIZE MATCH':'CHECK THE SIZE'}</span><strong className="advanced-result-output">{result ? `${shoeGroupLabels[group]} · EU ${formatShoeSize(result.eu)}` : 'Unsupported reference size'}</strong><p>{result ? `Reference-table match for ${region} ${size}. Brand-specific sizing may differ.` : `Enter one of the listed ${region} reference sizes for ${shoeGroupLabels[group]}. Values between table rows are not silently rounded.`}</p></div>
          {result && <div className="advanced-breakdown"><div><span>US size</span><strong>{formatShoeSize(result.us)}</strong></div><div><span>UK size</span><strong>{formatShoeSize(result.uk)}</strong></div><div><span>EU size</span><strong>{formatShoeSize(result.eu)}</strong></div><div><span>Approx. foot length</span><strong>{formatShoeSize(result.cm)} cm</strong></div></div>}
        </div>
        <button type="button" className="reset-button mt-6" onClick={()=>{setGroup('men');setRegion('EU');setSize('42.5');}}>Reset values</button>
      </section>
    </div>
    <div className="advanced-content-grid"><article className="advanced-content"><section><div className="eyebrow">HOW TO USE IT</div><h2>Choose the correct sizing group first.</h2><p>Baby, toddler, little-kid, big-kid/youth, women, and men use different size sequences. Select the group printed on the footwear or appropriate for the wearer, then choose the sizing system and enter one of the supported reference sizes shown below the field.</p></section><section><div className="eyebrow">ACCURACY</div><h2>Why shoe conversions are references, not exact formulas.</h2><p>Regional labels do not map through one reliable universal equation. This converter therefore uses separate reference rows instead of a single adult arithmetic formula. It only returns a conversion when the entered regional size exists in the selected reference table, rather than pretending an unsupported in-between value has an exact equivalent.</p><p>For the best fit, measure the foot while standing, measure both feet, use the larger measurement, and compare it with the specific brand’s current chart. Width, shoe last, socks, materials and intended activity can change the size that feels correct.</p></section><section className="advanced-faq"><div className="eyebrow">FAQ</div><h2>Common shoe-size questions.</h2><details><summary>Does this converter include children?</summary><p>Yes. Yes. It has separate Baby, Toddler, Little kid, and Big kid / youth modes in addition to Women and Men.</p></details><details><summary>Why can two brands fit differently at the same size?</summary><p>Shoe-size labels are nominal. Last shape, width, construction and brand-specific grading can all change fit, so the manufacturer chart remains the final reference.</p></details><details><summary>What happens if I enter a size the table does not contain?</summary><p>The converter stops and lists the supported reference sizes. It does not silently round an unsupported value to a neighboring size.</p></details></section></article></div>
  </div></Shell>;
}
