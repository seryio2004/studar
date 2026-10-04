import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyState,initializeSubjects,initializeSSI,initializeSSIPractice,initializeACIIExams,initializeESTExams,monthCalendar,validateState,calendar,toCSV,parseCSV} from '../src/data.js';
const fixture=()=>({...emptyState(),subjects:[{id:'s1',name:'Matemáticas',color:'#397b68'}],tasks:[{id:'t1',title:'Repasar, derivadas',subjectId:'s1',date:'2026-10-10',priority:'Alta',done:false,notes:'Primera línea\nSegunda línea'}],exams:[{id:'e1',title:'Parcial',subjectId:'s1',date:'2026-10-11T09:00',duration:90}]});
test('backup validation rejects missing subjects and invalid duration',()=>{assert.equal(validateState(fixture()).version,1);const x=fixture();x.tasks[0].subjectId='unknown';assert.throws(()=>validateState(x));const y=fixture();y.exams[0].duration=-1;assert.throws(()=>validateState(y));});
test('CSV round trip preserves commas, quotes, multiline notes and Unicode',()=>{const rows=[['Nombre','Notas'],['Álgebra, II','Dice "hola"\nsegunda línea']];assert.deepEqual(parseCSV('\uFEFF'+toCSV(rows)),rows);assert.throws(()=>parseCSV('"unfinished'));});
test('calendar contains exclusive day end and timed exam end',()=>{const result=calendar(fixture());assert.match(result,/DTSTART;VALUE=DATE:20261010/);assert.match(result,/DTEND;VALUE=DATE:20261011/);assert.match(result,/SUMMARY:Tarea: Repasar\\, derivadas/);assert.match(result,/DTEND:\d{8}T\d{6}Z/);assert.ok(result.endsWith('END:VCALENDAR\r\n'));});
test('completed tasks are excluded and long Unicode lines folded at 75 octets',()=>{const x=fixture();x.tasks[0].done=true;x.exams[0].title='Á'.repeat(150);const result=calendar(x);assert.ok(!result.includes('UID:task-'));for(const line of result.split('\r\n'))assert.ok(Buffer.byteLength(line)<=75);});

test('subject initialization preserves records, matches names and runs only once',()=>{
  const state=fixture();
  state.subjects.push({id:'existing-abp',name:' abp ',color:'#123456'});
  initializeSubjects(state);
  assert.deepEqual(state.subjects.slice(1).map(s=>s.difficulty),[1,2,3,4,5]);
  assert.equal(state.subjects[1].id,'existing-abp');
  assert.equal(state.subjects[1].color,'#123456');
  assert.equal(state.tasks[0].subjectId,'s1');
  validateState(state);
  state.subjects=state.subjects.filter(s=>s.name!=='LC');
  initializeSubjects(state);
  assert.equal(state.subjects.length,5);
});
test('difficulty accepts legacy backups and integers from 1 to 5 only',()=>{
  validateState(fixture());
  for(const difficulty of [1,2,3,4,5]){
    const state=fixture();state.subjects[0].difficulty=difficulty;validateState(state);
  }
  for(const difficulty of [0,6,2.5,'3',null]){
    const state=fixture();state.subjects[0].difficulty=difficulty;
    assert.throws(()=>validateState(state),/dificultad/);
  }
});

test('SSI phases are added once to the matching subject, preserving uncertain dates',()=>{
  const state=emptyState();
  state.subjects.push({id:'custom-ssi',name:' ssi ',color:'#123456'});
  initializeSSI(state);
  assert.equal(state.tasks.length,5);
  assert.ok(state.tasks.every(t=>t.subjectId==='custom-ssi' && t.section==='group' && t.date===''));
  assert.equal(state.subjects[0].groupWork,true);
  assert.match(state.tasks[0].dateText,/2028/);
  assert.match(state.tasks[3].dateText,/206$/);
  validateState(state);
  assert.ok(!calendar(state).includes('BEGIN:VEVENT'));
  state.tasks[0].done=true;
  initializeSSI(state);
  assert.equal(state.tasks.length,5);
  assert.equal(state.tasks[0].done,true);
});
test('tasks support pending dates and sections while exams still require dates',()=>{
  const state=fixture();state.tasks[0].date='';state.tasks[0].section='individual';
  validateState(state);
  state.tasks[0].section='unknown';assert.throws(()=>validateState(state),/Apartado/);
  state.tasks[0].section='practices';state.exams[0].date='';assert.throws(()=>validateState(state),/Fecha/);
});

