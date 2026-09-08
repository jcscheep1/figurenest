from pathlib import Path

core = Path('artifacts/calcstride/src/lib/core-calculators.ts')
core_text = core.read_text()
core_old = "  if (['age', 'working-days'].includes(slug)) return calculateDates(slug, inputs);\n  if ([...BUSINESS_SLUGS, ...AUTOMOTIVE_CALCULATOR_SLUGS].includes(slug) && inputs.some((value) => !value.trim())) {"
core_new = "  if (['age', 'working-days'].includes(slug)) return calculateDates(slug, inputs);\n  if (slug === 'percentage' && inputs.some((value) => !value.trim())) return invalid('Complete every field with a valid non-negative value');\n  if ([...BUSINESS_SLUGS, ...AUTOMOTIVE_CALCULATOR_SLUGS].includes(slug) && inputs.some((value) => !value.trim())) {"
if core_old not in core_text:
    raise SystemExit('Percentage target not found; refusing unsafe edit')
core.write_text(core_text.replace(core_old, core_new, 1))

phase = Path('artifacts/calcstride/src/lib/phase-three-b.ts')
phase_text = phase.read_text()
validation_old = "  if (values.length !== definition.fields.length || values.some((value) => !value.trim())) return bad('Complete every field before calculating.');"
validation_new = "  if (values.length !== definition.fields.length) return bad('Complete every field before calculating.');\n  const matrixSingleInput = slug === 'matrix' && (values[0] === 'determinant' || values[0] === 'inverse');\n  const requiredValues = matrixSingleInput ? [values[0], values[1], values[2], values[5]] : values;\n  if (requiredValues.some((value) => !value.trim())) return bad('Complete every field before calculating.');"
if validation_old not in phase_text:
    raise SystemExit('Matrix top-level validation target not found; refusing unsafe edit')
phase_text = phase_text.replace(validation_old, validation_new, 1)

start_marker = "    if (slug === 'matrix') {\n"
end_marker = "    if (slug === 'mean-median-mode-range') {\n"
start = phase_text.find(start_marker)
end = phase_text.find(end_marker, start)
if start < 0 or end < 0:
    raise SystemExit('Matrix calculation block not found; refusing unsafe edit')

matrix_new = '''    if (slug === 'matrix') {
      const rows = at(1), columns = at(2);
      if ([rows, columns].some((dimension) => dimension === null || !Number.isInteger(dimension) || dimension! < 1 || dimension! > 6)) return bad('Matrix A dimensions must be whole numbers from 1 through 6.');
      const matrixA = parseMatrix(values[5], rows!, columns!);
      if (!matrixA) return bad('Enter Matrix A with exactly its selected rows and columns.');
      if (values[0] === 'determinant' || values[0] === 'inverse') {
        if (rows !== columns) return bad('Determinants and inverses require a square matrix.');
        if (values[0] === 'determinant') {
          const determinant = matrixDeterminant(matrixA)!;
          return result(format(determinant), 'Determinant of Matrix A.', [{ label: 'Dimensions', value: `${rows} × ${columns}` }]);
        }
        const inverse = matrixInverse(matrixA);
        if (!inverse) return bad('Matrix A is singular and has no inverse.');
        return result(formatMatrix(inverse), 'Inverse of Matrix A.', [{ label: 'Dimensions', value: `${rows} × ${columns}` }]);
      }
      const bRows = at(3), bColumns = at(4);
      if ([bRows, bColumns].some((dimension) => dimension === null || !Number.isInteger(dimension) || dimension! < 1 || dimension! > 6)) return bad('Matrix B dimensions must be whole numbers from 1 through 6.');
      const matrixB = parseMatrix(values[6], bRows!, bColumns!);
      if (!matrixB) return bad('Enter Matrix B with exactly its selected rows and columns.');
      if (values[0] === 'add' || values[0] === 'subtract') {
        if (rows !== bRows || columns !== bColumns) return bad('Matrix addition and subtraction require equal dimensions.');
        const output = matrixA.map((row, rowIndex) => row.map((cell, columnIndex) => values[0] === 'add' ? cell + matrixB[rowIndex][columnIndex] : cell - matrixB[rowIndex][columnIndex]));
        return result(formatMatrix(output), values[0] === 'add' ? 'Element-by-element matrix sum.' : 'Element-by-element matrix difference.');
      }
      if (columns !== bRows) return bad('Matrix multiplication requires Matrix A columns to equal Matrix B rows.');
      const output = matrixA.map((row) => matrixB[0].map((_, columnIndex) => row.reduce((sum, cell, inner) => sum + cell * matrixB[inner][columnIndex], 0)));
      return result(formatMatrix(output), 'Matrix product from row-by-column dot products.', [{ label: 'Output dimensions', value: `${rows} × ${bColumns}` }]);
    }
'''
phase.write_text(phase_text[:start] + matrix_new + phase_text[end:])

Path('artifacts/calcstride/src/lib/percentage-calculator-input-regression.test.ts').write_text("""import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCore } from './core-calculators';

test('percentage calculator validates required numeric inputs', () => {
  assert.deepEqual(calculateCore('percentage', ['25', '80']), { primary: '20' });
  assert.deepEqual(calculateCore('percentage', ['0', '80']), { primary: '0' });
  assert.deepEqual(calculateCore('percentage', ['25', '0']), { primary: '0' });
  assert.ok(calculateCore('percentage', ['', '80']).error);
  assert.ok(calculateCore('percentage', ['25', '']).error);
  assert.ok(calculateCore('percentage', ['Infinity', '80']).error);
  assert.ok(calculateCore('percentage', ['25', '-1']).error);
});
""")

Path('artifacts/calcstride/src/lib/matrix-unused-inputs.test.ts').write_text("""import assert from 'node:assert/strict';
import test from 'node:test';
import { calculatePhaseThreeB } from './phase-three-b';

test('matrix determinant and inverse ignore unused Matrix B inputs', () => {
  const determinant = calculatePhaseThreeB('matrix', ['determinant','2','2','','','1,2\\n3,4','']);
  assert.equal(determinant.error, undefined);
  assert.equal(determinant.primary, '-2');
  const inverse = calculatePhaseThreeB('matrix', ['inverse','2','2','not-used','not-used','1,2\\n3,4','not-used']);
  assert.equal(inverse.error, undefined);
  assert.equal(inverse.primary, '[-2, 1]\\n[1.5, -0.5]');
});

test('matrix two-matrix operations still require valid Matrix B inputs', () => {
  assert.ok(calculatePhaseThreeB('matrix', ['add','2','2','','','1,2\\n3,4','']).error);
});
""")
