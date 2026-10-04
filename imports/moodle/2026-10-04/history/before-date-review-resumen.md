# Revisión Moovi · 4 de octubre de 2026

Resultado: **25 propuestas nuevas respecto a las referencias locales**, **7 candidatos a cambio**, **45 actividades inventariadas** y cinco asignaturas revisadas: EST, ACII, LC, SSI y ABP. No se han modificado tareas ni exámenes confirmados, notas personales, código o Moodle.

Las fuentes académicas se consultaron el **3 de octubre**. El día 4 Moovi volvió a responder, pero la sesión había caducado y rechazó el inicio de sesión. La revisión queda **parcial**, sin verificación de novedades del día 4. Las fechas de consulta originales se conservan en cada evidencia.

## Importación en «Por confirmar»

En StudyTracker, abre **Por confirmar → Importar revisión JSON** y selecciona [proposals.json](proposals.json). El mecanismo existente valida las propuestas y las mantiene pendientes hasta tu decisión. «Cargar revisión del proyecto» apunta a la carpeta del día 3; para esta revisión utiliza la importación de JSON. No se ha alterado ese código.

Distribución de altas: EST: 1, ACII: 7, LC: 3, SSI: 3, ABP: 11. Son nuevas respecto a 13 referencias del proyecto, **no respecto a una copia actual de tu navegador**. La importación no acepta nada automáticamente. Los 7 candidatos a cambio permanecen en `detected_changes`: falta identificar sus registros reales y conservar una copia base. No se convierten en altas duplicadas.

## Próximas actividades

| Asignatura | Actividad | Fecha explícita o pendiente |
|---|---|---|
| ABP | Taller 1 | 5, 6 o 7 de octubre según grupo |
| ABP | Ficha sesión 4: prompts frente a especificación | Antes de sesión 5, 7 de octubre; sin hora |
| ACII | P2 Puerta de garaje | 8 de octubre, 23:59, según Moodle |
| LC | Solicitud global, solo si deseas cambiar | 8 de octubre; sin hora |
| ABP | Sprint 1 | **9 de octubre, 23:59**; reemplaza 2 de octubre |
| SSI | Apertura entrega práctica Java | 12 de octubre, 16:26; entrega domingo xx/10, 23:50 / finales de octubre |
| ACII | P3 Cronómetro | 15 de octubre, 23:59, según Moodle |
| SSI | Modalidad de evaluación | **15 de octubre, 23:50**; título viejo contradictorio |
| EST | Probabilidades | 16 de octubre, Aula Magna; mañana 10:30–12:30 / tarde 08:30–10:30 |

ACII P1 venció el 24 de septiembre a las 23:59 y mostraba ninguna entrega, sin calificar y botón para añadir entrega. Se mantiene como actividad relevante; no se marca completada. P4–P7 tienen plazos Moodle del 9/11, 16/11, 30/11 y 7/12 a las 23:59. [Fuentes y enunciados completos](inventory.json).

## Cambios y contradicciones

- **SSI, seis referencias existentes:** fase 1 tiene fecha 30/09/2026 en documento de equipos frente a 2028 en la etiqueta; fase 2 ya contiene asignación temática; memoria, presentación y revisión tienen requisitos adicionales; práctica Java publica apertura y hora de entrega, pero sigue sin día concreto. Revisar `detected_changes` para las siete modificaciones contando EST.
- **EST:** el anuncio del 25/09 concreta el examen de mañana a las **10:30**, duración **120 minutos**, Aula Magna. La referencia local conserva día sin hora. Horario regular del grupo A discrepa entre página y anuncio antiguo; no se usa para calcular el examen.
- **ABP:** Definición del Proyecto fija Sprint 5 en **semana del 27/11** y memoria final **13/01/2027**; la presentación de prácticas fija **11/12** y **08/01/2027**. Ambas fuentes permanecen enlazadas; las propuestas no eligen una fecha exacta. Sprint 3 describe documentación completa en una fuente y recomendador funcionando en otra.
- **ACII:** Moodle fija plazos comunes; enunciados indican una semana desde el final de la sesión pertinente. No se recalculan plazos por grupo. Calendario coloca inicio P4 lunes 19/10, mientras anuncio indica comienzo el día de prueba 26/10.
- **SSI:** elección cierra 15/10/2026 frente a título 19/10/2025; mínimo del trabajo y tamaños de equipos difieren entre encuesta, guía, presentación y documento de trabajo. Fechas `xx` se conservan literalmente.
- **LC:** entrega de segunda convocatoria abre 22/05/2027 y vence 05/06/2027. La defensa dice «26 de junio a partir de las 10:00» sin año; no se añade uno por inferencia. Programador sin huecos. IA prohibida en actividades según Datos de la materia.

## Grupos y alcance