test('SSI practice is seeded once in existing data with the real subject and pending deadline',()=>{
  const state=fixture();state.subjects.push({id:'my-ssi',name:'SSI',color:'#4684b5'});
  initializeSSIPractice(state);initializeSSIPractice(state);
  const practice=state.tasks.find(t=>t.subjectId==='my-ssi');
  assert.equal(state.tasks.length,2);assert.equal(practice.section,'practices');
  assert.equal(practice.mode,'Individual');assert.equal(practice.date,'');
  assert.match(practice.dateText,/octubre/);
  assert.equal(practice.links[0].url,'https://moovi.uvigo.gal/mod/assign/view.php?id=448586');
  validateState(state);
});
test('month calendar starts on Monday and groups exams and pending deliveries by local date',()=>{
  const state=fixture();state.tasks.push({...state.tasks[0],id:'t2',date:'',done:false});
  state.tasks.push({...state.tasks[0],id:'t3',done:true});
  const cells=monthCalendar(state,2026,9);
  assert.equal(cells.length,35);assert.equal(cells[0],null);assert.equal(cells[3].day,1);
  assert.equal(cells.find(c=>c?.day===10).events.length,1);
  assert.equal(cells.find(c=>c?.day===11).events[0].kind,'exams');
  assert.equal(cells.flatMap(c=>c?.events||[]).length,2);
  assert.equal(monthCalendar(state,2028,1).filter(Boolean).length,29);
  assert.equal(monthCalendar(state,2026,11).find(c=>c?.day===31).date,'2026-12-31');
});

test('ACII exams use Monday laboratory dates and survive reloads without changing deliveries',()=>{
  const state=fixture();
  initializeACIIExams(state);
  assert.equal(state.aciiExams2026Added,undefined);
  state.subjects.push({id:'my-acii',name:' acii ',color:'#8b65ad'});
  const tasks=structuredClone(state.tasks);
  initializeACIIExams(state);
  const exams=state.exams.filter(e=>e.subjectId==='my-acii');
  assert.deepEqual(exams.map(e=>e.date),['2026-10-26','2026-12-07','2026-10-28','2027-01-18']);
  assert.deepEqual(exams.slice(0,2).map(e=>new Date(e.date+'T12:00').getDay()),[1,1]);
  assert.match(exams[0].notes,/las interrupciones no entran/);
  assert.match(exams[1].notes,/P4 a P7/);
  assert.match(exams[3].notes,/pruebas globales/);
  assert.ok(exams.every(e=>e.duration===null));
  assert.deepEqual(state.tasks,tasks);
  validateState(state);
  const exported=calendar(state);
  assert.match(exported,/DTSTART;VALUE=DATE:20261026/);
  assert.match(exported,/DTEND;VALUE=DATE:20261027/);
  assert.match(exported,/DTSTART;VALUE=DATE:20270118/);
  state.exams=state.exams.filter(e=>e.id!==exams[0].id);
  initializeACIIExams(state);
  assert.equal(state.exams.length,4);
});


test('EST morning exams preserve the corrected date and uncertain November week across reloads',()=>{
  const state=fixture();
  initializeESTExams(state);
  assert.equal(state.estExams2026Added,undefined);
  state.subjects.push({id:'my-est',name:' est ',color:'#bb8436'});
  initializeESTExams(state);
  const exams=state.exams.filter(e=>e.subjectId==='my-est');
  assert.equal(exams.length,2);
  assert.equal(exams[0].date,'2026-10-16');
  assert.match(exams[0].notes,/horario de clase del grupo de mañana/);
  assert.equal(exams[1].date,'2026-11-23');
  assert.equal(exams[1].endDate,'2026-11-27');
  assert.ok(exams.every(e=>e.duration===null));
  validateState(state);
  const days=monthCalendar(state,2026,10).filter(c=>c?.events.some(e=>e.id===exams[1].id));
  assert.deepEqual(days.map(c=>c.day),[23,24,25,26,27]);
  const exported=calendar(state);
  assert.match(exported,/DTSTART;VALUE=DATE:20261123/);
  assert.match(exported,/DTEND;VALUE=DATE:20261128/);
  const restored=validateState(JSON.parse(JSON.stringify(state)));
  initializeESTExams(restored);
  assert.deepEqual(restored.exams,state.exams);
  restored.exams=restored.exams.filter(e=>e.id!==exams[0].id);
  initializeESTExams(restored);
  assert.equal(restored.exams.length,2);
  exams[1].endDate='2026-11-22';
  assert.throws(()=>validateState(state),/Intervalo/);
});
