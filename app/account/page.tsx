'use client';
import {useEffect,useState,type FormEvent} from 'react';
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
  AlertCircle
} from 'lucide-react';

type Order={
  reference:string;
  status:string;
  paymentStatus:string;
  createdAt:string;
  total:number;
  items:{name:string;nameBn:string;image:string;quantity:number}[]
};

export default function Account(){
  const [bn,setBn]=useState(false);
  const [mode,setMode]=useState<'login'|'register'>('login');
  const [email,setEmail]=useState<string|null>(null);
  const [orders,setOrders]=useState<Order[]>([]);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [success,setSuccess]=useState('');
  const [showPass,setShowPass]=useState(false);
  const [showConfirmPass,setShowConfirmPass]=useState(false);

  const t=(en:string,b:string)=>bn?b:en;

  async function refresh(){
    const r=await fetch('/api/customer',{cache:'no-store'});
    const d=await r.json();
    if(!r.ok)throw new Error(d.error);
    setEmail(d.email);
    setOrders(d.orders);
  }

  useEffect(()=>{
    setBn(localStorage.getItem('cy-language')==='bn');
    refresh()
      .catch(e=>setError(e.message))
      .finally(()=>setLoading(false));
  },[]);

  async function handleSubmit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    const form=new FormData(e.currentTarget);
    const formEmail=String(form.get('email')||'').trim();
    const password=String(form.get('password')||'');
    const confirmPassword=String(form.get('confirmPassword')||'');

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
        ? {action:'register',email:formEmail,password}
        : {email:formEmail,password};

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
      setEmail(null);
      setOrders([]);
      setMode('login');
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

  return (
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
      ):!email?(
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
                  : t('Register in seconds to keep your delivery details saved and track your craft projects with ease.','সহজে অর্ডার ট্র্যাক ও সংরক্ষিত তথ্যে দ্রুত কেনাকাটা করতে যুক্ত হোন।')}
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

              <form onSubmit={handleSubmit} className="auth-form">
                <label>
                  <span>{t('Email address','ইমেইল ঠিকানা')}</span>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="username"
                    maxLength={254}
                    placeholder="name@example.com"
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
                <p className="customer-email-badge">{email}</p>
              </div>
              <button className="button outline logout-btn" disabled={busy} onClick={logout}>
                <LogOut size={16}/>
                <span>{t('Sign Out','লগআউট')}</span>
              </button>
            </div>
            <p className="customer-muted">
              {t('Below are the orders placed with your account. You can track their live status and see item breakdowns.','আপনার অ্যাকাউন্ট দিয়ে করা সমস্ত অর্ডার নিচে দেওয়া হলো।')}
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
  );
}
