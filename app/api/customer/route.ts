import {z} from 'zod';
import {database,readJson,json,checkOrigin,rateLimit} from '../../lib/store';
import {getCustomer,customerSession,customerLogout} from '../../lib/customer-auth';
import {verifyPassword,hashPassword} from '../../lib/auth';

export async function GET(){
  try{
    const email=await getCustomer();
    if(!email)return json({email:null,orders:[]});
    const {results}=await database().prepare(
      "SELECT reference,payload,status,payment_status,created_at FROM orders WHERE json_extract(payload,'$.customerEmail')=? ORDER BY created_at DESC LIMIT 50"
    ).bind(email).all<{reference:string,payload:string,status:string,payment_status:string,created_at:string}>();
    return json({
      email,
      orders:results.map(r=>{
        const p=JSON.parse(r.payload);
        return {
          reference:r.reference,
          status:r.status,
          paymentStatus:r.payment_status,
          createdAt:r.created_at,
          total:p.total,
          items:p.items.map((i:{name:string;nameBn:string;image:string;quantity:number})=>({
            name:i.name,
            nameBn:i.nameBn,
            image:i.image,
            quantity:i.quantity
          }))
        };
      })
    });
  }catch{
    return json({error:'Account unavailable. Please try again.'},503);
  }
}

export async function POST(request:Request){
  try{
    if(!checkOrigin(request))return json({error:'Invalid request origin.'},403);
    if(!await rateLimit(request,'customer-auth',15))return json({error:'Too many attempts. Please try later.'},429);
    const input=await readJson(request);

    if(input.action==='logout'){
      await customerLogout();
      return json({ok:true});
    }

    if(input.action==='register'){
      const regSchema=z.object({
        email:z.string().trim().email().max(254).transform(v=>v.toLowerCase()),
        password:z.string().min(6,'Password must be at least 6 characters.').max(128)
      });
      const parsed=regSchema.safeParse(input);
      if(!parsed.success){
        return json({error:parsed.error.issues[0]?.message||'Invalid registration details.'},400);
      }
      const {email,password}=parsed.data;
      const existing=await database().prepare('SELECT email FROM customer_users WHERE email=?').bind(email).first<{email:string}>();
      if(existing){
        return json({error:'An account with this email already exists. Please sign in.'},409);
      }

      const passwordHash=await hashPassword(password);
      const now=new Date().toISOString();
      await database().prepare('INSERT INTO customer_users(email,password_hash,created_at) VALUES(?,?,?)').bind(email,passwordHash,now).run();
      await customerSession(email);
      return json({ok:true,registered:true},201);
    }

    // Default login
    const d=z.object({
      email:z.string().trim().email().max(254).transform(v=>v.toLowerCase()),
      password:z.string().min(1).max(128)
    }).parse(input);

    const user=await database().prepare('SELECT password_hash FROM customer_users WHERE email=?').bind(d.email).first<{password_hash:string}>();
    const good=await verifyPassword(d.password,user?.password_hash||'0123456789abcdef0123456789abcdef:'+ '00'.repeat(64));
    if(!user||!good)return json({error:'Email or password is incorrect.'},401);

    await customerSession(d.email);
    return json({ok:true});
  }catch(err){
    return json({error:err instanceof Error?err.message:'Please check your sign-in details.'},400);
  }
}
