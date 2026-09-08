import { useMemo, useState } from 'react';
import '@/styles/advanced-calculator-pages.css';
import { Shell } from '@/components/FigureNestShell';
import { Seo } from '@/pages/AppPages';
import { CurrencySelector } from '@/components/UnitsPreferencesSelectors';
import { currencyPrefix, formatCurrency, useUnitsPreferences } from '@/lib/units-preferences';
import { CalculatorModeSwitch } from '@/components/calculators/CalculatorDecisionExpansion';
import { workDateCalculatorContent } from '@/lib/work-date-calculators';
import { calculateOvertimePay } from '@/lib/work-pay-math';
import { calculateSalary } from '@/lib/salary-math';

type WorkPaySlug = 'salary' | 'overtime';
const num = (value: string) => Number(value);

export function WorkPayCalculator({ slug }: { slug: WorkPaySlug }) {
  const { forCalculator, setCurrency, setCalculatorOverride } = useUnitsPreferences();
  const currency = forCalculator(slug).currency;
  const symbol = currencyPrefix(currency);
  const setSelectedCurrency = (next: typeof currency) => {
    setCurrency(next);
    setCalculatorOverride(slug, { ...forCalculator(slug).calculatorOverrides[slug], currency: next });
  };
  return slug === 'salary'
    ? <SalaryCalculator currency={currency} symbol={symbol} setCurrency={setSelectedCurrency} />
    : <OvertimeCalculator currency={currency} symbol={symbol} setCurrency={setSelectedCurrency} />;
}

function SalaryCalculator({ currency, symbol, setCurrency }: any) {
  const [advanced, setAdvanced] = useState(false);
  const [annual, setAnnual] = useState('60000');
  const [hours, setHours] = useState('40');
  const [weeks, setWeeks] = useState('52');
  const [bonus, setBonus] = useState('0');
  const [unpaidWeeks, setUnpaidWeeks] = useState('0');
  const result = useMemo(() => calculateSalary({
    annual: num(annual),
    hoursPerWeek: num(hours),
    weeksPerYear: num(weeks),
    bonus: advanced ? num(bonus) : 0,
    unpaidWeeks: advanced ? num(unpaidWeeks) : 0,
  }), [annual, hours, weeks, bonus, unpaidWeeks, advanced]);
  const money=(v:number)=>formatCurrency(v,currency);
  return <Shell><Seo path="/calculators/salary-work/salary"/><div className="advanced-calc-page"><div className="advanced-calc-layout"><header className="advanced-calc-copy"><div className="eyebrow"><span className="eyebrow-dot"/> SALARY & WORK</div><h1>Salary Converter<span>.</span></h1><p>Convert annual pay into monthly, weekly, daily and hourly equivalents. Advanced mode can include bonus pay and unpaid weeks.</p></header><section className="advanced-calculator-card"><div className="advanced-calc-head"><span className="mono">SALARY — CALCULATE</span><div className="live-dot"><i/> LIVE RESULT</div></div><CalculatorModeSwitch advanced={advanced} onChange={setAdvanced}/><label className="advanced-field"><span>Currency</span><CurrencySelector value={currency} onChange={setCurrency}/></label><div className="advanced-fields"><MoneyField label="Annual salary" value={annual} set={setAnnual} symbol={symbol}/><NumberField label="Hours per week" value={hours} set={setHours}/><NumberField label="Working weeks per year" value={weeks} set={setWeeks}/>{advanced&&<><MoneyField label="Annual bonus / extra gross pay" value={bonus} set={setBonus} symbol={symbol}/><NumberField label="Unpaid weeks per year" value={unpaidWeeks} set={setUnpaidWeeks}/></>}</div><Result title="ESTIMATED GROSS ANNUAL PAY" primary={result?money(result.total):'Check the values'} error={!result} details={result?[['Monthly pay',money(result.monthly)],['Weekly pay',money(result.weekly)],['Daily pay (5-day week)',money(result.daily)],['Hourly pay',money(result.hourly)],['Paid weeks',String(result.paidWeeks)]]:[]}/><button className="reset-button mt-6" onClick={()=>{setAnnual('60000');setHours('40');setWeeks('52');setBonus('0');setUnpaidWeeks('0');setAdvanced(false);}}>Reset values</button></section></div><FullWorkContent slug="salary"/></div></Shell>;
}

