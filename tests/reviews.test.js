import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {emptyState,validateState,importProposals,decideProposal,proposalConflict,editProposal} from '../src/data.js';

function fixture() {
  const state=emptyState();
  state.subjects.push({id:'ssi',name:'SSI',color:'#4684b5'});
  state.tasks.push({id:'task-1',subjectId:'ssi',title:'Práctica',date:'',dateText:'Finales de octubre',done:false,priority:'Media',notes:'Mis notas'});
  return state;
}
const report=proposals=>({schema_version:1,review_date:'2026-10-03',complete:true,proposals});
const addition=(extra={})=>({id:'new-1',kind:'tasks',action:'create',summary:'Nueva práctica',changes:{title:'Práctica nueva',subjectId:'ssi',date:''},...extra});
const update=state=>({id:'update-1',kind:'tasks',action:'update',targetId:'task-1',base:structuredClone(state.tasks[0]),changes:{date:'2026-10-30'}});

test('import keeps confirmed records untouched; acceptance applies once and survives backup',()=>{
  const original=fixture();
  const {state,added}=importProposals(original,report([addition()]));
  assert.equal(added,1);
  assert.deepEqual(state.tasks,original.tasks);
  assert.equal(original.aiProposals,undefined);
  const accepted=decideProposal(state,'new-1','accepted');
  assert.equal(accepted.tasks.length,2);
  assert.equal(accepted.tasks[1].done,false);
  assert.equal(accepted.aiProposals[0].appliedId,accepted.tasks[1].id);
  assert.throws(()=>decideProposal(accepted,'new-1','accepted'),/ya está revisada/);
  const restored=validateState(JSON.parse(JSON.stringify(accepted)));
  assert.equal(restored.aiProposals[0].status,'accepted');
  assert.equal(importProposals(restored,report([addition()])).added,0);
});
test('discard preserves records and can be reopened for review',()=>{
  const original=fixture();const imported=importProposals(original,report([update(original)])).state;
  const discarded=decideProposal(imported,'update-1','discarded');
  assert.deepEqual(discarded.tasks,original.tasks);
  assert.equal(discarded.aiProposals[0].status,'discarded');
  assert.equal(decideProposal(discarded,'update-1','pending').aiProposals[0].status,'pending');
});
test('updates preserve user notes and unrelated edits but block edits to proposed fields',()=>{
  const original=fixture();const imported=importProposals(original,report([update(original)])).state;
  imported.tasks[0].notes='Mis notas actualizadas';
  assert.equal(proposalConflict(imported,imported.aiProposals[0]),'');
  const accepted=decideProposal(imported,'update-1','accepted');
  assert.equal(accepted.tasks[0].date,'2026-10-30');
  assert.equal(accepted.tasks[0].notes,'Mis notas actualizadas');
  imported.tasks[0].date='2026-10-29';
  assert.throws(()=>decideProposal(imported,'update-1','accepted'),/Has modificado/);
  assert.equal(imported.aiProposals[0].status,'pending');
});
test('deleted targets and subjects block acceptance but history still restores',()=>{
  const original=fixture();const imported=importProposals(original,report([update(original)])).state;
  imported.tasks=[];imported.subjects=[];
  assert.throws(()=>decideProposal(imported,'update-1','accepted'),/ya no existe/);
  assert.doesNotThrow(()=>validateState(JSON.parse(JSON.stringify(imported))));
  assert.equal(decideProposal(imported,'update-1','discarded').aiProposals[0].status,'discarded');
});
test('creation blocks duplicate titles and direct activity links',()=>{
  const original=fixture();original.tasks[0].links=[{label:'Moodle',url:'https://example.com/activity/1'}];
  for (const changes of [{title:'Práctica',subjectId:'ssi',date:''},{title:'Otro título',subjectId:'ssi',date:'',links:original.tasks[0].links}]) {
    const imported=importProposals(original,report([addition({changes})])).state;
    assert.throws(()=>decideProposal(imported,'new-1','accepted'),/Ya existe/);
  }
});
test('deletion requires unchanged full snapshot and an explicit acceptance',()=>{
  const original=fixture();const deletion={id:'delete-1',kind:'tasks',action:'delete',targetId:'task-1',base:structuredClone(original.tasks[0]),changes:{},reason:'Actividad cancelada explícitamente en la fuente'};
  const imported=importProposals(original,report([deletion])).state;
  assert.equal(imported.tasks.length,1);
  const accepted=decideProposal(imported,'delete-1','accepted');
  assert.equal(accepted.tasks.length,0);
  imported.tasks[0].notes='Nueva nota';
  assert.throws(()=>decideProposal(imported,'delete-1','accepted'),/Has modificado/);
});
test('invalid batches are rejected atomically, including unsafe links and missing base',()=>{
  const original=fixture();
  for (const invalid of [addition({id:'bad',changes:{title:'Sin asignatura'}}),addition({id:'bad',sources:[{label:'Malicioso',url:'javascript:alert(1)'}]}),{...update(original),id:'bad',base:undefined},addition({id:'bad',changes:{title:'Título',subjectId:'ssi',date:'',unexpected:'x'}})]) {
    assert.throws(()=>importProposals(original,report([addition(),invalid])));
    assert.equal(original.aiProposals,undefined);
    assert.equal(original.tasks.length,1);
  }
});
test('a reused proposal id cannot silently replace reviewed content',()=>{
  const imported=importProposals(fixture(),report([addition()])).state;
  assert.throws(()=>importProposals(imported,report([addition({summary:'Contenido diferente'})])),/id nuevo/);
});
test('approximate deadlines remain textual and untimed exams remain untimed',()=>{
  const imported=importProposals(fixture(),report([addition({changes:{title:'Nueva',subjectId:'ssi',date:'',dateText:'Finales de octubre'}}),{id:'exam',kind:'exams',action:'create',changes:{title:'Prueba',subjectId:'ssi',date:'2026-11-23',endDate:'2026-11-27'}}])).state;
  const accepted=decideProposal(decideProposal(imported,'new-1','accepted'),'exam','accepted');
  assert.equal(accepted.tasks[1].date,'');
  assert.equal(accepted.tasks[1].dateText,'Finales de octubre');
  assert.equal(accepted.exams[0].duration,null);
  assert.equal(accepted.exams[0].endDate,'2026-11-27');
});
test('the existing incomplete Moodle report displays access gaps without inventing proposals',()=>{
  const existing=JSON.parse(readFileSync(new URL('../imports/moodle/2026-10-03/proposals.json',import.meta.url),'utf8'));
  const {state,added}=importProposals(fixture(),existing);
  assert.equal(added,0);
  assert.equal(state.aiReviews[0].complete,false);
  assert.ok(state.aiReviews[0].issues.length);
  assert.equal(state.tasks.length,1);
});

