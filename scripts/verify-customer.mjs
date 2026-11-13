import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
const base='http://127.0.0.1:3000',password=process.env.SETUP_ACCOUNT_PASSWORD;
if(!password)throw new Error('Provide the preview account password through the environment.');
const db=new DatabaseSync('.local-data/store.sqlite'),keys=[],sessions=[];
let checks=0;
function check(condition,message){assert.ok(condition,message);checks++;}
async function post(path,data,cookie='',origin=base){return fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie,'X-Forwarded-For':'127.0.0.88'},body:JSON.stringify(data)});}
async function me(cookie=''){return (await fetch(base+'/api/customer',{headers:{Cookie:cookie}})).json();}
try{
 check((await me()).email===null,'Anonymous access has no customer data');
 check((await post('/api/customer',{email:'zabidkhan58@gmail.com',password:'wrong-password'})).status===401,'Wrong password denied');
 check((await post('/api/customer',{email:'zabidkhan58@gmail.com',password},'','https://example.com')).status===403,'Cross-origin login denied');
 const login=await post('/api/customer',{email:'zabidkhan58@gmail.com',password});check(login.status===200,'Customer can sign in');
 const header=login.headers.get('set-cookie');check(header.includes('HttpOnly')&&header.includes('SameSite=strict'),'Customer cookie protected');const cookie=header.split(';')[0];sessions.push(cookie.split('=')[1]);
 check((await me(cookie)).email==='zabidkhan58@gmail.com','Customer identity correct');
 check((await fetch(base+'/api/admin',{headers:{Cookie:cookie}})).status===403,'Customer has no admin access');
 const before=(await me(cookie)).orders.length;
 const sample={name:'Customer QA',phone:'01700000000',email:'zabidkhan58@gmail.com',address:'Preview test address only',district:'Dhaka',zone:'dhaka',payment:'cod',website:'',items:[{id:'light-pink-a12-about-100',quantity:1}]};
 const guestKey=crypto.randomUUID();keys.push(guestKey);const guest=await post('/api/orders',{...sample,checkoutKey:guestKey,customerEmail:'zabidkhan58@gmail.com'});check(guest.status===201,'Guest order accepted');
 check((await me(cookie)).orders.length===before,'Matching or forged email cannot claim guest orders');
 const accountKey=crypto.randomUUID();keys.push(accountKey);const order=await post('/api/orders',{...sample,checkoutKey:accountKey,customerEmail:'other@example.com'},cookie);check(order.status===201,'Signed-in order accepted');const saved=await order.json();
 check((await me(cookie)).orders.some(o=>o.reference===saved.reference),'Account sees its signed-in order');
 const payload=JSON.parse(db.prepare('SELECT payload FROM orders WHERE checkout_key=?').get(accountKey).payload);check(payload.customerEmail==='zabidkhan58@gmail.com','Server owns order-account association');
 const admin=await post('/api/auth',{email:'zabid.coder@gmail.com',password});check(admin.status===200,'Requested admin credentials work');const adminCookie=admin.headers.get('set-cookie').split(';')[0];sessions.push(adminCookie.split('=')[1]);
 check((await fetch(base+'/api/admin',{headers:{Cookie:adminCookie}})).status===200,'Admin dashboard access works');check((await me(adminCookie)).email===null,'Admin session cannot become customer session');
 await post('/api/auth',{action:'logout'},adminCookie);check((await fetch(base+'/api/admin',{headers:{Cookie:adminCookie}})).status===403,'Admin logout revokes session');
 await post('/api/customer',{action:'logout'},cookie);check((await me(cookie)).email===null,'Customer logout revokes session');
 console.log(`${checks} account, order ownership and security checks passed`);
}finally{for(const key of keys)db.prepare('DELETE FROM orders WHERE checkout_key=?').run(key);for(const table of ['customer_sessions','admin_sessions'])for(const token of sessions){const {createHash}=await import('node:crypto');db.prepare(`DELETE FROM ${table} WHERE token_hash=?`).run(createHash('sha256').update(token).digest('hex'));}db.close();}
