import fs from 'node:fs';

const path = 'artifacts/calcstride/src/lib/core-calculators.ts';
let source = fs.readFileSync(path, 'utf8');
const before = `    return {\n      primary: \`${'${decimal.format(hours)}'} hours\`,\n      details: [\n        { label: 'Approximate duration', value: \`${'${whole.format(Math.floor(totalMinutes / 60))}'} hr ${'${whole.format(totalMinutes % 60)}'} min\` },\n        { label: 'Charger power used', value: \`${'${decimal.format(b)}'} kW\` },\n      ],\n    };`;
const after = `    const hoursDisplay = hours > 0 && hours < 0.01 ? '<0.01' : decimal.format(hours);\n    const durationDisplay = hours > 0 && totalMinutes === 0\n      ? '<1 min'\n      : \`${'${whole.format(Math.floor(totalMinutes / 60))}'} hr ${'${whole.format(totalMinutes % 60)}'} min\`;\n    return {\n      primary: \`${'${hoursDisplay}'} hours\`,\n      details: [\n        { label: 'Approximate duration', value: durationDisplay },\n        { label: 'Charger power used', value: \`${'${decimal.format(b)}'} kW\` },\n      ],\n    };`;
if (!source.includes(before)) throw new Error('Expected EV Charging Time result block not found');
source = source.replace(before, after);
fs.writeFileSync(path, source);
