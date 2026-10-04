# Revisión de Moodle — 3 de octubre de 2026

**Estado actual: revisión académica pendiente de autenticación. El MCP de Chromium funciona.**

Comprobación del 3 de octubre de 2026, 19:51 (Europe/Madrid; 17:51 UTC): `list_pages` mostró una única pestaña `about:blank`. Se navegó mediante `chrome-devtools` a https://moovi.uvigo.gal/ y luego a https://moovi.uvigo.gal/login/index.php. La portada mostraba «Log in» y la página de acceso contiene el formulario de usuario y contraseña: no hay sesión iniciada en este Chromium. El anterior fallo de conexión no se ha reproducido. No se han cambiado perfiles ni configuración ni cerrado navegadores.

Se ha solicitado la autenticación, ofreciendo introducir las credenciales directamente en Chromium. La revisión queda pendiente de ese acceso; no se han consultado cursos, calendario académico, anuncios de asignaturas, actividades, estados de entrega ni adjuntos. No se han descargado recursos académicos. Cursos revisados: ninguno. Propuestas nuevas: ninguna; cambios y duplicados sin determinar. Las listas vacías no indican ausencia de actividades ni eliminaciones.

El mecanismo «Por confirmar» existe y lee `proposals.json` de esta carpeta. El informe sigue con `complete: false`, sin propuestas académicas verificadas. No se han modificado el código, Moodle ni los registros confirmados. Los 13 registros de `local-reference.json` son referencias locales, no una copia de los datos actuales del usuario.

La URL de Moovi se ha comprobado en esta ejecución. Tras autenticarse se deberá realizar la primera revisión completa de todos los cursos activos y comparar las actividades por identificador y enlace. Los siguientes apartados conservan el historial anterior; sus bloqueos de conexión describen intentos pasados.

---

## Historial previo de la revisión

**Estado: revisión académica incompleta; conexión con chrome-devtools MCP bloqueada antes de comprobar la sesión.**

Último intento: 3 de octubre de 2026, 19:49 (Europe/Madrid; 17:49 UTC). Se empezó con `list_pages` del servidor `chrome-devtools`, que devolvió:

```text
The browser is already running for /home/sk/snap/chromium/common/codex-mcp-profile. Use --isolated to run multiple browser instances.
Cause: The browser is already running for /home/sk/snap/chromium/common/codex-mcp-profile. Use a different `userDataDir` or stop the running browser first.
```

No se han podido listar las pestañas, seleccionar Moovi ni comprobar si existe una sesión activa. El mensaje señala un conflicto de perfil; su causa exacta no se ha diagnosticado en este intento. No se ha usado el navegador integrado ni `node_repl`, cerrado navegadores, cambiado perfiles o modificado la configuración del MCP. No se han solicitado credenciales: no resuelven este fallo previo al acceso.

La dirección https://moovi.uvigo.gal/ y la sesión indicada por el usuario proceden del informe anterior; no se han verificado en esta ejecución. Los intentos anteriores se conservan en `proposals.json` y en el historial de este resumen.

## Cobertura y resultado

- Cursos revisados en Moodle: ninguno. ABP, SSI, ACII, EST y LC figuran en el proyecto; su condición de cursos activos no se ha verificado.
- Propuestas nuevas: ninguna generada; novedades y cambios sin determinar.
- Calendario, anuncios, actividades, entregas, recursos y adjuntos: sin consultar.
- Archivos descargados de Moodle: ninguno.
- Importaciones anteriores: no se encontró una carpeta de importaciones antes de preparar este informe. Este intento incompleto no debe servir de revisión completa anterior.
- Registros actuales de StudyTracker: sin consultar; el estado reside en el navegador del usuario. Las referencias del código no prueban que esos registros estén presentes ni reflejan sus notas o correcciones.

No se ha modificado Moodle, el código, las tareas o los exámenes confirmados. No se han enviado mensajes ni entregado actividades.

## Archivos preparados

`proposals.json` registra el alcance, los impedimentos y las propuestas vacías con `complete: false`. No es una copia de seguridad de StudyTracker y no debe restaurarse desde la aplicación.

`local-reference.json` recoge 13 registros de inicialización del proyecto para una comparación futura, sin considerarlos nuevas propuestas. La carpeta `evidence/` conserva copias de los archivos locales con su procedencia y SHA-256; no son descargas ni comprobaciones de Moodle.

