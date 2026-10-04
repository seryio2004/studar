import {emptyState,initializeSubjects,initializeSSI,initializeSSIPractice,initializeACIIExams,initializeLCExam,initializeESTExams,monthCalendar,taskSections,uid,validateState,calendar,toCSV,parseCSV,proposalFields,proposalCandidate,proposalConflict,importProposals,decideProposal,editProposal} from './data.js';
import {renderMarkdown} from './markdown.js';
import {discoverMoodleReviews,readMoodleReview,resolvedReviewIds,deleteMoodleReview} from './moodle.js';
const KEY='studytracker:v1';let state=emptyState(),view='overview',filter='',notice='';
try{const saved=localStorage.getItem(KEY);if(saved)state=validateState(JSON.parse(saved));}catch{notice='No se pudo leer la copia local. Puedes importar una copia válida.';}
initializeSubjects(state);
initializeSSI(state);
initializeSSIPractice(state);
initializeACIIExams(state);
initializeLCExam(state);
initializeESTExams(state);
try{localStorage.setItem(KEY,JSON.stringify(state));}catch{notice='No se pudo guardar en el navegador. Exporta una copia JSON para conservar los cambios.';}
let reviewStatus='pending', reviewSubject='', reviewSearch='', editingProposal=null;
let selectedTask=null, returnView='overview', taskStatus='pending', showEntry=false;
const difficultyOptions=value=>[1,2,3,4,5].map(n=>`<option value="${n}" ${n===value?'selected':''}>${n}</option>`).join('');
const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const dateLabel=value=>!value?'Fecha pendiente':new Date(value.length===10?value+'T12:00':value).toLocaleString('es-ES',{day:'numeric',month:'short',...(value.length>10?{hour:'2-digit',minute:'2-digit'}:{})});
const priorityControl=()=>`<fieldset class="choice-field"><legend>Prioridad</legend><div class="choices">${['Baja','Media','Alta'].map(value=>`<label><input type="radio" name="priority" value="${value}" ${value==='Media'?'checked':''}><span>${value}</span></label>`).join('')}</div></fieldset>`;
const sectionOptions=(value='practices')=>Object.entries(taskSections).map(([key,label])=>`<option value="${key}" ${value===key?'selected':''}>${label}</option>`).join('');
let calendarMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1,12);
const taskOrder=(a,b)=>(a.date||'9999').localeCompare(b.date||'9999');
const subject=id=>state.subjects.find(s=>s.id===id);
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));return true;}catch{notice='No se pudo guardar en el navegador. Exporta una copia JSON para conservar los cambios.';return false;}}
function save(){const saved=persist();render();return saved;}
const badge=id=>{const s=subject(id);return `<span class="badge" style="--subject:${s?.color||'#174c40'}">${esc(s?.name||'Sin asignatura')}</span>`;};
function download(name,content,type){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function rows(kind,items){
  if(!items.length)return '<div class="empty">Nada por aquí.</div>';
  return items.map(item=>`<article class="record">
    ${kind==='tasks'?`<input type="checkbox" aria-label="Completar ${esc(item.title)}" data-toggle="${esc(item.id)}" ${item.done?'checked':''}>`:'<span class="record-icon">◷</span>'}
    <div class="record-body">
      ${kind==='tasks'?`<button class="task-title ${item.done?'done':''}" data-task="${esc(item.id)}">${esc(item.title)}<span aria-hidden="true">↗</span></button>`:`<strong>${esc(kind==='sessions'?(item.notes||'Sesión de estudio'):item.title)}</strong>`}
      <div class="meta">${badge(item.subjectId)}<span>${esc(item.date?dateLabel(item.date)+(item.endDate?' – '+dateLabel(item.endDate):''):'Sin fecha')}</span>${kind==='tasks'?'':`<span>${kind==='sessions'?item.minutes+' min':item.duration===null?'Duración pendiente':item.duration+' min'}</span>`}</div>
      ${kind==='exams'&&item.date.length===10?'<small>Hora pendiente</small>':''}
      ${kind==='exams'&&item.notes?`<p>${esc(item.notes)}</p>`:''}
    </div>
    ${kind==='tasks'?'':`<button class="icon-button" data-delete="${kind}:${esc(item.id)}" aria-label="Eliminar registro">×</button>`}
  </article>`).join('');
}
function openTask(id){
  returnView=view;selectedTask=id;view='task';render();
  document.querySelector('main')?.focus();
}
function taskDetail(){
  const task=state.tasks.find(t=>t.id===selectedTask);
  if(!task)return '<p class="empty">Esta tarea ya no existe.</p><button data-view="tasks">Volver a tareas</button>';
  return `<div class="task-detail">
    <button id="task-back" class="back-button">← Volver</button>
    <article class="panel">
      <div class="meta">${badge(task.subjectId)}<span>${esc(taskSections[task.section||'practices'])}</span></div>
      <h1>${esc(task.title)}</h1>
      <div class="task-toolbar"><label class="completion"><input type="checkbox" data-toggle="${esc(task.id)}" ${task.done?'checked':''}>${task.done?'Completada':'Marcar como hecha'}</label><label>Entrega<input type="date" data-task-date="${esc(task.id)}" value="${esc(task.date)}"></label><span>Prioridad ${esc(task.priority.toLowerCase())}</span></div>
      ${task.dateText?`<p class="muted">${esc(task.dateText)}</p>`:''}
      ${task.mode||task.project?`<p class="muted">${esc([task.mode,task.project].filter(Boolean).join(' · '))}</p>`:''}
      ${(task.links||[]).map(link=>`<a class="record-link" href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">${esc(link.label)} ↗</a>`).join('')}
      <section class="statement"><div class="panel-title"><h2>Enunciado</h2>${task.documentPath?`<a href="${esc(task.documentPath)}" download>Descargar .md ↓</a>`:''}</div>
      <div class="markdown" ${task.documentPath?`data-document="${esc(task.documentPath)}" aria-live="polite"`:''}>${task.documentPath?'Cargando enunciado…':renderMarkdown(task.notes||'Sin enunciado todavía.')}</div></section>
      <button class="danger" data-delete="tasks:${esc(task.id)}">Eliminar tarea</button>
    </article></div>`;
}
function form(kind){return `<form id="entry-form" data-kind="${kind}" class="entry-form"><h3>${{tasks:'Nueva tarea',exams:'Nuevo examen',sessions:'Registrar estudio'}[kind]}</h3>${kind!=='sessions'?'<label>Título<input name="title" required maxlength="160" placeholder="¿Qué tienes que preparar?"></label>':''}<label>Asignatura<select name="subjectId" required><option value="">Selecciona una asignatura</option>${state.subjects.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></label><label>${kind==='exams'?'Fecha y hora':'Fecha'}<input type="${kind==='exams'?'datetime-local':'date'}" name="date" value="${today()+(kind==='exams'?'T09:00':'')}" ${kind==='tasks'?'':'required'}></label>${kind==='tasks'?'<label>Apartado<select name="section">'+sectionOptions()+'</select></label>'+priorityControl()+'':`<label>Duración (minutos)<input name="${kind==='exams'?'duration':'minutes'}" type="number" min="1" max="1440" value="${kind==='exams'?90:60}" required></label>`}<label class="wide">${kind==='tasks'?'Enunciado (Markdown)':'Notas'}<textarea name="notes" maxlength="1000" placeholder="Temas, objetivos o detalles…"></textarea></label><button class="primary" ${state.subjects.length?'':'disabled'}>Guardar ${kind==='sessions'?'sesión':kind==='exams'?'examen':'tarea'}</button>${state.subjects.length?'':'<small>Crea primero una asignatura.</small>'}</form>`;}
function subjectCard(s){
const tasks=state.tasks.filter(t=>t.subjectId===s.id).sort((a,b)=>Number(a.done)-Number(b.done)||taskOrder(a,b));
const minutes=state.sessions.filter(session=>session.subjectId===s.id).reduce((total,session)=>total+session.minutes,0);
return `<article class="panel subject-card" style="border-top:4px solid ${s.color}"><h2>${esc(s.name)}</h2><label class="subject-difficulty">Dificultad (1–5)<select data-difficulty="${esc(s.id)}" aria-label="Dificultad de ${esc(s.name)}"><option value="" ${s.difficulty===undefined?'selected':''} disabled>Sin asignar</option>${difficultyOptions(s.difficulty)}</select></label><p>${tasks.filter(t=>!t.done).length} tareas pendientes · ${state.exams.filter(e=>e.subjectId===s.id).length} exámenes · ${minutes} min de estudio</p>
<div class="subject-options">${[['groupWork','Trabajo en grupo'],['individualWork','Trabajos individuales']].map(([key,label])=>`<label><input type="checkbox" data-section="${s.id}" data-option="${key}" ${s[key]||tasks.some(t=>t.section===(key==='groupWork'?'group':'individual'))?'checked':''}> ${label}</label>`).join('')}</div>
${Object.entries(taskSections).filter(([key])=>key==='practices'||s[key==='group'?'groupWork':'individualWork']||tasks.some(t=>t.section===key)).map(([key,label])=>`<section class="subject-tasks" aria-label="${label} de ${esc(s.name)}"><h3>${label}</h3>${rows('tasks',tasks.filter(t=>(t.section||'practices')===key))}</section>`).join('')}
<section class="subject-tasks"><h3>Exámenes</h3>${rows('exams',state.exams.filter(e=>e.subjectId===s.id).sort(taskOrder))}</section>
<details class="subject-action"><summary>Añadir tarea +</summary><form class="subject-entry" data-kind="tasks"><input type="hidden" name="subjectId" value="${esc(s.id)}"><label class="wide">Título<input name="title" required maxlength="160" placeholder="¿Qué tienes que preparar?"></label><label>Apartado<select name="section">${sectionOptions()}</select></label><label>Fecha límite (opcional)<input type="date" name="date"></label>${priorityControl()}<button class="primary wide">Guardar tarea</button></form></details>
<details class="subject-action"><summary>Registrar sesión de estudio +</summary><form class="subject-entry" data-kind="sessions"><input type="hidden" name="subjectId" value="${esc(s.id)}"><label>Fecha<input type="date" name="date" value="${today()}" required></label><label>Duración (minutos)<input name="minutes" type="number" min="1" max="1440" value="30" required></label><div class="duration-presets wide" role="group" aria-label="Duraciones rápidas">${[15,30,60,90].map(n=>`<button type="button" data-minutes="${n}" aria-pressed="${n===30}">${n} min</button>`).join('')}</div><label class="wide">Notas (opcional)<input name="notes" maxlength="1000" placeholder="¿Qué has estudiado?"></label><button class="primary wide">Guardar sesión</button></form></details>
<button data-delete="subjects:${s.id}" class="danger">Eliminar asignatura</button></article>`;
}
function calendarPanel(){
  const year=calendarMonth.getFullYear(),month=calendarMonth.getMonth();
  const cells=monthCalendar(state,year,month);
  const pending=state.tasks.filter(t=>!t.done&&!t.date);
  return `<section class="panel study-calendar"><div class="panel-title"><div><h2>Calendario de estudio</h2><p>Exámenes y entregas pendientes</p></div><div class="calendar-controls"><button data-calendar-step="-1" aria-label="Mes anterior">←</button><h3 aria-live="polite">${calendarMonth.toLocaleDateString('es-ES',{month:'long',year:'numeric'})}</h3><button data-calendar-step="1" aria-label="Mes siguiente">→</button><button id="calendar-today">Hoy</button></div></div><div class="calendar-scroll"><div class="calendar-week">${['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(day=>`<span>${day}</span>`).join('')}</div><div class="calendar-days">${cells.map(cell=>cell?`<div class="calendar-day ${cell.date===today()?'is-today':''}"><time datetime="${cell.date}">${cell.day}</time>${cell.events.map(item=>`<button class="calendar-event" style="--subject:${subject(item.subjectId)?.color||'#174c40'}" data-calendar-record="${item.kind}:${esc(item.id)}" title="${esc(item.title)}"><span>${esc(subject(item.subjectId)?.name)} · ${item.kind==='exams'?'Examen':'Entrega'}${item.kind==='exams'?' · '+(item.date.length>10?esc(item.date.slice(11)):'Hora pendiente'):''}</span>${esc(item.title)}</button>`).join('')}</div>`:'<div class="calendar-day outside" aria-hidden="true"></div>').join('')}</div></div>${pending.length?`<details class="calendar-undated"><summary>${pending.length} entregas sin fecha confirmada</summary>${pending.map(item=>`<button data-calendar-record="tasks:${esc(item.id)}">${badge(item.subjectId)} ${esc(item.title)}<small>${esc(item.dateText||'Fecha pendiente')}</small></button>`).join('')}</details>`:''}</section>`;
}
function render(){
const hours=state.sessions.reduce((n,s)=>n+s.minutes,0)/60;const pending=state.tasks.filter(t=>!t.done);const nextExams=state.exams.filter(e=>(e.endDate||e.date)>=today()).sort((a,b)=>taskOrder(a,b));
const names={overview:'Tu estudio',subjects:'Asignaturas',tasks:'Tareas',task:'Tarea',exams:'Exámenes',sessions:'Estudio',reviews:'Por confirmar',integrations:'Tus datos'};
document.querySelector('#app').innerHTML=`<aside><a class="brand" href="#">▤ <span>study<span class="brand-light">tracker</span></span></a><div class="workspace">ESPACIO PERSONAL</div><nav>${[['overview','◫','Resumen'],['subjects','▤','Asignaturas'],['tasks','✓','Tareas'],['exams','▦','Exámenes'],['sessions','◷','Horas de estudio'],['reviews','◇','Por confirmar ('+(state.aiProposals||[]).filter(p=>p.status==='pending').length+')'],['integrations','↗','Importar / exportar']].map(([key,icon,label])=>`<button data-view="${key}" class="${view===key?'active':''}"><span>${icon}</span>${label}</button>`).join('')}</nav><div class="sidebar-note"><span class="dot"></span> Guardado en este navegador</div></aside><main tabindex="-1"><header><span>MI PLAN DE ESTUDIO</span><time>${new Date().toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'})}</time></header>${view==='task'?'':`<section class="heading"><h1>${names[view]}</h1></section>`}${notice?`<p role="status" class="notice">${esc(notice)}</p>`:''}${view==='task'?taskDetail():view==='overview'?`<div class="stats"><div><span>Tiempo de estudio</span><strong>${hours.toLocaleString('es-ES',{maximumFractionDigits:1})}<small> h</small></strong></div><div><span>Tareas pendientes</span><strong>${pending.length}</strong><p>${state.tasks.filter(t=>t.done).length} completadas</p></div><div><span>Próximos exámenes</span><strong>${nextExams.length}</strong></div><div><span>Asignaturas</span><strong>${state.subjects.length}</strong></div></div>${calendarPanel()}<div class="dashboard-grid"><section class="panel"><div class="panel-title"><h2>Próximos exámenes</h2><button data-view="exams">Ver todos ↗</button></div>${rows('exams',nextExams.slice(0,4))}</section><section class="panel"><div class="panel-title"><h2>Por hacer</h2><button data-view="tasks">Ver todas ↗</button></div>${rows('tasks',pending.sort(taskOrder).slice(0,5))}</section><section class="panel wide"><div class="panel-title"><h2>Estudio por asignatura</h2><button data-view="sessions">Registrar sesión +</button></div>${state.subjects.length?state.subjects.map(s=>{const minutes=state.sessions.filter(x=>x.subjectId===s.id).reduce((n,x)=>n+x.minutes,0);return `<div class="progress-row">${badge(s.id)}<div class="track"><div style="width:${hours?minutes/(hours*60)*100:0}%;background:${s.color}"></div></div><strong>${(minutes/60).toLocaleString('es-ES',{maximumFractionDigits:1})} h</strong></div>`;}).join(''):'<div class="empty">Empieza creando tus asignaturas.<br><button data-view="subjects" class="primary">Añadir asignatura +</button></div>'}</section></div>`:view==='subjects'?`<form id="subject-form" class="subject-form panel"><label>Nombre de la asignatura<input name="name" required maxlength="80" placeholder="Ej. Matemáticas"></label><label>Color<input name="color" type="color" value="#397b68"></label><label>Dificultad (1–5)<select name="difficulty">${difficultyOptions(3)}</select></label><button class="primary">Añadir asignatura +</button></form><div class="subject-grid">${state.subjects.map(subjectCard).join('')||'<div class="empty">Añade tu primera asignatura para comenzar.</div>'}</div>`:['tasks','exams','sessions'].includes(view)?`<div class="list-actions"><div class="tabs">${view==='tasks'?['pending','done'].map(status=>`<button data-status="${status}" aria-pressed="${taskStatus===status}">${status==='pending'?'Pendientes':'Completadas'}</button>`).join(''):''}</div><button id="show-entry" class="primary">${showEntry?'Cerrar':{tasks:'+ Nueva tarea',exams:'+ Examen',sessions:'+ Sesión'}[view]}</button></div>${showEntry?form(view):''}<section class="panel"><div class="panel-title"><h2>${{tasks:'Tus tareas',exams:'Tus exámenes',sessions:'Sesiones registradas'}[view]}</h2><select id="filter" aria-label="Filtrar por asignatura"><option value="">Todas las asignaturas</option>${state.subjects.map(s=>`<option value="${s.id}" ${filter===s.id?'selected':''}>${esc(s.name)}</option>`).join('')}</select></div>${rows(view,state[view].filter(i=>(!filter||i.subjectId===filter)&&(view!=='tasks'||i.done===(taskStatus==='done'))).sort((a,b)=>view==='sessions'?b.date.localeCompare(a.date):taskOrder(a,b)))}</section>`:view==='reviews'?reviews():integrations()}</main>`;
bind();}
function integrations(){return `<div class="integration-grid"><section class="panel"><span class="integration-icon">▦</span><h2>Calendario</h2><p>Exporta exámenes con hora y duración, y tareas pendientes como eventos de día completo.</p><button class="primary" id="calendar">Descargar .ics</button><small>Importa el archivo en Google Calendar, Apple Calendar u Outlook. Es una exportación puntual, sin sincronización.</small></section><section class="panel"><span class="integration-icon">N</span><h2>Notion · CSV</h2><p>Intercambia tus tareas con una base de datos de Notion mediante archivos CSV.</p><button class="primary" id="csv-export">Exportar tareas</button><label class="file-button">Importar tareas CSV<input type="file" id="csv-import" accept=".csv,text/csv"></label><small>Columnas: Nombre, Asignatura, Fecha (AAAA-MM-DD), Prioridad (Alta/Media/Baja), Completada (true/false), Notas. Usa estos nombres al exportar desde Notion. La importación añade tareas y crea asignaturas que falten.</small></section><section class="panel"><span class="integration-icon">↓</span><h2>Copia de seguridad</h2><p>Conserva todas tus asignaturas, tareas, exámenes y sesiones en un archivo JSON.</p><button id="backup" class="primary">Exportar copia</button><label class="file-button">Restaurar copia JSON<input type="file" id="restore" accept=".json,application/json"></label><small>Restaurar reemplaza los datos actuales, previa confirmación. Los datos se guardan únicamente en este navegador.</small></section><section class="panel"><span class="integration-icon">↗</span><h2>Próxima fase: conexión directa</h2><p>La estructura separa las asignaturas, tareas, exámenes y sesiones mediante identificadores estables.</p><small>La sincronización automática con Notion y calendarios requiere un servidor, autenticación y resolución de conflictos. No está activada en esta versión.</small></section></div>`;}
function bind(){
  bindReviews();
  document.querySelectorAll('[data-calendar-step]').forEach(button=>button.onclick=()=>{calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+Number(button.dataset.calendarStep),1,12);render();});
  document.querySelector('#calendar-today')?.addEventListener('click',()=>{calendarMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1,12);render();});
  document.querySelectorAll('[data-calendar-record]').forEach(button=>button.onclick=()=>{const [kind,id]=button.dataset.calendarRecord.split(':');if(kind==='tasks'){openTask(id);return;}view=kind;filter=state[kind].find(item=>item.id===id).subjectId;render();});
  document.querySelectorAll('[data-task-date]').forEach(input=>input.onchange=()=>{const next=structuredClone(state),task=next.tasks.find(t=>t.id===input.dataset.taskDate);task.date=input.value;delete task.dateText;try{validateState(next);state=next;save();}catch(err){notice=err.message;render();}});
  document.querySelectorAll('[data-task]').forEach(button=>button.onclick=()=>openTask(button.dataset.task));
  document.querySelector('#task-back')?.addEventListener('click',()=>{view=returnView;render();});
  document.querySelector('#show-entry')?.addEventListener('click',()=>{showEntry=!showEntry;render();});
  document.querySelectorAll('[data-status]').forEach(button=>button.onclick=()=>{taskStatus=button.dataset.status;render();});
  const documentElement=document.querySelector('[data-document]');
  if(documentElement){
    fetch(documentElement.dataset.document).then(response=>{if(!response.ok)throw new Error();return response.text();})
      .then(text=>{documentElement.innerHTML=renderMarkdown(text);})
      .catch(()=>{documentElement.textContent='No se pudo cargar el enunciado. Prueba a abrir la tarea de nuevo o descarga el archivo.';});
  }
document.querySelectorAll('[data-section]').forEach(input=>input.onchange=()=>{const s=subject(input.dataset.section);const section=input.dataset.option==='groupWork'?'group':'individual';if(!input.checked&&state.tasks.some(t=>t.subjectId===s.id&&t.section===section)){notice='El apartado contiene tareas. Elimina o mueve sus tareas antes de ocultarlo.';render();return;}s[input.dataset.option]=input.checked;save();});document.querySelectorAll('[data-minutes]').forEach(button=>button.onclick=()=>{const entry=button.closest('form');entry.elements.minutes.value=button.dataset.minutes;entry.querySelectorAll('[data-minutes]').forEach(preset=>preset.setAttribute('aria-pressed',String(preset===button)));});document.querySelectorAll('.subject-entry input[name=minutes]').forEach(input=>input.oninput=()=>{input.form.querySelectorAll('[data-minutes]').forEach(preset=>preset.setAttribute('aria-pressed',String(preset.dataset.minutes===input.value)));});document.querySelectorAll('[data-difficulty]').forEach(input=>input.onchange=()=>{const value=Number(input.value);if(Number.isInteger(value)&&value>=1&&value<=5){subject(input.dataset.difficulty).difficulty=value;save();}});document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{view=b.dataset.view;editingProposal=null;filter='';notice='';showEntry=false;taskStatus='pending';render();});document.querySelector('[id=filter]')?.addEventListener('change',e=>{filter=e.target.value;render();});
document.querySelector('#subject-form')?.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);const name=f.get('name').trim();if(!name){notice='Escribe un nombre para la asignatura.';render();return;}state.subjects.push({id:uid(),name,color:f.get('color'),difficulty:Number(f.get('difficulty'))});save();});
document.querySelectorAll('#entry-form, .subject-entry').forEach(entry=>entry.addEventListener('submit',e=>{e.preventDefault();const kind=e.target.dataset.kind;try{const item=Object.fromEntries(new FormData(e.target));item.id=uid();if(kind==='tasks'){item.done=false;}else if(kind==='exams')item.duration=Number(item.duration);else item.minutes=Number(item.minutes);if(item.title)item.title=item.title.trim();const next=structuredClone(state);next[kind].push(item);if(kind==='tasks'&&item.section!=='practices'){const s=next.subjects.find(s=>s.id===item.subjectId);if(s)s[item.section==='group'?'groupWork':'individualWork']=true;}validateState(next);state=next;showEntry=false;notice=kind==='sessions'?'Sesión de estudio registrada.':kind==='tasks'?'Tarea añadida.':'Examen añadido.';save();}catch(err){notice=err.message;render();}}));
document.querySelectorAll('[data-toggle]').forEach(b=>b.onchange=()=>{const t=state.tasks.find(t=>t.id===b.dataset.toggle);t.done=b.checked;save();});document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{const [kind,id]=b.dataset.delete.split(':');if(!confirm(kind==='subjects'?'Eliminar esta asignatura y todas sus tareas, exámenes y sesiones?':'¿Eliminar este registro?'))return;state[kind]=state[kind].filter(i=>i.id!==id);if(kind==='tasks'&&view==='task'){view=returnView;selectedTask=null;}if(kind==='subjects')for(const k of ['tasks','exams','sessions'])state[k]=state[k].filter(i=>i.subjectId!==id);save();});
document.querySelector('#calendar')?.addEventListener('click',()=>download('studytracker.ics',calendar(state),'text/calendar;charset=utf-8'));document.querySelector('#backup')?.addEventListener('click',()=>download('studytracker.json',JSON.stringify(state,null,2),'application/json'));
document.querySelector('#csv-export')?.addEventListener('click',()=>download('tareas-notion.csv','\uFEFF'+toCSV([['Nombre','Asignatura','Fecha','Prioridad','Completada','Notas','Apartado','Fecha pendiente'],...state.tasks.map(t=>[t.title,subject(t.subjectId)?.name,t.date,t.priority,t.done,t.notes,t.section||'practices',t.dateText||''])]),'text/csv;charset=utf-8'));
for(const id of ['restore','csv-import'])document.querySelector('#'+id)?.addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>5*1024*1024)throw new Error('El archivo supera los 5 MB.');const text=await file.text();if(id==='restore'){const next=validateState(JSON.parse(text));if(!confirm('¿Reemplazar todos los datos actuales con esta copia?'))return;state=next;}else{const [headers,...records]=parseCSV(text);const required=['Nombre','Asignatura','Fecha','Prioridad','Completada','Notas'];if(!headers||required.some(h=>!headers.includes(h)))throw new Error('El CSV debe contener: '+required.join(', '));const next=structuredClone(state);for(const values of records){const r=Object.fromEntries(headers.map((h,i)=>[h,values[i]||'']));if(!r.Nombre.trim()||!r.Asignatura.trim())throw new Error('Cada tarea debe tener nombre y asignatura.');if(!['true','false'].includes(r.Completada.toLowerCase()))throw new Error('Completada debe ser true o false.');let s=next.subjects.find(s=>s.name.toLowerCase()===r.Asignatura.trim().toLowerCase());if(!s){s={id:uid(),name:r.Asignatura.trim(),color:'#397b68',difficulty:3};next.subjects.push(s);}next.tasks.push({id:uid(),title:r.Nombre.trim(),subjectId:s.id,date:r.Fecha,priority:r.Prioridad||'Media',done:r.Completada.toLowerCase()==='true',notes:r.Notas,section:r.Apartado||'practices',dateText:r['Fecha pendiente']||''});}state=validateState(next);}notice='Importación completada.';save();}catch(err){notice='No se importó el archivo: '+err.message;render();}});
}
render();

