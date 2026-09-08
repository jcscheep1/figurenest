from pathlib import Path

source = Path('artifacts/calcstride/src/lib/phase-two-expansion.ts')
text = source.read_text()

old_helpers = """const zoneOffset=(date:Date,zone:string)=>{const p=new Intl.DateTimeFormat('en-US',{timeZone:zone,timeZoneName:'longOffset'}).formatToParts(date).find(x=>x.type==='timeZoneName')?.value||'GMT';const m=/GMT([+-])(\\d{2}):?(\\d{2})/.exec(p);return m?(m[1]==='-'?-1:1)*(+m[2]*60 + +m[3]):0;};"""
new_helpers = """const zoneOffset=(date:Date,zone:string)=>{const p=new Intl.DateTimeFormat('en-US',{timeZone:zone,timeZoneName:'longOffset'}).formatToParts(date).find(x=>x.type==='timeZoneName')?.value||'GMT';const m=/GMT([+-])(\\d{2}):?(\\d{2})/.exec(p);return m?(m[1]==='-'?-1:1)*(+m[2]*60 + +m[3]):0;};
const zoneWallTime=(date:Date,zone:string)=>{const parts=new Intl.DateTimeFormat('en-US',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date);const part=(type:string)=>parts.find(p=>p.type===type)?.value||'';return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}`;};"""
if old_helpers not in text:
    raise SystemExit('Time-zone helper target not found; refusing unsafe edit')
text = text.replace(old_helpers, new_helpers, 1)

old_tail = """ const raw=values[0],wallTime=utcDateTime(raw);if(!Number.isFinite(wallTime))return bad('Enter a valid local date and time.');const assumed=new Date(wallTime);const instant=new Date(assumed.valueOf()-zoneOffset(assumed,values[1])*60000);try{return {primary:new Intl.DateTimeFormat('en-US',{dateStyle:'medium',timeStyle:'short',timeZone:values[2]}).format(instant),summary:`Converted from ${values[1]} to ${values[2]}.`,details:[{label:'UTC instant',value:instant.toISOString()}]};}catch{return bad('Choose supported IANA time zones.');}"""
new_tail = """ const raw=values[0],wallTime=utcDateTime(raw);if(!Number.isFinite(wallTime))return bad('Enter a valid local date and time.');const fromZone=values[1],toZone=values[2];try{const offsets=new Set<number>();for(const hours of [-48,-24,0,24,48])offsets.add(zoneOffset(new Date(wallTime+hours*3600000),fromZone));const matches=[...offsets].map(offset=>new Date(wallTime-offset*60000)).filter(candidate=>zoneWallTime(candidate,fromZone)===raw);const unique=[...new Map(matches.map(candidate=>[candidate.valueOf(),candidate])).values()];if(unique.length===0)return bad('That local time does not exist in the selected source time zone because of a daylight-saving time change.');if(unique.length>1)return bad('That local time is ambiguous in the selected source time zone because the clock repeats during a daylight-saving time change. Choose a different local time.');const instant=unique[0];return {primary:new Intl.DateTimeFormat('en-US',{dateStyle:'medium',timeStyle:'short',timeZone:toZone}).format(instant),summary:`Converted from ${fromZone} to ${toZone}.`,details:[{label:'UTC instant',value:instant.toISOString()}]};}catch{return bad('Choose supported IANA time zones.');}"""
if old_tail not in text:
    raise SystemExit('Time-zone calculation target not found; refusing unsafe edit')
source.write_text(text.replace(old_tail, new_tail, 1))

Path('artifacts/calcstride/src/lib/time-zone-dst-regression.test.ts').write_text("""import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePhaseTwo } from './phase-two-expansion';

test('time-zone rejects a nonexistent local wall time during the spring DST gap', () => {
  const result = calculatePhaseTwo('time-zone', [
    '2026-03-08T02:30',
    'America/New_York',
    'Europe/London',
  ]);

  assert.ok(result.error, '02:30 does not exist in New York on the 2026 spring-forward date');
  assert.match(result.error, /valid|exist|daylight|DST|time/i);
});

test('time-zone converts a valid post-transition local time with the new DST offset', () => {
  const result = calculatePhaseTwo('time-zone', [
    '2026-03-08T03:30',
    'America/New_York',
    'Europe/London',
  ]);

  assert.equal(result.error, undefined);
  assert.match(result.primary, /7:30 AM/);
  assert.equal(result.details?.find((detail) => detail.label === 'UTC instant')?.value, '2026-03-08T07:30:00.000Z');
});

test('time-zone rejects an ambiguous repeated local wall time during the autumn DST fold', () => {
  const result = calculatePhaseTwo('time-zone', [
    '2026-11-01T01:30',
    'America/New_York',
    'Europe/London',
  ]);

  assert.match(result.error ?? '', /ambiguous|repeat|daylight|DST/i);
});
""")
