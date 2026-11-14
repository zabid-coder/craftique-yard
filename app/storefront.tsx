'use client';
import {useState,useEffect,useRef,type ReactNode} from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  ShoppingBag,
  X,
  Plus,
  Minus,
  Check,
  ChevronDown,
  Leaf,
  Package,
  MessageCircle,
  Phone,
  Truck,
  Heart,
  Globe,
  Menu,
  Copy,
  CheckCircle2,
  UserRound,
  ShieldCheck,
  Flame,
  Download,
  Sparkles,
  Clock,
  AlertCircle,
  PackageCheck,
} from 'lucide-react';
import {type Product,type StoreSettings} from './lib/catalog';
import {BD_DISTRICTS} from './lib/districts';

type CartItem={id:string;quantity:number};
type Lang='en'|'bn';

const TRACKING_STEPS = [
  { key: 'pending', en: 'Order Placed', bn: 'অর্ডার গৃহীত' },
  { key: 'confirmed', en: 'Confirmed', bn: 'অর্ডার নিশ্চিত' },
  { key: 'processing', en: 'Packaging', bn: 'প্রস্তুত হচ্ছে' },
  { key: 'shipped', en: 'On The Way', bn: 'ডেলিভারিতে আছে' },
  { key: 'delivered', en: 'Delivered', bn: 'ডেলিভারি সম্পন্ন' },
];

export function Modal({children,onClose,title,className=''}:{children:ReactNode;onClose:()=>void;title:string;className?:string}){
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{
    ref.current?.showModal();
    const old=document.body.style.overflow;
    document.body.style.overflow='hidden';
    return()=>{document.body.style.overflow=old;};
  },[]);
  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      aria-label={title}
      onCancel={onClose}
      onClick={e=>{
        if(e.target===ref.current){
          const r=ref.current!.getBoundingClientRect();
          if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();
        }
      }}
    >
      <button className="modal-close icon-btn" onClick={onClose} aria-label="Close">
        <X size={22}/>
      </button>
      {children}
    </dialog>
  );
}

const SOCIAL_PROOF_ORDERS = [
  {
    nameEn: 'Tanjila',
    nameBn: 'তানজিলা',
    locEn: 'Mirpur, Dhaka',
    locBn: 'মিরপুর, ঢাকা',
    itemEn: 'Chenille Stems Craft Pack',
    itemBn: 'পাইপ ক্লিনার ক্রাফট প্যাক',
    timeEn: '3m ago',
    timeBn: '৩ মিনিট আগে',
    image: '/images/home-light-pink-a12-about-100.webp',
  },
  {
    nameEn: 'Sultana R.',
    nameBn: 'সুলতানা আর.',
    locEn: 'Uttara, Dhaka',
    locBn: 'উত্তরা, ঢাকা',
    itemEn: 'Bouquet Mesh & Ribbons',
    itemBn: 'বুকেট মেশ ও রিবন',
    timeEn: '7m ago',
    timeBn: '৭ মিনিট আগে',
    image: '/images/home-bouquet-yarn-2.webp',
  },
  {
    nameEn: 'Nafisa',
    nameBn: 'নাফিসা',
    locEn: 'Chittagong',
    locBn: 'চট্টগ্রাম',
    itemEn: 'Fairy Lights (Warm Glow)',
    itemBn: 'ফেয়ারি লাইট (ওয়ার্ম গ্লো)',
    timeEn: '12m ago',
    timeBn: '১২ মিনিট আগে',
    image: '/images/home-warm-light-2-meters.webp',
  },
  {
    nameEn: 'Farhana',
    nameBn: 'ফারহানা',
    locEn: 'Sylhet',
    locBn: 'সিলেট',
    itemEn: 'Floral Tape & Stamens',
    itemBn: 'ফ্লোরাল টেপ ও রেণু',
    timeEn: '18m ago',
    timeBn: '১৮ মিনিট আগে',
    image: '/images/home-light-green.webp',
  },
  {
    nameEn: 'Mehzabin',
    nameBn: 'মেহজাবিন',
    locEn: 'Dhanmondi, Dhaka',
    locBn: 'ধানমন্ডি, ঢাকা',
    itemEn: 'Bouquet Craft Bags',
    itemBn: 'বুকেট ক্রাফট ব্যাগ',
    timeEn: '24m ago',
    timeBn: '২৪ মিনিট আগে',
    image: '/images/home-flower-beg-1-pcs.webp',
  },
];

export function runCelebrationConfetti() {
  if (typeof window === 'undefined') return;
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const width = (canvas.width = window.innerWidth);
  const height = (canvas.height = window.innerHeight);

  const colors = ['#c86241', '#e07a5f', '#f4a261', '#2a9d8f', '#e76f51', '#e9c46a', '#3d5a80', '#98c1d9'];
  const pieces: {
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
    vx: number;
    vy: number;
    rot: number;
    vrot: number;
    opacity: number;
  }[] = [];

  for (let i = 0; i < 90; i++) {
    pieces.push({
      x: width * (0.2 + Math.random() * 0.6),
      y: height * 0.35 + (Math.random() - 0.5) * 60,
      w: Math.random() * 8 + 6,
      h: Math.random() * 12 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 16,
      vy: -(Math.random() * 14 + 8),
      rot: Math.random() * 360,
      vrot: (Math.random() - 0.5) * 12,
      opacity: 1,
    });
  }

  let animationFrame: number;
  const startTime = Date.now();

  function animate() {
    const elapsed = Date.now() - startTime;
    ctx!.clearRect(0, 0, width, height);

    let active = false;
    for (const p of pieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.45;
      p.vx *= 0.98;
      p.rot += p.vrot;

      if (elapsed > 2000) {
        p.opacity = Math.max(0, p.opacity - 0.02);
      }

      if (p.opacity > 0 && p.y < height + 50) {
        active = true;
        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate((p.rot * Math.PI) / 180);
        ctx!.globalAlpha = p.opacity;
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx!.restore();
      }
    }

    if (active && elapsed < 4000) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animationFrame);
      canvas.remove();
    }
  }

  animationFrame = requestAnimationFrame(animate);
}