function reviewValue(key,value) {
  if (value===undefined || value===null || value==='') return 'Sin especificar';
  if (key==='subjectId') return subject(value)?.name||value;
  if (key==='done') return value?'Sí':'No';
  if (key==='section') return taskSections[value]||value;
  if (key==='links') return value.map(link=>link.label+' · '+link.url).join('\n')||'Sin enlaces';
  if (typeof value==='object') return JSON.stringify(value,null,2);
  return String(value);
}
function proposalCard(proposal) {
  const current=state[proposal.kind].find(item=>item.id===proposal.targetId);
  const candidate=proposalCandidate(state,proposal);
  const reference=proposal.action==='create'?candidate:proposal.base;
  const conflict=proposal.status==='pending'?proposalConflict(state,proposal):'';
  const fields=Object.keys(proposalFields).filter(key=>key in (current||{}) || key in (reference||{}) || key in proposal.changes);
  const changed=key=>proposal.action==='create' || proposal.action==='delete' || (Object.hasOwn(proposal.changes,key) && JSON.stringify(current?.[key])!==JSON.stringify(proposal.changes[key]));
  return `<article class="panel proposal-card">
    <div class="meta">${badge((candidate||reference)?.subjectId)}<span>${proposal.kind==='tasks'?'Tarea':'Examen'}</span><span class="review-tag">${{create:'Nueva actividad',update:'Cambio propuesto',delete:'Eliminación propuesta'}[proposal.action]}</span><span>${{pending:'Pendiente',accepted:'Aceptada',discarded:'Descartada'}[proposal.status]}</span></div>
    <h2>${esc(candidate?.title||reference?.title||'Actividad')}</h2>
    <p>${esc(proposal.summary||'Revisa los datos propuestos antes de decidir.')}</p>
    ${proposal.reason?`<p><strong>Motivo:</strong> ${esc(proposal.reason)}</p>`:''}
    ${proposal.uncertainties?.length?`<div class="review-warning"><strong>Información por confirmar</strong><ul>${proposal.uncertainties.map(text=>`<li>${esc(text)}</li>`).join('')}</ul></div>`:''}
    ${conflict?`<p class="review-warning" role="status">${esc(conflict)}</p>`:''}
    <div class="review-table-wrap"><table class="review-table"><caption>${proposal.action==='delete'?'Se eliminará el registro completo':proposal.action==='create'?'Datos de la nueva actividad':'Comparación de campos modificados'}</caption><thead><tr><th scope="col">Campo</th><th scope="col">Ahora</th><th scope="col">Propuesta</th></tr></thead><tbody>${fields.filter(changed).map(key=>`<tr><th scope="row">${esc(proposalFields[key])}</th><td>${esc(reviewValue(key,current?.[key]))}</td><td class="proposed-value">${proposal.action==='delete'?'Eliminar':esc(reviewValue(key,(candidate||{...proposal.base,...proposal.changes})[key]))}</td></tr>`).join('')||'<tr><td colspan="3">No hay diferencias con los datos actuales.</td></tr>'}</tbody></table></div>
    <details class="review-details"><summary>Revisión completa · todos los campos</summary><dl class="review-fields">${fields.map(key=>`<div><dt>${esc(proposalFields[key])}</dt><dd>${esc(reviewValue(key,proposal.action==='delete'?reference?.[key]:(candidate||{...proposal.base,...proposal.changes})[key]))}</dd></div>`).join('')}</dl>
    ${proposal.statement?`<section class="statement"><h3>Enunciado completo de la fuente</h3><div class="markdown">${renderMarkdown(proposal.statement)}</div></section>`:''}
    ${proposal.base?`<details><summary>Registro original cuando la IA hizo la revisión</summary><pre>${esc(JSON.stringify(proposal.base,null,2))}</pre></details>`:''}
    <details><summary>Datos íntegros de la propuesta</summary><pre>${esc(JSON.stringify(proposal,null,2))}</pre></details></details>
    <div class="review-sources"><strong>Fuentes</strong>${proposal.sources?.length?proposal.sources.map(link=>`<a href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">${esc(link.label)} ↗</a>`).join(''):'<span class="muted">No se han adjuntado fuentes.</span>'}</div>
    <div class="review-actions">${proposal.status==='pending'?`${proposal.action!=='delete'?`<button class="review-secondary" data-review-edit="${esc(proposal.id)}">Editar propuesta</button>`:''}<button class="primary" data-review-decision="accepted" data-proposal-id="${esc(proposal.id)}" ${conflict||editingProposal===proposal.id?'disabled':''}>${proposal.action==='delete'?'Aceptar eliminación':'Aceptar cambio'}</button><button class="review-secondary" data-review-decision="discarded" data-proposal-id="${esc(proposal.id)}">Descartar</button>`:proposal.status==='discarded'?`<button class="review-secondary" data-review-decision="pending" data-proposal-id="${esc(proposal.id)}">Volver a revisar</button>`:`<span class="muted">Aplicada a tus ${proposal.kind==='tasks'?'tareas':'exámenes'}.</span>`}${proposal.decidedAt?`<small>Última decisión: ${esc(new Date(proposal.decidedAt).toLocaleString('es-ES'))}</small>`:''}</div>
    ${proposal.editedAt?`<p class="muted">Editada por ti: ${esc(new Date(proposal.editedAt).toLocaleString('es-ES'))}. Tus correcciones se conservan en revisiones posteriores.</p>`:''}
    ${editingProposal===proposal.id?proposalEditor(proposal):''}
  </article>`;
}
function proposalEditor(proposal) {
  const item={...(proposal.base||{}),...proposalCandidate(state,proposal),...proposal.changes};
  const input=(name,label,value='',type='text',extra='')=>`<label>${label}<input name="${name}" type="${type}" value="${esc(value??'')}" ${extra}></label>`;
  return `<form class="proposal-editor" data-proposal-editor="${esc(proposal.id)}">
    <h3>Editar propuesta</h3><p>Los cambios se guardan en esta propuesta. Se incorporarán a tu plan cuando la aceptes.</p>
    <div class="proposal-editor-grid">
    ${input('title','Título',item.title,'text','required')}
    <label>Asignatura<select name="subjectId" required>${state.subjects.some(s=>s.id===item.subjectId)?'':`<option value="${esc(item.subjectId)}">${esc(item.subjectId)} · pendiente de vincular</option>`}${state.subjects.map(s=>`<option value="${esc(s.id)}" ${s.id===item.subjectId?'selected':''}>${esc(s.name)}</option>`).join('')}</select></label>
    ${input('dateDay','Fecha',item.date?.slice(0,10),'date',proposal.kind==='exams'?'required':'')}
    ${input('dateTime','Hora (opcional)',item.date?.slice(11,16),'time')}
    ${input('dateText','Fecha aproximada o por confirmar',item.dateText)}
    ${proposal.kind==='exams'?input('duration','Duración en minutos (si hay hora)',item.duration,'number','min="1" max="1440"')+input('endDate','Último día (solo intervalos sin hora)',item.endDate,'date'):`<label>Prioridad<select name="priority">${['Baja','Media','Alta'].map(v=>`<option ${v===(item.priority||'Media')?'selected':''}>${v}</option>`).join('')}</select></label><label>Apartado<select name="section">${sectionOptions(item.section)}</select></label><label class="proposal-done"><input name="done" type="checkbox" ${item.done?'checked':''}>Completada</label>`}
    ${input('mode','Individual / equipo',item.mode)}${input('project','Proyecto',item.project)}
    </div>
    <label>Notas y requisitos<textarea name="notes" rows="7">${esc(item.notes)}</textarea></label>
    <label>Enlaces (uno por línea: nombre | URL)<textarea name="links" rows="3">${esc((item.links||[]).map(link=>link.label+' | '+link.url).join('\n'))}</textarea></label>
    <p class="muted">Si la fecha no está confirmada, conserva la expresión original en el campo de fecha aproximada. Las fuentes y su enunciado original permanecen disponibles.</p>
    <div class="review-actions"><button class="primary" type="submit">Guardar propuesta</button><button class="review-secondary" type="button" data-review-cancel>Cancelar</button></div>
    <p role="alert" class="proposal-edit-error"></p>
  </form>`;
}
function saveProposalEdits(id,values) {
  const proposal=state.aiProposals.find(p=>p.id===id);
  if (!proposal) throw new Error('La propuesta ya no está disponible.');
  const item={...(proposal.base||{}),...proposalCandidate(state,proposal),...proposal.changes};
  if (values.dateTime && !values.dateDay) throw new Error('Indica una fecha para guardar la hora.');
  const desired={title:values.title.trim(),subjectId:values.subjectId,date:values.dateDay+(values.dateTime?'T'+values.dateTime:''),dateText:values.dateText,mode:values.mode,project:values.project,notes:values.notes,
    links:values.links.split('\n').map(line=>line.trim()).filter(Boolean).map(line=>{const split=line.lastIndexOf(' | ');return split<0?{label:'Enlace',url:line}:{label:line.slice(0,split),url:line.slice(split+3)};})};
  if (proposal.kind==='tasks') Object.assign(desired,{priority:values.priority,section:values.section,done:values.done==='on'});
  else Object.assign(desired,{duration:values.dateTime?Number(values.duration):null,endDate:values.endDate});
  const changes=Object.fromEntries(Object.entries(desired).filter(([key,value])=>JSON.stringify(item[key]??(key==='links'?[]:key==='duration'?null:''))!==JSON.stringify(value)));
  if (Object.keys(changes).length) state=editProposal(state,id,changes);
  editingProposal=null;notice='Propuesta editada. Revisa los datos antes de aceptarla.';save();
}
function reviews() {
  const proposals=state.aiProposals||[];
  const visible=proposals.filter(proposal=>proposal.status===reviewStatus && (!reviewSubject||(proposalCandidate(state,proposal)||proposal.base)?.subjectId===reviewSubject) && JSON.stringify(proposal).toLocaleLowerCase('es').includes(reviewSearch.toLocaleLowerCase('es')));
  return `<section class="panel review-intro"><div><h2>Tú decides qué cambia</h2><p>Las revisiones de Moovi se cargan automáticamente. Revisa las propuestas antes de incorporarlas a tu plan. Aceptar aplica el cambio; descartar conserva tus datos. Al resolver todas las propuestas de una revisión, se borran sus archivos JSON y se conserva el registro en la web.</p></div><div class="review-actions"><label class="file-button">Importar revisión JSON<input type="file" id="review-import" accept=".json,application/json"></label><button class="review-secondary" id="review-local">Actualizar revisiones</button><button class="review-secondary" id="review-template">Descargar plantilla</button></div></section>
    <div class="review-controls"><div class="tabs" role="group" aria-label="Estado de las propuestas">${['pending','accepted','discarded'].map(status=>`<button data-review-status="${status}" aria-pressed="${reviewStatus===status}">${{pending:'Pendientes',accepted:'Aceptadas',discarded:'Descartadas'}[status]} · ${proposals.filter(p=>p.status===status).length}</button>`).join('')}</div><label>Asignatura<select id="review-subject"><option value="">Todas</option>${state.subjects.map(s=>`<option value="${esc(s.id)}" ${reviewSubject===s.id?'selected':''}>${esc(s.name)}</option>`).join('')}</select></label><label>Buscar<input id="review-search" type="search" value="${esc(reviewSearch)}" placeholder="Título, motivo o fuente"></label></div>
    <div class="proposal-list">${visible.map(proposalCard).join('')||`<section class="panel empty"><h2>${reviewStatus==='pending'?'No hay propuestas pendientes':'No hay propuestas en esta vista'}</h2><p>${proposals.length?'Cambia los filtros para ver otras propuestas.':'Las revisiones nuevas de Moovi aparecerán aquí automáticamente. También puedes importar un JSON.'}</p></section>`}</div>
    <section class="panel review-history"><h2>Revisiones importadas</h2><p class="muted">Una revisión incompleta o sin propuestas no confirma que no haya novedades.</p>${Object.entries(state.moodleReportFiles||{}).filter(([,file])=>file.deleted).map(([path,file])=>`<p class="muted">JSON de ${esc(path.split('/')[2])} eliminados. Registro conservado en este navegador.</p>`).join('')}${(state.aiReviews||[]).slice().reverse().map(report=>`<details><summary>${esc(report.date||'Sin fecha')} · ${report.complete?'Completa':'Incompleta'} · ${report.added} propuestas nuevas${report.updated?` · ${report.updated} actualizadas`:""}</summary><p><strong>Cursos revisados:</strong> ${esc(report.courses.join(', ')||'Ninguno registrado')}</p>${report.issues.length?`<h3>Recursos sin consultar</h3><ul>${report.issues.map(issue=>`<li>${esc(issue)}</li>`).join('')}</ul>`:''}${report.uncertainties.length?`<h3>Dudas</h3><ul>${report.uncertainties.map(text=>`<li>${esc(text)}</li>`).join('')}</ul>`:''}</details>`).join('')||'<p class="muted">Todavía no has importado revisiones.</p>'}</section>`;
}
function receiveReview(report) {
  const result=importProposals(state,report);state=result.state;
  notice=`Revisión importada: ${result.added} propuestas nuevas, ${result.updated} actualizadas. ${report.complete===true?'':'La revisión está incompleta; consulta los detalles.'}`;save();
}
let syncingMoodle=false;
let cleaningMoodle=false;
async function cleanMoodleReports() {
  if (cleaningMoodle || editingProposal || typeof fetch!=='function') return;
  cleaningMoodle=true;
  let deleted=0;
  try {
    for (const [path,file] of Object.entries(state.moodleReportFiles||{})) {
      if (file.deleted) continue;
      const ids=resolvedReviewIds(state,file);
      if (!ids) continue;
      // The full decisions and accepted activities must be durable before
      // deleting any source JSON. On a storage error no request is sent.
      if (!persist()) {render();return;}
      try {
        const removed=await deleteMoodleReview(path,file,ids);
        if (state.moodleReportFiles?.[path]?.sha256===file.sha256) {
          state.moodleReportFiles[path].deleted=true;
          state.moodleReportFiles[path].deletedAt=new Date().toISOString();
        }
        deleted+=removed.length;
        persist();
      } catch(error) {
        notice='El registro se conserva en la web. Limpieza pendiente: '+error.message;
        if (!editingProposal)render();
      }
    }
    if (deleted) {notice=`${deleted} archivos JSON de revisiones resueltas borrados. El registro se conserva en la web.`;if(!editingProposal)render();}
  } finally {cleaningMoodle=false;}
}
async function syncMoodleReviews(manual=false) {
  if (syncingMoodle || editingProposal) return;
  syncingMoodle=true;
  let added=0,updated=0,loaded=0;
  const errors=[];
  try {
    const files=await discoverMoodleReviews();
    for (const file of files) {
      if (state.moodleImports?.[file.path]===file.sha256 && state.moodleReportFiles?.[file.path]?.sha256===file.sha256) {
        // A regenerated identical file can be cleaned using saved decisions.
        state.moodleReportFiles[file.path].deleted=false;
        continue;
      }
      try {
        const report=await readMoodleReview(file.path);
        if (editingProposal) return;
        // Read the current state after each request: user decisions made while
        // the file was loading must survive the import.
        const result=importProposals(state,report);
        state=result.state;
        state.moodleImports={...state.moodleImports,[file.path]:file.sha256};
        state.moodleReportFiles={...state.moodleReportFiles,[file.path]:{sha256:file.sha256,references:result.references,deleted:false}};
        added+=result.added;updated+=result.updated;loaded++;
      } catch(error) {errors.push(file.path+': '+error.message);}
    }
    if (loaded || manual || errors.length) {
      notice=`Moovi: ${added} propuestas nuevas, ${updated} actualizadas en Por confirmar.`+(errors.length?' No se cargaron algunas revisiones: '+errors.join(' '):'');
      persist();
      // Do not erase an in-progress form when a background review arrives.
      if (manual || (!showEntry && !document.activeElement?.closest('form') && view!=='task')) render();
    }
    await cleanMoodleReports();
  } catch(error) {notice=error.message;if(manual || view==='reviews')render();}
  finally {syncingMoodle=false;}
}
function bindReviews() {
  document.querySelectorAll('[data-review-edit]').forEach(button=>button.onclick=()=>{editingProposal=button.dataset.reviewEdit;render();document.querySelector('[data-proposal-editor] input')?.focus();});
  document.querySelector('[data-review-cancel]')?.addEventListener('click',()=>{editingProposal=null;render();});
  document.querySelector('[data-proposal-editor]')?.addEventListener('submit',event=>{
    event.preventDefault();
    try {saveProposalEdits(event.target.dataset.proposalEditor,Object.fromEntries(new FormData(event.target)));}
    catch(error) {event.target.querySelector('.proposal-edit-error').textContent=error.message;}
  });
  document.querySelectorAll('[data-review-status]').forEach(button=>button.onclick=()=>{reviewStatus=button.dataset.reviewStatus;editingProposal=null;render();});
  document.querySelector('#review-subject')?.addEventListener('change',event=>{reviewSubject=event.target.value;editingProposal=null;render();});
  document.querySelector('#review-search')?.addEventListener('input',event=>{const position=event.target.selectionStart;reviewSearch=event.target.value;editingProposal=null;render();const input=document.querySelector('#review-search');input?.focus();if(position!==null)input?.setSelectionRange(position,position);});
  document.querySelectorAll('[data-review-decision]').forEach(button=>button.onclick=()=>{
    try {state=decideProposal(state,button.dataset.proposalId,button.dataset.reviewDecision);notice={accepted:'Propuesta aceptada y aplicada.',discarded:'Propuesta descartada. Tus registros se han conservado.',pending:'Propuesta devuelta a pendientes.'}[button.dataset.reviewDecision];if(save())void cleanMoodleReports();}
    catch(error){notice=error.message;render();}
  });
  document.querySelector('#review-import')?.addEventListener('change',async event=>{
    const file=event.target.files[0];if(!file)return;
    try {if(file.size>5*1024*1024)throw new Error('El archivo supera los 5 MB.');receiveReview(JSON.parse(await file.text()));}
    catch(error){notice='No se importó la revisión: '+error.message;render();}
  });
  document.querySelector('#review-local')?.addEventListener('click',async()=>{
    await syncMoodleReviews(true);
  });
  document.querySelector('#review-template')?.addEventListener('click',()=>download('revision-ia.json',JSON.stringify({schema_version:1,review_date:today(),complete:false,reviewed_courses:[],access_issues:[],uncertainties:[],proposals:[]},null,2),'application/json'));
}
if (typeof window!=='undefined' && typeof fetch==='function') {
  void syncMoodleReviews();
  window.addEventListener('focus',()=>void syncMoodleReviews());
  window.setInterval(()=>{if(!document.hidden)void syncMoodleReviews();},30000);
}
