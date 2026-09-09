import { ELECTRICAL_VOLTAGE_PRESETS, useElectricalPreferences, type ElectricalPhase } from '@/lib/electrical-preferences';

export function ElectricalPreferencesSelector({ idPrefix = 'electrical-supply' }: { idPrefix?: string }) {
  const { preferences, setVoltage, setPhase } = useElectricalPreferences();
  const preset = ELECTRICAL_VOLTAGE_PRESETS.includes(preferences.voltage as (typeof ELECTRICAL_VOLTAGE_PRESETS)[number])
    ? String(preferences.voltage)
    : 'custom';

  return <div className="advanced-fields" data-testid="electrical-supply-preferences">
    <label className="advanced-field" htmlFor={`${idPrefix}-voltage-preset`}>
      <span>Supply voltage</span>
      <div><select id={`${idPrefix}-voltage-preset`} value={preset} onChange={(event) => {
        if (event.target.value !== 'custom') setVoltage(Number(event.target.value));
      }}>
        {ELECTRICAL_VOLTAGE_PRESETS.map((voltage) => <option key={voltage} value={voltage}>{voltage} V</option>)}
        <option value="custom">Custom voltage</option>
      </select></div>
    </label>
    {preset === 'custom' && <label className="advanced-field" htmlFor={`${idPrefix}-custom-voltage`}>
      <span>Custom voltage (V)</span>
      <div><input id={`${idPrefix}-custom-voltage`} type="number" min="1" max="1000" step="1" value={preferences.voltage} onChange={(event) => setVoltage(Number(event.target.value))} /></div>
    </label>}
    <label className="advanced-field" htmlFor={`${idPrefix}-phase`}>
      <span>Supply phase</span>
      <div><select id={`${idPrefix}-phase`} value={preferences.phase} onChange={(event) => setPhase(event.target.value as ElectricalPhase)}>
        <option value="single">Single-phase</option>
        <option value="three">Three-phase</option>
      </select></div>
    </label>
  </div>;
}
