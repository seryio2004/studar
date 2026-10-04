# Moovi · revisión de fechas del 4 de octubre de 2026

Sesión activa comprobada en Chromium mediante chrome-devtools. Se han vuelto a consultar las cinco asignaturas (EST, ACII, LC, SSI y ABP), 30 módulos, 49 discusiones y calendarios de octubre de 2026 a julio de 2027. Los 19 documentos clave siguen idénticos, comprobados por SHA-256. Se descargaron tres calendarios oficiales GREI de ESEI y se verificaron las filas relevantes de sus tablas.

El resultado contiene **32 propuestas**: 25 anteriores y **7 nuevas convocatorias oficiales**. **2 propuestas SSI** incorporan ahora hora, duración y aula. Hay **8 candidatos a cambio** sobre referencias existentes sin `targetId`/`base`; siguen fuera de las altas para evitar duplicados y no sobrescribir correcciones. JSON compatible con carga automática en **Por confirmar**, sin aceptación automática. Puedes usar **Editar propuesta** para corregir fechas, horas, notas y demás datos antes de aceptar.

## Próximos plazos verificados

| Asignatura | Actividad | Fecha / hora Europe/Madrid |
|---|---|---|
| ABP | Taller 1 | 5, 6 o 7 de octubre, según grupo |
| ABP | Ejercicio sesión 4 | Antes de sesión 5 del 7 de octubre; hora no indicada |
| ACII | P2 Puerta de garaje | 8/10/2026 23:59 |
| LC | Solicitud global, solo si procede | 8/10/2026; hora no indicada |
| ABP | Sprint 1 | **9/10/2026 23:59**, reemplaza el 2/10 |
| SSI | Apertura entrega práctica Java | 12/10/2026 16:26; esto no es su fecha de entrega |
| ACII | P3 Cronómetro | 15/10/2026 23:59 |
| SSI | Selección de modalidad | **15/10/2026 23:50**, pese a título antiguo 19/10/2025 |
| EST | Probabilidades | **16/10/2026**, Aula Magna: mañana **10:30–12:30**, tarde **08:30–10:30** |

ACII P1 venció el 24/09 a las 23:59; vuelve a aparecer sin entregar, sin calificar y con botón de entrega. P4–P7 vencen 9/11, 16/11, 30/11 y 7/12 a las 23:59. Enunciados fijan además «una semana desde el final de la sesión»; se conserva la discrepancia por grupo, sin recalcular una fecha.

## Horarios oficiales ahora localizados

| Asignatura | Ordinaria enero 2027 | Extraordinaria junio/julio 2027 | Lugar |
|---|---|---|---|
| EST | **12/01 09:00–12:00** | **17/06 09:00–12:00** | SO2–SO6 / SO4–SO6 |
| LC | **13/01 09:00–12:00** | **25/06 16:00–18:00** | Aula Magna |
| ABP | **14/01 11:30–14:30** | **22/06 12:00–14:00** | Aula Magna / SO6 |
| ACII teoría/GG | **18/01 16:00–18:00** | **14/06 15:00–17:00** | Aula Magna |
| SSI | **19/01 09:00–11:30** | **06/07 10:00–12:00** | Aula Magna |

Fuentes: [ESEI: primer cuatrimestre](https://esei.uvigo.es/documentos/grao-exames-1-cuatrimestre/), [ESEI: junio/julio](https://esei.uvigo.es/documentos/grao-exames-xullo/). Los PDF originales, procedencia, fecha y SHA-256 están en [manifest.json](resources/manifest.json). Las horas de fin determinan la duración; no se toma la duración de una clase como duración de examen.

ACII publica franjas prácticas en Automática el 18/01 (08:30–10:30, 10:30–12:30, 12:30–14:30) y el 14/06 (17:00–19:00, 19:00–21:00). Falta asignación personal de franja, por lo que no se elige una. Las convocatorias ABP están en el calendario oficial pero el curso se evalúa por proyecto; confirmar si requieren actuación personal. No se confunden estas convocatorias con la memoria final.

## Fechas aún sin resolver

- **ABP Sprint 5:** semana del **27/11** en Definición del Proyecto frente a **11/12/2026** en presentación de prácticas. [Definición](https://moovi.uvigo.gal/mod/resource/view.php?id=448770), [presentación](https://moovi.uvigo.gal/mod/resource/view.php?id=476908).
- **ABP memoria final:** **13/01/2027 incluido** en Definición/presentación inicial frente a **08/01/2027** en presentación de prácticas. Ambos documentos siguen idénticos; calendario del examen ABP 14/01 no resuelve este plazo.
- **ABP Sprint 2/3/4:** conservar semanas del 16/10, 30/10 y 13/11; la presentación también muestra esos días, sin convertir una semana en fecha única. Sprint 3 describe documentación completa y recomendador funcionando en fuentes distintas.
- **SSI Java:** entrega «hasta domingo xx/10/2026 (23:50)» y aproximadamente «finales de octubre». Día desconocido; no se deduce del calendario. [Entrega](https://moovi.uvigo.gal/mod/assign/view.php?id=448586).
- **SSI trabajo:** marcadores `xx` siguen sin resolverse; memoria, presentación y revisión sin fechas exactas. Formación de equipos: documento público dice 30/09/2026 frente a 2028 en etiqueta.
- **EST segunda prueba:** semana del **23 al 27/11/2026**, en grupo reducido; sin día/hora concretos. No se fija jueves por coincidencia nominal en EST-2.
- **LC defensa:** enunciado dice «26 de junio a partir de las 10:00» **sin año**; entrega Moodle 05/06/2027 23:59, apertura 22/05/2027 12:00. Examen extraordinario oficial 25/06/2027 y defensa del enunciado son actividades distintas; consultar al profesor si hay texto reutilizado. Programador sigue sin huecos. [Enunciado](https://moovi.uvigo.gal/mod/assign/view.php?id=451667), [programador](https://moovi.uvigo.gal/mod/scheduler/view.php?id=451668).

Los grupos personales siguen pendientes de confirmación; dos homónimos en LC. No se utiliza el usuario de acceso para identificarlos. Coincidencias E15 en SSI, ABBA/ABP6 y EST-2 son hipótesis. Las alternativas de ACII prácticas se mantienen en el inventario.

## Evidencia y límites

[fechas.json](fechas.json) recoge cada fecha, condición, duda y fuente; [inventory.json](inventory.json) conserva los enunciados completos y metadatos; [proposals.json](proposals.json) es el archivo que carga la aplicación. Versiones anteriores del mismo día conservadas en `history/`.

La revisión sigue marcada parcial: no se ha obtenido una copia del navegador personal de StudyTracker, algunos adjuntos anteriormente devolvieron 404 y no se han vuelto a descargar todos los recursos sin relación con fechas. Los errores antiguos permanecen como historia en sus evidencias; la sesión caducada y calendarios fuera de servicio de la primera comprobación ya no son bloqueos actuales. No se asume que una actividad ausente haya sido eliminada. No se han modificado registros confirmados ni Moodle.

Verificación de la web: en el Chromium MCP se cargaron automáticamente las 32 propuestas. El editor muestra fecha y hora separadas y mantiene deshabilitada la aceptación mientras editas. Ese perfil contiene los registros de inicialización (6 tareas y 7 exámenes); no se toma como prueba de los datos de tu navegador personal.
