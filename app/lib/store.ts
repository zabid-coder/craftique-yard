import { database,bumpRate } from './database';
import { baseProducts,defaults,defaultProductOrder,sortProductsByOrder,type Product,type StoreSettings } from './catalog';
import { getAdmin } from './auth';
import { z } from 'zod';
export {database};
export async function getProductOrder():Promise<string[]|null>{
  const row=await database().prepare('SELECT payload FROM settings WHERE key=?').bind('product_order').first<{payload:string}>();
  if(!row)return null;
  try{
    const parsed=JSON.parse(row.payload);
    return Array.isArray(parsed?.order)?parsed.order.filter((id:unknown):id is string=>typeof id==='string'):null;
  }catch{return null;}
}
export async function saveProductOrder(order:string[]):Promise<void>{
  const deduped=[...new Set(order.filter(Boolean))];
  await database().prepare('INSERT INTO settings(key,payload) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET payload=excluded.payload').bind('product_order',JSON.stringify({order:deduped})).run();
}
export async function getProducts(admin=false):Promise<Product[]> {
  const [{results},customOrder]=await Promise.all([
    database().prepare('SELECT id,payload FROM products').all<{id:string,payload:string}>(),
    getProductOrder(),
  ]);
  const map=new Map(baseProducts.map(p=>[p.id,p]));
  for(const r of results)map.set(r.id,JSON.parse(r.payload));
  const list=[...map.values()].filter(p=>admin||p.active);
  return sortProductsByOrder(list,customOrder,defaultProductOrder);
}
export async function getSettings():Promise<StoreSettings>{const row=await database().prepare('SELECT payload FROM settings WHERE key=?').bind('store').first<{payload:string}>();return {...defaults,...(row?JSON.parse(row.payload):{})};}
export async function isAdmin(){return Boolean(await getAdmin());}
export function checkOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    const reqOrigin = new URL(request.url).origin;
    if (origin === reqOrigin) return true;
  } catch {}
  const configured = process.env.SITE_URL;
  if (configured) {
    try {
      if (origin === new URL(configured).origin) return true;
    } catch {}
  }
  if (process.env.ALLOW_LOCAL_PREVIEW === 'true' || process.env.NODE_ENV !== 'production') {
    try {
      const parsed = new URL(origin);
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        return true;
      }
    } catch {}
  }
  return false;
}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
export async function readBody(request:Request,maximum=20000){const reader=request.body?.getReader();if(!reader)return new Uint8Array();const chunks:Uint8Array[]=[];let size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maximum){await reader.cancel();throw new Error('Request too large.');}chunks.push(value);}const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.byteLength;}return bytes;}
export async function readJson(request:Request){return JSON.parse(new TextDecoder().decode(await readBody(request)));}
export async function rateLimit(request:Request,action:string,maximum=8){const raw=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'local';const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${action}:${raw}`));const key=[...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');const now=Math.floor(Date.now()/1000);const row=await bumpRate(key,now+900,now);return Boolean(row&&row.count<=maximum);}
export const productSchema=z.object({id:z.string().regex(/^[a-z0-9][a-z0-9-]{0,99}$/),name:z.string().trim().min(2).max(180),nameBn:z.string().trim().min(2).max(180),category:z.string().trim().min(2).max(80),categoryBn:z.string().trim().min(2).max(80),price:z.number().positive().max(500000),image:z.string().regex(/^\/images\/[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp)$/),description:z.string().max(2000),descriptionBn:z.string().max(2000),available:z.boolean(),active:z.boolean(),stock:z.number().int().min(0).max(1000000).nullable(),bestSeller:z.boolean().optional().default(false)});
export const settingsSchema=z.object({whatsapp:z.string().regex(/^\d{10,15}$/),messenger:z.string().regex(/^\d{5,30}$/),phone:z.string().min(8).max(30),email:z.string().email(),address:z.string().min(5).max(250),insideDhaka:z.number().min(0).max(5000),outsideDhaka:z.number().min(0).max(5000),freeShippingThreshold:z.number().min(0).max(100000).optional().default(1500),bkash:z.string().regex(/^01\d{9}$/),nagad:z.string().regex(/^01\d{9}$/),bkashType:z.enum(['personal','merchant']),nagadType:z.enum(['personal','merchant']),codEnabled:z.boolean(),bkashEnabled:z.boolean(),nagadEnabled:z.boolean()});
export type OrderRecord={id:string;reference:string;payload:string;status:string;payment_status:string;created_at:string;updated_at:string};
export function publicOrder(row:OrderRecord){const p=JSON.parse(row.payload);return {reference:row.reference,status:row.status,paymentStatus:row.payment_status,createdAt:row.created_at,items:p.items.map((i:{name:string,nameBn:string,quantity:number})=>({name:i.name,nameBn:i.nameBn,quantity:i.quantity})),total:p.total};}
