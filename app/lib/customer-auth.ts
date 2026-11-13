import 'server-only';
import {cookies} from 'next/headers';
import {randomBytes} from 'node:crypto';
import {database} from './database';
import {tokenHash} from './auth';
export async function getCustomer(){
  const token=(await cookies()).get('cy-customer')?.value;
  if(!token||!/^[a-f0-9]{64}$/.test(token))return null;
  const row=await database().prepare('SELECT email FROM customer_sessions WHERE token_hash=? AND expires_at>?').bind(tokenHash(token),Math.floor(Date.now()/1000)).first<{email:string}>();
  return row?.email??null;
}
export async function customerSession(email:string){
  const token=randomBytes(32).toString('hex');
  await database().prepare('INSERT INTO customer_sessions(token_hash,email,expires_at) VALUES(?,?,?)').bind(tokenHash(token),email,Math.floor(Date.now()/1000)+28800).run();
  (await cookies()).set('cy-customer',token,{httpOnly:true,secure:process.env.NODE_ENV==='production'&&process.env.ALLOW_LOCAL_PREVIEW!=='true',sameSite:'strict',path:'/',maxAge:28800});
}
export async function customerLogout(){const jar=await cookies(),token=jar.get('cy-customer')?.value;if(token)await database().prepare('DELETE FROM customer_sessions WHERE token_hash=?').bind(tokenHash(token)).run();jar.delete('cy-customer');}
