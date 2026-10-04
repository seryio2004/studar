# StudyTracker

Base funcional en español para organizar asignaturas, tareas, exámenes y sesiones de estudio. HTML, CSS y JavaScript modular, sin dependencias de ejecución.

## Arranque

```sh
npm run dev
```

Abre la dirección que muestra la terminal. El servidor empieza en http://localhost:5173 y, si el puerto está ocupado, utiliza el siguiente disponible. Puedes elegir otro puerto con `npm run dev -- --port 8000`. El almacenamiento del navegador es independiente para cada puerto; para trasladar datos, exporta e importa una copia JSON.

Necesitas Python 3 para el servidor y Node.js para las comprobaciones:

```sh
npm run check
npm test
```

## Funcionalidades

- Alta y eliminación de asignaturas con color y dificultad editable del 1 (menor) al 5 (mayor). Al iniciar se añaden una sola vez ABP (1), SSI (2), ACII (3), EST (4) y LC (5), conservando los registros y evitando duplicados por nombre. Al eliminar se borran sus registros asociados, previa confirmación.
- Tareas por asignatura con fecha, prioridad, notas y estado de finalización.
- Exámenes con fecha, hora y duración; los exámenes importados sin horario muestran hora y duración pendientes. Sesiones de estudio con fecha y minutos.
- ACII: se añaden una sola vez las pruebas de prácticas del grupo del lunes (26/10/2026 y 07/12/2026) y las del grupo grande (28/10/2026 y 18/01/2027), con notas del temario y sin modificar las entregas.
- EST, grupo de mañana: Probabilidades el 16/10/2026 en horario de clase y Variables aleatorias e estatística descritiva durante la semana del 23 al 27/11/2026, en grupos reducidos. Se añaden una sola vez, con horario pendiente; el intervalo de noviembre se muestra completo en el calendario y se exporta a iCalendar.
- Calendario mensual en el resumen con navegación, exámenes y entregas pendientes. Las tareas sin fecha se muestran aparte; la fecha se puede asignar o cambiar en cada tarea.
- Práctica 1 de SSI añadida una sola vez como práctica individual, con enlace a Moovi y enunciado Markdown en `docs/ssi/practica-1-cifrado-java.md` (lectura y descarga desde la tarea). Plazo aproximado: finales de octubre, pendiente de confirmar.
- Resumen de horas acumuladas, tareas pendientes, exámenes próximos y distribución del estudio.
- Persistencia local en `localStorage`, bajo `studytracker:v1`.
- Exportación iCalendar `.ics`: exámenes con hora local convertida a UTC y exámenes sin hora y tareas pendientes como eventos de día completo. Importación manual en la aplicación de calendario; no hay sincronización automática.
- Exportación e importación CSV de tareas compatible con intercambio manual mediante Notion. Columnas exactas: `Nombre,Asignatura,Fecha,Prioridad,Completada,Notas`. Fecha `AAAA-MM-DD`, prioridad `Alta`, `Media` o `Baja`, completada `true` o `false`. La importación añade registros, crea asignaturas desconocidas y no deduplica tareas. Los CSV de otras bases de Notion requieren adaptar columnas y valores.
- Copia JSON de todos los datos; restauración validada que reemplaza el estado previa confirmación.

## Estructura

- `src/app.js`: interfaz, formularios, almacenamiento e intercambio de archivos.
- `src/data.js`: modelo, validación, serialización CSV e iCalendar.
- `src/styles.css`: diseño adaptable a móvil.
- `tests/data.test.js`: validación e interoperabilidad de exportaciones.

El estado tiene `version`, `subjects`, `tasks`, `exams` y `sessions`. Cada registro tiene un `id`; tareas, exámenes y sesiones usan `subjectId`. Las fechas sin hora usan `AAAA-MM-DD`; los exámenes sin horario usan también `AAAA-MM-DD` con duración `null`; los que tienen horario usan `AAAA-MM-DDTHH:mm`, interpretada en la zona horaria del navegador.

