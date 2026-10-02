import type { Metadata } from 'next';
import {headers} from 'next/headers';
import './globals.css';
export async function generateMetadata():Promise<Metadata>{const h=await headers();const host=h.get('x-forwarded-host')||h.get('host')||'localhost:3000';const protocol=host.startsWith('localhost')?'http':'https';const image=`${protocol}://${host}/og.png`;const title='proyecto. — Tu espacio para crear';const description='Organiza tus proyectos personales, ideas, tareas y materiales. Cada pequeño paso cuenta.';return {title,description,openGraph:{title,description,locale:'es_ES',type:'website',images:[{url:image,width:1536,height:1024,alt:'Tus proyectos, en movimiento. Cada pequeño paso cuenta.'}]},twitter:{card:'summary_large_image',title,description,images:[image]}};}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body>{children}</body></html>}
