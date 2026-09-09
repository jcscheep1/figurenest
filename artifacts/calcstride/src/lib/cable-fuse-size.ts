export type SupplyPhase = 'single' | 'three';
export type LoadMode = 'amps' | 'watts' | 'kw';
export type LengthUnit = 'm' | 'ft';
export type ConductorMaterial = 'copper' | 'aluminium';
export type InstallationMethod = 'clipped-direct' | 'conduit' | 'insulated';
export type InsulationType = 'pvc70' | 'xlpe90';

export type CableFuseInput = {
  loadMode: LoadMode;
  load: number;
  voltage: number;
  phase: SupplyPhase;
  powerFactor: number;
  length: number;
  lengthUnit: LengthUnit;
  material: ConductorMaterial;
  installation: InstallationMethod;
  insulation: InsulationType;
  ambientC: number;
  voltageDropLimitPct: number;
};

export type CableFuseResult = {
  designCurrentA: number;
  cableSizeMm2: number;
  breakerA: number | null;
  correctedAmpacityA: number;
  voltageDropV: number;
  voltageDropPct: number;
  voltageDropPass: boolean;
  warnings: string[];
  assumptions: string[];
};

const FEET_TO_METRES = 0.3048;
const STANDARD_BREAKERS = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125] as const;

// Conservative planning values for common multicore LV cable sizes. These are
// deliberately not presented as statutory AREI/IEC tabulated ratings. Final
// design depends on the exact cable construction, grouping, installation,
// thermal conditions, protective device characteristics and local code.
const BASE_AMPACITY_CU_PVC: Record<number, Record<InstallationMethod, number>> = {
  1.5: { 'clipped-direct': 18, conduit: 14.5, insulated: 10 },
  2.5: { 'clipped-direct': 24, conduit: 20, insulated: 16 },
  4: { 'clipped-direct': 32, conduit: 26, insulated: 21 },
  6: { 'clipped-direct': 41, conduit: 34, insulated: 27 },
  10: { 'clipped-direct': 57, conduit: 46, insulated: 37 },
  16: { 'clipped-direct': 76, conduit: 61, insulated: 49 },
  25: { 'clipped-direct': 101, conduit: 80, insulated: 64 },
  35: { 'clipped-direct': 125, conduit: 99, insulated: 79 },
  50: { 'clipped-direct': 151, conduit: 119, insulated: 95 },
};

const CABLE_SIZES = Object.keys(BASE_AMPACITY_CU_PVC).map(Number).sort((a, b) => a - b);

function ambientFactor(ambientC: number, insulation: InsulationType): number {
  if (insulation === 'xlpe90') {
    if (ambientC <= 30) return 1;
    if (ambientC <= 35) return 0.96;
    if (ambientC <= 40) return 0.91;
    if (ambientC <= 45) return 0.87;
    if (ambientC <= 50) return 0.82;
    if (ambientC <= 55) return 0.76;
    return 0.71;
  }
  if (ambientC <= 30) return 1;
  if (ambientC <= 35) return 0.94;
  if (ambientC <= 40) return 0.87;
  if (ambientC <= 45) return 0.79;
  if (ambientC <= 50) return 0.71;
  if (ambientC <= 55) return 0.61;
  return 0.5;
}

function materialAmpacityFactor(material: ConductorMaterial): number {
  return material === 'copper' ? 1 : 0.8;
}

function insulationAmpacityFactor(insulation: InsulationType): number {
  return insulation === 'xlpe90' ? 1.12 : 1;
}

function conductorResistanceOhmPerKm(sizeMm2: number, material: ConductorMaterial): number {
  const resistivity = material === 'copper' ? 17.5 : 28.2;
  return resistivity / sizeMm2;
}

