'use client';
import {useEffect,useState,useRef,type FormEvent} from 'react';
import Script from 'next/script';
import {
  ArrowRight,
  Globe,
  ShoppingBag,
  LogOut,
  Eye,
  EyeOff,
  ShieldCheck,
  Package,
  Clock,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  UserPlus,
  LogIn,
  AlertCircle,
  Phone,
  Mail,
  Info,
  Check
} from 'lucide-react';

type Order={
  reference:string;
  status:string;
  paymentStatus:string;
  createdAt:string;
  total:number;
  items:{name:string;nameBn:string;image:string;quantity:number}[]
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (res: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          prompt: () => void;
          renderButton: (
            element: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: string;
              shape?: string;
              width?: string | number;
            }
          ) => void;
        };
      };
    };
  }
}

export default function Account(){
  const [bn,setBn]=useState(false);
  const [mode,setMode]=useState<'login'|'register'>('login');
  const [identifier,setIdentifier]=useState<string|null>(null);
  const [orders,setOrders]=useState<Order[]>([]);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [success,setSuccess]=useState('');
  const [showPass,setShowPass]=useState(false);
  const [showConfirmPass,setShowConfirmPass]=useState(false);

  // Unified Identifier State (Phone or Email)
  const [identifierInput,setIdentifierInput]=useState('');
  const [detectedType,setDetectedType]=useState<'phone'|'email'|null>(null);

  // Google Sign-In state & guidance modal
  const [showGoogleGuide,setShowGoogleGuide]=useState(false);
  const googleBtnRef=useRef<HTMLDivElement>(null);

  const t=(en:string,b:string)=>bn?b:en;

  async function refresh(){
    const r=await fetch('/api/customer',{cache:'no-store'});
    const d=await r.json();
    if(!r.ok)throw new Error(d.error);
    setIdentifier(d.identifier||d.email||null);
    setOrders(d.orders||[]);
  }

  useEffect(()=>{
    setBn(localStorage.getItem('cy-language')==='bn');
    refresh()
      .catch(e=>setError(e.message))
      .finally(()=>setLoading(false));
  },[]);

  function detectType(val:string){
    const clean=val.trim();
    if(!clean){
      setDetectedType(null);
      return;
    }
    if(clean.includes('@')||/^[a-zA-Z]/.test(clean)){
      setDetectedType('email');
    }else if(/^(\+?88)?01\d*/.test(clean)||/^\d+$/.test(clean)){
      setDetectedType('phone');
    }else{
      setDetectedType(null);
    }
  }

  // Google Auth Response Callback
  async function handleGoogleCredential(credential:string){
    setBusy(true);
    setError('');
    setSuccess('');
    try{
      const r=await fetch('/api/customer',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action:'google',credential})
      });
      const d=await r.json();
      if(!r.ok)throw new Error(d.error||'Google sign in failed.');
      setSuccess(t('Signed in with Google successfully!','গুগল দিয়ে সফলভাবে সাইন ইন হয়েছে!'));
      await refresh();
    }catch(e){
      setError((e as Error).message);
    }finally{
      setBusy(false);
    }
  }

  // Initialize Google Identity Services
  function initGoogleGSI(){
    const googleClientId=process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if(typeof window!=='undefined'&&window.google?.accounts?.id&&googleClientId){
      window.google.accounts.id.initialize({
        client_id:googleClientId,
        callback:(res)=>handleGoogleCredential(res.credential)
      });
      if(googleBtnRef.current){
        window.google.accounts.id.renderButton(googleBtnRef.current,{
          theme:'outline',
          size:'large',
          width:360,
          text:'continue_with'
        });
      }
    }
  }

  async function handleGoogleClick(){
    const googleClientId=process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if(googleClientId&&window.google?.accounts?.id){
      try{
        window.google.accounts.id.prompt();
      }catch{
        setShowGoogleGuide(true);
      }
    }else{
      // If client ID is not yet configured, show friendly guide / instant test
      setShowGoogleGuide(true);
    }
  }

  async function handleDevGoogleMock(testEmail:string,testName:string){
    setBusy(true);
    setError('');
    setShowGoogleGuide(false);
    try{
      const r=await fetch('/api/customer',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action:'google',testEmail,testName})
      });
      const d=await r.json();
      if(!r.ok)throw new Error(d.error);
      setSuccess(t(`Signed in as ${testEmail}!` ,`${testEmail} হিসেবে সাইন ইন সম্পন্ন!`));
      await refresh();
    }catch(e){
      setError((e as Error).message);
    }finally{
      setBusy(false);
    }
  }

  async function handleSubmit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    const form=new FormData(e.currentTarget);
    const rawIdentifier=String(form.get('identifier')||'').trim();
    const password=String(form.get('password')||'');
    const confirmPassword=String(form.get('confirmPassword')||'');

    if(!rawIdentifier){
      setError(t('Please enter your mobile number or email address.','দয়া করে আপনার মোবাইল নম্বর অথবা ইমেইল লিখুন।'));
      setBusy(false);
      return;
    }

    if(mode==='register'){
      if(password.length<6){
        setError(t('Password must be at least 6 characters long.','পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'));
        setBusy(false);
        return;
      }
      if(password!==confirmPassword){
        setError(t('Passwords do not match. Please check again.','উভয় পাসওয়ার্ড একই হতে হবে।'));
        setBusy(false);
        return;
      }
    }

    try{
      const payload=mode==='register'
        ? {action:'register',identifier:rawIdentifier,password}
        : {identifier:rawIdentifier,password};

      const r=await fetch('/api/customer',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload)
      });
      const d=await r.json();
      if(!r.ok)throw new Error(d.error);

      if(mode==='register'){
        setSuccess(t('Account created successfully! Welcome to Craftique Yard.','অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! স্বাগতম।'));
      }
      await refresh();
    }catch(e){
      setError((e as Error).message);
    }finally{
      setBusy(false);
    }
  }

  async function logout(){
    setBusy(true);
    setError('');
    try{
      const r=await fetch('/api/customer',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action:'logout'})
      });
      if(!r.ok)throw new Error('Please try again.');
      setIdentifier(null);
      setOrders([]);
      setMode('login');
      setIdentifierInput('');
      setDetectedType(null);
    }catch(e){
      setError((e as Error).message);
    }finally{
      setBusy(false);
    }
  }

  const statuses:Record<string,string>={
    pending:'নিশ্চিত করার অপেক্ষায়',
    confirmed:'অর্ডার নিশ্চিত হয়েছে',
    processing:'অর্ডার প্রস্তুত হচ্ছে',
    shipped:'ডেলিভারিতে পাঠানো হয়েছে',
    delivered:'ডেলিভারি সম্পন্ন',
    cancelled:'বাতিল হয়েছে'
  };

  const isPhone = /^\d{11}$/.test(identifier||'');

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initGoogleGSI}
      />
      <main className="customer-shell">
        {/* Header */}
        <header className="customer-header">
          <a className="brand" href="/" aria-label="Craftique Yard Home">
            <img src="/images/logo.jpg" width={52} height={52} alt="Craftique Yard Logo"/>
            <span className="brand-text">CRAFTIQUE <span className="yard">YARD</span></span>
          </a>
          <div className="header-actions">
            <button
              className="language-btn"
              onClick={()=>{
                const next=!bn;
                setBn(next);
                localStorage.setItem('cy-language',next?'bn':'en');
              }}
            >
              <Globe size={15}/>
              {bn?'EN':'বাংলা'}
            </button>
          </div>
        </header>

        <div className="account-top-nav">
          <a className="text-link" href="/">
            <ArrowLeft size={16}/>
            <span>{t('Back to collection','কালেকশনে ফিরে যান')}</span>
          </a>
        </div>

        {loading?(
          <div className="account-loading-box">
            <div className="loading-spinner"/>
            <p>{t('Loading your creative space…','আপনার অ্যাকাউন্ট লোড হচ্ছে…')}</p>
          </div>
        ):!identifier?(
          <div className="auth-wrapper">
            {/* Main Auth Card */}
            <section className="auth-card">
              {/* Pill Tabs Switcher */}
              <div className="auth-tabs">
                <button
                  type="button"
                  className={`auth-tab ${mode==='login'?'active':''}`}
                  onClick={()=>{setMode('login');setError('');setSuccess('');}}
                >
                  <LogIn size={16}/>
                  <span>{t('Sign In','লগইন করুন')}</span>
                </button>
                <button
                  type="button"
                  className={`auth-tab ${mode==='register'?'active':''}`}
                  onClick={()=>{setMode('register');setError('');setSuccess('');}}
                >
                  <UserPlus size={16}/>
                  <span>{t('Create Account','নতুন অ্যাকাউন্ট')}</span>
                </button>
              </div>

              <div className="auth-card-body">
                <div className="eyebrow">
                  <span className="tiny-star">✳</span>
                  {mode==='login'?t('WELCOME BACK','পুনরায় স্বাগতম'):t('JOIN OUR MAKER FAMILY','আমাদের পরিবারে যোগ দিন')}
                </div>

                <h1>
                  {mode==='login'?t('Sign in to your account.','আপনার অ্যাকাউন্টে লগইন করুন'):t('Create your account.','নতুন অ্যাকাউন্ট তৈরি করুন')}
                </h1>

                <p className="auth-subtitle">
                  {mode==='login'
                    ? t('Access past orders, track deliveries in real time, and enjoy effortless checkout.','আপনার পূর্বের অর্ডার দেখতে এবং দ্রুত কেনাকাটা করতে সাইন ইন করুন।')
                    : t('Register in seconds with your phone or email to track your craft projects with ease.','মোবাইল নম্বর বা ইমেইল দিয়ে সহজে অ্যাকাউন্ট খুলে কেনাকাটা শুরু করুন।')}
                </p>

                {error&&(
                  <div className="form-error" role="alert">
                    <AlertCircle size={16}/>
                    <span>{error}</span>
                  </div>
                )}

                {success&&(
                  <div className="form-success" role="status">
                    <CheckCircle2 size={16}/>
                    <span>{success}</span>
                  </div>
                )}

                {/* Social Login: Continue with Google */}
                <div className="social-auth-section">
                  <button
                    type="button"
                    className="google-auth-btn"
                    onClick={handleGoogleClick}
                    disabled={busy}
                  >
                    <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.66-5.17 3.66-9.09z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.28v3.09C3.26 21.3 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.59H1.28C.46 8.21 0 10.04 0 12s.46 3.79 1.28 5.41l4-3.09z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.7 1.28 6.59l4 3.09c.95-2.83 3.6-4.93 6.72-4.93z"/>
                    </svg>
                    <span>{t('Continue with Google','গুগল দিয়ে চালিয়ে যান')}</span>
                  </button>

                  <div ref={googleBtnRef} style={{ display: 'none' }} />

                  {/* Google Guidance & Quick Preview Helper */}
                  {showGoogleGuide&&(
                    <div className="google-guide-box" role="dialog">
                      <strong>
                        <Info size={15} style={{ verticalAlign: 'middle', marginRight: 6 }}/>
                        {t('Google Sign-In Ready','Google Sign-In প্রস্তুত আছে')}
                      </strong>
                      <p>
                        {t(
                          'Google Sign-In is fully coded and integrated. To activate Google popup authentication, simply add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your .env.local file.',
                          'Google Sign-In কোডে সম্পূর্ণ ইন্টিগ্রেটেড। লাইভ গুগল পপআপ চালু করতে আপনার .env.local ফাইলে NEXT_PUBLIC_GOOGLE_CLIENT_ID যুক্ত করুন।'
                        )}
                      </p>
                      <div className="google-guide-actions">
                        <button
                          type="button"
                          className="dev-test-btn"
                          onClick={()=>handleDevGoogleMock('zabid.coder@gmail.com','Zabid Coder')}
                        >
                          <Check size={14}/>
                          <span>{t('Test 1-Tap Google Sign-In','১-ক্লিকে টেস্ট গুগল লগইন')}</span>
                        </button>
                        <button
                          type="button"
                          className="close-guide-btn"
                          onClick={()=>setShowGoogleGuide(false)}
                        >
                          {t('Close','বন্ধ করুন')}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="auth-divider">
                    <span>{t('or continue with mobile / email','অথবা মোবাইল / ইমেইল দিয়ে')}</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                  <label>
                    <div className="input-label-row">
                      <span>{t('Mobile Number or Email','মোবাইল নম্বর অথবা ইমেইল')}</span>
                      {detectedType==='phone'&&(
                        <span className="type-badge phone-badge">
                          <Phone size={11}/>
                          <span>🇧🇩 {t('Mobile (11 digits)','মোবাইল নম্বর')}</span>
                        </span>
                      )}
                      {detectedType==='email'&&(
                        <span className="type-badge email-badge">
                          <Mail size={11}/>
                          <span>{t('Email Address','ইমেইল')}</span>
                        </span>
                      )}
                    </div>
                    <input
                      name="identifier"
                      type="text"
                      required
                      autoComplete="username"
                      maxLength={254}
                      value={identifierInput}
                      onChange={(e)=>{
                        setIdentifierInput(e.target.value);
                        detectType(e.target.value);
                      }}
                      placeholder={t('01XXXXXXXXX or name@example.com','০১XXXXXXXXX অথবা name@example.com')}
                    />
                  </label>

                  <label>
                    <span>{t('Password','পাসওয়ার্ড')}</span>
                    <div className="password-input-wrap">
                      <input
                        name="password"
                        type={showPass?'text':'password'}
                        required
                        autoComplete={mode==='login'?'current-password':'new-password'}
                        minLength={mode==='register'?6:1}
                        maxLength={128}
                        placeholder={mode==='register'?t('Minimum 6 characters','কমপক্ষে ৬ অক্ষর'):'••••••••'}
                      />
                      <button
                        type="button"
                        className="pass-toggle-btn"
                        onClick={()=>setShowPass(!showPass)}
                        aria-label="Toggle password visibility"
                      >
                        {showPass?<EyeOff size={18}/>:<Eye size={18}/>}
                      </button>
                    </div>
                  </label>

                  {mode==='register'&&(
                    <label>
                      <span>{t('Confirm password','পাসওয়ার্ড নিশ্চিত করুন')}</span>
                      <div className="password-input-wrap">
                        <input
                          name="confirmPassword"
                          type={showConfirmPass?'text':'password'}
                          required
                          autoComplete="new-password"
                          minLength={6}
                          maxLength={128}
                          placeholder={t('Repeat your password','পুনরায় পাসওয়ার্ড লিখুন')}
                        />
                        <button
                          type="button"
                          className="pass-toggle-btn"
                          onClick={()=>setShowConfirmPass(!showConfirmPass)}
                          aria-label="Toggle confirm password visibility"
                        >
                          {showConfirmPass?<EyeOff size={18}/>:<Eye size={18}/>}
                        </button>
                      </div>
                    </label>
                  )}

                  <button className="button primary wide auth-submit-btn" disabled={busy} type="submit">
                    <span>
                      {busy
                        ? t('Processing…','প্রক্রিয়া চলছে…')
                        : mode==='login'
                          ? t('Sign In to Account','সাইন ইন করুন')
                          : t('Create My Account','অ্যাকাউন্ট তৈরি করুন')}
                    </span>
                    <ArrowRight size={18}/>
                  </button>
                </form>

                {/* Toggle switch text */}
                <div className="auth-switch-prompt">
                  {mode==='login'?(
                    <p>
                      {t('New to Craftique Yard?','Craftique Yard-এ নতুন?')}{' '}
                      <button
                        type="button"
                        className="inline-toggle-link"
                        onClick={()=>{setMode('register');setError('');setSuccess('');}}
                      >
                        {t('Create an account here','এখানে নতুন অ্যাকাউন্ট খুলুন')}
                      </button>
                    </p>
                  ):(
                    <p>
                      {t('Already have an account?','ইতিমধ্যে অ্যাকাউন্ট আছে?')}{' '}
                      <button
                        type="button"
                        className="inline-toggle-link"
                        onClick={()=>{setMode('login');setError('');setSuccess('');}}
                      >
                        {t('Sign in instead','সাইন ইন করুন')}
                      </button>
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Value proposition / Benefits Card */}
            <aside className="auth-perks-card">
              <div className="perks-badge">
                <Sparkles size={16}/>
                <span>{t('MAKER PRIVILEGES','সদস্যদের সুবিধা')}</span>
              </div>
              <h3>{t('Why have a Craftique Yard account?','অ্যাকাউন্ট থাকার বিশেষ সুবিধাসমূহ')}</h3>

              <div className="perk-item">
                <Package size={22}/>
                <div>
                  <strong>{t('Live Order Tracking','সহজ লাইভ ট্র্যাকিং')}</strong>
                  <p>{t('Check status of all your ongoing and past orders in one clean timeline.','চলতি ও পূর্বের সব অর্ডারের অগ্রগতি এক ক্লিকেই দেখুন।')}</p>
                </div>
              </div>

              <div className="perk-item">
                <Clock size={22}/>
                <div>
                  <strong>{t('Lightning Checkout','দ্রুত কেনাকাটা')}</strong>
                  <p>{t('Your saved details allow 1-tap orders without re-typing addresses.','পুনরায় ঠিকানা না লিখে সহজেই দ্রুত অর্ডার সম্পন্ন করুন।')}</p>
                </div>
              </div>

              <div className="perk-item">
                <ShieldCheck size={22}/>
                <div>
                  <strong>{t('Verified Customer Care','নিরাপদ সেবা ও সহায়তা')}</strong>
                  <p>{t('Direct priority support on WhatsApp and phone for all account orders.','আপনার অর্ডারের যে কোনো প্রয়োজনে পান প্রায়োরিটি সহায়তা।')}</p>
                </div>
              </div>
            </aside>
          </div>
        ):(
          /* Signed-in Customer Dashboard */
          <div className="dashboard-wrapper">
            <section className="customer-panel dashboard-header-panel">
              <div className="customer-order-top">
                <div className="customer-info-meta">
                  <div className="eyebrow">{t('CUSTOMER PORTAL','কাস্টমার পোর্টাল')}</div>
                  <h1>{t('Your Creative Account','আপনার অ্যাকাউন্ট')}</h1>
                  <div className="customer-badge-row">
                    <span className="customer-id-pill">
                      {isPhone?<Phone size={14} color="#1e7e34"/>:<Mail size={14} color="#1e5bb8"/>}
                      <span>{identifier}</span>
                    </span>
                  </div>
                </div>
                <button className="button outline logout-btn" disabled={busy} onClick={logout}>
                  <LogOut size={16}/>
                  <span>{t('Sign Out','লগআউট')}</span>
                </button>
              </div>
              <p className="customer-muted">
                {t(
                  'Below are the orders placed with your account or phone number. You can track live status and view item breakdowns.',
                  'আপনার অ্যাকাউন্ট বা মোবাইল নম্বরের মাধ্যমে করা সমস্ত অর্ডার নিচে দেওয়া হলো। লাইভ অগ্রগতি দেখুন।'
                )}
              </p>
            </section>

            {orders.length===0?(
              <section className="customer-panel empty-orders-panel">
                <ShoppingBag size={44}/>
                <h2>{t('No orders placed yet.','এখনও কোনো অর্ডার করেননি')}</h2>
                <p>{t('Your bag is waiting for your next lovely DIY craft idea. Explore our collection to get started.','আপনার ক্রাফট ভাবনার জন্য সুন্দর সব উপাদান অপেক্ষা করছে। কালেকশন ঘুরে দেখুন।')}</p>
                <a className="button primary" href="/#shop">
                  <span>{t('Shop the collection','কালেকশন থেকে কিনুন')}</span>
                  <ArrowRight size={17}/>
                </a>
              </section>
            ):(
              <div className="orders-list">
                <div className="orders-header-strip">
                  <h3>{t(`Order History (${orders.length})`,`অর্ডারের ইতিহাস (${orders.length.toLocaleString('bn-BD')}টি)`)}</h3>
                </div>
                {orders.map(o=>(
                  <article className="customer-panel order-card" key={o.reference}>
                    <div className="customer-order-top">
                      <div>
                        <small className="order-ref-label">{t('ORDER REFERENCE','অর্ডার রেফারেন্স')}</small>
                        <strong className="order-ref-val">{o.reference}</strong>
                      </div>
                      <span className={`customer-state status-${o.status}`}>
                        {bn?statuses[o.status]||o.status:o.status.replaceAll('_',' ')}
                      </span>
                      <strong className="order-price-val">৳{o.total.toLocaleString(bn?'bn-BD':'en-BD')}</strong>
                    </div>
                    <p className="customer-muted order-date-line">
                      <Clock size={14}/>
                      <span>
                        {new Date(o.createdAt).toLocaleDateString(bn?'bn-BD':'en-GB')} · {t('Payment','পেমেন্ট')}: {o.paymentStatus.replaceAll('_',' ')}
                      </span>
                    </p>
                    <div className="order-items-grid">
                      {o.items.map((i,index)=>(
                        <div className="customer-order-items" key={index}>
                          <img src={i.image} alt={bn?i.nameBn:i.name}/>
                          <div className="order-item-copy">
                            <strong>{bn?i.nameBn:i.name}</strong>
                            <span className="order-item-qty">{t(`Qty: ${i.quantity}`,`পরিমাণ: ${i.quantity}`)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
