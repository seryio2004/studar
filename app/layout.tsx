import type { Metadata } from 'next';
import './globals.css';
const title='proyecto.';
const description='Gestión de proyectos, ideas, tareas y materiales.';
export const metadata:Metadata={title,description,icons:{icon:[{url:'/favicon.ico',sizes:'16x16 32x32 48x48',type:'image/x-icon'},{url:'/logo.svg',type:'image/svg+xml'}],apple:[{url:'/apple-touch-icon.png',sizes:'180x180',type:'image/png'}]},openGraph:{title,description,locale:'es_ES',type:'website'},twitter:{card:'summary',title,description}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body>{children}</body></html>}
