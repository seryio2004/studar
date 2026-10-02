export type Task={id:string;title:string;done:boolean;priority:number};
export type Material={id:string;name:string;type:string;url:string;cost:string;acquired:boolean};
export type Doc={id:string;name:string;content:string};
export type Project={id:string;title:string;description:string;category:string;status:string;priority:number;repo:string;notion:string;tasks:Task[];materials:Material[];docs:Doc[];revision:number};
export type Idea={id:string;title:string;description:string;createdAt:string};
export type Event={id:string;project_id:string;date:string;title:string};
export type State={projects:Project[];ideas:Idea[];events:Event[]};
export const dayKey=(date=new Date())=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Madrid'}).format(date);
export const safeUrl=(url:string)=>{try{const u=new URL(url);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}};