test('different ids for the same activity update one pending proposal and preserve its prior version',()=>{
  const original=fixture();
  const initial=importProposals(original,report([addition()])).state;
  const changed=addition({id:'new-version',changes:{title:'Práctica nueva',subjectId:'ssi',date:'2026-11-01'}});
  const result=importProposals(initial,{...report([changed]),review_date:'2026-10-04'});
  assert.equal(result.added,0);assert.equal(result.updated,1);
  assert.equal(result.state.aiProposals.length,1);
  assert.equal(result.state.aiProposals[0].changes.date,'2026-11-01');
  assert.equal(result.state.aiProposals[0].previousVersions[0].id,'new-1');
  assert.deepEqual(result.state.tasks,original.tasks);
  const old=importProposals(result.state,report([addition({id:'old-copy'})]));
  assert.equal(old.updated,0);
  assert.equal(old.state.aiProposals[0].id,'new-version');
});

test('repeat imports do not duplicate reviews or revive accepted and discarded proposals',()=>{
  for(const decision of ['accepted','discarded']) {
    const initial=importProposals(fixture(),report([addition()])).state;
    const decided=decideProposal(initial,'new-1',decision);
    const repeated=importProposals(decided,report([addition({id:'different-id',summary:'Nueva evidencia'})]));
    assert.equal(repeated.added,0);assert.equal(repeated.updated,0);
    assert.equal(repeated.state.aiProposals.length,1);
    assert.equal(repeated.state.aiProposals[0].status,decision);
    assert.equal(repeated.state.aiReviews.length,1);
    assert.deepEqual(repeated.state.tasks,decided.tasks);
  }
});

test('activity module ids deduplicate renamed titles and ignore incidental URL parameters',()=>{
  const a=addition({changes:{title:'Primero',subjectId:'ssi',date:'',links:[{label:'Moovi',url:'https://moovi.uvigo.gal/mod/assign/view.php?id=12&redirect=1'}]}});
  const b=addition({id:'renamed',changes:{...a.changes,title:'Nuevo título',links:[{label:'Moovi',url:'https://moovi.uvigo.gal/mod/assign/view.php?id=12'}]}});
  const result=importProposals(fixture(),report([a,b]));
  assert.equal(result.state.aiProposals.length,1);assert.equal(result.updated,1);
  assert.equal(result.state.aiProposals[0].changes.title,'Nuevo título');
});

