import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

export type ElectricalPhase = 'single' | 'three';
export type ElectricalPreferences = { voltage: number; phase: ElectricalPhase };

export const ELECTRICAL_VOLTAGE_PRESETS = [110, 120, 127, 220, 230, 240, 380, 400, 415, 480] as const;
export const ELECTRICAL_PREFERENCES_STORAGE_KEY = 'figurenest-electrical-preferences-v1';
export const defaultElectricalPreferences: ElectricalPreferences = { voltage: 230, phase: 'single' };

export function validateElectricalPreferences(value: unknown): ElectricalPreferences {
  if (!value || typeof value !== 'object') return defaultElectricalPreferences;
  const raw = value as Partial<ElectricalPreferences>;
  const voltage = Number(raw.voltage);
  const phase = raw.phase === 'three' ? 'three' : 'single';
  return {
    voltage: Number.isFinite(voltage) && voltage >= 1 && voltage <= 1000 ? voltage : defaultElectricalPreferences.voltage,
    phase,
  };
}

export function loadElectricalPreferences(): ElectricalPreferences {
  if (typeof window === 'undefined') return defaultElectricalPreferences;
  try {
    return validateElectricalPreferences(JSON.parse(window.localStorage.getItem(ELECTRICAL_PREFERENCES_STORAGE_KEY) ?? 'null'));
  } catch {
    return defaultElectricalPreferences;
  }
}

export function saveElectricalPreferences(preferences: ElectricalPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    const validated = validateElectricalPreferences(preferences);
    window.localStorage.setItem(ELECTRICAL_PREFERENCES_STORAGE_KEY, JSON.stringify(validated));
    window.dispatchEvent(new CustomEvent('figurenest-electrical-preferences', { detail: validated }));
  } catch {
    // Storage can be unavailable in restrictive browser modes.
  }
}

export function useElectricalPreferences() {
  const [preferences, setPreferences] = useState<ElectricalPreferences>(defaultElectricalPreferences);
  const useHydrationEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
  useHydrationEffect(() => setPreferences(loadElectricalPreferences()), []);
  useEffect(() => {
    const sync = () => setPreferences(loadElectricalPreferences());
    window.addEventListener('storage', sync);
    window.addEventListener('figurenest-electrical-preferences', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('figurenest-electrical-preferences', sync);
    };
  }, []);
  const update = useCallback((next: ElectricalPreferences | ((previous: ElectricalPreferences) => ElectricalPreferences)) => {
    setPreferences(previous => {
      const validated = validateElectricalPreferences(typeof next === 'function' ? next(previous) : next);
      saveElectricalPreferences(validated);
      return validated;
    });
  }, []);
  const setVoltage = useCallback((voltage: number) => update(previous => ({ ...previous, voltage })), [update]);
  const setPhase = useCallback((phase: ElectricalPhase) => update(previous => ({ ...previous, phase })), [update]);
  return { preferences, setVoltage, setPhase };
}
