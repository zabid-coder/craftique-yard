import {z} from 'zod';
import crypto from 'node:crypto';
import {database,readJson,json,checkOrigin,rateLimit} from '../../lib/store';
import {getCustomer,customerSession,customerLogout} from '../../lib/customer-auth';
import {verifyPassword,hashPassword} from '../../lib/auth';

export function normalizeCustomerIdentifier(raw: string): { type: 'phone' | 'email'; value: string } | null {
  const clean = String(raw || '').trim();
  if (!clean) return null;

  if (clean.includes('@')) {
    const email = clean.toLowerCase();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
    return isValid ? { type: 'email', value: email } : null;
  }

  // Remove non-digit characters
  const digits = clean.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('01')) {
    return { type: 'phone', value: digits };
  }
  if (digits.length === 13 && digits.startsWith('8801')) {
    return { type: 'phone', value: digits.slice(2) };
  }
  if (digits.length === 14 && digits.startsWith('008801')) {
    return { type: 'phone', value: digits.slice(4) };
  }
  return null;
}

export async function GET(){
  try{
    const identifier=await getCustomer();
    if(!identifier)return json({identifier:null,email:null,orders:[]});

    const isPhone = /^\d{11}$/.test(identifier);
    const altIdentifier = isPhone ? `+88${identifier}` : identifier;

    const {results}=await database().prepare(
      "SELECT reference,payload,status,payment_status,created_at FROM orders WHERE json_extract(payload,'$.customerEmail')=? OR json_extract(payload,'$.email')=? OR json_extract(payload,'$.phone')=? OR json_extract(payload,'$.phone')=? ORDER BY created_at DESC LIMIT 50"
    ).bind(identifier,identifier,identifier,altIdentifier).all<{reference:string,payload:string,status:string,payment_status:string,created_at:string}>();

    return json({
      identifier,
      email: identifier,
      isPhone,
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
    if(!await rateLimit(request,'customer-auth',25))return json({error:'Too many attempts. Please try later.'},429);
    const input=await readJson(request);

    if(input.action==='logout'){
      await customerLogout();
      return json({ok:true});
    }

    if(input.action==='google'){
      let email='';
      let name='';
      const credential=input.credential;
      if(credential){
        try{
          const parts=String(credential).split('.');
          if(parts.length===3){
            const payload=JSON.parse(Buffer.from(parts[1],'base64').toString('utf-8'));
            if(payload.email&&(payload.email_verified===true||payload.email_verified==='true'||payload.email_verified===1)){
              email=String(payload.email).toLowerCase().trim();
              name=String(payload.name||'').trim();
            }
          }
        }catch{}
      }

      // Preview / Dev mode mock trigger if no external Google Client is set yet
      if(!email && (process.env.ALLOW_LOCAL_PREVIEW==='true'||process.env.NODE_ENV!=='production') && input.testEmail){
        const norm=normalizeCustomerIdentifier(input.testEmail);
        if(norm?.type==='email'){
          email=norm.value;
          name=String(input.testName||'Google User').trim();
        }
      }

      if(!email){
        return json({error:'Could not verify Google account details. Please try again or sign in with your mobile number.'},400);
      }

      const existing=await database().prepare('SELECT email FROM customer_users WHERE email=?').bind(email).first<{email:string}>();
      if(!existing){
        const dummyHash=await hashPassword(crypto.randomUUID());
        await database().prepare('INSERT INTO customer_users(email,password_hash,created_at) VALUES(?,?,?)').bind(email,dummyHash,new Date().toISOString()).run();
      }

      await customerSession(email);
      return json({ok:true,identifier:email,name});
    }

    if(input.action==='register'){
      const rawIdentifier = input.identifier || input.email;
      const norm = normalizeCustomerIdentifier(rawIdentifier);
      if(!norm){
        return json({error:'Please enter a valid 11-digit mobile number (e.g. 017XXXXXXXX) or email address.'},400);
      }

      const password = String(input.password || '');
      if(password.length < 6){
        return json({error:'Password must be at least 6 characters long.'},400);
      }

      const existing=await database().prepare('SELECT email FROM customer_users WHERE email=?').bind(norm.value).first<{email:string}>();
      if(existing){
        return json({
          error: norm.type === 'phone'
            ? 'An account with this mobile number already exists. Please sign in.'
            : 'An account with this email already exists. Please sign in.'
        },409);
      }

      const passwordHash=await hashPassword(password);
      const now=new Date().toISOString();
      await database().prepare('INSERT INTO customer_users(email,password_hash,created_at) VALUES(?,?,?)').bind(norm.value,passwordHash,now).run();
      await customerSession(norm.value);
      return json({ok:true,registered:true,identifier:norm.value},201);
    }

    // Default Sign In (by mobile number or email)
    const rawIdentifier = input.identifier || input.email;
    const norm = normalizeCustomerIdentifier(rawIdentifier);
    if(!norm){
      return json({error:'Please enter a valid 11-digit mobile number or email address.'},400);
    }

    const password = String(input.password || '');
    if(!password){
      return json({error:'Please enter your password.'},400);
    }

    const user=await database().prepare('SELECT password_hash FROM customer_users WHERE email=?').bind(norm.value).first<{password_hash:string}>();
    const good=await verifyPassword(password,user?.password_hash||'0123456789abcdef0123456789abcdef:'+ '00'.repeat(64));
    if(!user||!good){
      return json({
        error: norm.type === 'phone'
          ? 'Mobile number or password is incorrect.'
          : 'Email or password is incorrect.'
      },401);
    }

    await customerSession(norm.value);
    return json({ok:true,identifier:norm.value});
  }catch(err){
    return json({error:err instanceof Error?err.message:'Please check your details and try again.'},400);
  }
}
