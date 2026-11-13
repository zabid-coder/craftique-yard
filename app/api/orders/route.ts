import { z } from 'zod';
import { readJson,database,getProducts,getSettings,checkOrigin,json,rateLimit } from '../../lib/store';
import {getCustomer} from '../../lib/customer-auth';
const schema=z.object({checkoutKey:z.string().uuid(),name:z.string().trim().min(2).max(100),phone:z.string().regex(/^01\d{9}$/),email:z.union([z.literal(''),z.string().email().max(150)]).optional(),address:z.string().trim().min(8).max(400),district:z.string().trim().min(2).max(80),zone:z.enum(['dhaka','outside']),payment:z.enum(['cod','bkash','nagad']),note:z.string().max(500).optional(),website:z.string().max(0),items:z.array(z.object({id:z.string().max(100),quantity:z.number().int().min(1).max(500)})).min(1).max(50)});
export async function POST(request:Request){try{
  if(!checkOrigin(request))return json({error:'Invalid request origin.'},403);if(Number(request.headers.get('content-length'))>20000)return json({error:'Request too large.'},413);if(!await rateLimit(request,'order'))return json({error:'Too many requests. Please wait and try again.'},429);
  const input=schema.safeParse(await readJson(request));if(!input.success)return json({error:'Please check your name, phone, address and cart.'},400);const d=input.data;
  const existing=await database().prepare('SELECT reference,payload FROM orders WHERE checkout_key=?').bind(d.checkoutKey).first<{reference:string,payload:string}>();if(existing)return json({reference:existing.reference,total:JSON.parse(existing.payload).total});
  const [products,settings]=await Promise.all([getProducts(),getSettings()]);if(!(d.payment==='cod'?settings.codEnabled:d.payment==='bkash'?settings.bkashEnabled:settings.nagadEnabled))return json({error:'This payment option is unavailable.'},400);
  if(new Set(d.items.map(i=>i.id)).size!==d.items.length)return json({error:'Invalid cart.'},400);const items=[];
  for(const item of d.items){const p=products.find(p=>p.id===item.id);if(!p||!p.available||(p.stock!==null&&p.stock<item.quantity))return json({error:'An item is unavailable or the quantity exceeds available stock. Please review your cart.'},409);items.push({id:p.id,name:p.name,nameBn:p.nameBn,quantity:item.quantity,price:p.price,image:p.image});}
  const subtotal=Math.round(items.reduce((sum,i)=>sum+i.price*i.quantity,0)*100)/100;
  const threshold=Number(settings.freeShippingThreshold??1500);
  const isFreeShipping=threshold>0&&subtotal>=threshold;
  const shipping=isFreeShipping?0:(d.zone==='dhaka'?settings.insideDhaka:settings.outsideDhaka);
  const total=Math.round((subtotal+shipping)*100)/100,now=new Date().toISOString(),id=crypto.randomUUID(),reference=`CY-${now.slice(0,10).replaceAll('-','')}-${id.slice(0,8).toUpperCase()}`;
  const customerEmail=await getCustomer();
  const {website,...customer}=d;const payload={...customer,customerEmail,items,subtotal,shipping,total,transactionRef:'',staffNote:''};
  await database().prepare('INSERT INTO orders(id,reference,checkout_key,payload,status,payment_status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(checkout_key) DO NOTHING').bind(id,reference,d.checkoutKey,JSON.stringify(payload),'pending','unpaid',now,now).run();
  const saved=await database().prepare('SELECT reference,payload FROM orders WHERE checkout_key=?').bind(d.checkoutKey).first<{reference:string,payload:string}>();return json({reference:saved!.reference,total:JSON.parse(saved!.payload).total},201);
}catch{return json({error:'We could not save your order. Please retry or contact us.'},503);}}
