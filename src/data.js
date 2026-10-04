export const emptyState = () => ({version:1,subjects:[],tasks:[],exams:[],sessions:[]});
export const calendarSubjects = [
  {id:'subject-abp',name:'ABP',color:'#397b68',difficulty:1},
  {id:'subject-ssi',name:'SSI',color:'#4684b5',difficulty:2},
  {id:'subject-acii',name:'ACII',color:'#8b65ad',difficulty:3},
  {id:'subject-est',name:'EST',color:'#bb8436',difficulty:4},
  {id:'subject-lc',name:'LC',color:'#b55858',difficulty:5}
];
export function initializeSubjects(state) {
  if (state.calendarSubjectsAdded) return state;
  for (const preset of calendarSubjects) {
    const existing = state.subjects.find(s=>s.name.trim().toUpperCase()===preset.name);
    if (existing) existing.difficulty=preset.difficulty;
    else {
      let id=preset.id;
      while (state.subjects.some(s=>s.id===id)) id+='-new';
      state.subjects.push({...preset,id});
    }
  }
  state.calendarSubjectsAdded=true;
  return state;
}
export const taskSections = {practices:'Prácticas',group:'Trabajo en grupo',individual:'Trabajos individuales'};
export function initializeESTExams(state) {
  if (state.estExams2026Added) return state;
  const subject = state.subjects.find(s=>s.name.trim().toUpperCase()==='EST');
  if (!subject) return state;
  state.exams.push({
    id:uid(), subjectId:subject.id, title:'Cálculo de Probabilidades · Grupo de mañana',
    date:'2026-10-16', duration:null,
    notes:'Viernes 16/10/2026, en horario de clase del grupo de mañana (Grupo Mañá). Sustituye la fecha anterior del 09/10/2026. Hora y duración pendientes de confirmar.'
  }, {
    id:uid(), subjectId:subject.id, title:'Variables aleatorias e estatística descritiva · Grupo de mañana',
    date:'2026-11-23', endDate:'2026-11-27', duration:null,
    notes:'Semana del 23 al 27 de noviembre de 2026, en horario de grupos reducidos. Día concreto, hora y duración pendientes de confirmar.'
  });
  state.estExams2026Added=true;
  return state;
}
export function initializeACIIExams(state) {
  if (state.aciiExams2026Added) return state;
  const subject = state.subjects.find(s=>s.name.trim().toUpperCase()==='ACII');
  if (!subject) return state;
  const exams = [
    ['Prueba 1 de prácticas · Grupo del lunes', '2026-10-26', 'En la sesión de laboratorio del lunes. Temario: P1 a P3 (el entorno, el módulo LED&KEY, la máquina de estados, el antirrebote y la base de tiempo). Ese día se empieza la P4, pero las interrupciones no entran en la prueba.'],
    ['Prueba 2 de prácticas · Grupo del lunes', '2026-12-07', 'En la sesión de laboratorio del lunes. Temario: P4 a P7.'],
    ['Prueba del grupo grande · Octubre', '2026-10-28', 'Prueba del grupo grande. Temario pendiente de confirmar.'],
    ['Prueba del grupo grande · Enero', '2027-01-18', 'Prueba del grupo grande, junto con las pruebas globales. Temario pendiente de confirmar.']
  ];
  for (const [title, date, notes] of exams) {
    state.exams.push({id:uid(), subjectId:subject.id, title, date, duration:null,
      notes:notes+' Hora y duración pendientes de confirmar. Calendario de prácticas actualizado y ficheros de importación disponibles en Moovi. Las fechas de entrega de las prácticas no cambian.'});
  }
  state.aciiExams2026Added = true;
  return state;
}
export function initializeLCExam(state) {
  if (state.lcExam2026Added) return state;
  const subject = state.subjects.find(s=>s.name.trim().toUpperCase()==='LC');
  if (!subject) return state;
  state.exams.push({
    id:uid(), subjectId:subject.id, title:'Examen · Grupo B',
    date:'2026-11-17T12:30', duration:105,
    notes:'Lugar: Aula Magna. Horario del grupo B: 12:30–14:15. Contenidos: se comunicarán con antelación suficiente.'
  });
  state.lcExam2026Added = true;
  return state;
}
export function initializeSSI(state) {
  if (state.ssiWorkAdded) return state;
  const subject=state.subjects.find(s=>s.name.trim().toUpperCase()==='SSI');
  if (!subject) return state;
  subject.groupWork=true;
  const phases=[
    ['FASE 1 · Creación de grupos/equipos','Hasta miércoles 30/9/2028 (fecha original; confirmar el año y el día de la semana). El documento de creación de grupos aparece tachado en el procedimiento original.','30/9/2028 · por confirmar',[{label:'Documento de creación de grupos (tachado en el original)',url:'https://docs.google.com/document/d/183oqoPGvzaxrdh36z4sBFXWJiHwEhhDP/edit?usp=sharing&ouid=105644562796697267046&rtpof=true&sd=true'}]],
    ['FASE 2 · Asignación aleatoria de tema','Consultar la descripción de los temas y las normas de entrega. Enlace de asignación original: http://xn--adolfo%20jos%20gonzlez%20morais-itc0x/ (parece inválido; pendiente de confirmar).','Fecha pendiente',[{label:'Temas y normas de entrega',url:'https://moovi.uvigo.gal/pluginfile.php/649702/mod_label/intro/trabajos_SSI2627_temas_y_enunciado.pdf?time=1790983756375'}]],
    ['Entrega del trabajo','Entregar en la tarea de tipo «taller» habilitada en Moovi.','xx/11/2026',[]],
    ['Presentación del trabajo','Presentación en los grupos de laboratorio. El año final figura como 206 en el original; pendiente de confirmar.','Semana del xx/11/2026 al xx/11/206',[]],
    ['Revisión del trabajo','Realizar la revisión en la tarea de tipo «taller» habilitada en Moovi.','Del xx/11/2026 al xx/12/2026',[]]
  ];
  phases.forEach(([title,notes,dateText,links])=>state.tasks.push({id:uid(),subjectId:subject.id,title,notes,dateText,links,date:'',section:'group',priority:'Media',done:false,project:'Trabajos SSI 2026/27'}));
  state.ssiWorkAdded=true;
  return state;
}
export function initializeSSIPractice(state) {
  if (state.ssiPractice1Added) return state;
  const subject=state.subjects.find(s=>s.name.trim().toUpperCase()==='SSI');
  if (!subject) return state;
  state.tasks.push({id:uid(),subjectId:subject.id,title:'Práctica 1. Uso del API de cifrado de Java',section:'practices',mode:'Individual',date:'',dateText:'Por determinar · aproximadamente finales de octubre',priority:'Media',done:false,notes:'Desarrollar herramientas en Java con JCA y Bouncy Castle para empaquetar, sellar y validar facturas electrónicas. Entregar memoria, código fuente y casos de prueba en un único archivo en Moovi. El enunciado permite trabajar individualmente o en parejas.',documentPath:'docs/ssi/practica-1-cifrado-java.md',links:[{label:'Entrega de la práctica en Moovi',url:'https://moovi.uvigo.gal/mod/assign/view.php?id=448586'}]});
  state.ssiPractice1Added=true;
  return state;
}
export function monthCalendar(state,year,month) {
  const first=new Date(year,month,1,12);
  const offset=(first.getDay()+6)%7;
  const count=new Date(year,month+1,0,12).getDate();
  const events=[...state.exams.map(item=>({...item,kind:'exams'})),...state.tasks.filter(item=>!item.done&&item.date).map(item=>({...item,kind:'tasks'}))].sort((a,b)=>a.date.localeCompare(b.date));
  const size=Math.ceil((offset+count)/7)*7;
  return Array.from({length:size},(_,index)=>{
    const day=index-offset+1;
    if(day<1||day>count) return null;
    const date=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return {day,date,events:events.filter(item=>item.endDate?item.date<=date&&date<=item.endDate:item.date.slice(0,10)===date)};
  });
}
export function uid() {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
function validDate(value) {
  if (typeof value!=='string' || !/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(value)) return false;
  const day=value.slice(0,10),date=new Date(day+'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10)===day &&
    (value.length===10 || (Number(value.slice(11,13))<24 && Number(value.slice(14,16))<60));
}
export function validateState(data) {
  if (!data || data.version !== 1) throw new Error('Formato de copia no compatible.');
  for (const key of ['subjects','tasks','exams','sessions']) if (!Array.isArray(data[key])) throw new Error('Falta la colección '+key);
  const ids = new Set();
  for (const subject of data.subjects) {
    if (typeof subject.id !== 'string' || !subject.id || ids.has(subject.id) || typeof subject.name !== 'string' || !subject.name.trim()) throw new Error('Asignatura inválida.');
    if (subject.difficulty !== undefined && (!Number.isInteger(subject.difficulty) || subject.difficulty < 1 || subject.difficulty > 5)) throw new Error('La dificultad debe ser un número entero del 1 al 5.');
    for (const key of ['groupWork','individualWork']) if (subject[key] !== undefined && typeof subject[key] !== 'boolean') throw new Error('Apartado opcional inválido.');
    ids.add(subject.id);
    if (!/^#[0-9a-f]{6}$/i.test(subject.color)) throw new Error('Color inválido.');
  }
  for (const key of ['tasks','exams','sessions']) {
    const recordIds = new Set();
    for (const item of data[key]) {
      if (!item || typeof item.id !== 'string' || recordIds.has(item.id) || !ids.has(item.subjectId)) throw new Error('Registro o asignatura inválidos.');
      recordIds.add(item.id);
      if (key !== 'sessions' && (typeof item.title !== 'string' || !item.title.trim())) throw new Error('Título inválido.');
      if (key === 'tasks' && (typeof item.done !== 'boolean' || !['Alta','Media','Baja'].includes(item.priority))) throw new Error('Tarea inválida.');
      if (key === 'tasks' && item.section !== undefined && !Object.hasOwn(taskSections,item.section)) throw new Error('Apartado de tarea inválido.');
      if (key === 'tasks' && item.dateText !== undefined && typeof item.dateText !== 'string') throw new Error('Texto de fecha inválido.');
      if (item.links !== undefined && (!Array.isArray(item.links) || item.links.some(link=>typeof link.label !== 'string' || typeof link.url !== 'string' || !/^https?:\/\//.test(link.url)))) throw new Error('Enlace inválido.');
      if (!(key === 'tasks' && item.date === '') && !validDate(item.date)) throw new Error('Fecha inválida.');
      if (key === 'sessions' && (!Number.isFinite(item.minutes) || item.minutes <= 0 || item.minutes > 1440)) throw new Error('Duración inválida.');
      if (key === 'exams' && !(item.date.length === 10 && item.duration === null) && (!Number.isFinite(item.duration) || item.duration <= 0 || item.duration > 1440)) throw new Error('Duración inválida.');
      if (item.endDate !== undefined && (key !== 'exams' || (item.endDate!=='' && (item.date.length!==10 || !validDate(item.endDate) || item.endDate.length!==10 || item.endDate<item.date)))) throw new Error('Intervalo de examen inválido.');
      if (item.documentPath !== undefined && item.documentPath !== 'docs/ssi/practica-1-cifrado-java.md') throw new Error('Documento inválido.');
      if (item.mode !== undefined && typeof item.mode !== 'string') throw new Error('Modalidad inválida.');
      if (item.notes !== undefined && typeof item.notes !== 'string') throw new Error('Notas inválidas.');
    }
  }
  if (data.aiProposals !== undefined) {
    if (!Array.isArray(data.aiProposals)) throw new Error('Bandeja de propuestas inválida.');
    const proposalIds = new Set();
    for (const proposal of data.aiProposals) {
      validateProposal(data,proposal);
      if (proposalIds.has(proposal.id)) throw new Error('Propuesta duplicada.');
      proposalIds.add(proposal.id);
    }
  }
  if (data.aiReviews !== undefined && (!Array.isArray(data.aiReviews) || data.aiReviews.some(review=>!review || typeof review.id!=='string' || typeof review.date!=='string' || typeof review.complete!=='boolean' || !Number.isInteger(review.added) || ['courses','issues','uncertainties'].some(key=>!Array.isArray(review[key]) || review[key].some(value=>typeof value!=='string'))))) throw new Error('Historial de revisión inválido.');
  return data;
}
const icsEscape = value => String(value).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
const utc = date => date.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
export function calendar(state) {
  const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//StudyTracker//ES','CALSCALE:GREGORIAN'];
  for (const [kind,items] of [['exam',state.exams],['task',state.tasks.filter(t=>!t.done && t.date)]]) for (const item of items) {
    const subject = state.subjects.find(s=>s.id===item.subjectId)?.name || '';
    lines.push('BEGIN:VEVENT',`UID:${kind}-${item.id}@studytracker.local`,`DTSTAMP:${utc(new Date())}`);
    if (kind === 'exam' && item.date.length > 10) {
      const start = new Date(item.date);
      lines.push(`DTSTART:${utc(start)}`,`DTEND:${utc(new Date(start.getTime()+item.duration*60000))}`);
    } else {
      const start = new Date((item.endDate||item.date)+'T12:00:00'); start.setDate(start.getDate()+1);
      const localDay = d => `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
      lines.push(`DTSTART;VALUE=DATE:${item.date.replace(/-/g,'')}`,`DTEND;VALUE=DATE:${localDay(start)}`);
    }
    lines.push(`SUMMARY:${icsEscape((kind==='exam'?'Examen: ':'Tarea: ')+item.title+' · '+subject)}`,`DESCRIPTION:${icsEscape(item.notes||'')}`,'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  // Fold on UTF-8 octet boundaries per RFC 5545.
  return lines.map(line=>{let result='',size=0;for(const c of line){const bytes=new TextEncoder().encode(c).length;if(size+bytes>75){result+='\r\n ';size=1;}result+=c;size+=bytes;}return result;}).join('\r\n')+'\r\n';
}
export function toCSV(rows) { return rows.map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n'); }
export function parseCSV(text) {
  const rows=[];let row=[],field='',quoted=false;
  text=text.replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(field);field='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(Boolean))rows.push(row);row=[];field='';}else field+=c;}
  if(quoted)throw new Error('CSV con comillas sin cerrar.');
  row.push(field);if(row.some(Boolean))rows.push(row);return rows;
}

// AI proposals are kept separate from confirmed academic records.
export const proposalFields = {
  title:'Título', subjectId:'Asignatura', date:'Fecha y hora', endDate:'Hasta',
  dateText:'Fecha aproximada', priority:'Prioridad', done:'Completada',
  section:'Apartado', notes:'Enunciado / notas', duration:'Duración (min)',
  mode:'Modalidad', project:'Proyecto', links:'Enlaces', documentPath:'Documento'
};
const sameValue = (a,b) => JSON.stringify(a) === JSON.stringify(b);
export function proposalCandidate(state, proposal) {
  const current = state[proposal.kind].find(item=>item.id===proposal.targetId);
  if (proposal.action==='create') return {...(proposal.kind==='tasks'?{date:'',priority:'Media',done:false,section:'practices'}:{duration:null}),...proposal.changes,id:proposal.targetId||'proposal-preview'};
  return current ? {...current,...proposal.changes} : null;
}
export function validateProposal(state, proposal) {
  if (!proposal || typeof proposal.id!=='string' || !proposal.id || !['tasks','exams'].includes(proposal.kind) || !['create','update','delete'].includes(proposal.action)) throw new Error('Propuesta inválida: indica id, kind y action.');
  if (!['pending','accepted','discarded'].includes(proposal.status)) throw new Error('Estado de propuesta inválido.');
  for (const key of ['summary','reason','statement']) if (proposal[key]!==undefined && typeof proposal[key]!=='string') throw new Error('Texto de propuesta inválido.');
  if (proposal.sources!==undefined && (!Array.isArray(proposal.sources) || proposal.sources.some(link=>!link || typeof link.label!=='string' || typeof link.url!=='string' || !/^https?:\/\//.test(link.url)))) throw new Error('Fuente inválida: usa enlaces http o https.');
  if (proposal.uncertainties!==undefined && (!Array.isArray(proposal.uncertainties) || proposal.uncertainties.some(value=>typeof value!=='string'))) throw new Error('Las dudas deben ser una lista de textos.');
  if (proposal.action!=='create' && (typeof proposal.targetId!=='string' || !proposal.targetId || !proposal.base || proposal.base.id!==proposal.targetId)) throw new Error('Los cambios y eliminaciones necesitan targetId y una copia base del registro.');
  if (!proposal.changes || typeof proposal.changes!=='object' || Array.isArray(proposal.changes) || Object.keys(proposal.changes).some(key=>!Object.hasOwn(proposalFields,key))) throw new Error('Campos propuestos no compatibles.');
  if (proposal.action==='update' && !Object.keys(proposal.changes).length) throw new Error('La propuesta no contiene cambios.');
  if (proposal.action==='delete' && Object.keys(proposal.changes).length) throw new Error('Una eliminación no puede incluir cambios.');
  // Validate against the original snapshot; a missing current record is a conflict, not a broken backup.
  const preview = proposal.action==='create' ? proposalCandidate(state,proposal) : {...proposal.base,...proposal.changes};
  const shadow = {version:1,subjects:state.subjects,tasks:[],exams:[],sessions:[]};
  // Deleted subjects must not make the review history impossible to restore.
  if (!state.subjects.some(s=>s.id===preview.subjectId)) shadow.subjects=[...state.subjects,{id:preview.subjectId,name:'Asignatura de la propuesta',color:'#397b68'}];
  shadow[proposal.kind]=[preview];
  validateState(shadow);
  return proposal;
}
export function proposalConflict(state, proposal) {
  if (!proposal || proposal.status!=='pending') return 'Esta propuesta ya está revisada.';
  const current = state[proposal.kind].find(item=>item.id===proposal.targetId);
  if (proposal.action==='create') {
    const candidate=proposalCandidate(state,proposal);
    if (!state.subjects.some(s=>s.id===candidate.subjectId)) return 'La asignatura ya no existe.';
    if (current || state[proposal.kind].some(item=>item.subjectId===candidate.subjectId && (item.title.trim().toLowerCase()===candidate.title.trim().toLowerCase() || (candidate.links||[]).some(link=>(item.links||[]).some(existing=>existing.url===link.url))))) return 'Ya existe una actividad con este título o enlace. Prepara una propuesta de actualización.';
  } else {
    if (!current) return 'El registro original ya no existe.';
    const fields=proposal.action==='delete' ? new Set([...Object.keys(current),...Object.keys(proposal.base)]) : Object.keys(proposal.changes);
    if ([...fields].some(key=>!sameValue(current[key],proposal.base[key]))) return 'Has modificado este registro desde la revisión. Prepara una propuesta nueva con los datos actuales.';
    if (!state.subjects.some(s=>s.id===(proposal.changes.subjectId||current.subjectId))) return 'La asignatura ya no existe.';
  }
  return '';
}
function proposalIdentity(proposal) {
  if (proposal.sourceIdentity) return proposal.sourceIdentity;
  const scope=[proposal.kind,proposal.action,proposal.changes.subjectId||proposal.base?.subjectId];
  if (proposal.action!=='create') return JSON.stringify([...scope,proposal.targetId]);
  const identity=proposal.academic_metadata?.identity;
  if (typeof identity==='string' && identity) return JSON.stringify([...scope,identity]);
  const activity=(proposal.changes.links||[]).map(link=>{
    try {
      const url=new URL(link.url);
      return /\/mod\/(assign|choice|scheduler|quiz)\/view\.php$/.test(url.pathname) && url.searchParams.has('id')
        ? url.origin+url.pathname+'?id='+url.searchParams.get('id') : null;
    } catch {return null;}
  }).find(Boolean);
  const title=proposal.changes.title?.normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('es');
  return JSON.stringify([...scope,activity||title]);
}
function proposalContent(proposal) {
  return JSON.stringify([proposal.kind,proposal.action,proposal.targetId,proposal.base,proposal.changes,proposal.summary,proposal.reason,proposal.statement,proposal.sources,proposal.uncertainties]);
}
export function editProposal(state, id, changes) {
  const next=structuredClone(state),proposal=next.aiProposals?.find(item=>item.id===id);
  if (!proposal || proposal.status!=='pending' || proposal.action==='delete') throw new Error('Solo se pueden editar propuestas pendientes de alta o cambio.');
  if (!changes || typeof changes!=='object' || Array.isArray(changes) || Object.keys(changes).some(key=>!Object.hasOwn(proposalFields,key))) throw new Error('Campos de edición no compatibles.');
  proposal.sourceIdentity ||= proposalIdentity(proposal);
  proposal.originalChanges ||= structuredClone(proposal.changes);
  proposal.userEdits={...proposal.userEdits,...changes};
  proposal.changes={...proposal.changes,...changes};
  proposal.editedAt=new Date().toISOString();
  validateState(next);
  return next;
}
export function importProposals(state, report) {
  if (!report || report.schema_version!==1 || !Array.isArray(report.proposals)) throw new Error('La revisión debe tener schema_version: 1 y proposals: [].');
  const next=structuredClone(state);
  next.aiProposals ||= [];
  next.aiReviews ||= [];
  // Compact duplicates left by older imports, keeping reviewed history intact.
  const pendingByIdentity=new Map();
  for (const proposal of next.aiProposals) {
    if (proposal.status!=='pending') continue;
    const identity=proposalIdentity(proposal),previous=pendingByIdentity.get(identity);
    if (!previous) {pendingByIdentity.set(identity,proposal);continue;}
    const latest=(proposal.reviewDate||'')<(previous.reviewDate||'')?previous:proposal;
    const older=latest===proposal?previous:proposal;
    latest.previousVersions=[...(latest.previousVersions||[]),...(older.previousVersions||[]),{...older,previousVersions:undefined}];
    pendingByIdentity.set(identity,latest);
  }
  next.aiProposals=next.aiProposals.filter(proposal=>proposal.status!=='pending'||pendingByIdentity.get(proposalIdentity(proposal))===proposal);
  const batchId=uid();
  let added=0,updated=0,skipped=0;
  const references=Object.create(null);
  for (const raw of report.proposals) {
    const proposal={...raw,status:'pending',batchId,reviewDate:report.review_date};
    validateProposal(next,proposal);
    references[proposal.id]=proposal.id;
    const existing=next.aiProposals.find(item=>item.id===proposal.id);
    if (existing) {
      if (proposalContent({...existing,changes:existing.originalChanges||existing.changes})!==proposalContent(proposal)) throw new Error('El identificador '+proposal.id+' ya pertenece a otra propuesta. Usa un id nuevo para la nueva versión.');
      references[proposal.id]=existing.id;skipped++;
      continue;
    }
    const matches=next.aiProposals.filter(item=>proposalIdentity(item)===proposalIdentity(proposal));
    const equivalent=matches.find(item=>proposalContent({...item,changes:item.originalChanges||item.changes})===proposalContent(proposal));
    if (equivalent) {references[proposal.id]=equivalent.id;skipped++;continue;}
    const pending=matches.find(item=>item.status==='pending');
    if (pending) {
      if (typeof pending.reviewDate==='string' && typeof proposal.reviewDate==='string' && proposal.reviewDate<pending.reviewDate) {references[proposal.id]=pending.id;skipped++;continue;}
      // Keep the latest pending version and retain its previous source content.
      if (pending.userEdits) {
        proposal.sourceIdentity=proposalIdentity(proposal);
        proposal.originalChanges=structuredClone(proposal.changes);
        proposal.userEdits=structuredClone(pending.userEdits);
        proposal.editedAt=pending.editedAt;
        proposal.changes={...proposal.changes,...proposal.userEdits};
        validateProposal(next,proposal);
      }
      proposal.previousVersions=[...(pending.previousVersions||[]),{...pending,previousVersions:undefined}];
      next.aiProposals[next.aiProposals.indexOf(pending)]=proposal;
      updated++;
      continue;
    }
    // A reviewed activity with unchanged proposed fields must not reopen itself
    // merely because a later report supplies a different summary or source text.
    const reviewed=matches.find(item=>sameValue(item.originalChanges||item.changes,proposal.changes));
    if (reviewed) {references[proposal.id]=reviewed.id;skipped++;continue;}
    next.aiProposals.push(proposal);added++;
  }
  const review={id:batchId,date:typeof report.review_date==='string'?report.review_date:'',complete:report.complete===true,added,updated,
    courses:Array.isArray(report.reviewed_courses)?report.reviewed_courses.map(course=>typeof course==='string'?course:JSON.stringify(course)):[],
    issues:Array.isArray(report.access_issues)?report.access_issues.map(issue=>typeof issue==='string'?issue:JSON.stringify(issue)):[],
    uncertainties:Array.isArray(report.uncertainties)?report.uncertainties.map(String):[]};
  if (added || updated || !next.aiReviews.some(item=>sameValue([item.date,item.complete,item.courses,item.issues,item.uncertainties],[review.date,review.complete,review.courses,review.issues,review.uncertainties]))) next.aiReviews.push(review);
  validateState(next);
  return {state:next,added,updated,skipped,references};
}
export function decideProposal(state, id, decision) {
  if (!['accepted','discarded','pending'].includes(decision)) throw new Error('Decisión inválida.');
  const next=structuredClone(state),proposal=next.aiProposals?.find(item=>item.id===id);
  if (!proposal || (decision==='pending'?proposal.status!=='discarded':proposal.status!=='pending')) throw new Error('Esta propuesta ya está revisada.');
  if (decision==='accepted') {
    const conflict=proposalConflict(next,proposal);
    if (conflict) throw new Error(conflict);
    if (proposal.action==='delete') next[proposal.kind]=next[proposal.kind].filter(item=>item.id!==proposal.targetId);
    else {
      const candidate=proposalCandidate(next,proposal);
      if (proposal.action==='create') {candidate.id=uid();next[proposal.kind].push(candidate);}
      else next[proposal.kind][next[proposal.kind].findIndex(item=>item.id===proposal.targetId)]=candidate;
      proposal.appliedId=candidate.id;
    }
  }
  proposal.status=decision;proposal.decidedAt=new Date().toISOString();
  validateState(next);
  return next;
}