export function calculateCableFuseSize(input: CableFuseInput): CableFuseResult | { error: string } {
  const finite = [input.load, input.voltage, input.powerFactor, input.length, input.ambientC, input.voltageDropLimitPct].every(Number.isFinite);
  if (!finite) return { error: 'Enter finite numeric values in every numeric field.' };
  if (input.load <= 0) return { error: 'Load must be greater than zero.' };
  if (input.voltage < 1 || input.voltage > 1000) return { error: 'Supply voltage must be between 1 V and 1000 V.' };
  if (input.powerFactor <= 0 || input.powerFactor > 1) return { error: 'Power factor must be greater than 0 and no more than 1.' };
  if (input.length <= 0) return { error: 'Cable length must be greater than zero.' };
  if (input.ambientC < -20 || input.ambientC > 60) return { error: 'Ambient temperature must be between -20 °C and 60 °C.' };
  if (input.voltageDropLimitPct <= 0 || input.voltageDropLimitPct > 10) return { error: 'Voltage-drop limit must be greater than 0% and no more than 10%.' };

  const loadW = input.loadMode === 'amps' ? null : input.loadMode === 'kw' ? input.load * 1000 : input.load;
  const designCurrentA = input.loadMode === 'amps'
    ? input.load
    : input.phase === 'single'
      ? loadW! / (input.voltage * input.powerFactor)
      : loadW! / (Math.sqrt(3) * input.voltage * input.powerFactor);

  if (!Number.isFinite(designCurrentA) || designCurrentA <= 0 || designCurrentA > 1000) {
    return { error: 'The calculated design current is outside the supported range.' };
  }

  const factor = ambientFactor(input.ambientC, input.insulation)
    * materialAmpacityFactor(input.material)
    * insulationAmpacityFactor(input.insulation);

  let selectedSize: number | null = null;
  let correctedAmpacityA = 0;
  for (const size of CABLE_SIZES) {
    const corrected = BASE_AMPACITY_CU_PVC[size][input.installation] * factor;
    if (corrected >= designCurrentA) {
      selectedSize = size;
      correctedAmpacityA = corrected;
      break;
    }
  }
  if (selectedSize === null) {
    return { error: 'No supported cable size is adequate for this design current and installation combination.' };
  }

  const breakerA = STANDARD_BREAKERS.find((rating) => rating >= designCurrentA && rating <= correctedAmpacityA) ?? null;
  const lengthM = input.lengthUnit === 'ft' ? input.length * FEET_TO_METRES : input.length;
  const resistanceOhmPerKm = conductorResistanceOhmPerKm(selectedSize, input.material);
  const loopFactor = input.phase === 'single' ? 2 : Math.sqrt(3);
  const voltageDropV = loopFactor * designCurrentA * (lengthM / 1000) * resistanceOhmPerKm;
  const voltageDropPct = voltageDropV / input.voltage * 100;
  const voltageDropPass = voltageDropPct <= input.voltageDropLimitPct;

  const warnings: string[] = [];
  if (!breakerA) warnings.push('No standard protective-device rating in the supported list can be coordinated safely with this cable at the calculated load.');
  if (!voltageDropPass) warnings.push(`Estimated voltage drop exceeds the selected ${input.voltageDropLimitPct}% limit; increase conductor size or reduce the run/load.`);
  if (input.installation === 'insulated') warnings.push('Cables enclosed by thermal insulation can require substantial derating; verify the actual installation method and manufacturer data.');
  if (input.material === 'aluminium') warnings.push('Aluminium conductors require suitable terminals, installation practices and code checks; verify the exact cable and connection system.');

  return {
    designCurrentA,
    cableSizeMm2: selectedSize,
    breakerA,
    correctedAmpacityA,
    voltageDropV,
    voltageDropPct,
    voltageDropPass,
    warnings,
    assumptions: [
      `Supply basis: ${input.voltage} V ${input.phase === 'single' ? 'single-phase' : 'three-phase'}.`,
      'Planning estimate using conservative generic low-voltage cable ampacity values, not a statutory wiring-table lookup.',
      'No grouping factor, harmonic loading, fault-loop impedance, short-circuit withstand, RCD selection or disconnection-time verification is included.',
      'Final cable and protective-device selection must follow the applicable code, manufacturer data and site conditions.',
    ],
  };
}
