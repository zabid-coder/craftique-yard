import fs from 'node:fs/promises';
import mysql from 'mysql2/promise';
if(!process.env.DB_HOST)throw new Error('Set Hostinger MySQL environment variables first.');
const db=await mysql.createConnection({host:process.env.DB_HOST,port:Number(process.env.DB_PORT||3306),database:process.env.DB_NAME,user:process.env.DB_USER,password:process.env.DB_PASSWORD,charset:'utf8mb4',...(process.env.DB_SSL==='true'?{ssl:{rejectUnauthorized:true}}:{})});
try{const sql=await fs.readFile('db/schema.mysql.sql','utf8');for(const statement of sql.split(';').map(s=>s.trim()).filter(Boolean))await db.execute(statement);console.log('MySQL schema ready. Existing records preserved.');}finally{await db.end();}
