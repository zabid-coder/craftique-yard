import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
const base=process.env.TEST_URL||'http://127.0.0.1:3000';
const env=fs.readFileSync('.env.local','utf8');
const code=env.match(/^ADMIN_BOOTSTRAP_TOKEN=(.+)$/m)?.[1];
const email='zabid.coder@gmail.com',password=crypto.randomBytes(24).toString('base64url');
let cookie='',testCount=0;
async function request(path,payload,{admin=false,origin=base,form}={}){const headers={...(payload?{'Content-Type':'application/json'}:{}),'Origin':origin,...(admin&&cookie?{Cookie:cookie}:{}),'X-Forwarded-For':`127.0.1.${testCount+1}`};const r=await fetch(base+path,{method:payload||form?'POST':'GET',headers,body:form|| (payload?JSON.stringify(payload):undefined)});return {status:r.status,headers:r.headers,data:await r.json()};}
function test(name,condition){assert.ok(condition,name);testCount++;console.log(`PASS ${name}`);}
const db=new DatabaseSync('.local-data/store.sqlite');
const initialUsers=db.prepare('SELECT * FROM admin_users').all();
const initialSessions=db.prepare('SELECT * FROM admin_sessions').all();
const initialProducts=db.prepare('SELECT * FROM products').all();
const initialSettings=db.prepare('SELECT * FROM settings').all();
const initialOrders=db.prepare('SELECT id FROM orders').all().map(o=>o.id);
let product,settings,order;
try{
 let r=await request('/api/admin');test('Anonymous cannot read dashboard',r.status===403);
 r=await request('/api/admin',{action:'settings',settings:{}},{origin:'https://evil.test'});test('Cross-origin admin write rejected',r.status===403);
 r=await request('/api/auth',{action:'setup',email:'unapproved@example.com',password,code});test('Unapproved administrator rejected',r.status===403);
 r=await request('/api/auth',{action:'setup',email,password,code});if(r.status!==200)console.log('Setup failure:',r.status,r.data);test('Approved first admin can bootstrap',r.status===200);cookie=r.headers.get('set-cookie')?.split(';')[0]||'';test('Session cookie uses HttpOnly and SameSite',r.headers.get('set-cookie')?.includes('HttpOnly')&&r.headers.get('set-cookie')?.toLowerCase().includes('samesite=strict'));
 r=await request('/api/auth',{action:'setup',email:'juwelranatju@gmail.com',password,code});test('Unauthenticated setup closed after first admin',r.status===403);
 r=await request('/api/admin',undefined,{admin:true});test('Approved admin loads all 104 products',r.status===200&&r.data.products.length===104);product=r.data.products.find(p=>p.id==='light-pink-a12-about-100');settings=r.data.settings;test('Correct delivery defaults',settings.insideDhaka===80&&settings.outsideDhaka===130);
 const input={checkoutKey:crypto.randomUUID(),name:'Local QA customer',phone:'01700000000',email:'',address:'Test road, test house, Dhaka',district:'Dhaka',zone:'dhaka',payment:'cod',note:'Disposable local QA order',website:'',items:[{id:product.id,quantity:2,price:1}],total:1};
 r=await request('/api/orders',input);test('Server computes total instead of trusting browser',r.status===201&&r.data.total===product.price*2+80);order=r.data;
 r=await request('/api/orders',input);test('Duplicate retry returns same order reference',r.status===200&&r.data.reference===order.reference);
 r=await request('/api/orders',{...input,checkoutKey:crypto.randomUUID(),zone:'outside'});test('Outside Dhaka charge is 130',r.status===201&&r.data.total===product.price*2+130);
 r=await request('/api/track',{reference:order.reference,phone:input.phone});test('Tracking works with reference and phone',r.status===200&&r.data.status==='pending'&&!('address' in r.data)&&!('phone' in r.data));
 r=await request('/api/track',{reference:order.reference,phone:'01800000000'});test('Wrong phone cannot track an order',r.status===404);
 r=await request('/api/orders',{...input,checkoutKey:crypto.randomUUID(),phone:"' OR 1=1 --"});test('Invalid mobile/SQL injection input rejected',r.status===400);
 r=await request('/api/orders',{...input,checkoutKey:crypto.randomUUID(),website:'spam'});test('Bot honeypot rejected',r.status===400);
 r=await request('/api/admin',{action:'product',product:{...product,price:177,stock:1}},{admin:true});test('Admin can persist product price/stock',r.status===200);
 r=await request('/api/orders',{...input,checkoutKey:crypto.randomUUID()});test('Quantity above declared stock rejected',r.status===409);
 r=await request('/api/admin',{action:'product',product:{...product,image:'https://evil.test/file.svg'}},{admin:true});test('External/script image URLs rejected',r.status===400);
 const bad=new FormData();bad.set('image',new Blob(['<svg onload="alert(1)"></svg>'],{type:'image/png'}),'fake.png');r=await request('/api/admin/upload',null,{admin:true,form:bad});test('Disguised script upload rejected',r.status===400);
 const good=new FormData();good.set('image',new Blob([fs.readFileSync('public/images/logo.jpg')],{type:'image/jpeg'}),'logo.jpg');r=await request('/api/admin/upload',null,{admin:true,form:good});test('Valid photo optimized and stored',r.status===200&&r.data.image.endsWith('.webp'));const imageResponse=await fetch(base+r.data.image);test('Uploaded image survives independent request',imageResponse.ok&&imageResponse.headers.get('content-type')==='image/webp');
 r=await request('/api/admin',undefined,{admin:true});const stored=r.data.orders.find(o=>o.reference===order.reference);test('Order is durable in dashboard',Boolean(stored));
 r=await request('/api/admin',{action:'order',order:{id:stored.id,status:'confirmed',paymentStatus:'paid',transactionRef:'LOCAL-QA-ONLY',staffNote:'QA note'}},{admin:true});test('Admin updates order/payment status',r.status===200);
 r=await request('/api/track',{reference:order.reference,phone:input.phone});test('Tracking reflects status updates',r.data.status==='confirmed'&&r.data.paymentStatus==='paid');
 r=await request('/api/admin',{action:'settings',settings:{...settings,insideDhaka:90}},{admin:true});test('Admin can persist delivery settings',r.status===200);
 const customId='qa-custom-craft';
 r=await request('/api/admin',{action:'product',position:1,product:{...product,id:customId,name:'QA Custom Craft',nameBn:'QA কাস্টম ক্র্যাফট',bestSeller:true,active:true,available:true,stock:5}},{admin:true});test('Admin creates Best Seller product at position #1',r.status===200);
 r=await request('/api/admin',undefined,{admin:true});test('Custom Best Seller appears first in serial order',r.status===200&&r.data.products[0]?.id===customId&&r.data.products[0]?.bestSeller===true);
 const reordered=[r.data.products[1].id,customId,...r.data.products.slice(2).map(p=>p.id)];
 r=await request('/api/admin',{action:'reorder',order:reordered},{admin:true});test('Admin can reorder storefront product serial',r.status===200);
 r=await request('/api/admin',undefined,{admin:true});test('Reordered serial persists across reads',r.status===200&&r.data.products[1]?.id===customId);
 r=await request('/api/admin',{action:'deleteProduct',id:product.id},{admin:true});test('Built-in catalog product cannot be hard-deleted',r.status===400);
 r=await request('/api/admin',{action:'deleteProduct',id:customId},{admin:true});test('Admin can delete custom product cleanly',r.status===200);
 r=await request('/api/admin',undefined,{admin:true});test('Deleted custom product removed from catalog and order',r.status===200&&!r.data.products.some(p=>p.id===customId));
 r=await request('/api/auth',{action:'setup',email:'juwelranatju@gmail.com',password,code:'authenticated-admin'},{admin:true});test('Signed-in admin adds an approved account',r.status===200);
 r=await request('/api/auth',{action:'password',current:password,password:password+'New'},{admin:true});test('Password change invalidates old sessions',r.status===200);
 r=await request('/api/admin',undefined,{admin:true});test('Old session no longer authorized',r.status===403);
 console.log(`\n${testCount} meaningful API/security checks passed.`);
}finally{
 // Restore only local QA mutations. Never run this against a live database.
 if(process.env.DB_HOST)throw new Error('Refusing QA cleanup with production DB configured.');
 db.exec('BEGIN');
 for(const table of ['admin_users','admin_sessions','products','settings'])db.exec(`DELETE FROM ${table}`);
 for(const r of initialUsers)db.prepare('INSERT INTO admin_users(email,password_hash,created_at) VALUES(?,?,?)').run(r.email,r.password_hash,r.created_at);
 for(const r of initialSessions)db.prepare('INSERT INTO admin_sessions(token_hash,email,expires_at) VALUES(?,?,?)').run(r.token_hash,r.email,r.expires_at);
 for(const r of initialProducts)db.prepare('INSERT INTO products(id,payload,updated_at) VALUES(?,?,?)').run(r.id,r.payload,r.updated_at);
 for(const r of initialSettings)db.prepare('INSERT INTO settings(key,payload) VALUES(?,?)').run(r.key,r.payload);
 if(initialOrders.length)db.prepare(`DELETE FROM orders WHERE id NOT IN (${initialOrders.map(()=>'?').join(',')})`).run(...initialOrders);else db.exec('DELETE FROM orders');
 db.exec('DELETE FROM uploads');db.exec('DELETE FROM rate_limits');db.exec('COMMIT');db.close();
}
