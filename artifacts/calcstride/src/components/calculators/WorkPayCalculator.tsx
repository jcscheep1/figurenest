import { useMemo, useState } from 'react';
import '@/styles/advanced-calculator-pages.css';
import { Shell } from '@/components/FigureNestShell';
import { Seo } from '@/pages/AppPages';
import { CurrencySelector } from '@/components/UnitsPreferencesSelectors';
import { currencyPrefix, formatCurrency, useUnitsPreferences } from '@/lib/units-preferences';
import { CalculatorModeSwitch } from '@/components/calculators/CalculatorDecisionExpansion';

type WorkPaySlug = 'salary' | 'overtime';
const num = (value: string) => Number(value);
const valid = (...values: number[]) => values.every((value) => Number.isFinite(value) && value >= 0);

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
  const result = useMemo(() => {
    const a=num(annual), h=num(hours), w=num(weeks), b=num(bonus), u=num(unpaidWeeks);
    if (!valid(a,h,w,b,u) || h<=0 || w<=0 || w>53 || h>168 || u>=w) return undefined;
    const paidWeeks=w-u, base=a*(paidWeeks/w), total=base+b, hourly=total/(h*paidWeeks);
    return { total, monthly:total/12, weekly:total/paidWeeks, daily:total/(paidWeeks*5), hourly, paidWeeks };
  },[annual,hours,weeks,bonus,unpaidWeeks]);
  const money=(v:number)=>formatCurrency(v,currency);
  return <Shell><Seo path="/calculators/salary-work/salary"/><div className="advanced-calc-page"><div className="advanced-calc-layout"><header className="advanced-calc-copy"><div className="eyebrow"><span className="eyebrow-dot"/> SALARY & WORK</div><h1>Salary Converter<span>.</span></h1><p>Convert annual pay into monthly, weekly, daily and hourly equivalents. Advanced mode can include bonus pay and unpaid weeks.</p></header><section className="advanced-calculator-card"><div className="advanced-calc-head"><span className="mono">SALARY — CALCULATE</span><div className="live-dot"><i/> LIVE RESULT</div></div><CalculatorModeSwitch advanced={advanced} onChange={setAdvanced}/><label className="advanced-field"><span>Currency</span><CurrencySelector value={currency} onChange={setCurrency}/></label><div className="advanced-fields"><MoneyField label="Annual salary" value={annual} set={setAnnual} symbol={symbol}/><NumberField label="Hours per week" value={hours} set={setHours}/><NumberField label="Working weeks per year" value={weeks} set={setWeeks}/>{advanced&&<><MoneyField label="Annual bonus / extra gross pay" value={bonus} set={setBonus} symbol={symbol}/><NumberField label="Unpaid weeks per year" value={unpaidWeeks} set={setUnpaidWeeks}/></>}</div><Result title="ESTIMATED GROSS ANNUAL PAY" primary={result?money(result.total):'Check the values'} error={!result} details={result?[['Monthly pay',money(result.monthly)],['Weekly pay',money(result.weekly)],['Daily pay (5-day week)',money(result.daily)],['Hourly pay',money(result.hourly)],['Paid weeks',String(result.paidWeeks)]]:[]}/><button className="reset-button mt-6" onClick={()=>{setAnnual('60000');setHours('40');setWeeks('52');setBonus('0');setUnpaidWeeks('0');setAdvanced(false);}}>Reset values</button></section></div><WorkContent title="Salary conversion" text="Salary equivalents depend on the working schedule you enter. Monthly pay is annual gross pay divided by 12. Weekly and hourly figures use the paid weeks and hours you specify. Advanced mode reduces the modeled base salary proportionally for unpaid weeks and then adds entered bonus or extra gross pay. This is a gross-pay planning tool; it does not calculate taxes, benefits, payroll withholding or jurisdiction-specific employment rules."/></div></Shell>;
}