El proyecto ya dispone del mecanismo «Por confirmar». **Cargar revisión del proyecto** lee este `proposals.json`; también existe **Importar revisión JSON**. El informe es compatible con ese mecanismo y permanece incompleto, sin propuestas académicas verificadas. No se ha cargado en la aplicación porque no hay conexión con el navegador. Esta actualización corrige la descripción anterior del mecanismo, sin modificar el código ni los registros.

## Dudas locales que habrá que verificar

- SSI, práctica 1: mantener «aproximadamente finales de octubre» hasta que una fuente aporte una fecha exacta. El tracker indica modalidad individual, mientras que la transcripción permite individual o parejas; ambas afirmaciones tienen distinto alcance.
- SSI, trabajo en grupo: el proyecto conserva «miércoles 30/9/2028», «xx/11/2026», «Semana del xx/11/2026 al xx/11/206» y «Del xx/11/2026 al xx/12/2026». No se han corregido ni convertido en fechas exactas.
- EST: el código registra un cambio del 09/10/2026 al 16/10/2026 y la semana del 23 al 27/11/2026. No se puede confirmar ese cambio ni la vigencia de las fechas sin Moodle.
- ACII y LC: las fechas y los grupos existentes requieren contrastar sus fuentes; no se han reconstruido enlaces de Moodle inexistentes en el proyecto.
- Horas, zona horaria de Moodle, ubicaciones, grupos, estado de entrega, publicación y apertura: pendientes de consulta. Europe/Madrid es la zona de este informe, no una zona verificada de las actividades.

## Para continuar

Se necesita una conexión funcional de `chrome-devtools` con Chromium para continuar. Cuando esté disponible, se deberá empezar con `list_pages` y comprobar la sesión en ese navegador. Solo si Moovi requiere autenticación se solicitará el acceso, permitiendo al usuario introducirlo directamente; no se guardarán las credenciales. Después se deberá realizar la primera revisión completa de todos los cursos activos y comparar por identificador/enlace con los registros accesibles antes de proponer altas o cambios. No se ha aplicado ninguna corrección de conexión en este intento.

Las listas vacías de este informe no significan que no existan actividades ni que se haya eliminado ninguna.

## Intento con MCP de Chromium · 19:29 Europe/Madrid

A petición del usuario se ha utilizado directamente chrome-devtools MCP. `list_pages` devuelve un conflicto del perfil `/home/sk/.cache/chrome-devtools-mcp/chrome-profile`, antes de listar pestañas o verificar la sesión. La comprobación de procesos y bloqueos no encuentra un `SingletonLock` en esa ruta; la causa exacta sigue sin determinar. No se ha cerrado ningún navegador, modificado perfiles ni cambiado la configuración del MCP. La revisión académica permanece sin realizar.

## Corrección del perfil de Chromium · 19:34 Europe/Madrid

Se ha reproducido el error con la conexión MCP existente. Chromium está instalado mediante Snap. El perfil predeterminado estaba en una carpeta oculta de `~/.cache`; se ha sustituido por un perfil exclusivo en una ruta accesible para Chromium Snap:

`/home/sk/snap/chromium/common/codex-mcp-profile`

Se ha añadido `--user-data-dir=/home/sk/snap/chromium/common/codex-mcp-profile` a los argumentos de `[mcp_servers.chrome-devtools]` en `/home/sk/.codex/config.toml`. Se conserva el ejecutable `/snap/bin/chromium`. La copia previa de la configuración es `/home/sk/.codex/config.toml.bak-chromium-profile-20261003T173402Z`. El directorio del perfil tiene permisos `700`.

**Verificación:** un proceso MCP nuevo con estos argumentos ha listado `about:blank` y ejecutado JavaScript correctamente (`document.readyState: complete`). Durante la prueba estaban abiertos simultáneamente el Chromium personal y el Chromium automatizado con el perfil exclusivo. Al finalizar se ha cerrado únicamente la instancia de prueba. El cambio de ruta resuelve el fallo de arranque reproducido; el mensaje anterior de «browser already running» no acreditaba por sí solo que hubiese otro proceso usando el perfil.

La conexión MCP cargada en este chat conserva los argumentos anteriores hasta reiniciarla. El fallo independiente de `node_repl` (`node:process`) no se ha modificado: chrome-devtools MCP ofrece la vía comprobada de acceso al navegador. No se han copiado sesiones ni contraseñas del perfil personal, ni se ha iniciado sesión en Moodle. `proposals.json` conserva el registro de los intentos académicos incompletos; esta comprobación técnica no constituye una revisión de cursos.
