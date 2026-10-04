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