function OvertimeCalculator({ currency, symbol, setCurrency }: any) {
  const [advanced,setAdvanced]=useState(false); const [rate,setRate]=useState('24'); const [otHours,setOtHours]=useState('8'); const [mult,setMult]=useState('1.5'); const [regularHours,setRegularHours]=useState('40'); const [threshold,setThreshold]=useState('40');
  const result=useMemo(()=>{const r=num(rate),o=num(otHours),m=num(mult),rh=num(regularHours),t=num(threshold);if(!valid(r,o,m,rh,t)||m<=0||rh>168||o>168||t>168)return undefined;const overtimeRate=r*m, overtimePay=o*overtimeRate, regularPay=r*rh,total=regularPay+overtimePay;return{regularPay,overtimeRate,overtimePay,total,totalHours:rh+o,threshold:t};},[rate,otHours,mult,regularHours,threshold]);
  const money=(v:number)=>formatCurrency(v,currency);
  return <Shell><Seo path="/calculators/salary-work/overtime"/><div className="advanced-calc-page"><div className="advanced-calc-layout"><header className="advanced-calc-copy"><div className="eyebrow"><span className="eyebrow-dot"/> SALARY & WORK</div><h1>Overtime Calculator<span>.</span></h1><p>Calculate overtime rate and overtime pay. Advanced mode also combines regular hours and overtime into an estimated gross pay total.</p></header><section className="advanced-calculator-card"><div className="advanced-calc-head"><span className="mono">OVERTIME — CALCULATE</span><div className="live-dot"><i/> LIVE RESULT</div></div><CalculatorModeSwitch advanced={advanced} onChange={setAdvanced}/><label className="advanced-field"><span>Currency</span><CurrencySelector value={currency} onChange={setCurrency}/></label><div className="advanced-fields"><MoneyField label="Regular hourly rate" value={rate} set={setRate} symbol={symbol}/><NumberField label="Overtime hours" value={otHours} set={setOtHours}/><NumberField label="Overtime multiplier" value={mult} set={setMult} suffix="×"/>{advanced&&<><NumberField label="Regular hours" value={regularHours} set={setRegularHours}/><NumberField label="Overtime threshold (reference)" value={threshold} set={setThreshold} suffix="hours"/></>}</div><Result title={advanced?'ESTIMATED TOTAL GROSS PAY':'OVERTIME PAY'} primary={result?money(advanced?result.total:result.overtimePay):'Check the values'} error={!result} details={result?[['Overtime rate',money(result.overtimeRate)],['Overtime pay',money(result.overtimePay)],...(advanced?[['Regular pay',money(result.regularPay)],['Total hours',`${result.totalHours} hours`],['Entered overtime threshold',`${result.threshold} hours`]]:[])]:[]}/><button className="reset-button mt-6" onClick={()=>{setRate('24');setOtHours('8');setMult('1.5');setRegularHours('40');setThreshold('40');setAdvanced(false);}}>Reset values</button></section></div><WorkContent title="Overtime pay" text="Overtime pay equals overtime hours multiplied by the regular hourly rate and the multiplier you enter. Advanced mode adds regular-hours pay to show a combined gross-pay estimate. The threshold field is displayed as a reference because overtime eligibility and thresholds vary by contract and jurisdiction; FigureNest does not assume a legal overtime rule. Confirm your applicable employment agreement and payroll rules."/></div></Shell>;
}

function MoneyField({label,value,set,symbol}:{label:string;value:string;set:(v:string)=>void;symbol:string}){return <label className="advanced-field"><span>{label}</span><div><b>{symbol}</b><input type="number" min="0" step="any" value={value} onChange={e=>set(e.target.value)}/></div></label>}
function NumberField({label,value,set,suffix}:{label:string;value:string;set:(v:string)=>void;suffix?:string}){return <label className="advanced-field"><span>{label}</span><div><input type="number" min="0" step="any" value={value} onChange={e=>set(e.target.value)}/>{suffix&&<small>{suffix}</small>}</div></label>}
function Result({title,primary,error,details}:{title:string;primary:string;error:boolean;details:(string[])[]}){return <><div className={`advanced-result${error?' has-error':''}`}><span className="mono">{error?'CHECK THE VALUES':title}</span><strong>{primary}</strong><p>{error?'Enter valid non-negative values within a realistic working schedule.':'Gross estimate before taxes, deductions and benefits.'}</p></div>{!error&&<div className="advanced-breakdown">{details.map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>}</>}
function WorkContent({title,text}:{title:string;text:string}){return <div className="advanced-content-grid"><article className="advanced-content"><section><div className="eyebrow">HOW IT WORKS</div><h2>{title} with a clear pay breakdown.</h2><p>{text}</p></section><section className="advanced-faq"><div className="eyebrow">FAQ</div><h2>Gross pay versus take-home pay.</h2><details><summary>Is this the amount I receive after tax?</summary><p>No. These results are gross-pay estimates. Use the Take-Home Pay Calculator with appropriate tax and deduction assumptions for a separate net-pay estimate.</p></details><details><summary>Does FigureNest assume local overtime law?</summary><p>No. Enter the multiplier, hours and schedule that apply to your situation rather than relying on a built-in jurisdiction rule.</p></details></section></article></div>}
