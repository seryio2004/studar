# proyecto.
Web personal en español para organizar proyectos, ideas, tareas, materiales y documentación.

## Uso
- Crea un proyecto y añade tareas con prioridad alta, media o baja.
- El progreso se calcula a partir de sus tareas completadas.
- Cada tarea completada registra una actividad única en la fecha local de Madrid. Desmarcarla elimina esa actividad; borrarla conserva el historial.
- Ordena proyectos en las tres colas de prioridad y cambia su estado.
- Guarda ideas y conviértelas en proyectos.
- Registra materiales de hardware, infraestructura, software u otros; coste estimado en EUR, enlace de proveedor y estado adquirido.
- Enlaza cualquier repositorio Git HTTP/HTTPS. No se sincronizan commits del repositorio.
- Importa documentación exportada de Notion: Markdown, HTML o TXT, descomprimiendo previamente su ZIP. Se guarda el texto, no imágenes ni adjuntos. No hay sincronización automática con Notion.

## Desarrollo
`npm install`, `npm run dev`. La app se abre en `http://localhost:3001`; `npm start` utiliza el mismo puerto.

Estos comandos mantienen el modo original de Cloudflare D1 (binding DB) y Sites. El estado de desarrollo es independiente del sitio publicado y de SQLite local. El sitio privado utiliza el acceso del propietario gestionado por Sites. Para tu servidor utiliza el modo local descrito a continuación.

`npm run build`: compilación de producción.
`npx tsc --noEmit`: comprobación de tipos.
`npm run db:generate`: migraciones de SQLite.
`npm test`: pruebas de los flujos de persistencia contra un servidor local en ejecución; crea un proyecto de prueba local. Usar solo con una base de datos de desarrollo (TEST_BASE_URL permite cambiar la URL).

Las escrituras tienen control de revisión para detectar ediciones concurrentes. Los archivos importados tienen un límite de 500 KB; máximo 1,5 MB de contenido por proyecto. Los enlaces permiten únicamente HTTP/HTTPS.

## Servidor local con Docker

Requiere Docker Engine y Docker Compose v2. Ejecuta los comandos desde esta carpeta (`proyectos`). La imagen compila la aplicación para Node; no necesita cuenta de Cloudflare, D1 remoto ni Sites. SQLite guarda proyectos (con tareas, materiales y documentos), ideas y actividad en `./data/proyectos.sqlite`, fuera del contenedor. No hace falta instalar un servidor de bases de datos.

En Linux, prepara las carpetas para el usuario del contenedor (UID/GID 1000):

```bash
mkdir -p data backups
sudo chown 1000:1000 data backups
docker compose up -d --build
docker compose ps
```

Si has importado una base de datos con otro usuario, asigna también su propietario con `sudo chown 1000:1000 data/proyectos.sqlite`. Los permisos indicados corresponden a Docker sin remapeo de usuarios; ajusta el propietario si utilizas Docker rootless o user namespaces.

Abre `http://IP_DE_TU_SERVIDOR:3001`. El servidor debe permanecer encendido y sin suspensión; Docker debe arrancar con el sistema (en Linux con systemd: `sudo systemctl enable --now docker`). La política `unless-stopped` recupera el servicio al reiniciar Docker o al terminar el proceso; si lo paras manualmente, vuelve a arrancarlo con `docker compose up -d`.

El healthcheck comprueba también el acceso a SQLite. Un estado `unhealthy` informa de un problema, pero no reinicia por sí solo un proceso que sigue vivo. Consulta los errores con `docker compose logs --tail=100 proyectos`.

Puedes cambiar el puerto con `PORT=8080 docker compose up -d`, o guardar `PORT=8080` en un archivo `.env`. Para escuchar solo en el propio servidor, configura `BIND_ADDRESS=127.0.0.1` en ese archivo.

**Acceso:** este modo no tiene autenticación propia; cualquier persona que alcance el puerto puede leer y modificar los datos. Úsalo en una red doméstica de confianza o mediante una VPN. Para publicarlo en Internet, añade autenticación y HTTPS en un proxy inverso. El acceso privado de Sites no protege este contenedor.

## Persistencia y copias de seguridad

`./data` y `./backups` son carpetas locales montadas en el contenedor. Recrear o actualizar el contenedor conserva sus datos. Mantén la base en un disco local del servidor y conserva la carpeta `data` completa, incluidos los archivos SQLite `-wal` y `-shm` mientras esté en uso. Las carpetas están excluidas de Git y de la imagen: al trasladar el proyecto a otro equipo también debes trasladar sus datos o una copia de seguridad.

Crear una copia consistente mientras la aplicación funciona:

```bash
docker compose exec -T proyectos npm run db:backup
```

Se genera `./backups/proyectos-FECHA.sqlite`. El comando usa la API de backup de SQLite; no copies únicamente el archivo principal con la aplicación en marcha. Puedes programar el comando anterior con cron usando `cd /ruta/al/proyecto && docker compose exec -T proyectos npm run db:backup` y guardar otra copia en un disco diferente. No hay borrado automático de copias.

Para restaurar, detén el servicio, conserva la carpeta anterior y prepara otra vacía:

```bash
docker compose stop proyectos
mv data "data-antes-restaurar-$(date +%Y%m%d-%H%M%S)"
mkdir data
sudo chown 1000:1000 data
docker compose run --rm --no-deps proyectos npm run db:import -- /app/backups/proyectos-FECHA.sqlite
docker compose up -d
```

Sustituye `proyectos-FECHA.sqlite` por tu copia. La importación comprueba la integridad y las tablas; rechaza un destino existente para evitar sobrescribir datos.

Para actualizar el código: `docker compose up -d --build`. Para detenerlo: `docker compose down`. No borres `data` si quieres conservar los datos.

## Pasar los datos anteriores a SQLite local

La base D1 de desarrollo está en `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/`. Con el servidor de desarrollo detenido, identifica el archivo `.sqlite` de la aplicación (no `metadata.sqlite`) e impórtalo **antes del primer arranque local**:

```bash
npm run db:import -- /ruta/a/la/base-anterior.sqlite
```

Necesitas Node 22.16 o posterior. El origen se abre en modo de solo lectura y se conserva. Si vas a usar Docker después, aplica los permisos indicados arriba a la carpeta `data` y al archivo importado. Esta importación solo copia datos locales; los datos del sitio publicado requieren exportar primero su base D1 remota.

## Desarrollo y validación del modo local

```bash
npm ci
npm run dev:local
```

Se abre en `http://localhost:3001`. Para producción sin Docker: `npm run build:local` y `npm run start:local`. `DATABASE_PATH` permite elegir otro archivo; por defecto usa `data/proyectos.sqlite`. No mezcles compilaciones de Cloudflare y Node: cada modo reemplaza la carpeta `dist`.

Comprobaciones:

```bash
npx tsc --noEmit
npm run test:storage
npm run test:self-host
```

La última prueba compila para Node y arranca un servidor temporal con una base aislada. Comprueba la página y sus recursos, los flujos de proyectos e ideas, los conflictos de revisión y que los datos sobrevivan a un reinicio. La prueba de almacenamiento comprueba además rollback, backup y restauración sin sobrescritura. Ninguna de estas dos pruebas modifica tus datos reales.

Referencias: [despliegue Node con Vinext](https://github.com/cloudflare/vinext), [SQLite y copias en Node](https://nodejs.org/download/release/latest-jod/docs/api/sqlite.html), [políticas de reinicio de Docker](https://docs.docker.com/engine/containers/start-containers-automatically/).
