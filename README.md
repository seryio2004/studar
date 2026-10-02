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
`npm install`, `npm run dev`.

Persistencia D1 (binding DB) y despliegue privado mediante Sites. El estado local de desarrollo es independiente del sitio publicado. El sitio privado utiliza el acceso del propietario gestionado por Sites; no debe hacerse público sin añadir autenticación y aislamiento de usuarios a la aplicación.

`npm run build`: compilación de producción.
`npx tsc --noEmit`: comprobación de tipos.
`npm run db:generate`: migraciones de SQLite.
`npm test`: pruebas de los flujos de persistencia contra un servidor local en ejecución; crea un proyecto de prueba local. Usar solo con una base de datos de desarrollo (TEST_BASE_URL permite cambiar la URL).

Las escrituras tienen control de revisión para detectar ediciones concurrentes. Los archivos importados tienen un límite de 500 KB; máximo 1,5 MB de contenido por proyecto. Los enlaces permiten únicamente HTTP/HTTPS.
