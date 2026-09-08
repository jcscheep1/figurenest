import type { MeasurementSystem } from './units-preferences';

export type AutomotiveResetUnits = {
  distanceUnit: 'miles' | 'kilometres';
  efficiencyUnit: 'mpg' | 'l100km';
  liquidUnit: 'usGallons' | 'litres';
  energyUnit: 'kwh';
  powerUnit: 'kw';
  converterFromUnit: 'mpg' | 'l100km';
  converterToUnit: 'mpg' | 'l100km';
};

export function getAutomotiveResetUnits(measurementSystem: MeasurementSystem): AutomotiveResetUnits {
  const metric = measurementSystem === 'metric';
  return {
    distanceUnit: metric ? 'kilometres' : 'miles',
    efficiencyUnit: metric ? 'l100km' : 'mpg',
    liquidUnit: metric ? 'litres' : 'usGallons',
    energyUnit: 'kwh',
    powerUnit: 'kw',
    converterFromUnit: metric ? 'l100km' : 'mpg',
    converterToUnit: metric ? 'mpg' : 'l100km',
  };
}
