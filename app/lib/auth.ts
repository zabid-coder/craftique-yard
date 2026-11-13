import 'server-only';
import {randomBytes,scrypt,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
import {cookies} from 'next/headers';
import {database} from './database';
const derive=promisify(scrypt);
export const allowedEmails=()=> (process.env.ADMIN_EMAILS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
export async function hashPassword(password:string){const salt=randomBytes(16).toString('hex');const hash=await derive(password,salt,64) as Buffer;return `${salt}:${hash.toString('hex')}`;}
export async function verifyPassword(password:string,stored:string){try{const [salt,hex]=stored.split(':');const expected=Buffer.from(hex,'hex'),actual=await derive(password,salt,64) as Buffer;return expected.length===actual.length&&timingSafeEqual(expected,actual);}catch{return false;}}
export const tokenHash=(token:string)=>createHash('sha256').update(token).digest('hex');
export async function getAdmin(){const token=(await cookies()).get('cy-admin')?.value;if(!token||!/^[a-f0-9]{64}$/.test(token))return null;const row=await database().prepare('SELECT email FROM admin_sessions WHERE token_hash=? AND expires_at>?').bind(tokenHash(token),Math.floor(Date.now()/1000)).first<{email:string}>();return row&&allowedEmails().includes(row.email)?row.email:null;}
export async function setSession(email:string){const token=randomBytes(32).toString('hex'),expires=Math.floor(Date.now()/1000)+28800;await database().prepare('INSERT INTO admin_sessions(token_hash,email,expires_at) VALUES(?,?,?)').bind(tokenHash(token),email,expires).run();(await cookies()).set('cy-admin',token,{httpOnly:true,secure:process.env.NODE_ENV==='production'&&process.env.ALLOW_LOCAL_PREVIEW!=='true',sameSite:'strict',path:'/',maxAge:28800});}
export async function clearSession(){const jar=await cookies(),token=jar.get('cy-admin')?.value;if(token)await database().prepare('DELETE FROM admin_sessions WHERE token_hash=?').bind(tokenHash(token)).run();jar.delete('cy-admin');}
export function secureEqual(a:string,b:string){const ah=tokenHash(a),bh=tokenHash(b);return timingSafeEqual(Buffer.from(ah),Buffer.from(bh));}