## Siguiente fase

Añadir servidor, base de datos y cuentas para compartir datos entre dispositivos. Implementar OAuth para calendario y la integración de Notion en el servidor, con secretos fuera del navegador, mapeo de propiedades, identificadores remotos y reglas para conflictos y sincronización. Esta base no incluye conexión directa ni credenciales de terceros.

Los datos permanecen en el navegador y pueden perderse al borrar su almacenamiento: exporta copias JSON. Las fuentes de Google son opcionales y tienen alternativas locales. Se incluyen las cinco asignaturas configuradas por el usuario.

## Revisión de propuestas de IA · Por confirmar

El apartado **Por confirmar** permite importar una revisión JSON sin modificar las tareas ni los exámenes confirmados. Muestra los campos que cambian junto a sus valores actuales, una revisión completa desplegable, el enunciado, las fuentes y las dudas. Puedes filtrar por asignatura, buscar y consultar pendientes, aceptadas y descartadas. Aceptar aplica una propuesta individual; descartar conserva los registros y permite volver a revisarla. Las decisiones y los informes se guardan en el navegador y en las copias JSON.

**Editar propuesta** permite corregir títulos, asignaturas, fechas, horas, fechas aproximadas, notas, prioridad, apartado, modalidad, proyecto y enlaces de las propuestas pendientes; también horario, duración e intervalo de exámenes. **Guardar propuesta** conserva esos cambios sin aceptar la actividad. Puedes cancelar para mantener la propuesta anterior. Las fuentes y el enunciado original se conservan. Las revisiones automáticas posteriores respetan tus campos corregidos y actualizan los demás; al aceptar se aplican tus valores. La carga espera mientras editas para conservar el formulario. Los conflictos con registros confirmados siguen bloqueando la aceptación hasta resolverlos.

Con el servidor de **npm run dev**, los archivos `imports/moodle/AAAA-MM-DD/proposals.json` se detectan y cargan automáticamente en **Por confirmar** al abrir la web, volver a su pestaña y cada 30 segundos mientras esté visible. Basta con guardar el JSON en una nueva carpeta de fecha; no hay que editar un índice ni importar el archivo manualmente. **Actualizar revisiones** fuerza la comprobación. Si el servidor ya estaba abierto antes de este cambio, reinícialo una vez con `npm run dev`, utilizando el mismo puerto para conservar el acceso a tus datos del navegador.

La carga conserva las decisiones y evita repetir archivos, informes y actividades. Reconoce actividades por identidad académica, enlace del módulo de Moodle o título y asignatura. Una nueva versión sustituye a la pendiente y conserva la versión anterior en sus datos íntegros; las decisiones aceptadas o descartadas se mantienen si los campos propuestos no cambian. Los cambios reales posteriores requieren otra revisión. Los enlaces compartidos a documentos no fusionan hitos distintos. No se borran tareas ni exámenes confirmados para eliminar duplicados. Los JSON inválidos se omiten con un mensaje y se reintentan en la siguiente comprobación; los demás archivos sí se cargan.

**Limpieza de JSON:** cuando todas las propuestas de una revisión estén aceptadas o descartadas, la web guarda primero el registro completo en su almacenamiento y solicita al servidor borrar los archivos `.json` de esa carpeta de fecha, incluidos inventarios, evidencias JSON, manifiestos e históricos. Las tareas y exámenes aceptados, las decisiones, los enunciados y el historial de revisiones permanecen en la web y en las copias exportadas. Los documentos PDF, archivos de recursos y resúmenes Markdown permanecen en el proyecto. La limpieza no modifica otras carpetas de revisión.

Los informes con propuestas pendientes o sin propuestas se conservan. Si falla el guardado del navegador, no se solicita el borrado; si falla el servidor, se conserva el registro y se reintenta en las comprobaciones automáticas. Antes de borrar se comprueba que `proposals.json` conserva la misma huella SHA-256 y que todas sus propuestas están resueltas. Una versión nueva exige revisar sus novedades. Los archivos importados manualmente desde fuera del proyecto no se borran. Esta función requiere el servidor de `npm run dev`; reinícialo si estaba abierto antes del cambio.

