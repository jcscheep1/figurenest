import type { ChangeEvent } from 'react';
import { currencies, currencyCodes, type CurrencyCode, type MeasurementSystem } from '@/lib/units-preferences';

export function CurrencySelector({ value, onChange, id = 'currency' }: { value: CurrencyCode; onChange: (currency: CurrencyCode) => void; id?: string }) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value as CurrencyCode);
  return <select id={id} aria-label="Currency" value={value} onChange={handleChange}>
    {currencyCodes.map(code => <option key={code} value={code}>{currencies[code].symbol} — {currencies[code].label} ({code})</option>)}
  </select>;
}

export function MeasurementSystemSelector({ value, onChange, id = 'measurement-system' }: { value: MeasurementSystem; onChange: (system: MeasurementSystem) => void; id?: string }) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value as MeasurementSystem);
  return <select id={id} aria-label="Measurement system" value={value} onChange={handleChange}>
    <option value="metric">Metric</option>
    <option value="imperial">Imperial</option>
  </select>;
}