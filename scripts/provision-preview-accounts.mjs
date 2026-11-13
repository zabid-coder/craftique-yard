import {DatabaseSync} from 'node:sqlite';
import {randomBytes,scryptSync} from 'node:crypto';
import fs from 'node:fs';
if(process.env.ALLOW_LOCAL_PREVIEW!=='true'||process.env.DB_HOST)throw new Error('This command only provisions the local preview.');
const password=process.env.SETUP_ACCOUNT_PASSWORD;
if(!password)throw new Error('Set SETUP_ACCOUNT_PASSWORD for this one-time command.');
fs.mkdirSync('.local-data',{recursive:true});
const db=new DatabaseSync('.local-data/store.sqlite');db.exec(fs.readFileSync('db/schema.sqlite.sql','utf8'));
for(const [table,email] of [['admin_users','zabid.coder@gmail.com'],['customer_users','zabidkhan58@gmail.com']]){
 if(db.prepare(`SELECT email FROM ${table} WHERE email=?`).get(email)){console.log(`${table}: account already exists; preserved`);continue;}
 const salt=randomBytes(16).toString('hex'),hash=scryptSync(password,salt,64).toString('hex');
 db.prepare(`INSERT INTO ${table}(email,password_hash,created_at) VALUES(?,?,?)`).run(email,`${salt}:${hash}`,new Date().toISOString());console.log(`${table}: account created`);
}
db.close();