test('shared document sources do not merge separate milestones',()=>{
  const sources=[{label:'Calendario',url:'https://moovi.uvigo.gal/mod/resource/view.php?id=12'}];
  const result=importProposals(fixture(),report([addition({sources}),addition({id:'sprint-two',sources,changes:{title:'Sprint 2',subjectId:'ssi',date:''}})]));
  assert.equal(result.state.aiProposals.length,2);
});

test('legacy pending duplicates are compacted without touching confirmed records',()=>{
  const state=importProposals(fixture(),report([addition()])).state;
  state.aiProposals.push({...state.aiProposals[0],id:'legacy-duplicate'});
  const result=importProposals(state,report([]));
  assert.equal(result.state.aiProposals.length,1);
  assert.equal(result.state.aiProposals[0].previousVersions[0].id,'new-1');
  assert.deepEqual(result.state.tasks,state.tasks);
});

test('editing pending proposals persists corrections without applying them or altering source evidence',()=>{
  const original=fixture();
  const source=addition({statement:'Fecha según Moodle',sources:[{label:'Moovi',url:'https://example.com/task'}]});
  const imported=importProposals(original,report([source])).state;
  const edited=editProposal(imported,'new-1',{title:'Título corregido',date:'2026-10-08T23:59',notes:'Mis requisitos'});
  assert.deepEqual(edited.tasks,original.tasks);
  assert.equal(edited.aiProposals[0].statement,source.statement);
  assert.deepEqual(edited.aiProposals[0].sources,source.sources);
  assert.equal(edited.aiProposals[0].editedAt.length>0,true);
  const restored=validateState(JSON.parse(JSON.stringify(edited)));
  assert.equal(importProposals(restored,report([source])).added,0);
  const accepted=decideProposal(restored,'new-1','accepted');
  assert.equal(accepted.tasks[1].date,'2026-10-08T23:59');
  assert.equal(accepted.tasks[1].notes,'Mis requisitos');
  assert.throws(()=>editProposal(accepted,'new-1',{date:''}),/pendientes/);
});

test('automatic newer reports preserve corrected dates and titles while adding untouched source changes',()=>{
  const initial=importProposals(fixture(),report([addition()])).state;
  const edited=editProposal(initial,'new-1',{date:'2026-10-10',title:'Mi título'});
  const newer=addition({id:'new-source',changes:{title:'Práctica nueva',subjectId:'ssi',date:'2026-10-09',notes:'Requisito nuevo'}});
  const result=importProposals(edited,{...report([newer]),review_date:'2026-10-04'});
  assert.equal(result.updated,1);assert.equal(result.state.aiProposals.length,1);
  assert.equal(result.state.aiProposals[0].changes.date,'2026-10-10');
  assert.equal(result.state.aiProposals[0].changes.title,'Mi título');
  assert.equal(result.state.aiProposals[0].changes.notes,'Requisito nuevo');
  assert.equal(importProposals(result.state,report([newer])).added,0);
});

test('invalid edits are atomic and updates retain the original conflict baseline',()=>{
  const initial=fixture();const imported=importProposals(initial,report([update(initial)])).state;
  for(const date of ['2026-02-30','2026-10-10T24:00']) assert.throws(()=>editProposal(imported,'update-1',{date}),/Fecha inválida/);
  assert.equal(imported.aiProposals[0].changes.date,'2026-10-30');
  const edited=editProposal(imported,'update-1',{date:'2026-10-31'});
  edited.tasks[0].date='2026-10-29';
  assert.throws(()=>decideProposal(edited,'update-1','accepted'),/Has modificado/);
});

test('a revised source with unchanged fields does not reopen a personally edited accepted proposal',()=>{
  const imported=importProposals(fixture(),report([addition()])).state;
  const edited=editProposal(imported,'new-1',{date:'2026-10-10'});
  const accepted=decideProposal(edited,'new-1','accepted');
  const result=importProposals(accepted,report([addition({id:'later-source',summary:'Más evidencia'})]));
  assert.equal(result.added,0);assert.equal(result.state.aiProposals.length,1);
  assert.equal(result.state.tasks[1].date,'2026-10-10');
});