**Importar revisión JSON** sigue disponible para otros servidores estáticos o archivos externos. **Descargar plantilla** proporciona un informe vacío. La carga automática solo lee revisiones ya generadas: no consulta Moodle, no genera propuestas y no acepta cambios por ti. Los candidatos de `detected_changes` sin `targetId` y `base` siguen siendo información del informe y no se convierten en cambios aplicables.

Formato de una revisión (ejemplo ilustrativo; sustituye los datos por información verificada y el `subjectId` por el identificador de la asignatura en tu copia JSON):

```json
{
  "schema_version": 1,
  "review_date": "2026-10-03",
  "complete": true,
  "reviewed_courses": ["SSI"],
  "access_issues": [],
  "uncertainties": [],
  "proposals": [
    {
      "id": "moodle-actividad-123-nueva-revision-1",
      "kind": "tasks",
      "action": "create",
      "summary": "Nueva práctica individual; plazo pendiente de confirmar.",
      "reason": "Actividad encontrada en la revisión de Moodle.",
      "changes": {
        "subjectId": "subject-ssi",
        "title": "Título verificado de la actividad",
        "date": "",
        "dateText": "Finales de octubre",
        "notes": "Enunciado, requisitos y criterios de evaluación completos.",
        "links": [{"label": "Actividad Moodle", "url": "https://example.com/actividad/123"}]
      },
      "statement": "## Enunciado completo\n\nTexto accesible de la fuente.",
      "sources": [{"label": "Actividad Moodle", "url": "https://example.com/actividad/123"}],
      "uncertainties": ["La fuente no indica un día exacto."]
    }
  ]
}
```

- `kind`: `tasks` o `exams`. `action`: `create`, `update` o `delete`.
- Para `update` y `delete`, añade `targetId` y `base`: una copia íntegra del registro confirmado cuando se revisó. En una actualización, `changes` contiene únicamente los campos propuestos. En una eliminación, usa `changes: {}` e indica la evidencia de cancelación en `reason` y `sources`.
- Campos admitidos: `title`, `subjectId`, `date`, `endDate`, `dateText`, `priority`, `done`, `section`, `notes`, `duration`, `mode`, `project`, `links` y `documentPath`, sujetos a las validaciones del modelo. Para tareas nuevas se usan prioridad Media, estado pendiente y apartado Prácticas si no se especifican. Los exámenes necesitan fecha; si no tienen hora, pueden usar `duration: null`. Mantén fechas aproximadas en el texto, sin inventar un día exacto.
- `sources` contiene enlaces HTTP/HTTPS con `label` y `url`. `statement` admite Markdown seguro. Los metadatos adicionales quedan disponibles en «Datos íntegros de la propuesta». Si un campo opcional se debe vaciar, usa su valor vacío admitido por el modelo; no lo omitas, porque omitirlo conserva el valor actual.
- Cada propuesta debe tener un `id` estable y único. Reimportar la misma propuesta no vuelve a añadirla ni cambia su decisión. Una versión distinta necesita un nuevo `id`.
- Se bloquea la aceptación si falta el registro o la asignatura, si una nueva actividad coincide por título o enlace con una existente, o si has cambiado un campo propuesto desde la revisión. Una eliminación exige que todo el registro siga igual. Los cambios a campos ajenos a la propuesta se conservan, incluidas tus notas.
- Los archivos se validan por completo antes de importar y tienen un límite de 5 MB. Las propuestas descartadas no se aplican; las aceptadas no se aplican una segunda vez.

`tests/reviews.test.js` comprueba importación, decisiones, conflictos, duplicados y restauración. `tests/session.test.js` también verifica la presentación y persistencia del apartado.
