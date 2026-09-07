import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePhaseTwo, phaseTwoDefinitions, phaseTwoMetadataSentence, phaseTwoSlugs, phaseTwoUsefulWordCount } from './phase-two-expansion';
import { publishedTools } from './catalog';

const run=(slug:typeof phaseTwoSlugs[number], values:string[])=>calculatePhaseTwo(slug,values);
test('phase two formulas produce known answers',()=>{
 assert.equal(run('btu',['500','30']).primary,'15,000 BTU/h');
 assert.equal(run('average',['10','20','30']).primary,'20');
 assert.equal(run('average',['-2','4','10']).primary,'4');
 assert.equal(run('average-return',['8','-4','12']).primary,'5.3333%');
 assert.equal(run('fraction',['1','2','add','1','3']).primary,'5/6');
 assert.equal(run('percent-error',['9.5','10']).primary,'5%');
 assert.equal(run('percent-off',['100','25']).primary,'75');
 assert.equal(run('scientific',['12','multiply','3','degrees']).primary,'36');
 assert.equal(run('scientific',['90','sine','0','degrees']).primary,'1');
 assert.ok(run('scientific',['90','tangent','0','degrees']).error);
 assert.ok(run('scientific',['-1','square-root','0','degrees']).error);
 assert.ok(run('scientific',['0','natural-log','0','degrees']).error);
 assert.equal(run('scientific-notation',['6.02','23']).primary,'602,000,000,000,000,000,000,000');
 assert.equal(run('time-duration',['2025-01-01T09:00','2025-01-01T17:30']).primary,'8 hours 30 minutes');
 assert.equal(run('voltage-drop',['10','100','1.24','single']).primary,'2.48 V');
 assert.equal(run('day-of-week',['2025-01-01']).primary,'Wednesday');
 assert.equal(run('hours',['09:00','17:30','30']).primary,'8 hours 0 minutes');
 assert.equal(run('time',['09:00','2','45']).primary,'11:45');
 assert.equal(run('time-card',['09:00','17:30','30','20']).details[0].value,'160');
 assert.match(run('time-zone',['2025-01-01T12:00','America/New_York','Europe/London']).primary,/5:00 PM/);
});
test('phase two invalid and boundary cases are explicit',()=>{
 assert.ok(run('average',['','2','3']).error);
 assert.ok(run('fraction',['1','0','add','1','2']).error);
 assert.ok(run('fraction',['1.5','2','add','1','2']).error);
 assert.ok(run('percent-error',['1','0']).error);
 assert.ok(run('percent-off',['10','101']).error);
 assert.ok(run('scientific',['1','divide','0','degrees']).error);
 assert.ok(run('scientific-notation',['1','309']).error);
 assert.ok(run('scientific-notation',['1','2.5']).error);
 assert.ok(run('time-duration',['2025-01-02T00:00','2025-01-01T00:00']).error);
 assert.ok(run('hours',['09:00','10:00','61']).error);
 assert.ok(run('day-of-week',['2025-02-30']).error);
});
test('time duration has dedicated elapsed-time guidance',()=>{
 const content=phaseTwoDefinitions['time-duration'];
 assert.equal(content.seoDescription,'Calculate elapsed time between two local dates and times in hours and minutes, including same-day and overnight intervals.');
 assert.match(content.educationalSections.map(section=>section.body).join(' '),/shifts, travel, events, study sessions/i);
 assert.match(content.variables,/minutes after midnight/i);
 assert.match(content.variables,/following date/i);
 assert.match(content.workedExample,/09:35 to 14:20/i);
 assert.match(content.workedExample,/575 minutes/i);
 assert.match(content.workedExample,/860 minutes/i);
 assert.match(content.workedExample,/285 minutes/i);
 assert.match(content.workedExample,/4 hours 45 minutes/i);
 assert.match(content.interpretation,/4\.75 decimal hours, not 4\.45/i);
 assert.match(content.edgeCases,/22:30 to 01:15/i);
 assert.match(content.edgeCases,/Equal entries produce zero/i);
 assert.match(content.edgeCases,/AM\/PM/i);
 assert.match(content.edgeCases,/breaks or pauses are not deducted automatically/i);
 assert.match(content.limitations,/unpaid breaks/i);
 assert.match(content.limitations,/timesheet rounding policies/i);
 assert.match(content.limitations,/time-zone changes/i);
 assert.match(content.limitations,/daylight-saving transitions/i);
 assert.match(content.limitations,/employer-specific payroll rules/i);
});
test('phase two metadata is unique, substantive, and linked',()=>{
 assert.equal(phaseTwoSlugs.length,15);
 const names=phaseTwoSlugs.map(x=>phaseTwoDefinitions[x].name);
 assert.equal(new Set(names).size,names.length);
  for(const slug of phaseTwoSlugs){const d=phaseTwoDefinitions[slug];assert.ok(d.seoTitle.length<=60);assert.ok(d.seoDescription.length>=100&&d.seoDescription.length<=160);assert.match(d.seoDescription,/[.!?]$/);assert.ok(d.educationalSections.length>=8,slug);assert.equal(new Set(d.educationalSections.map(section=>section.body)).size,d.educationalSections.length,slug);assert.ok(d.educationalSections.every(section=>section.heading&&section.body),slug);assert.ok(d.faqs.length>=2);assert.ok(d.relatedRoutes.length>=2);assert.ok(d.relatedRoutes.every(route=>publishedTools.some(tool=>tool.href===route)),slug);assert.ok(d.tags.length>=4);assert.ok(d.workedExample&&d.interpretation&&d.edgeCases&&d.limitations&&d.formula);assert.ok(phaseTwoUsefulWordCount(d)>=500,`${slug} needs at least 500 meaningful registry words`);}
 const descriptions=phaseTwoSlugs.map(slug=>phaseTwoDefinitions[slug].seoDescription);
 assert.equal(new Set(descriptions).size,descriptions.length,'SEO descriptions must be route-specific');
 assert.equal(phaseTwoMetadataSentence('Calculate a voltage drop from conductor current, resistance, and route length with a transparent electrical model.','x'.repeat(200)).includes('x'),false,'metadata must not end mid-word');
 const bodies=phaseTwoSlugs.flatMap(slug=>phaseTwoDefinitions[slug].educationalSections.map(section=>section.body.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()));
 assert.equal(new Set(bodies).size,bodies.length,'normalized educational sections must not be duplicated');
 const voltageDrop=phaseTwoDefinitions['voltage-drop'];
 assert.equal(voltageDrop.category,'Electrical');
 assert.equal(voltageDrop.categorySlug,'electrical');
 assert.equal(voltageDrop.href,'/calculators/electrical/voltage-drop');
 assert.ok(voltageDrop.relatedRoutes.every(route=>['/calculators/electrical/ohms-law','/calculators/electrical/resistor','/calculators/electrical/electricity'].includes(route)));
  assert.match(voltageDrop.educationalSections.map(section=>section.body).join(' '),/qualified professional/i);
  for (const slug of ['average-return','percent-off'] as const) {
    assert.match(phaseTwoDefinitions[slug].educationalSections.map(section=>section.body).join(' '),/planning arithmetic/i);
  }
});