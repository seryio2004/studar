import type { Metadata } from 'next';
import './globals.css';
const title='proyecto.';
const description='Gestión de proyectos, ideas, tareas y materiales.';
export const metadata:Metadata={title,description,openGraph:{title,description,locale:'es_ES',type:'website'},twitter:{card:'summary',title,description}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body>{children}</body></html>}