Los grupos aún requieren confirmación. Hay dos estudiantes con el mismo nombre en LC (LC2 y LC6, ambos teoría B). Las coincidencias nominales en EST-2, equipo SSI E15 y ABP ABBA/ABP6 se mantienen como hipótesis. Los exámenes ACII de lunes ya estaban en las referencias; se inventariaron también alternativas de martes/jueves sin crear nuevos exámenes hasta confirmar grupo. No se ha utilizado el usuario de acceso para resolver estas coincidencias.

Se leyeron las páginas de los cinco cursos 2627, 30 módulos, 20 anuncios, 29 discusiones de proyectos y calendarios accesibles de octubre–enero. Las portadas de 11 cursos 2526 muestran fechas antiguas y se conservan como contexto histórico; no se asume eliminación ni se acredita que estén inactivos mediante filtro oficial.

Se conservan **41 recursos descargados correctamente** incluyendo exportación textual de equipos, con procedencia, fecha y SHA-256 en [manifest.json](resources/manifest.json). PDF completos y extracciones de texto disponibles en `resources/`; evidencias de páginas, calendarios y guías en `evidence/`. PPS y RAR descargados sin interpretar; no se ejecuta su contenido.

## Pendiente / recursos inaccesibles

- 04/10: sesión caducada; Moovi respondió Invalid login, please try again al intentar el acceso autorizado. No se pudieron verificar novedades del día 4.
- Calendarios febrero–julio de 2027 respondieron Fora de servizo el 03/10; alcance incompleto.
- Estado actual de StudyTracker en el navegador personal no disponible; comparación limitada a importación anterior y 13 referencias de inicialización.
- PPS de memoria y RAR de demostración descargados, contenido binario no interpretado.
- Documento Sesion2_Casos_Reales.docx y calendarios .ics mencionados sin enlace localizable.
- HTTP 404: https://moovi.uvigo.gal/pluginfile.php/653627/mod_folder/content/0/Calificaciones/lc-2026-27.pdf
- HTTP 404: https://moovi.uvigo.gal/pluginfile.php/653627/mod_folder/content/0/Material%20de%20pr%C3%A1cticas/Enunciados%20Fin%20de%20Carrera/Enunciado%20P1%20-%20Listas.txt
- HTTP 404: https://moovi.uvigo.gal/pluginfile.php/653627/mod_folder/content/0/Material%20de%20pr%C3%A1cticas/Enunciados%20Fin%20de%20Carrera/Enunciado%20P2%20-%20Diferencias%20de%20Listas.txt
- HTTP 404: https://moovi.uvigo.gal/pluginfile.php/653627/mod_folder/content/0/Material%20de%20pr%C3%A1cticas/Enunciados%20Fin%20de%20Carrera/Enunciado%20P3%20-%20Operadores.txt
- HTTP 404: https://moovi.uvigo.gal/pluginfile.php/653627/mod_folder/content/0/Organizaci%C3%B3n%20de%20grupos%20de%20pr%C3%A1cticas/ListaDefinitiva.pdf
- HTTP 404: https://moovi.uvigo.gal/pluginfile.php/602482/mod_folder/content/0/Boletin%20Calculo%20de%20probabilidades-esei.pdf?forcedownload=1
- HTTP 404: https://moovi.uvigo.gal/pluginfile.php/602482/mod_folder/content/0/Tema%202%20-%20C%C3%A1lculo%20de%20Probabilidades.pdf?forcedownload=1
- HTTP 404: https://moovi.uvigo.gal/pluginfile.php/602484/mod_folder/content/0/boletin%201.%20VA-esei.pdf?forcedownload=1
- HTTP 404: https://moovi.uvigo.gal/pluginfile.php/602484/mod_folder/content/0/boletin%202.%20VA-ese.pdf?forcedownload=1
- HTTP 404: https://moovi.uvigo.gal/pluginfile.php/602484/mod_folder/content/0/Tema%203%20-%20Variables%20Aleatorias.pdf?forcedownload=1

Las respuestas de error se conservan con extensión `.http-error.txt`, no como PDF válido. La guía general ACII se recuperó mediante URL directa tras fallo del enlace del módulo. Otros libros, vídeos, instaladores, archivos de datos y ejemplos están inventariados por enlace en las páginas conservadas, pero no todos se descargaron o analizaron. Esto limita la exhaustividad; no se atribuyen a esos recursos fechas o requisitos desconocidos.

Los informes anteriores del 3 de octubre permanecen intactos como historial. Esta carpeta es el resultado preparado a partir del acceso académico logrado posteriormente el día 3 y de la comprobación del día 4. Para vincular cambios sin sobrescribir tus correcciones haría falta una copia actual de StudyTracker; para revisar novedades del día 4 hace falta recuperar la sesión.

Validación: el JSON cumple el esquema de importación; 25 propuestas entran pendientes y reimportar añade 0. La prueba en memoria conservó sin cambios las colecciones confirmadas y no detectó duplicados entre las altas. No se ha usado una prueba como copia de tus datos reales.
