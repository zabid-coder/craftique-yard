import {z} from 'zod';
import {readJson,database,json,checkOrigin,rateLimit} from '../../lib/store';
import {allowedEmails,hashPassword,verifyPassword,setSession,clearSession,getAdmin,secureEqual} from '../../lib/auth';
const credentials=z.object({email:z.string().email().max(254).transform(v=>v.toLowerCase().trim()),password:z.string().min(1).max(128)});
export async function POST(request:Request){try{
  if(!checkOrigin(request))return json({error:'Invalid request origin.'},403);
  if(!await rateLimit(request,'auth',12))return json({error:'Too many attempts. Please wait 15 minutes.'},429);
  const data=await readJson(request);
  if(data.action==='logout'){await clearSession();return json({ok:true});}
  if(data.action==='setup'){
    const d=credentials.extend({password:z.string().min(12).max(128),code:z.string().min(1).max(150)}).parse(data),existing=await database().prepare('SELECT COUNT(*) AS count FROM admin_users').first<{count:number}>(),admin=await getAdmin();
    if(!allowedEmails().includes(d.email)||(!admin&&(Number(existing?.count)!==0||!process.env.ADMIN_BOOTSTRAP_TOKEN||!secureEqual(d.code,process.env.ADMIN_BOOTSTRAP_TOKEN))))return json({error:'Setup is unavailable or your setup details are incorrect.'},403);
    await database().prepare('INSERT INTO admin_users(email,password_hash,created_at) VALUES(?,?,?)').bind(d.email,await hashPassword(d.password),new Date().toISOString()).run();
    if(!admin)await setSession(d.email);return json({ok:true});
  }
  if(data.action==='password'){
    const email=await getAdmin();if(!email)return json({error:'Sign in first.'},403);
    const d=z.object({current:z.string().max(128),password:z.string().min(12).max(128)}).parse(data),user=await database().prepare('SELECT password_hash FROM admin_users WHERE email=?').bind(email).first<{password_hash:string}>();
    if(!user||!await verifyPassword(d.current,user.password_hash))return json({error:'Current password is incorrect.'},400);
    await database().prepare('UPDATE admin_users SET password_hash=? WHERE email=?').bind(await hashPassword(d.password),email).run();await database().prepare('DELETE FROM admin_sessions WHERE email=?').bind(email).run();await setSession(email);return json({ok:true});
  }
  const d=credentials.parse(data),user=await database().prepare('SELECT password_hash FROM admin_users WHERE email=?').bind(d.email).first<{password_hash:string}>();
  // Run a real derivation even for unknown accounts to avoid a timing shortcut.
  const good=await verifyPassword(d.password,user?.password_hash||'0123456789abcdef0123456789abcdef:'+ '00'.repeat(64));
  if(!user||!good||!allowedEmails().includes(d.email))return json({error:'Email or password is incorrect.'},401);await setSession(d.email);return json({ok:true});
}catch(error){console.error('Admin authentication error:',error instanceof Error?error.message:'Unknown error');return json({error:'Please check the values. Passwords need at least 12 characters.'},400);}}
