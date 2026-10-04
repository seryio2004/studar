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
      if (!(key === 'tasks' && item.date === '') && (typeof item.date !== 'string' || !/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(item.date) || !Number.isFinite(new Date(item.date).getTime()))) throw new Error('Fecha inválida.');
      if (key === 'sessions' && (!Number.isFinite(item.minutes) || item.minutes <= 0 || item.minutes > 1440)) throw new Error('Duración inválida.');
      if (key === 'exams' && !(item.date.length === 10 && item.duration === null) && (!Number.isFinite(item.duration) || item.duration <= 0 || item.duration > 1440)) throw new Error('Duración inválida.');
      if (item.endDate !== undefined && (key !== 'exams' || item.date.length !== 10 || typeof item.endDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(item.endDate) || !Number.isFinite(new Date(item.endDate).getTime()) || item.endDate < item.date)) throw new Error('Intervalo de examen inválido.');
      if (item.documentPath !== undefined && item.documentPath !== 'docs/ssi/practica-1-cifrado-java.md') throw new Error('Documento inválido.');
      if (item.mode !== undefined && typeof item.mode !== 'string') throw new Error('Modalidad inválida.');
      if (item.notes !== undefined && typeof item.notes !== 'string') throw new Error('Notas inválidas.');
    }
  }
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
