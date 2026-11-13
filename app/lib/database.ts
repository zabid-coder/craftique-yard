import 'server-only';
import type {Pool} from 'mysql2/promise';
import type {DatabaseSync} from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { mysqlQuery } from './sql-compat';
type State={pool?:Pool;sqlite?:DatabaseSync};
const state=(globalThis as typeof globalThis & {cyDatabase?:State}).cyDatabase??={};
async function connection(){
  if(process.env.DB_HOST){if(!state.pool){const mysql=await import('mysql2/promise');state.pool=mysql.createPool({host:process.env.DB_HOST,port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,waitForConnections:true,connectionLimit:5,queueLimit:20,charset:'utf8mb4',...(process.env.DB_SSL==='true'?{ssl:{rejectUnauthorized:true}}:{})});}return {kind:'mysql' as const,db:state.pool};}
  if(process.env.ALLOW_LOCAL_PREVIEW!=='true')throw new Error('Configure the Hostinger MySQL database before accepting orders.');
  if(!state.sqlite){const {DatabaseSync}=await import('node:sqlite');const dir=path.join(process.cwd(),'.local-data');fs.mkdirSync(dir,{recursive:true});state.sqlite=new DatabaseSync(path.join(dir,'store.sqlite'));state.sqlite.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');state.sqlite.exec(fs.readFileSync(path.join(process.cwd(),'db/schema.sqlite.sql'),'utf8'));}
  return {kind:'sqlite' as const,db:state.sqlite};
}
export function database(){return {prepare(query:string){let values:any[]=[];const statement={bind(...v:any[]){values=v;return statement;},async all<T=Record<string,unknown>>(){const c=await connection();if(c.kind==='mysql'){const [rows]=await c.db.execute(mysqlQuery(query),values);return {results:rows as T[]};}return {results:c.db.prepare(query).all(...values) as T[]};},async first<T=Record<string,unknown>>(){return (await statement.all<T>()).results[0]??null;},async run(){const c=await connection();if(c.kind==='mysql'){const [result]=await c.db.execute(mysqlQuery(query),values);return {meta:{changes:(result as {affectedRows:number}).affectedRows}};}const result=c.db.prepare(query).run(...values);return {meta:{changes:Number(result.changes)}};}};return statement;}};}
export async function bumpRate(key:string,expires:number,now:number){const c=await connection();if(c.kind==='sqlite')return c.db.prepare('INSERT INTO rate_limits(key,count,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires_at < ? THEN 1 ELSE count+1 END,expires_at=CASE WHEN expires_at < ? THEN ? ELSE expires_at END RETURNING count').get(key,expires,now,now,expires) as {count:number};
  const conn=await c.db.getConnection();try{await conn.beginTransaction();await conn.execute('INSERT INTO rate_limits(`key`,count,expires_at) VALUES(?,1,?) ON DUPLICATE KEY UPDATE count=IF(expires_at < ?,1,count+1),expires_at=IF(expires_at < ?,?,expires_at)',[key,expires,now,now,expires]);const [rows]=await conn.execute('SELECT count FROM rate_limits WHERE `key`=? FOR UPDATE',[key]);await conn.commit();return (rows as {count:number}[])[0];}catch(e){await conn.rollback();throw e;}finally{conn.release();}}
