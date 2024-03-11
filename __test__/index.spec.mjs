import test from 'ava'
import fs from 'fs'
import { parseXbrl } from '../index.js'

test('parse xbrl from native', async (t) => {
  const startTime = Date.now();

  const file = fs.readFileSync('./__test__/msft.xml', 'utf8');
  const result = parseXbrl(file);

  const endTime = Date.now();
  console.log('Parse time:', endTime - startTime, 'ms');

  t.is(result.facts.length, 1578);

  const firstFact = result.facts[0];
  t.is(firstFact.concept, "CurrentFiscalYearEndDate");
  t.is(firstFact.value, "--06-30");

  const context = firstFact.context;
  t.is(context.entity, "0000789019");
  t.deepEqual(context.segments, []);

  const period = context.period;
  t.is(period.instant, undefined);
  t.is(period.start_date, undefined);
  t.is(period.end_date, undefined);
});