export default function Storefront({products,settings}:{products:Product[];settings:StoreSettings}){
  const [lang,setLang]=useState<Lang>('en');
  const [cart,setCart]=useState<CartItem[]>([]);
  const [loaded,setLoaded]=useState(false);
  const [category,setCategory]=useState('All');
  const [query,setQuery]=useState('');
  const [sort,setSort]=useState('featured');
  const [limit,setLimit]=useState(12);
  const [selected,setSelected]=useState<Product|null>(null);
  const [modalQty,setModalQty]=useState(1);
  const [cartOpen,setCartOpen]=useState(false);
  const [checkout,setCheckout]=useState(false);
  const [info,setInfo]=useState<string|null>(null);
  const [toast,setToast]=useState('');
  const [menu,setMenu]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [receipt,setReceipt]=useState<{reference:string;total:number}|null>(null);
  const [payment,setPayment]=useState('cod');
  const [zone,setZone]=useState('dhaka');
  const [district,setDistrict]=useState('Dhaka');
  const [key,setKey]=useState('');
  const [trackResult,setTrackResult]=useState<any>(null);
  const [tracking,setTracking]=useState(false);

  // Social Proof States
  const [proofIndex,setProofIndex]=useState(0);
  const [showProof,setShowProof]=useState(false);
  const [proofPaused,setProofPaused]=useState(false);
  const [proofDismissed,setProofDismissed]=useState(false);

  const t=(en:string,bn:string)=>lang==='en'?en:bn;
  const money=(n:number)=>`৳${n.toLocaleString(lang==='bn'?'bn-BD':'en-BD',{maximumFractionDigits:2})}`;

  useEffect(()=>{
    if(proofDismissed)return;
    let hideTimer:NodeJS.Timeout;
    const interval=setInterval(()=>{
      if(!proofPaused){
        setShowProof(true);
        hideTimer=setTimeout(()=>{
          setShowProof(false);
          setProofIndex(i=>(i+1)%SOCIAL_PROOF_ORDERS.length);
        },5500);
      }
    },18000);

    const initialTimer=setTimeout(()=>{
      setShowProof(true);
      hideTimer=setTimeout(()=>{
        setShowProof(false);
        setProofIndex(i=>(i+1)%SOCIAL_PROOF_ORDERS.length);
      },5500);
    },3500);

    return()=>{
      clearInterval(interval);
      clearTimeout(initialTimer);
      clearTimeout(hideTimer);
    };
  },[proofPaused,proofDismissed]);

  useEffect(()=>{
    try{
      const l=localStorage.getItem('cy-language');
      if(l==='bn')setLang('bn');
      const stored=JSON.parse(localStorage.getItem('cy-cart')||'[]');
      if(Array.isArray(stored)){
        setCart(stored.filter(i=>typeof i.id==='string'&&Number.isInteger(i.quantity)&&i.quantity>0&&i.quantity<=500&&products.some(p=>p.id===i.id)));
      }
    }catch{}
    setLoaded(true);
    setKey(crypto.randomUUID());
    const p=new URLSearchParams(location.search).get('product');
    if(p)setSelected(products.find(p2=>p2.id===p)||null);
  },[products]);

  useEffect(()=>{
    if(loaded){
      localStorage.setItem('cy-cart',JSON.stringify(cart));
      localStorage.setItem('cy-language',lang);
      document.documentElement.lang=lang;
    }
  },[cart,lang,loaded]);

  useEffect(()=>{
    if(selected)setModalQty(1);
  },[selected]);

  useEffect(()=>{
    if(!toast)return;
    const timer=setTimeout(()=>setToast(''),2500);
    return()=>clearTimeout(timer);
  },[toast]);

  const count=cart.reduce((n,i)=>n+i.quantity,0);
  const cartProducts=cart.map(i=>({p:products.find(p=>p.id===i.id),quantity:i.quantity})).filter(i=>i.p) as {p:Product;quantity:number}[];
  const subtotal=cartProducts.reduce((n,i)=>n+i.p.price*i.quantity,0);
  const freeShippingThreshold=Number(settings.freeShippingThreshold??1500);
  const isFreeShipping=freeShippingThreshold>0&&subtotal>=freeShippingThreshold;
  const standardShipping=zone==='dhaka'?settings.insideDhaka:settings.outsideDhaka;
  const shipping=isFreeShipping?0:standardShipping;
  const categories=[...new Set(products.map(p=>p.category))];

  // Senior UX Fix: When user searches, search across all products globally so they never get a false 0-results page
  const isSearching = query.trim().length > 0;
  let filtered = products.filter(p => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !isSearching || `${p.name} ${p.nameBn} ${p.category} ${p.categoryBn}`.toLowerCase().includes(q);
    const matchesCategory = isSearching ? true : (category === 'All' || p.category === category);
    return matchesQuery && matchesCategory;
  });

  if(sort==='low')filtered.sort((a,b)=>a.price-b.price);
  else if(sort==='high')filtered.sort((a,b)=>b.price-a.price);

  function goShop(cat='All'){
    setCategory(cat);
    setQuery('');
    setLimit(12);
    setMenu(false);
    document.getElementById('shop')?.scrollIntoView({behavior:'smooth'});
  }

  function add(p:Product, qty=1){
    if(!p.available||p.stock===0)return;
    const current=cart.find(i=>i.id===p.id)?.quantity||0;
    const maxStock=Math.min(p.stock??500,500);
    if(current>=maxStock){
      setToast(t('Maximum available quantity reached.','সর্বোচ্চ পরিমাণ যোগ করা হয়েছে।'));
      return;
    }
    const addAmount=Math.min(qty,maxStock-current);
    setCart(c=>c.some(i=>i.id===p.id)?c.map(i=>i.id===p.id?{...i,quantity:i.quantity+addAmount}:i):[...c,{id:p.id,quantity:addAmount}]);
    setToast(t('Added to your bag','ব্যাগে যোগ করা হয়েছে'));
  }

  function buyNow(p:Product, qty=1){
    if(!p.available||p.stock===0)return;
    const targetQty=Math.min(Math.max(1,qty),Math.min(p.stock??500,500));
    setCart(c=>{
      if(c.some(i=>i.id===p.id)){
        return c.map(i=>i.id===p.id?{...i,quantity:Math.min(p.stock??500,i.quantity+targetQty)}:i);
      }
      return [...c,{id:p.id,quantity:targetQty}];
    });
    setSelected(null);
    setCartOpen(true);
    setCheckout(true);
    setError('');
    setReceipt(null);
    setPayment(settings.codEnabled?'cod':settings.bkashEnabled?'bkash':'nagad');
  }

  function update(id:string,delta:number){
    const p=products.find(p=>p.id===id);
    setCart(c=>c.map(i=>i.id===id?{...i,quantity:Math.min(Math.min(p?.stock??500,500),i.quantity+delta)}:i).filter(i=>i.quantity>0));
  }

  function handleDistrictChange(newDist:string){
    setDistrict(newDist);
    const d=BD_DISTRICTS.find(item=>item.en.toLowerCase()===newDist.toLowerCase()||item.bn===newDist);
    if(d){
      setZone(d.isDhaka?'dhaka':'outside');
    }
  }

  async function placeOrder(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setBusy(true);
    setError('');
    const form=new FormData(e.currentTarget);

    const rawPhone=String(form.get('phone')||'').trim();
    const cleanPhone=rawPhone.replace(/^(\+?88)?0?/, '0').replace(/[\s\-\(\)]/g, '');
    if(!/^01\d{9}$/.test(cleanPhone)){
      setError(t('Please enter a valid 11-digit mobile number (e.g. 01XXXXXXXXX).','সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)।'));
      setBusy(false);
      return;
    }

    const payloadObj=Object.fromEntries(form);
    payloadObj.phone=cleanPhone;
    payloadObj.district=district;

    try{
      const response=await fetch('/api/orders',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          ...payloadObj,
          checkoutKey:key,
          payment,
          zone,
          items:cart.map(i=>({id:i.id,quantity:i.quantity}))
        })
      });
      const data=await response.json();
      if(!response.ok)throw new Error(data.error);
      setReceipt(data);
      runCelebrationConfetti();
      setCart([]);
      setKey(crypto.randomUUID());
    }catch(err){
      setError(err instanceof Error?err.message:t('Could not save your order. Please try again.','অর্ডার সংরক্ষণ হয়নি। আবার চেষ্টা করুন।'));
    }finally{
      setBusy(false);
    }
  }

  async function track(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setTracking(true);
    setError('');
    setTrackResult(null);
    const f=new FormData(e.currentTarget);
    let rawRef=String(f.get('reference')||'').trim().toUpperCase();
    if(!rawRef.startsWith('CY-') && rawRef.length > 5){
      rawRef = 'CY-' + rawRef.replace(/^CY-?/i, '');
    }
    const rawPhone=String(f.get('phone')||'').trim();
    const cleanPhone=rawPhone.replace(/^(\+?88)?0?/, '0').replace(/[\s\-\(\)]/g, '');
    try{
      const r=await fetch('/api/track',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          reference:rawRef,
          phone:cleanPhone
        })
      });
      const d=await r.json();
      if(!r.ok)throw new Error(d.error);
      setTrackResult(d);
    }catch(err){
      setError((err as Error).message);
    }finally{
      setTracking(false);
    }
  }

  const whatsapp=(text?:string)=>`https://wa.me/${settings.whatsapp}${text?'?text='+encodeURIComponent(text):''}`;
  const messenger=`https://m.me/${settings.messenger}`;
  const statusLabels:Record<string,[string,string]>={
    pending:['Awaiting Confirmation','নিশ্চিত করার অপেক্ষায়'],
    confirmed:['Order Confirmed','অর্ডার নিশ্চিত হয়েছে'],
    processing:['Preparing Your Order','অর্ডার প্রস্তুত হচ্ছে'],
    shipped:['Shipped / On The Way','পাঠানো হয়েছে (পথে আছে)'],
    delivered:['Delivered Successfully','ডেলিভারি সম্পন্ন হয়েছে'],
    cancelled:['Cancelled','বাতিল হয়েছে'],
    unpaid:['Cash On Delivery / Unpaid','ক্যাশ অন ডেলিভারি'],
    verification_pending:['Payment Verification Pending','পেমেন্ট যাচাই চলছে'],
    paid:['Paid in Full','পরিশোধিত'],
    refunded:['Refunded','ফেরত দেওয়া হয়েছে']
  };

  return (
    <>
      <a className="skip-link" href="#shop">{t('Skip to products','পণ্যের তালিকায় যান')}</a>
      
      {/* Top Announcement Bar */}
      <div className="announcement">
        <span className="announce-left">
          <Sparkles size={13}/>
          <span>{t('A little material. A lot of possibility.','ছোট্ট উপকরণে, অসীম সৃষ্টির সম্ভাবনা।')}</span>
        </span>
        <span className="announce-center">
          <span>{t('✨ Free Delivery across Bangladesh on orders ৳1,500+','✨ ১,৫০০+ টাকার অর্ডারে সারা দেশে ডেলিভারি সম্পূর্ণ ফ্রি')}</span>
        </span>
        <span className="announce-right">
          <Truck size={13}/>
          <span>{t('Cash On Delivery Available','ক্যাশ অন ডেলিভারি সুবিধা')}</span>
        </span>
      </div>

      {/* Sticky Boutique Header */}
      <header className="site-header">
        <a className="brand" href="#" aria-label="Craftique Yard home">
          <img src="/images/logo.jpg" alt="Craftique Yard" width={52} height={52}/>
          <span className="brand-text">
            <span className="brand-title">CRAFTIQUE</span>
            <span className="yard">YARD</span>
          </span>
        </a>
        <nav className={menu?'nav open':'nav'} aria-label="Main navigation">
          <button onClick={()=>goShop()}>{t('The Collection','আমাদের কালেকশন')}</button>
          <button onClick={()=>goShop('Chenille stems')}>{t('Chenille Stems','পাইপ ক্লিনার')}</button>
          <button onClick={()=>goShop('Ribbons')}>{t('Ribbons & Mesh','রিবন ও মেশ')}</button>
          <a href="#our-story" onClick={()=>setMenu(false)}>{t('Our Story','আমাদের গল্প')}</a>
          <button className="nav-track-btn" onClick={()=>{setInfo('track');setError('');setTrackResult(null);setMenu(false);}}>
            <PackageCheck size={14}/>
            <span>{t('Track Order','অর্ডার ট্র্যাক')}</span>
          </button>
        </nav>
        <div className="header-actions">
          <a className="account-link" href="/account" aria-label={t('My account','আমার account')}>
            <UserRound size={19}/>
            <span>{t('Account','Account')}</span>
          </a>
          <button className="language-btn" onClick={()=>setLang(l=>l==='en'?'bn':'en')} aria-label="Switch language">
            <Globe size={15}/>
            {lang==='en'?'বাংলা':'EN'}
          </button>
          <button className="icon-btn search-open" aria-label={t('Search products','পণ্য খুঁজুন')} onClick={()=>{goShop();setTimeout(()=>document.getElementById('product-search')?.focus(),300);}}>
            <Search size={19}/>
          </button>
          <button className="bag-btn" onClick={()=>{setCartOpen(true);setCheckout(false);setReceipt(null);setError('');}} aria-label={`${t('Shopping bag','শপিং ব্যাগ')} (${count})`}>
            <ShoppingBag size={19}/>
            <span className="bag-badge">{count}</span>
          </button>
          <button className="icon-btn mobile-menu" aria-label="Toggle menu" aria-expanded={menu} onClick={()=>setMenu(!menu)}>
            {menu?<X size={22}/>:<Menu size={22}/>}
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="tiny-star">✳</span>{t('FOR THE LOVE OF MAKING','সৃষ্টির ভালোবাসায়')}
            </div>
            <h1>{t('Little things.','ছোট ছোট উপকরণ।')}<br/><em>{t('Beautiful possibilities.','সুন্দর সব সম্ভাবনা।')}</em></h1>
            <p>{t('Thoughtfully chosen craft supplies for the ideas you can’t wait to bring to life. A ribbon, a stem, a little spark. Make it yours.','তোমার মনের ভাবনাকে রূপ দিতে যত্নে বাছাই করা ক্রাফট সামগ্রী। একটা রিবন, একটা স্টেম, একটু আলো—তৈরি হোক তোমার নিজের সৃষ্টি।')}</p>
            <div className="hero-cta-wrap">
              <button className="button primary hero-shop-btn" onClick={()=>goShop()}>
                {t('Shop the collection','কালেকশন থেকে কিনুন')}
                <ArrowUpRight size={18}/>
              </button>
              <a className="button outline hero-wa-btn" href={whatsapp(t('Hello! I would like to place an order.','হ্যালো Craftique Yard! আমি অর্ডার করতে চাই।'))} target="_blank" rel="noreferrer">
                <MessageCircle size={18}/>
                <span>{t('Order on WhatsApp','WhatsApp-এ অর্ডার')}</span>
              </a>
            </div>
            <div className="hero-footnote">
              <div className="line-leaf"><Leaf size={22}/></div>
              <span>
                {t('Importing quality. Creating beauty.','মানসম্মত উপকরণে, সুন্দর সৃষ্টি।')}
                <small>{t('Wholesale & retail · Cash on Delivery across Bangladesh','পাইকারি ও খুচরা · সারা বাংলাদেশে ক্যাশ অন ডেলিভারি')}</small>
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <img className="hero-image" src="/images/hero.webp" alt={t('Craft styling inspiration: pastel chenille stems, ribbon and floral tape','সৃষ্টির অনুপ্রেরণা: রঙিন পাইপ ক্লিনার, রিবন ও ফ্লোরাল টেপ')} fetchPriority="high"/>
            <div className="hero-caption">
              <span>{t('THE MAKER’S LITTLE CORNER','সৃজনশীলতার ছোট্ট কোণ')}</span>
              <span>Craftique Yard <span className="caption-star">✳</span></span>
            </div>
            {/* Redesigned Luxury Artisanal Badge */}
            <div className="hero-stamp" aria-label="A little handmade happiness emblem">
              <svg className="stamp-svg" viewBox="0 0 120 120" aria-hidden="true">
                <defs>
                  <path
                    id="heroStampPath"
                    d="M 60,60 m -44,0 a 44,44 0 1,1 88,0 a 44,44 0 1,1 -88,0"
                  />
                </defs>
                <text className="stamp-curved-text">
                  <textPath href="#heroStampPath" startOffset="0%">
                    ✦ A LITTLE HANDMADE HAPPINESS ✦ CRAFTIQUE YARD
                  </textPath>
                </text>
              </svg>
              <div className="stamp-core">
                <div className="stamp-inner-ring">
                  <Heart size={17} className="stamp-heart-icon" />
                  <span className="stamp-sub-text">{t('HANDMADE', 'হ্যান্ডমেড')}</span>
                  <span className="stamp-dot-divider">✦ EST. 2024 ✦</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges Strip */}
        <div className="mobile-trust-strip">
          <div className="trust-item">
            <ShieldCheck size={22}/>
            <div>
              <strong>{t('Cash On Delivery','ক্যাশ অন ডেলিভারি')}</strong>
              <small>{t('Pay upon receiving parcel','পণ্য হাতে পেয়ে টাকা দিন')}</small>
            </div>
          </div>
          <div className="trust-item">
            <Truck size={22}/>
            <div>
              <strong>{t('Fast Home Delivery','দ্রুত হোম ডেলিভারি')}</strong>
              <small>{t('Across Bangladesh in 2-3 days','সারা বাংলাদেশে ২-৩ দিনে')}</small>
            </div>
          </div>
          <div className="trust-item">
            <Package size={22}/>
            <div>
              <strong>{t('Inspect Before Pay','দেখে নেওয়ার সুবিধা')}</strong>
              <small>{t('Check parcel with courier rider','ডেলিভারিম্যানের সামনে দেখে নিন')}</small>
            </div>
          </div>
          <div className="trust-item">
            <MessageCircle size={22}/>
            <div>
              <strong>{t('Instant Support','ইনস্ট্যান্ট সহায়তা')}</strong>
              <small>{t('WhatsApp & Call 24/7','WhatsApp ও কল সহায়তা')}</small>
            </div>
          </div>
        </div>

        {/* Benefits bar */}
        <div className="benefits">
          <div><Package size={21}/><span>{t('Thoughtfully sourced','যত্নে বাছাই করা')}<small>{t('Craft materials from China','চীন থেকে সরাসরি আমদানি করা')}</small></span></div>
          <div><Truck size={21}/><span>{t('Across Bangladesh','সারা বাংলাদেশে')}<small>{t(`Dhaka ${money(settings.insideDhaka)} · Outside ${money(settings.outsideDhaka)}`,`ঢাকা ${money(settings.insideDhaka)} · বাইরে ${money(settings.outsideDhaka)}`)}</small></span></div>
          <div><MessageCircle size={21}/><span>{t('A little help, always','পাশে আছি সবসময়')}<small>{t('WhatsApp & Messenger support','WhatsApp ও Messenger সহায়তা')}</small></span></div>
          <div><Heart size={21}/><span>{t('Small ideas, big orders','ছোট ভাবনা, বড় অর্ডার')}<small>{t('For hobbyists & small businesses','শখের কাজ ও ছোট ব্যবসার জন্য')}</small></span></div>
        </div>

        {/* Categories Showcase */}
        <section className="category-section section-wrap">
          <div className="section-top">
            <div>
              <div className="eyebrow">{t('FIND YOUR NEXT INSPIRATION','তোমার পরের সৃষ্টির অনুপ্রেরণা')}</div>
              <h2>{t('A world of little wonders','ছোট্ট সব সুন্দর উপকরণ')}</h2>
            </div>
            <button className="text-link" onClick={()=>goShop()}>{t('Shop everything','সব পণ্য দেখো')}<ArrowUpRight size={18}/></button>
          </div>
          <div className="category-grid">
            {[
              {cat:'Chenille stems',bn:'পাইপ ক্লিনার',tag:'BEND. TWIST. BLOOM.',bnTag:'বাঁকাও, গড়ো, ফুটিয়ে তোলো।',img:'/images/home-light-pink-a12-about-100.webp',cls:'pink'},
              {cat:'Ribbons',bn:'রিবন',tag:'THE PERFECT FINISHING TOUCH',bnTag:'সুন্দর সমাপ্তির ছোঁয়া',img:'/images/home-just-for-you-ribbon-off-white.webp',cls:'sand'},
              {cat:'Wrapping paper',bn:'র‍্যাপিং পেপার',tag:'WRAP IT WITH LOVE',bnTag:'ভালোবাসায় মুড়িয়ে দাও',img:'/images/home-warping-papercoming-soon.webp',cls:'sage'},
              {cat:'Bouquet bags',bn:'বুকেট ব্যাগ',tag:'A LITTLE SOMETHING SPECIAL',bnTag:'বিশেষ কিছুর জন্য',img:'/images/home-flower-beg-1-pcs.webp',cls:'peach'}
            ].map(c=>(
              <button className={`category-card ${c.cls}`} key={c.cat} onClick={()=>goShop(c.cat)}>
                <div className="category-image">
                  <img src={c.img} alt={t(c.cat,c.bn)} loading="lazy"/>
                </div>
                <div className="category-caption">
                  <span>
                    <small>{t(c.tag,c.bnTag)}</small>
                    <strong>{t(c.cat,c.bn)}</strong>
                  </span>
                  <span className="round-arrow"><ArrowUpRight size={18}/></span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Catalog Shop Section */}
        <section id="shop" className="shop-section section-wrap">
          <div className="section-top">
            <div>
              <div className="eyebrow">{t('YOUR NEXT PROJECT STARTS HERE','তোমার পরের প্রজেক্ট শুরু হোক এখানেই')}</div>
              <h2>{t('The collection','আমাদের কালেকশন')}</h2>
              <p className="section-subtitle">{t('Little essentials. Endless ways to make them yours.','ছোট্ট সব উপকরণ। নিজের মতো করে গড়ার অসীম সুযোগ।')}</p>
            </div>
            <span className="collection-note">{t('A thoughtful find for every maker.','প্রতিটি সৃজনশীল মনের জন্য।')}<Leaf size={23}/></span>
          </div>

          {/* Search & Sort Controls */}
          <div className="catalog-controls">
            <div className="search-box">
              <Search size={18}/>
              <input
                id="product-search"
                value={query}
                onChange={e=>{setQuery(e.target.value);setLimit(12);}}
                placeholder={t('Find by name, color, category…','পছন্দের উপকরণ বা রঙ খুঁজুন…')}
                aria-label={t('Search products','পণ্য খুঁজুন')}
              />
              {query&&(
                <button className="icon-btn search-clear" aria-label="Clear search" onClick={()=>setQuery('')}>
                  <X size={16}/>
                </button>
              )}
            </div>
            <select aria-label={t('Sort products','পণ্য সাজান')} value={sort} onChange={e=>setSort(e.target.value)}>
              <option value="featured">{t('Best Selling & Featured','বেস্ট সেলার ও নির্বাচিত')}</option>
              <option value="low">{t('Price: Low to High','দাম: কম থেকে বেশি')}</option>
              <option value="high">{t('Price: High to Low','দাম: বেশি থেকে কম')}</option>
            </select>
          </div>

          {/* Search Result Banner (Senior UX Polish) */}
          {isSearching&&(
            <div className="search-status-bar">
              <span>{t(`Showing ${filtered.length} finds for "${query}"`,`"${query}" এর জন্য ${filtered.length.toLocaleString('bn-BD')}টি উপকরণ পাওয়া গেছে`)}</span>
              <button className="clear-search-chip" onClick={()=>setQuery('')}>
                {t('Clear search','ফিল্টার মুছুন')} <X size={13}/>
              </button>
            </div>
          )}

          {/* Category Tabs */}
          <div className="category-tabs-container">
            <div className="category-tabs" aria-label="Product categories">
              {['All',...categories].map(c=>(
                <button
                  key={c}
                  aria-pressed={category===c}
                  className={category===c?'active':''}
                  onClick={()=>{setCategory(c);setLimit(12);}}
                >
                  {c==='All'?t('All Collections','সব উপকরণ'):t(c,products.find(p=>p.category===c)!.categoryBn)}
                </button>
              ))}
            </div>
          </div>

          <div className="results-count">
            {t(`${filtered.length} lovely finds`,`${filtered.length.toLocaleString('bn-BD')}টি সুন্দর উপকরণ`)}
          </div>

          {/* Product Grid */}
          <div className="product-grid">
            {filtered.slice(0,limit).map(p=>(
              <article className="product-card" key={p.id}>
                <button className="product-image" onClick={()=>setSelected(p)} aria-label={t(`View ${p.name}`,`${p.nameBn} দেখুন`)}>
                  <img src={p.image} alt={t(p.name,p.nameBn)} loading="lazy"/>
                  {(!p.available||p.stock===0)?(
                    <span className="product-badge out-of-stock">{t('Restocking soon','শীঘ্রই আসছে')}</span>
                  ):p.stock!==null&&p.stock<=5&&p.stock>0?(
                    <span className="product-badge low-stock">
                      <Flame size={12}/>
                      {t(`Only ${p.stock} left`,`মাত্র ${p.stock.toLocaleString('bn-BD')}টি বাকি`)}
                    </span>
                  ):p.bestSeller&&(
                    <span className="product-badge bestseller">
                      <Flame size={12}/>
                      {t('Best Seller','বেস্ট সেলার')}
                    </span>
                  )}
                  <span className="quick-view">{t('Quick view','বিস্তারিত দেখো')}<ArrowUpRight size={15}/></span>
                </button>
                <div className="product-copy">
                  <span className="product-category">{t(p.category,p.categoryBn)}</span>
                  <button className="product-name" onClick={()=>setSelected(p)} title={t(p.name,p.nameBn)}>
                    {t(p.name,p.nameBn)}
                  </button>
                  <div className="product-bottom">
                    <div className="price-container">
                      <span className="price">{money(p.price)}</span>
                      {p.stock!==null&&p.stock<=5&&p.stock>0?(
                        <span className="stock-alert urgent-stock">
                          🔥 {t(`Only ${p.stock} left in batch!`,`মাত্র ${p.stock.toLocaleString('bn-BD')}টি বাকি আছে!`)}
                        </span>
                      ):p.stock!==null&&p.stock<=10&&p.stock>0?(
                        <span className="stock-alert">{t(`Only ${p.stock} left`,'সীমিত স্টক')}</span>
                      ):null}
                    </div>
                    <div className="product-actions">
                      <button
                        className="buy-now-btn"
                        aria-label={t(`Order ${p.name} now`,`${p.nameBn} এখনই অর্ডার করুন`)}
                        onClick={()=>buyNow(p,1)}
                        disabled={!p.available||p.stock===0}
                      >
                        <span>{(!p.available||p.stock===0)?t('Restocking','শীঘ্রই আসছে'):t('Order Now','অর্ডার করুন')}</span>
                        <ArrowRight size={14}/>
                      </button>
                      <button
                        className="add-bag-icon"
                        aria-label={t(`Add ${p.name} to bag`,`${p.nameBn} ব্যাগে রাখুন`)}
                        onClick={()=>add(p)}
                        disabled={!p.available||p.stock===0}
                        title={t('Add to bag','ব্যাগে যোগ করুন')}
                      >
                        <ShoppingBag size={17}/>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filtered.length===0&&(
            <div className="empty-state">
              <Search size={36}/>
              <h3>{t('Nothing here just yet','পছন্দের উপকরণটি পাওয়া যায়নি')}</h3>
              <p>{t('Try searching with another name or explore all materials.','অন্য নামে খুঁজে দেখুন অথবা আমাদের সব কালেকশন ঘুরে দেখুন।')}</p>
              <button className="button outline" onClick={()=>{setQuery('');setCategory('All');}}>
                {t('See all products','সব পণ্য দেখুন')}
              </button>
            </div>
          )}

          {limit<filtered.length&&(
            <div className="load-more">
              <button className="button outline" onClick={()=>setLimit(l=>l+12)}>
                {t('More little wonders','আরও উপকরণ দেখুন')}
                <ChevronDown size={18}/>
              </button>
              <span>{t(`Showing ${Math.min(limit,filtered.length)} of ${filtered.length}`,`${filtered.length.toLocaleString('bn-BD')}টির মধ্যে ${Math.min(limit,filtered.length).toLocaleString('bn-BD')}টি দেখানো হচ্ছে`)}</span>
            </div>
          )}
        </section>

        {/* Story Section */}
        <section className="story-section" id="our-story">
          <div className="story-visual">
            <img src="/images/craft-materials.jpg" alt={t('Colourful chenille craft supplies at Craftique Yard','Craftique Yard-এর রঙিন ক্রাফট উপকরণ')} loading="lazy"/>
            <div className="story-paper">
              <Leaf size={27}/>
              <em>Made of little things.<br/>Made for big ideas.</em>
            </div>
          </div>
          <div className="story-copy">
            <div className="eyebrow">{t('HELLO, WE’RE CRAFTIQUE YARD','হ্যালো, আমরা Craftique Yard')}</div>
            <h2>{t('For the makers.','সৃজনশীল মনের জন্য।')}<br/><em>{t('The dreamers. The doers.','যারা ভাবেন, যারা গড়েন।')}</em></h2>
            <p>{t('We believe the most beautiful things begin with a simple idea and the right little materials. From colourful chenille stems to the ribbon that ties it all together, we bring craft supplies from China to your creative corner in Bangladesh.','আমরা বিশ্বাস করি, সুন্দর সব সৃষ্টি শুরু হয় একটা সহজ ভাবনা আর সঠিক উপকরণ দিয়ে। রঙিন পাইপ ক্লিনার থেকে শেষের রিবন—চীন থেকে ক্রাফটের উপকরণ পৌঁছে দিই বাংলাদেশের তোমার সৃজনশীল কোণে।')}</p>
            <p>{t('A first handmade flower. A thoughtful gift. The start of your small business. Whatever you’re making, we’re happy to be a little part of it.','প্রথম হাতে বানানো ফুল। যত্নের উপহার। তোমার ছোট ব্যবসার শুরু। তুমি যা-ই তৈরি করো, তার ছোট্ট একটা অংশ হতে চাই আমরা।')}</p>
            <a className="text-link" href="https://www.facebook.com/people/Craftique-Yard/61592911649087/" target="_blank" rel="noreferrer">
              {t('Meet us on Facebook','Facebook-এ দেখা হোক')}
              <ArrowUpRight size={18}/>
            </a>
          </div>
        </section>

        {/* Help & Contact Section */}
        <section className="help-section section-wrap">
          <div>
            <div className="eyebrow">{t('LET’S MAKE SOMETHING LOVELY','একসঙ্গে সুন্দর কিছু গড়ি')}</div>
            <h2>{t('A little help goes a long way.','একটু সহায়তা, অনেকটা পথ।')}</h2>
            <p>{t('Choosing a colour? Planning a bulk order? Just say hello.','রং বাছাই করতে চান? পাইকারি বা Bulk order-এর পরিকল্পনা? সরাসরি কথা বলুন।')}</p>
          </div>
          <div className="help-actions">
            <a className="button primary" href={whatsapp()} target="_blank" rel="noreferrer">
              <MessageCircle size={18}/>
              {t('Chat on WhatsApp','WhatsApp-এ কথা বলুন')}
            </a>
            <a className="button outline" href={messenger} target="_blank" rel="noreferrer">
              Messenger<ArrowUpRight size={17}/>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            <a className="brand" href="#">
              <img src="/images/logo.jpg" alt="Craftique Yard" width={65} height={65}/>
              <span>CRAFTIQUE <span className="yard">YARD</span></span>
            </a>
            <p>
              {t('Importing quality. Creating beauty.','মানসম্মত উপকরণে, সুন্দর সৃষ্টি।')}<br/>
              {t('Craft supplies & a little everyday inspiration.','ক্রাফটের উপকরণ আর প্রতিদিনের একটু অনুপ্রেরণা।')}
            </p>
          </div>
          <div>
            <h4>{t('EXPLORE','ঘুরে দেখুন')}</h4>
            <button onClick={()=>goShop()}>{t('The collection','আমাদের কালেকশন')}</button>
            <a href="#our-story">{t('Our story','আমাদের গল্প')}</a>
            <button onClick={()=>{setInfo('track');setError('');setTrackResult(null);}}>{t('Track your order','অর্ডার ট্র্যাক')}</button>
            <a href="/admin">{t('Store dashboard','স্টোর ড্যাশবোর্ড')}</a>
          </div>
          <div>
            <h4>{t('GOOD TO KNOW','জেনে রাখুন')}</h4>
            <button onClick={()=>setInfo('delivery')}>{t('Delivery & payments','ডেলিভারি ও পেমেন্ট')}</button>
            <button onClick={()=>setInfo('returns')}>{t('Returns & exchange','রিটার্ন ও এক্সচেঞ্জ নীতি')}</button>
            <button onClick={()=>setInfo('privacy')}>{t('Privacy policy','গোপনীয়তা নীতি')}</button>
          </div>
          <div>
            <h4>{t('CUSTOMER SUPPORT','সরাসরি যোগাযোগ')}</h4>
            <a href={`tel:${settings.phone.replace(/\D/g,'')}`}><Phone size={14}/>{settings.phone}</a>
            <a href={`mailto:${settings.email}`}>{settings.email}</a>
            <p>{settings.address}</p>
            <div className="footer-social">
              <a href={whatsapp()} target="_blank" rel="noreferrer">WhatsApp ↗</a>
              <a href={messenger} target="_blank" rel="noreferrer">Messenger ↗</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Craftique Yard. {t('Made for your imagination.','তোমার সৃজনশীলতার জন্য।')}</span>
          <div className="payment-chips">
            {settings.codEnabled&&<span>Cash on delivery</span>}
            {settings.bkashEnabled&&<span>bKash</span>}
            {settings.nagadEnabled&&<span>Nagad</span>}
          </div>
        </div>
      </footer>

      {/* Desktop Floating WhatsApp Support */}
      <a className="floating-help" href={whatsapp()} target="_blank" rel="noreferrer" aria-label="WhatsApp support">
        <MessageCircle size={24}/>
        <span className="floating-help-tooltip">{t('Chat with us','মেসেজ করুন')}</span>
      </a>

      {/* Live Social Proof Purchase Ticker */}
      {showProof && !proofDismissed && (
        <aside
          className="social-proof-toast"
          role="status"
          aria-live="polite"
          onMouseEnter={()=>setProofPaused(true)}
          onMouseLeave={()=>setProofPaused(false)}
        >
          <img
            src={SOCIAL_PROOF_ORDERS[proofIndex].image}
            alt={lang==='bn'?SOCIAL_PROOF_ORDERS[proofIndex].itemBn:SOCIAL_PROOF_ORDERS[proofIndex].itemEn}
            className="proof-thumb"
            width={44}
            height={44}
          />
          <div className="proof-content">
            <div className="proof-title">
              <strong>{lang==='bn'?SOCIAL_PROOF_ORDERS[proofIndex].nameBn:SOCIAL_PROOF_ORDERS[proofIndex].nameEn}</strong>
              <span className="proof-loc">({lang==='bn'?SOCIAL_PROOF_ORDERS[proofIndex].locBn:SOCIAL_PROOF_ORDERS[proofIndex].locEn})</span>
            </div>
            <p className="proof-action">
              {lang==='bn'?'অর্ডার করেছেন: ':'Purchased: '}
              <span className="proof-item">{lang==='bn'?SOCIAL_PROOF_ORDERS[proofIndex].itemBn:SOCIAL_PROOF_ORDERS[proofIndex].itemEn}</span>
            </p>
            <div className="proof-meta">
              <span className="proof-time">
                <Clock size={11}/>
                <span>{lang==='bn'?SOCIAL_PROOF_ORDERS[proofIndex].timeBn:SOCIAL_PROOF_ORDERS[proofIndex].timeEn}</span>
              </span>
              <span className="verified-buyer-tag">
                <CheckCircle2 size={11}/>
                <span>{lang==='bn'?'যাচাইকৃত ক্রেতা':'Verified Buyer'}</span>
              </span>
            </div>
          </div>
          <button
            type="button"
            className="proof-close"
            onClick={()=>{
              setShowProof(false);
              setProofDismissed(true);
            }}
            aria-label="Dismiss notification"
          >
            <X size={14}/>
          </button>
        </aside>
      )}

      {/* Sticky Mobile Bottom Bar */}
      <div className="mobile-bottom-bar" aria-label="Quick mobile navigation">
        {count > 0 ? (
          <div className="mobile-cart-summary">
            <button className="cart-trigger" onClick={()=>{setCartOpen(true);setCheckout(false);}}>
              <div className="cart-badge-wrap">
                <ShoppingBag size={20}/>
                <span className="badge-num">{count}</span>
              </div>
              <div className="cart-text-wrap">
                <span className="cart-item-count">{t(`${count} items in bag`,`ব্যাগে ${count.toLocaleString('bn-BD')}টি পণ্য`)}</span>
                <div className="cart-subtotal-row">
                  <strong className="cart-subtotal">{money(subtotal)}</strong>
                  {isFreeShipping ? (
                    <span className="mobile-free-shipping-tag">🚚 {t('FREE Delivery','ফ্রি ডেলিভারি')}</span>
                  ) : freeShippingThreshold > 0 && (
                    <span className="mobile-shipping-hint">
                      {t(`+${money(freeShippingThreshold-subtotal)} for free delv.`,`আর ${money(freeShippingThreshold-subtotal)} এ ফ্রি ডেলিভারি`)}
                    </span>
                  )}
                </div>
              </div>
            </button>
            <button className="cart-order-btn" onClick={()=>{setCartOpen(true);setCheckout(true);setReceipt(null);}}>
              <span>{t('Checkout','অর্ডার করুন')}</span>
              <ArrowRight size={17}/>
            </button>
          </div>
        ) : (
          <div className="mobile-nav-bar">
            <button onClick={()=>goShop()} className="mobile-nav-item">
              <ShoppingBag size={18}/>
              <span>{t('Collection','কালেকশন')}</span>
            </button>
            <a
              href={whatsapp(t('Hello! I want to inquire about craft supplies.','হ্যালো! আমি ক্রাফটের উপকরণ সম্পর্কে জানতে চাই।'))}
              target="_blank"
              rel="noreferrer"
              className="mobile-nav-item whatsapp"
            >
              <MessageCircle size={18}/>
              <span>{t('WhatsApp','হোয়াটসঅ্যাপ')}</span>
            </a>
            <a href={`tel:${settings.phone.replace(/\D/g,'')}`} className="mobile-nav-item call">
              <Phone size={18}/>
              <span>{t('Call Us','সরাসরি কল')}</span>
            </a>
          </div>
        )}
      </div>

      {toast&&<div className="toast" role="status"><Check size={17}/>{toast}</div>}

      {/* Boutique Product Detail Showcase Modal */}
      {selected&&(
        <Modal title={t(selected.name,selected.nameBn)} onClose={()=>setSelected(null)} className="product-modal">
          <div className="detail-image">
            <img src={selected.image} alt={t(selected.name,selected.nameBn)}/>
          </div>
          <div className="detail-copy">
            <div className="eyebrow">{t(selected.category,selected.categoryBn)}</div>
            <h2>{t(selected.name,selected.nameBn)}</h2>
            
            <div className="detail-price-row">
              <span className="detail-price">{money(selected.price)}</span>
              {selected.stock!==null&&selected.available?(
                <span className="detail-stock-badge in-stock">
                  <Check size={13}/>
                  {t(`${selected.stock} units available`,`${selected.stock.toLocaleString('bn-BD')} পিস মজুত আছে`)}
                </span>
              ):(!selected.available||selected.stock===0)?(
                <span className="detail-stock-badge out-stock">
                  <Clock size={13}/>
                  {t('Restocking soon','শীঘ্রই আসছে')}
                </span>
              ):null}
            </div>

            {selected.stock!==null&&selected.stock<=5&&selected.stock>0&&(
              <div className="modal-urgent-stock-banner">
                <Flame size={15}/>
                <span>
                  {t(
                    `Limited Handcrafted Batch: Only ${selected.stock} units left in stock!`,
                    `হাতে তৈরি সীমিত সংস্করণ: স্টকে মাত্র ${selected.stock.toLocaleString('bn-BD')}টি বাকি আছে!`
                  )}
                </span>
              </div>
            )}

            <p className="detail-desc">{t(selected.description,selected.descriptionBn)}</p>

            {/* Estimated Delivery Note */}
            <div className="delivery-estimate-card">
              <Truck size={17}/>
              <div>
                <strong>{t('Fast Home Delivery:','হোম ডেলিভারি:')}</strong>
                <span>{t(`Dhaka ${money(settings.insideDhaka)} (1-2 days) · Outside ${money(settings.outsideDhaka)} (2-3 days)`,`ঢাকা ${money(settings.insideDhaka)} (১-২ দিন) · ঢাকার বাইরে ${money(settings.outsideDhaka)} (২-৩ দিন)`)}</span>
              </div>
            </div>

            {/* Quantity Stepper */}
            {selected.available&&selected.stock!==0&&(
              <div className="modal-qty-container">
                <span className="modal-qty-label">{t('Quantity:','পরিমাণ:')}</span>
                <div className="quantity-stepper">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={()=>setModalQty(q=>Math.max(1,q-1))}
                    disabled={modalQty<=1}
                  >
                    <Minus size={15}/>
                  </button>
                  <span className="stepper-val">{modalQty}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={()=>setModalQty(q=>Math.min(selected.stock??500,q+1))}
                    disabled={modalQty>=(selected.stock??500)}
                  >
                    <Plus size={15}/>
                  </button>
                </div>
                <span className="subtotal-preview">
                  {t('Subtotal: ','মোট: ')}<strong>{money(selected.price*modalQty)}</strong>
                </span>
              </div>
            )}

            {/* Primary & Secondary CTAs */}
            <div className="modal-cta-group">
              <button
                className="button primary wide buy-now-primary"
                disabled={!selected.available||selected.stock===0}
                onClick={()=>buyNow(selected,modalQty)}
              >
                <span>
                  {selected.available&&selected.stock!==0
                    ? t('Order Now (Cash On Delivery)','এখনই অর্ডার করুন (ক্যাশ অন ডেলিভারি)')
                    : t('Restocking soon','শীঘ্রই আবার আসছে')}
                </span>
                <ArrowRight size={18}/>
              </button>
              <button
                className="button outline wide add-bag-secondary"
                disabled={!selected.available||selected.stock===0}
                onClick={()=>{
                  add(selected,modalQty);
                  setSelected(null);
                }}
              >
                <ShoppingBag size={18}/>
                <span>{t('Add to Bag','ব্যাগে যোগ করুন')}</span>
              </button>
            </div>

            {/* WhatsApp Direct Order Button */}
            <a
              className="whatsapp-order-btn"
              href={whatsapp(
                lang==='bn'
                  ? `হ্যালো Craftique Yard! আমি এই পণ্যটি অর্ডার করতে চাই:\n- পণ্য: ${selected.nameBn} (${selected.name})\n- পরিমাণ: ${modalQty} পিস\n- মোট মূল্য: ${money(selected.price*modalQty)}\nডেলিভারি ঠিকানা ও বিস্তারিত জানতে চাই।`
                  : `Hello Craftique Yard! I would like to order:\n- Product: ${selected.name}\n- Quantity: ${modalQty} pcs\n- Total: ${money(selected.price*modalQty)}\nPlease confirm delivery details.`
              )}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={19}/>
              <span>{t('Order via WhatsApp','WhatsApp-এ সরাসরি অর্ডার করুন')}</span>
            </a>

            {/* Open Box Checking Trust Banner */}
            <div className="open-box-trust-card">
              <div className="open-box-icon-wrap">
                <PackageCheck size={22}/>
              </div>
              <div className="open-box-text">
                <strong>{t('Open Box Checking Assurance','দেখে নেওয়ার ১০০% নিশ্চয়তা')}</strong>
                <p>
                  {t(
                    'Inspect your items with the rider before payment. Pay only when 100% happy.',
                    'ডেলিভারিম্যানের সামনে পার্সেল খুলে পণ্য দেখে নিন। সম্পূর্ণ নিশ্চিন্তে ক্যাশ অন ডেলিভারিতে অর্ডার করুন।'
                  )}
                </p>
              </div>
            </div>

            {/* Buyer Trust Badges */}
            <div className="modal-trust-strip">
              <div>
                <ShieldCheck size={16}/>
                <span>{t('Cash On Delivery available across Bangladesh','সারা দেশে ক্যাশ অন ডেলিভারি সুবিধা')}</span>
              </div>
              <div>
                <Package size={16}/>
                <span>{t('Check your parcel with delivery rider before pay','ডেলিভারির সময় পণ্য দেখে নেওয়ার সুযোগ')}</span>
              </div>
              <div>
                <CheckCircle2 size={16}/>
                <span>{t('100% genuine quality materials guaranteed','১০০% খাঁটি ও মানসম্মত উপকরণের নিশ্চয়তা')}</span>
              </div>
            </div>

            <div className="modal-footer-links">
              <button
                className="text-link"
                onClick={async()=>{
                  try{
                    await navigator.clipboard.writeText(`${location.origin}/?product=${selected.id}`);
                    setToast(t('Product link copied!','পণ্যের লিংক কপি হয়েছে!'));
                  }catch{
                    setToast(t('Copy the product URL from your browser.','ব্রাউজার থেকে পণ্যের লিংক কপি করুন।'));
                  }
                }}
              >
                <Copy size={14}/>
                {t('Copy product link','পণ্যের লিংক কপি')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cart & Checkout Modal */}
      {cartOpen&&(
        <Modal title={t('Your shopping bag','তোমার শপিং ব্যাগ')} onClose={()=>{if(!busy)setCartOpen(false);}} className="cart-modal">
          <div className="cart-content">
            {receipt?(
              <div className="receipt invoice-style">
                <div className="receipt-success-icon">
                  <CheckCircle2 size={54}/>
                </div>
                <div className="eyebrow">{t('ORDER SAVED WITH CARE','অর্ডারটি সফলভাবে জমা হয়েছে')}</div>
                <h2>{t('Thank You for Your Order!','ধন্যবাদ! আপনার অর্ডারটি গৃহীত হয়েছে')}</h2>
                <p className="receipt-subtitle">
                  {t('Your order has been recorded. Our team will call you to confirm before dispatching your package.','আপনার অর্ডারটি সংরক্ষণ করা হয়েছে। ডেলিভারির পূর্বে আমাদের প্রতিনিধি কল দিয়ে কনফার্ম করবেন।')}
                </p>

                <div className="celebrate-btn-wrap">
                  <button
                    type="button"
                    className="celebrate-again-btn"
                    onClick={runCelebrationConfetti}
                    title={t('Celebrate again!','আবার কনফেটি দেখুন!')}
                  >
                    <span>🎉 {t('Celebrate Again!','আবার উদযাপন করুন!')}</span>
                  </button>
                </div>

                <div className="invoice-box">
                  <div className="invoice-header">
                    <div>
                      <span className="invoice-tag">{t('ORDER REFERENCE','অর্ডার রেফারেন্স')}</span>
                      <strong className="invoice-ref">{receipt.reference}</strong>
                    </div>
                    <button
                      className="copy-ref-btn"
                      onClick={async()=>{
                        try{
                          await navigator.clipboard.writeText(receipt.reference);
                          setToast(t('Reference copied!','রেফারেন্স কপি হয়েছে!'));
                        }catch{}
                      }}
                      title={t('Copy Reference','রেফারেন্স কপি করুন')}
                    >
                      <Copy size={14}/>
                      <span>{t('Copy','কপি')}</span>
                    </button>
                  </div>

                  <div className="invoice-row total-row">
                    <span>{t('Payable Total (Cash On Delivery)','সর্বমোট প্রদেয় (ক্যাশ অন ডেলিভারি)')}</span>
                    <strong>{money(receipt.total)}</strong>
                  </div>
                </div>

                <div className="receipt-trust-note">
                  <ShieldCheck size={20}/>
                  <span>{t('No advance payment needed. Pay cash to the delivery rider when you receive and check your package.','কোনো অগ্রিম পেমেন্ট লাগবে না। পণ্য হাতে পেয়ে চেক করে মূল্য পরিশোধ করবেন।')}</span>
                </div>

                <div className="receipt-actions">
                  <a
                    className="button primary wide whatsapp-confirm-btn"
                    href={whatsapp(`Hello Craftique Yard! Please confirm my order ${receipt.reference}. Total: BDT ${receipt.total}.`)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle size={18}/>
                    <span>{t('Confirm Order on WhatsApp','WhatsApp-এ অর্ডার নিশ্চিত করুন')}</span>
                  </a>
                  <button
                    className="button outline wide"
                    onClick={()=>{
                      const blob=new Blob([`======================================\nCRAFTIQUE YARD - ORDER MEMO\n======================================\nOrder Reference : ${receipt.reference}\nTotal Payable   : BDT ${receipt.total}\nPayment Method  : Cash On Delivery\nHelpline        : ${settings.phone}\nWhatsApp        : ${settings.whatsapp}\nAddress         : ${settings.address}\n\nThank you for creating with Craftique Yard!\n======================================`],{type:'text/plain;charset=utf-8'});
                      const a=document.createElement('a');
                      a.href=URL.createObjectURL(blob);
                      a.download=`CraftiqueYard-${receipt.reference}.txt`;
                      a.click();
                      URL.revokeObjectURL(a.href);
                    }}
                  >
                    <Download size={16}/>
                    <span>{t('Download Order Memo','অর্ডার মেমো ডাউনলোড')}</span>
                  </button>
                </div>
              </div>
            ):checkout?(
              <>
                <button className="text-link" onClick={()=>setCheckout(false)}>
                  ← {t('Back to your bag','ব্যাগে ফিরে যান')}
                </button>
                <div className="eyebrow">{t('ONE LAST LITTLE STEP','আর মাত্র একটি ধাপ')}</div>
                <h2>{t('Complete Your Order','অর্ডার সম্পন্ন করুন')}</h2>

                <div className="checkout-trust-banner">
                  <ShieldCheck size={18}/>
                  <span>{t('Cash On Delivery: Pay only after receiving the product. Zero risk.','ক্যাশ অন ডেলিভারি: পণ্য হাতে পেয়ে টাকা দিন। কোনো ঝুঁকি নেই।')}</span>
                </div>

                {freeShippingThreshold > 0 && (
                  <div className="shipping-progress-card checkout-shipping-bar">
                    <div className="shipping-progress-header">
                      {isFreeShipping ? (
                        <span className="shipping-free-active">
                          <Sparkles size={16}/>
                          <strong>{t('FREE Delivery Unlocked across Bangladesh! 🎉','সারা বাংলাদেশে ফ্রি ডেলিভারি নিশ্চিত হয়েছে! 🎉')}</strong>
                        </span>
                      ) : (
                        <span className="shipping-needed-text">
                          <Truck size={16}/>
                          <span>
                            {t(
                              `Add ${money(freeShippingThreshold - subtotal)} more for FREE Delivery!`,
                              `আর মাত্র ${money(freeShippingThreshold - subtotal)} যোগ করলেই ফ্রি ডেলিভারি!`
                            )}
                          </span>
                        </span>
                      )}
                      <span className="shipping-percent-num">
                        {Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%
                      </span>
                    </div>
                    <div className="shipping-progress-track">
                      <div
                        className={`shipping-progress-fill ${isFreeShipping ? 'unlocked' : ''}`}
                        style={{ width: `${Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%` }}
                      />
                    </div>
                  </div>
                )}

                <form onSubmit={placeOrder} className="checkout-form">
                  <label>
                    {t('Your full name','আপনার পুরো নাম')}
                    <input name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder={t('Enter your full name','আপনার পুরো নাম লিখুন')}/>
                  </label>
                  <label>
                    {t('Mobile number','১১ ডিজিটের মোবাইল নম্বর')}
                    <input
                      name="phone"
                      autoComplete="tel"
                      inputMode="tel"
                      required
                      placeholder="01XXXXXXXXX"
                      title={t('11-digit Bangladesh mobile number','১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর')}
                    />
                  </label>
                  <label>
                    {t('Delivery address with landmark','সম্পূর্ণ ডেলিভারি ঠিকানা')}
                    <textarea
                      name="address"
                      autoComplete="street-address"
                      required
                      minLength={8}
                      maxLength={400}
                      rows={2}
                      placeholder={t('House, Road, Area, Thana and nearby landmark','বাসা/ফ্ল্যাট নং, রোড, এলাকা/থানা এবং কাছের কোনো পরিচিত ল্যান্ডমার্ক')}
                    />
                  </label>
                  <div className="form-row">
                    <label>
                      {t('District','জেলা')}
                      <select
                        value={district}
                        onChange={e=>handleDistrictChange(e.target.value)}
                        className="district-select"
                        required
                      >
                        {BD_DISTRICTS.map(d=>(
                          <option key={d.en} value={d.en}>
                            {lang==='bn'?d.bn:d.en} {d.isDhaka?`(${t('Dhaka','ঢাকার ভেতরে')})`:`(${t('Outside','ঢাকার বাইরে')})`}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      {t('Delivery area','ডেলিভারি এরিয়া')}
                      <select value={zone} onChange={e=>setZone(e.target.value)}>
                        <option value="dhaka">{t('Inside Dhaka','ঢাকার ভিতরে')} ({money(settings.insideDhaka)})</option>
                        <option value="outside">{t('Outside Dhaka','ঢাকার বাইরে')} ({money(settings.outsideDhaka)})</option>
                      </select>
                    </label>
                  </div>

                  <fieldset className="payment-options">
                    <legend>{t('Payment method','পেমেন্টের পদ্ধতি')}</legend>
                    {[
                      {id:'cod',on:settings.codEnabled,en:'Cash on delivery',bn:'ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে টাকা দিন)'},
                      {id:'bkash',on:settings.bkashEnabled,en:'bKash',bn:'বিকাশ'},
                      {id:'nagad',on:settings.nagadEnabled,en:'Nagad',bn:'নগদ'}
                    ].filter(p=>p.on).map(p=>(
                      <label key={p.id} className={`${payment===p.id?'selected':''} ${p.id==='cod'?'cod-choice':''}`}>
                        <input type="radio" name="paymentChoice" checked={payment===p.id} onChange={()=>setPayment(p.id)}/>
                        <div className="payment-label-wrap">
                          <strong>{t(p.en,p.bn)}</strong>
                          {p.id==='cod'&&(
                            <small className="cod-badge">{t('No advance payment required • 100% safe','কোনো অগ্রিম পেমেন্ট লাগবে না • সম্পূর্ণ নিরাপদ')}</small>
                          )}
                        </div>
                      </label>
                    ))}
                  </fieldset>

                  {payment!=='cod'&&(
                    <div className="payment-note">
                      {t('Place your order first. Contact us to confirm before sending money. Payment is verified manually.','আগে অর্ডার সাবমিট করুন। টাকা পাঠানোর আগে আমাদের সঙ্গে যোগাযোগ করে নিশ্চিত করুন।')}
                      <strong>{payment==='bkash'?'bKash':'Nagad'}: {payment==='bkash'?settings.bkash:settings.nagad}</strong>
                    </div>
                  )}

                  <label>
                    {t('Special delivery note (optional)','বিশেষ কোনো নির্দেশনা (ঐচ্ছিক)')}
                    <textarea name="note" rows={2} maxLength={500} placeholder={t('Preferred delivery time or special requests','পছন্দের ডেলিভারি সময় বা অন্যান্য নির্দেশনা')}/>
                  </label>

                  <label className="honeypot" aria-hidden="true">
                    Website<input name="website" tabIndex={-1} autoComplete="off"/>
                  </label>

                  <div className="order-totals">
                    <div>
                      <span>{t('Product subtotal','পণ্যের মূল্য')}</span>
                      <strong>{money(subtotal)}</strong>
                    </div>
                    <div>
                      <span>{t('Delivery charge','ডেলিভারি চার্জ')}</span>
                      {isFreeShipping ? (
                        <strong className="free-shipping-tag">
                          <span className="striked-amount">{money(standardShipping)}</span>
                          {' '}{t('FREE (৳0)','ফ্রি (৳০)')}
                        </strong>
                      ) : (
                        <strong>{money(shipping)}</strong>
                      )}
                    </div>
                    <div className="grand-total">
                      <span>{t('Total payable','সর্বমোট প্রদেয়')}</span>
                      <strong>{money(subtotal+shipping)}</strong>
                    </div>
                  </div>

                  {error&&<div className="form-error" role="alert">{error}</div>}

                  <button className="button primary wide checkout-submit-btn" disabled={busy||cart.length===0} type="submit">
                    {busy?t('Placing your order…','অর্ডার সম্পন্ন হচ্ছে…'):t('Confirm Order (Cash On Delivery)','অর্ডার কনফার্ম করুন (ক্যাশ অন ডেলিভারি)')}
                    <ArrowRight size={18}/>
                  </button>

                  {/* Open Box Checking Trust Banner */}
                  <div className="checkout-trust-banner">
                    <PackageCheck size={18}/>
                    <div>
                      <strong>{t('Open Box Checking Guarantee','দেখে নেওয়ার ১০০% নিশ্চয়তা')}</strong>
                      <p>{t('Inspect items in front of the delivery agent. Pay only when 100% satisfied.','ডেলিভারির সময় পার্সেল খুলে চেক করে পছন্দ হলে তবেই মূল্য পরিশোধ করুন।')}</p>
                    </div>
                  </div>
                </form>
              </>
            ):(
              <>
                <div className="eyebrow">{t('GOOD THINGS INSIDE','সুন্দর সব উপকরণ')}</div>
                <h2>{t('Your Shopping Bag','তোমার শপিং ব্যাগ')} <span className="cart-count">{count}</span></h2>
                {cartProducts.length===0?(
                  <div className="empty-state">
                    <ShoppingBag size={42}/>
                    <h3>{t('Your bag is waiting for something lovely.','আপনার ব্যাগটি এখন খালি।')}</h3>
                    <p>{t('Explore our craft materials to find your next creative project.','আমাদের সুন্দর সব ক্রাফট উপকরণ থেকে পছন্দের সামগ্রী বেছে নিন।')}</p>
                    <button className="button primary" onClick={()=>{setCartOpen(false);goShop();}}>
                      {t('Shop the collection','কালেকশন থেকে কিনুন')}
                    </button>
                  </div>
                ):(
                  <>
                    {/* Dynamic Free Shipping Progress Bar */}
                    {freeShippingThreshold > 0 && (
                      <div className="shipping-progress-card">
                        <div className="shipping-progress-header">
                          {isFreeShipping ? (
                            <span className="shipping-free-active">
                              <Sparkles size={16}/>
                              <strong>{t('FREE Delivery Unlocked across Bangladesh! 🎉','সারা বাংলাদেশে ফ্রি ডেলিভারি নিশ্চিত হয়েছে! 🎉')}</strong>
                            </span>
                          ) : (
                            <span className="shipping-needed-text">
                              <Truck size={16}/>
                              <span>
                                {t(
                                  `Add ${money(freeShippingThreshold - subtotal)} more for FREE Delivery!`,
                                  `আর মাত্র ${money(freeShippingThreshold - subtotal)} যোগ করলেই ফ্রি ডেলিভারি!`
                                )}
                              </span>
                            </span>
                          )}
                          <span className="shipping-percent-num">
                            {Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%
                          </span>
                        </div>
                        <div className="shipping-progress-track">
                          <div
                            className={`shipping-progress-fill ${isFreeShipping ? 'unlocked' : ''}`}
                            style={{ width: `${Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="cart-items">
                      {cartProducts.map(({p,quantity})=>(
                        <div className="cart-item" key={p.id}>
                          <img src={p.image} alt={t(p.name,p.nameBn)}/>
                          <div className="cart-item-details">
                            <h4>{t(p.name,p.nameBn)}</h4>
                            <span className="cart-item-unit-price">{money(p.price)}</span>
                            <div className="quantity">
                              <button aria-label="Decrease quantity" onClick={()=>update(p.id,-1)}>
                                <Minus size={13}/>
                              </button>
                              <span>{quantity}</span>
                              <button aria-label="Increase quantity" onClick={()=>update(p.id,1)} disabled={quantity>=Math.min(p.stock??500,500)}>
                                <Plus size={13}/>
                              </button>
                            </div>
                          </div>
                          <div className="cart-item-end">
                            <button className="icon-btn" aria-label="Remove item" onClick={()=>setCart(c=>c.filter(i=>i.id!==p.id))}>
                              <X size={16}/>
                            </button>
                            <strong>{money(p.price*quantity)}</strong>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="order-totals">
                      <div className="grand-total">
                        <span>{t('Subtotal','মোট মূল্য')}</span>
                        <strong>{money(subtotal)}</strong>
                      </div>
                    </div>

                    <p className="small-muted">
                      {t(`Delivery inside Dhaka: ${money(settings.insideDhaka)}, Outside: ${money(settings.outsideDhaka)}. Added at checkout.`,`ডেলিভারি চার্জ: ঢাকা ${money(settings.insideDhaka)}, বাইরে ${money(settings.outsideDhaka)}।`)}
                    </p>

                    <button
                      className="button primary wide"
                      onClick={()=>{
                        setCheckout(true);
                        setError('');
                        setPayment(settings.codEnabled?'cod':settings.bkashEnabled?'bkash':'nagad');
                      }}
                    >
                      {t('Proceed to Checkout','অর্ডার করতে এগিয়ে যান')}
                      <ArrowRight size={18}/>
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </Modal>
      )}

      {/* Info / Tracking Modal */}
      {info&&(
        <Modal title={info} onClose={()=>setInfo(null)} className="info-modal">
          <div className="eyebrow">CRAFTIQUE YARD</div>
          {info==='track'?(
            <>
              <h2>{t('Track Your Order','তোমার অর্ডার ট্র্যাক করো')}</h2>
              <p>{t('Enter your order reference code and the 11-digit mobile number used when ordering.','অর্ডারের সময় পাওয়া রেফারেন্স কোড ও আপনার মোবাইল নম্বর দিন।')}</p>
              <form onSubmit={track} className="track-form">
                <label>
                  {t('Order reference','অর্ডার রেফারেন্স')}
                  <input name="reference" placeholder="CY-20261113-XXXXXXXX" required/>
                </label>
                <label>
                  {t('Mobile number','মোবাইল নম্বর')}
                  <input name="phone" placeholder="01XXXXXXXXX" inputMode="tel" required/>
                </label>
                <button className="button primary wide" disabled={tracking}>
                  {tracking?t('Looking it up…','খোঁজা হচ্ছে…'):t('Track Order','অর্ডার ট্র্যাক করুন')}
                </button>
              </form>
              {error&&(
                <div className="form-error" role="alert">
                  <AlertCircle size={16}/>
                  <span>{error}</span>
                </div>
              )}
              {trackResult&&(
                <div className="tracking-card">
                  <div className="tracking-header">
                    <div>
                      <small>{t('ORDER REFERENCE','অর্ডার রেফারেন্স')}</small>
                      <strong>{trackResult.reference}</strong>
                    </div>
                    <span className="tracking-badge">
                      {t(...(statusLabels[trackResult.status]||[trackResult.status,trackResult.status]))}
                    </span>
                  </div>

                  {/* 5-Step Visual Progress Stepper */}
                  <div className="tracking-stepper">
                    {TRACKING_STEPS.map((step, idx) => {
                      const currentIdx = TRACKING_STEPS.findIndex(s => s.key === trackResult.status);
                      const isDone = currentIdx >= idx;
                      const isCurrent = currentIdx === idx;
                      return (
                        <div key={step.key} className={`stepper-node ${isDone?'done':''} ${isCurrent?'current':''}`}>
                          <div className="stepper-circle">
                            {isDone?<Check size={13}/>:<span>{idx+1}</span>}
                          </div>
                          <span className="stepper-title">{t(step.en, step.bn)}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="tracking-details-box">
                    <div className="tracking-info-row">
                      <span>{t('Payment status:','পেমেন্ট স্ট্যাটাস:')}</span>
                      <strong>{t(...(statusLabels[trackResult.paymentStatus]||[trackResult.paymentStatus,trackResult.paymentStatus]))}</strong>
                    </div>
                    <div className="tracking-info-row">
                      <span>{t('Total amount:','সর্বমোট মূল্য:')}</span>
                      <strong>{money(trackResult.total)}</strong>
                    </div>
                    <div className="tracking-items-list">
                      <span className="items-title">{t('Ordered items:','অর্ডারের উপকরণসমূহ:')}</span>
                      {trackResult.items.map((i:any,index:number)=>(
                        <div key={index} className="tracking-item-row">
                          <span>{t(i.name,i.nameBn)}</span>
                          <strong>× {i.quantity}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ):info==='delivery'?(
            <>
              <h2>{t('Delivered with care.','যত্নে পৌঁছে দেব।')}</h2>
              <p>{t(`Delivery inside Dhaka: ${money(settings.insideDhaka)}. Outside Dhaka: ${money(settings.outsideDhaka)}. Shipping is included in your checkout total. We confirm availability and dispatch details with you.`, `ঢাকার ভিতরে ডেলিভারি ${money(settings.insideDhaka)}, বাইরে ${money(settings.outsideDhaka)}। Checkout-এর মোট দামে ডেলিভারি চার্জ থাকবে। Stock ও পাঠানোর বিস্তারিত তোমার সঙ্গে নিশ্চিত করব।`)}</p>
              <h3>{t('Payments','পেমেন্ট পদ্ধতি')}</h3>
              <p>{t('Choose cash on delivery, bKash or Nagad when available. For mobile payments, please confirm the account type and your order with us first. A transaction reference is checked manually; an order request is not proof of payment.','চালু থাকা পদ্ধতি থেকে ক্যাশ অন ডেলিভারি, বিকাশ বা নগদ বেছে নাও। Mobile payment-এর আগে account type ও অর্ডার আমাদের সঙ্গে নিশ্চিত করো। Transaction reference হাতে যাচাই করা হবে; অর্ডার করা মানেই পেমেন্ট হয়েছে নয়।')}</p>
              <p className="small-muted">{t('Online card checkout will be available after merchant gateway setup.','Merchant gateway setup-এর পরে online card checkout চালু হবে।')}</p>
            </>
          ):info==='privacy'?(
            <>
              <h2>{t('Your details, with care.','তোমার তথ্য, যত্নে।')}</h2>
              <p>{t('We collect your name, mobile number, delivery address, order items and optional email or note to process and support your order. Approved store administrators can access order details.','অর্ডার প্রক্রিয়া ও সহায়তার জন্য তোমার নাম, মোবাইল, ডেলিভারির ঠিকানা, পণ্যের তথ্য এবং ঐচ্ছিক ইমেইল বা নোট সংগ্রহ করি। অনুমোদিত store administrator-রা অর্ডারের তথ্য দেখতে পারেন।')}</p>
              <p>{t('Order information is stored in the store database. We do not collect card numbers or banking passwords. Your language preference and shopping bag are saved only in your browser.','অর্ডারের তথ্য স্টোরের database-এ থাকে। আমরা card number বা ব্যাংকিং password সংগ্রহ করি না। ভাষা ও shopping bag শুধু তোমার browser-এ সংরক্ষিত থাকে।')}</p>
            </>
          ):(
            <>
              <h2>{t('Let’s sort it out.','সমাধান করি একসঙ্গে।')}</h2>
              <p>{t('For an incorrect, damaged or missing item, contact us with your order reference and photos so we can review it. We will discuss the appropriate replacement, return or refund before you send anything back.','ভুল, ক্ষতিগ্রস্ত বা অনুপস্থিত পণ্যের জন্য অর্ডার রেফারেন্স ও ছবি দিয়ে যোগাযোগ করো। কিছু ফেরত পাঠানোর আগে replacement, return বা refund নিয়ে আলোচনা করব।')}</p>
              <p>{t('Need to change or cancel an order? Message us as soon as possible. Changes depend on whether it has already been dispatched.','অর্ডার বদলাতে বা বাতিল করতে চান? যত দ্রুত সম্ভব মেসেজ করুন।')}</p>
            </>
          )}
          {info!=='track'&&(
            <a className="button primary" href={whatsapp()} target="_blank" rel="noreferrer">
              <MessageCircle size={18}/>
              {t('Talk to us on WhatsApp','WhatsApp-এ কথা বলুন')}
            </a>
          )}
        </Modal>
      )}
    </>
  );
}
