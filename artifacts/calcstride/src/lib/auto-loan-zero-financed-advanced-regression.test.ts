import assert from 'node:assert/strict';
import test from 'node:test';
import { autoLoanDecision } from './decision-calculators';
import { calculatePriorityFinance } from './priority-finance-calculators';

test('Auto Loan Basic and Advanced agree when credits fully cover the purchase cost', () => {
  const basic = calculatePriorityFinance('auto-loan', ['10000', '10000', '0', '6.5', '60', '0', '0']);
  assert.equal(basic.error, undefined);
  assert.equal(basic.primary, '$0.00');

  const advanced = autoLoanDecision(10000, 10000, 0, 6.5, 60, 0, 0, 0, 0, 0, 250);
  assert.ok(advanced, 'Advanced mode must preserve the valid zero-financed Basic boundary');
  assert.deepEqual(advanced, {
    financed: 0,
    payment: 0,
    ownershipMonthly: 250,
    payoffMonths: 0,
    interest: 0,
    interestSaved: 0,
    balloon: 0,
  });
});

test('Auto Loan Advanced still rejects credits that exceed purchase cost', () => {
  assert.equal(autoLoanDecision(10000, 10001, 0, 6.5, 60, 0, 0, 0, 0, 0, 0), undefined);
});
