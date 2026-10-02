import assert from 'node:assert/strict';
const base=process.env.TEST_BASE_URL||'http://localhost:3000';
async function state(){const r=await fetch(base+'/api/state');assert.equal(r.status,200);return r.json()}
async function send(body,expected=200){const r=await fetch(base+'/api/state',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});assert.equal(r.status,expected,await r.clone().text());return r.json()}
const id='test-'+crypto.randomUUID();let project={id,title:'Proyecto de verificación',description:'Solo datos locales de prueba',category:'Hardware',status:'Activo',priority:1,repo:'https://github.com/example/repo',notion:'',tasks:[],materials:[],docs:[],revision:0};
await send({action:'saveProject',project});let data=await state();project=data.projects.find(p=>p.id===id);assert.equal(project.revision,1);
project.tasks=[{id:'t1',title:'Primer paso',done:true,priority:1}];project.materials=[{id:'m1',name:'Servidor',type:'Infraestructura',url:'https://example.com',cost:'15',acquired:false}];project.docs=[{id:'d1',name:'notion.md',content:'# Documentación importada'}];await send({action:'saveProject',project});data=await state();project=data.projects.find(p=>p.id===id);assert.equal(data.events.filter(e=>e.project_id===id).length,1);assert.equal(project.materials[0].cost,'15');assert.equal(project.docs[0].content,'# Documentación importada');
await send({action:'saveProject',project});data=await state();const stale=project;project=data.projects.find(p=>p.id===id);assert.equal(data.events.filter(e=>e.project_id===id).length,1);await send({action:'saveProject',project:stale},409);
project.tasks[0].done=false;await send({action:'saveProject',project});data=await state();project=data.projects.find(p=>p.id===id);assert.equal(data.events.filter(e=>e.project_id===id).length,0);
project.tasks[0].done=true;await send({action:'saveProject',project});data=await state();project=data.projects.find(p=>p.id===id);assert.equal(data.events.filter(e=>e.project_id===id).length,1);
await send({action:'saveProject',project:{...project,repo:'javascript:alert(1)'}},400);
const idea={id,title:'Una idea',description:'Inspiración',createdAt:new Date().toISOString()};await send({action:'saveIdea',idea});assert((await state()).ideas.some(i=>i.id===id));await send({action:'deleteIdea',id});assert(!(await state()).ideas.some(i=>i.id===id));
console.log('PASS: persistencia de proyectos, tareas, materiales y documentación; actividad sin duplicados; deshacer/rehacer; conflicto entre sesiones; enlaces seguros; ideas.');
console.log('Local test project: '+id);
