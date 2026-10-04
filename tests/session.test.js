import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {renderMarkdown} from '../src/markdown.js';
import {webcrypto} from 'node:crypto';

const dataSource=readFileSync(new URL('../src/data.js',import.meta.url),'utf8').replaceAll('export ','');
const appSource=readFileSync(new URL('../src/app.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
const moodleSource=readFileSync(new URL('../src/moodle.js',import.meta.url),'utf8').replace(/^export /gm,'');
function openApp(storage,extras={}) {
  const entries=['entry-form','subject-entry'].map(name=>({name,addEventListener(event,handler){this[event]=handler;}}));
  const app={innerHTML:''};
  const context=vm.createContext({
    crypto:{getRandomValues:bytes=>webcrypto.getRandomValues(bytes)},
    structuredClone,TextEncoder,renderMarkdown,
    FormData:class {constructor(form){this.values=Object.entries(form.values);} [Symbol.iterator](){return this.values[Symbol.iterator]();}},
    localStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)},
    document:{querySelector:selector=>selector==='#app'?app:null,querySelectorAll:selector=>selector==='#entry-form, .subject-entry'?entries:[]},
    ...extras
  });
  vm.runInContext(dataSource+'\n'+moodleSource+'\n'+appSource,context);
  return {entries,app,context};
}
test('both session forms save without randomUUID and retain sessions after reload',()=>{
  const storage=new Map();
  const {entries}=openApp(storage);
  for(const [index,entry] of entries.entries()) {
    let prevented=false;
    entry.submit({preventDefault(){prevented=true;},target:{dataset:{kind:'sessions'},values:{subjectId:'subject-abp',date:'2026-10-03',minutes:String(30+index*30),notes:'Repaso'}}});
    assert.ok(prevented);
  }
  const saved=JSON.parse(storage.get('studytracker:v1'));
  assert.equal(saved.sessions.length,2);
  assert.deepEqual(saved.sessions.map(s=>s.minutes),[30,60]);
  assert.notEqual(saved.sessions[0].id,saved.sessions[1].id);
  for(const session of saved.sessions) assert.match(session.id,/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  const reloaded=openApp(storage);
  assert.equal(vm.runInContext('state.sessions.length',reloaded.context),2);
  assert.match(reloaded.app.innerHTML,/1,5/);
});

test('automatic Moodle discovery loads new files, persists hashes and retries failed files',async()=>{
  const storage=new Map(),handlers={},requests=[];
  const path='imports/moodle/2026-10-04/proposals.json';
  let files=[{path,sha256:'a'.repeat(64)}],broken=false;
  const fetcher=async url=>{
    requests.push(url);
    if(url==='api/moodle-reviews')return {ok:true,json:async()=>({reviews:files})};
    return {ok:true,text:async()=>broken?'{':JSON.stringify({schema_version:1,review_date:'2026-10-04',proposals:[{id:url,kind:'tasks',action:'create',changes:{title:url,subjectId:'subject-abp',date:''}}]})};
  };
  const extras={fetch:fetcher,window:{addEventListener:(name,fn)=>{handlers[name]=fn;},setInterval:fn=>{handlers.poll=fn;}}};
  const first=openApp(storage,extras);
  const baseline=vm.runInContext('JSON.stringify([state.tasks,state.exams])',first.context);
  await new Promise(setImmediate);
  assert.equal(vm.runInContext('state.aiProposals.length',first.context),1);
  assert.equal(vm.runInContext('JSON.stringify([state.tasks,state.exams])',first.context),baseline);
  assert.match(first.app.innerHTML,/Por confirmar \(1\)/);
  const reloaded=openApp(storage,extras);await new Promise(setImmediate);
  assert.equal(requests.filter(url=>url===path).length,1);
  assert.equal(vm.runInContext('state.aiReviews.length',reloaded.context),1);
  files.push({path:'imports/moodle/2026-10-05/proposals.json',sha256:'b'.repeat(64)});
  broken=true;handlers.poll();await new Promise(setImmediate);
  assert.equal(vm.runInContext('state.aiProposals.length',reloaded.context),1);
  broken=false;handlers.focus();await new Promise(setImmediate);
  assert.equal(vm.runInContext('state.aiProposals.length',reloaded.context),2);
  assert.equal(vm.runInContext('JSON.stringify([state.tasks,state.exams])',reloaded.context),baseline);
});
test('session creation errors are displayed and leave saved sessions unchanged',()=>{
  const storage=new Map();
  const {entries,app,context}=openApp(storage);
  vm.runInContext('crypto.getRandomValues=()=>{throw new Error("No se pudo crear el identificador.");}',context);
  entries[0].submit({preventDefault(){},target:{dataset:{kind:'sessions'},values:{subjectId:'subject-abp',date:'2026-10-03',minutes:'30',notes:''}}});
  assert.match(app.innerHTML,/No se pudo crear el identificador/);
  assert.equal(JSON.parse(storage.get('studytracker:v1')).sessions.length,0);
});

test('overview shows the calendar and an existing SSI receives its practice after reload',()=>{
  const storage=new Map();const first=openApp(storage);
  assert.match(first.app.innerHTML,/Calendario de estudio/);
  assert.match(first.app.innerHTML,/data-calendar-step="-1"/);
  assert.match(first.app.innerHTML,/entregas sin fecha confirmada/);
  const second=openApp(storage);
  assert.equal(vm.runInContext('state.tasks.filter(t=>t.documentPath).length',second.context),1);
  vm.runInContext("view='subjects';render();",second.context);
  assert.match(second.app.innerHTML,/Práctica 1. Uso del API de cifrado de Java/);
  vm.runInContext("openTask(state.tasks.find(t=>t.documentPath).id);",second.context);
  assert.match(second.app.innerHTML,/docs\/ssi\/practica-1-cifrado-java.md/);
  assert.match(second.app.innerHTML,/data-task-date/);
});

test('overview limits pending tasks to five, ordered by deadline with undated last',()=>{
  const {context,app}=openApp(new Map());
  vm.runInContext(`state.tasks=Array.from({length:8},(_,i)=>({id:'task-'+i,title:'Task '+i,subjectId:'subject-abp',date:i===0?'':'2026-10-'+String(20-i).padStart(2,'0'),done:i===7,priority:'Media'}));render();`,context);
  const ids=[...app.innerHTML.matchAll(/data-task="([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual(ids,['task-6','task-5','task-4','task-3','task-2']);
  vm.runInContext("view='tasks';render();",context);
  assert.equal([...app.innerHTML.matchAll(/data-task="/g)].length,7);
  assert.ok(!app.innerHTML.includes('data-task="task-7"'));
  vm.runInContext("taskStatus='done';render();",context);
  assert.equal([...app.innerHTML.matchAll(/data-task="/g)].length,1);
});

test('opening a task isolates its content and renders Markdown notes',()=>{
  const {context,app}=openApp(new Map());
  vm.runInContext(`state.tasks=[{id:'one',title:'Selected task',subjectId:'subject-abp',date:'',done:false,priority:'Media',notes:'## Objetivo\\n\\n**Preparar** el tema'},{id:'two',title:'Other task',subjectId:'subject-abp',date:'',done:false,priority:'Media'}];openTask('one');`,context);
  assert.match(app.innerHTML,/<h1>Selected task<\/h1>/);
  assert.match(app.innerHTML,/<h3>Objetivo<\/h3>/);
  assert.match(app.innerHTML,/<strong>Preparar<\/strong>/);
  assert.ok(!app.innerHTML.includes('Other task'));
  assert.equal(vm.runInContext('returnView',context),'overview');
});

test('review UI shows complete comparisons, sources, doubts and persistent decisions',()=>{
  const storage=new Map();const {context,app}=openApp(storage);
  vm.runInContext(`
    view='reviews';
    receiveReview({schema_version:1,review_date:'2026-10-03',complete:false,access_issues:['Documento no accesible'],proposals:[{
      id:'review-ui',kind:'tasks',action:'create',summary:'Nueva entrega',
      changes:{title:'Propuesta <script>alert(1)</script>',subjectId:'subject-abp',date:'',notes:'Enunciado completo'},
      statement:'## Requisitos\\n\\nEntregar memoria',sources:[{label:'Fuente Moodle',url:'https://example.com/activity'}],uncertainties:['Fecha pendiente']
    }]});
  `,context);
  assert.match(app.innerHTML,/Comparación|Datos de la nueva actividad/);
  assert.match(app.innerHTML,/Revisión completa/);
  assert.match(app.innerHTML,/Fuente Moodle/);
  assert.match(app.innerHTML,/Fecha pendiente/);
  assert.match(app.innerHTML,/Documento no accesible/);
  assert.match(app.innerHTML,/Entregar memoria/);
  assert.ok(!app.innerHTML.includes('<script>'));
  vm.runInContext("state=decideProposal(state,'review-ui','accepted');save();reviewStatus='accepted';render();",context);
  assert.match(app.innerHTML,/Aplicada a tus tareas/);
  const reloaded=openApp(storage);
  assert.equal(vm.runInContext("state.aiProposals[0].status",reloaded.context),'accepted');
  assert.equal(vm.runInContext("state.tasks.filter(t=>t.title.includes('Propuesta')).length",reloaded.context),1);
});

test('pending proposal editor shows date and time separately and saves corrections across reload',()=>{
  const storage=new Map();const {context,app}=openApp(storage);
  vm.runInContext(`view='reviews';receiveReview({schema_version:1,proposals:[{id:'editable',kind:'tasks',action:'create',changes:{subjectId:'subject-abp',title:'Entrega',date:'2026-10-09T23:59'}}]});editingProposal='editable';render();`,context);
  assert.match(app.innerHTML,/Editar propuesta/);
  assert.match(app.innerHTML,/name="dateDay" type="date" value="2026-10-09"/);
  assert.match(app.innerHTML,/name="dateTime" type="time" value="23:59"/);
  const baseline=vm.runInContext('JSON.stringify(state.tasks)',context);
  vm.runInContext(`saveProposalEdits('editable',{title:'Entrega corregida',subjectId:'subject-abp',dateDay:'2026-10-10',dateTime:'12:00',dateText:'',mode:'Individual',project:'',notes:'Mis notas',links:'Moovi | https://example.com/task',priority:'Alta',section:'practices'});`,context);
  assert.equal(vm.runInContext('JSON.stringify(state.tasks)',context),baseline);
  assert.match(app.innerHTML,/Entrega corregida/);
  const reloaded=openApp(storage);
  assert.equal(vm.runInContext('state.aiProposals[0].changes.date',reloaded.context),'2026-10-10T12:00');
  assert.equal(vm.runInContext('state.aiProposals[0].changes.priority',reloaded.context),'Alta');
});

test('resolved review JSON is deleted only after durable decisions, while the web retains the full registry',async()=>{
  const storage=new Map(),path='imports/moodle/2026-10-04/proposals.json';
  let exists=true,cleanupCalls=0;
  const fetcher=async(url,options)=>{
    if(url==='api/moodle-reviews')return {ok:true,json:async()=>({reviews:exists?[{path,sha256:'a'.repeat(64)}]:[]})};
    if(url==='api/moodle-reviews/cleanup') {
      cleanupCalls++;
      const saved=JSON.parse(storage.get('studytracker:v1'));
      assert.deepEqual(saved.aiProposals.map(p=>p.status),['accepted','discarded']);
      assert.equal(saved.aiReviews.length,1);
      assert.equal(saved.aiProposals[0].statement,'Enunciado que debe conservarse');
      assert.deepEqual(JSON.parse(options.body).resolved_ids,['cleanup-one','cleanup-two']);
      exists=false;return {ok:true,json:async()=>({deleted:[path,'imports/moodle/2026-10-04/inventory.json']})};
    }
    return {ok:true,text:async()=>JSON.stringify({schema_version:1,review_date:'2026-10-04',proposals:[
      {id:'cleanup-one',kind:'tasks',action:'create',statement:'Enunciado que debe conservarse',changes:{title:'Una',subjectId:'subject-abp',date:''}},
      {id:'cleanup-two',kind:'tasks',action:'create',changes:{title:'Dos',subjectId:'subject-abp',date:''}}
    ]})};
  };
  const extras={fetch:fetcher,window:{addEventListener(){},setInterval(){}}};
  const app=openApp(storage,extras);await new Promise(setImmediate);
  await vm.runInContext("state=decideProposal(state,'cleanup-one','accepted');save();cleanMoodleReports();",app.context);
  assert.equal(cleanupCalls,0);
  await vm.runInContext("state=decideProposal(state,'cleanup-two','discarded');save();cleanMoodleReports();",app.context);
  assert.equal(cleanupCalls,1);
  const reloaded=openApp(storage,extras);await new Promise(setImmediate);
  assert.equal(vm.runInContext('state.aiProposals.length',reloaded.context),2);
  assert.equal(vm.runInContext('state.aiReviews.length',reloaded.context),1);
  assert.equal(vm.runInContext("state.tasks.filter(t=>t.title==='Una').length",reloaded.context),1);
  assert.equal(vm.runInContext("state.tasks.filter(t=>t.title==='Dos').length",reloaded.context),0);
  assert.equal(vm.runInContext("state.moodleReportFiles['"+path+"'].deleted",reloaded.context),true);
});

test('storage failure prevents source deletion and a server failure remains retryable',async()=>{
  const storage=new Map();let requests=0,fail=true;
  const app=openApp(storage,{fetch:async()=>{requests++;return {ok:!fail,json:async()=>fail?{error:'Servidor no disponible'}:{deleted:['report.json']}};}});
  vm.runInContext(`receiveReview({schema_version:1,proposals:[{id:'retry',kind:'tasks',action:'create',changes:{title:'Reintento',subjectId:'subject-abp',date:''}}]});state=decideProposal(state,'retry','discarded');state.moodleReportFiles={'imports/moodle/2026-10-04/proposals.json':{sha256:'${'a'.repeat(64)}',references:{retry:'retry'}}};`,app.context);
  vm.runInContext('localStorage.setItem=()=>{throw new Error("Quota");}',app.context);
  await vm.runInContext('cleanMoodleReports()',app.context);assert.equal(requests,0);
  app.context.localStorage.setItem=(key,value)=>storage.set(key,value);
  await vm.runInContext('cleanMoodleReports()',app.context);assert.equal(requests,1);
  assert.match(app.app.innerHTML,/Limpieza pendiente/);
  fail=false;await vm.runInContext('cleanMoodleReports()',app.context);assert.equal(requests,2);
  assert.equal(vm.runInContext('state.aiProposals[0].status',app.context),'discarded');
});