function OvertimeCalculator({ currency, symbol, setCurrency }: any) {
  const [advanced,setAdvanced]=useState(false);
  const [rate,setRate]=useState('24');
  const [otHours,setOtHours]=useState('8');
  const [mult,setMult]=useState('1.5');
  const [totalHours,setTotalHours]=useState('48');
  const [threshold,setThreshold]=useState('40');
  const result=useMemo(()=>calculateOvertimePay({
    hourlyRate:num(rate),
    overtimeHours:num(otHours),
    multiplier:num(mult),
    totalHours:num(totalHours),
    threshold:num(threshold),
    advanced,
  }),[rate,otHours,mult,totalHours,threshold,advanced]);
  const money=(v:number)=>formatCurrency(v,currency);
  return <Shell><Seo path="/calculators/salary-work/overtime"/><div className="advanced-calc-page"><div className="advanced-calc-layout"><header className="advanced-calc-copy"><div className="eyebrow"><span className="eyebrow-dot"/> SALARY & WORK</div><h1>Overtime Calculator<span>.</span></h1><p>Calculate overtime rate and overtime pay. Advanced mode derives regular and overtime hours from total hours worked and the overtime threshold, then combines both into estimated gross pay.</p></header><section className="advanced-calculator-card"><div className="advanced-calc-head"><span className="mono">OVERTIME — CALCULATE</span><div className="live-dot"><i/> LIVE RESULT</div></div><CalculatorModeSwitch advanced={advanced} onChange={setAdvanced}/><label className="advanced-field"><span>Currency</span><CurrencySelector value={currency} onChange={setCurrency}/></label><div className="advanced-fields"><MoneyField label="Regular hourly rate" value={rate} set={setRate} symbol={symbol}/><NumberField label="Overtime multiplier" value={mult} set={setMult} suffix="×"/>{advanced?<><NumberField label="Total hours worked" value={totalHours} set={setTotalHours} suffix="hours"/><NumberField label="Overtime threshold" value={threshold} set={setThreshold} suffix="hours"/></>:<NumberField label="Overtime hours" value={otHours} set={setOtHours}/>}</div><Result title={advanced?'ESTIMATED TOTAL GROSS PAY':'OVERTIME PAY'} primary={result?money(advanced?result.totalPay:result.overtimePay):'Check the values'} error={!result} details={result?[['Overtime rate',money(result.overtimeRate)],['Overtime pay',money(result.overtimePay)],...(advanced?[['Regular hours',`${result.regularHours} hours`],['Overtime hours',`${result.overtimeHours} hours`],['Regular pay',money(result.regularPay)],['Total hours',`${result.totalHours} hours`],['Overtime threshold',`${result.threshold} hours`]]:[])]:[]}/><button className="reset-button mt-6" onClick={()=>{setRate('24');setOtHours('8');setMult('1.5');setTotalHours('48');setThreshold('40');setAdvanced(false);}}>Reset values</button></section></div><FullWorkContent slug="overtime"/></div></Shell>;
}

function MoneyField({label,value,set,symbol}:{label:string;value:string;set:(v:string)=>void;symbol:string}){return <label className="advanced-field"><span>{label}</span><div><b>{symbol}</b><input type="number" min="0" step="any" value={value} onChange={e=>set(e.target.value)}/></div></label>}
function NumberField({label,value,set,suffix}:{label:string;value:string;set:(v:string)=>void;suffix?:string}){return <label className="advanced-field"><span>{label}</span><div><input type="number" min="0" step="any" value={value} onChange={e=>set(e.target.value)}/>{suffix&&<small>{suffix}</small>}</div></label>}
function Result({title,primary,error,details}:{title:string;primary:string;error:boolean;details:(string[])[]}){return <><div className={`advanced-result${error?' has-error':''}`} aria-live="polite"><span className="mono">{error?'CHECK THE VALUES':title}</span><strong>{primary}</strong><p>{error?'Enter valid non-negative values within a realistic working schedule.':'Gross estimate before taxes, deductions and benefits.'}</p></div>{!error&&<div className="advanced-breakdown">{details.map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>}</>}

function FullWorkContent({slug}:{slug:WorkPaySlug}) {
  const c=workDateCalculatorContent[slug];
  return <div className="advanced-content-grid"><article className="advanced-content">
    <section><div className="eyebrow">WHEN THIS TOOL HELPS</div><h2>A practical {c.title.toLowerCase()} for pay planning.</h2><p>{c.whenUseful}</p><ul>{c.usefulFor.map(x=><li key={x}>{x}</li>)}</ul></section>
    <section><div className="eyebrow">HOW IT WORKS</div><h2>Formula and calculation method.</h2><div className="advanced-formula-list"><div><strong>Method</strong><code>{c.formula}</code></div></div><p>{c.formulaExplanation}</p></section>
    <section><div className="eyebrow">STEP BY STEP</div><h2>How to use this calculator.</h2><ol>{c.instructions.map(x=><li key={x}>{x}</li>)}</ol></section>
    <section><div className="eyebrow">WORKED EXAMPLES</div><h2>See the calculation in context.</h2><div className="advanced-example-list">{c.examples.map(e=><article key={e.title}><span className="mono">{e.title.toUpperCase()}</span><h3>{e.inputs}</h3><p><strong>Result:</strong> {e.result}</p><p><strong>Interpretation:</strong> {e.interpretation}</p></article>)}</div></section>
    <section><div className="eyebrow">USE IT CAREFULLY</div><h2>Assumptions and common mistakes.</h2><div className="finance-guidance-grid"><div><h3>What the result assumes</h3><ul>{c.assumptions.map(x=><li key={x}>{x}</li>)}</ul></div><div><h3>Mistakes to avoid</h3><ul>{c.commonMistakes.map(x=><li key={x}>{x}</li>)}</ul></div></div></section>
    <section><div className="eyebrow">EDGE CASES</div><h2>What unusual inputs mean.</h2><div className="finance-edge-list">{c.edgeCases.map(x=><div key={x.title}><strong>{x.title}</strong><p>{x.explanation}</p></div>)}</div></section>
    <section><div className="eyebrow">LIMITATIONS</div><h2>What the result leaves out.</h2><p>{c.limitations}</p></section>
    <section className="advanced-faq"><div className="eyebrow">FAQ</div><h2>Questions people ask about {c.title.toLowerCase()}.</h2>{c.faqs.map(f=><details key={f.question}><summary>{f.question}</summary><p>{f.answer}</p></details>)}</section>
  </article></div>;
}
