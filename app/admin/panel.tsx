'use client';
import { useState, useEffect, type FormEvent } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  LogOut,
  ArrowUpRight,
  Plus,
  Search,
  Download,
  RefreshCw,
  ShieldCheck,
  Users,
  Phone,
  MessageCircle,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  Trash2,
  Globe,
  Check,
} from 'lucide-react';
import { Modal } from '../storefront';
import {
  type Product,
  type StoreSettings,
  defaults,
  CATEGORY_PRESETS,
  applyProductPosition,
  slugifyProductId,
} from '../lib/catalog';

type Order = {
  id: string;
  reference: string;
  name: string;
  phone: string;
  address: string;
  district: string;
  zone: string;
  payment: string;
  total: number;
  subtotal: number;
  shipping: number;
  status: string;
  payment_status: string;
  transactionRef: string;
  staffNote: string;
  note: string;
  created_at: string;
  items: { id: string; name: string; price: number; quantity: number }[];
};

type Data = {
  products: Product[];
  settings: StoreSettings;
  orders: Order[];
  baseProductIds?: string[];
};

type Lang = 'en' | 'bn';

const money = (n: number) => `৳${n.toLocaleString('en-BD')}`;

async function call(url: string, payload?: unknown) {
  const r = await fetch(
    url,
    payload
      ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      : { cache: 'no-store' }
  );
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || 'Request failed.');
  return d;
}

function waNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('01')) return `88${digits}`;
  return digits;
}

export default function Admin({ user }: { user: string | null }) {
  const [lang, setLang] = useState<Lang>('en');
  const [mode, setMode] = useState<'login' | 'setup'>('login');
  const [tab, setTab] = useState('overview');
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const [product, setProduct] = useState<Product | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [manualIdEdited, setManualIdEdited] = useState(false);
  const [customCategory, setCustomCategory] = useState(false);
  const [productPosition, setProductPosition] = useState(1);
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [movingId, setMovingId] = useState<string | null>(null);
  const [moveTarget, setMoveTarget] = useState('');

  const [order, setOrder] = useState<Order | null>(null);
  const [confirmCancelOrder, setConfirmCancelOrder] = useState(false);
  const [settings, setSettings] = useState<StoreSettings>(defaults);

  const t = (en: string, bn: string) => (lang === 'en' ? en : bn);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('cy-admin-lang');
      if (savedLang === 'bn') setLang('bn');
    } catch {}
  }, []);

  function toggleLang() {
    const next: Lang = lang === 'en' ? 'bn' : 'en';
    setLang(next);
    try {
      localStorage.setItem('cy-admin-lang', next);
    } catch {}
  }

  async function refresh() {
    setBusy(true);
    setError('');
    try {
      const d = await call('/api/admin');
      setData(d);
      setSettings(d.settings);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (user) refresh();
  }, [user]);

  async function auth(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await call('/api/auth', {
        action: mode === 'setup' ? 'setup' : 'login',
        ...Object.fromEntries(new FormData(e.currentTarget)),
      });
      location.reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function save(payload: unknown, message?: string) {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await call('/api/admin', payload);
      setSuccess(message || t('Saved! Changes are live on your store.', 'সেভ হয়েছে! ওয়েবসাইটে সাথে সাথে দেখা যাবে।'));
      await refresh();
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function upload(file: File) {
    setUploading(true);
    setError('');
    try {
      const f = new FormData();
      f.set('image', file);
      const r = await fetch('/api/admin/upload', { method: 'POST', body: f });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setProduct((p) => (p ? { ...p, image: d.image } : p));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function account(e: FormEvent<HTMLFormElement>, action: string) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await call('/api/auth', {
        ...Object.fromEntries(new FormData(form)),
        action,
        ...(action === 'setup' ? { code: 'authenticated-admin' } : {}),
      });
      setSuccess(
        action === 'setup'
          ? t('New admin account created.', 'নতুন অ্যাডমিন অ্যাকাউন্ট তৈরি হয়েছে।')
          : t('Password changed. Other sessions signed out.', 'পাসওয়ার্ড পরিবর্তন হয়েছে।')
      );
      form.reset();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function moveProduct(productId: string, targetPos: number) {
    if (!data || reordering) return;
    const currentOrder = data.products.map((p) => p.id);
    const nextOrder = applyProductPosition(currentOrder, productId, targetPos);
    const productMap = new Map(data.products.map((p) => [p.id, p]));
    const reorderedProducts = nextOrder.map((id) => productMap.get(id)!).filter(Boolean);

    setReordering(true);
    setError('');
    setSuccess('');
    setData({ ...data, products: reorderedProducts });
    setMovingId(null);

    try {
      await call('/api/admin', { action: 'reorder', order: nextOrder });
      setSuccess(t('Main page product serial updated.', 'মেইন পেজের প্রোডাক্ট সিরিয়াল আপডেট হয়েছে।'));
    } catch (e) {
      setError((e as Error).message);
      await refresh();
    } finally {
      setReordering(false);
    }
  }

  async function quickOrderUpdate(nextStatus: string, nextPaymentStatus?: string) {
    if (!order) return;
    const ok = await save(
      {
        action: 'order',
        order: {
          id: order.id,
          status: nextStatus,
          paymentStatus: nextPaymentStatus ?? order.payment_status,
          transactionRef: order.transactionRef || '',
          staffNote: order.staffNote || '',
        },
      },
      t(`Order ${order.reference} updated to ${nextStatus}.`, `অর্ডার ${order.reference} আপডেট হয়েছে।`)
    );
    if (ok) {
      setOrder(null);
      setConfirmCancelOrder(false);
    }
  }

  function exportOrders() {
    if (!data) return;
    const escape = (v: unknown) => {
      let s = String(v ?? '');
      if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
      return '"' + s.replaceAll('"', '""') + '"';
    };
    const rows = [
      ['Reference', 'Customer', 'Phone', 'Address', 'District', 'Total', 'Payment', 'Status', 'Payment status', 'Created'],
      ...data.orders.map((o) => [
        o.reference,
        o.name,
        o.phone,
        o.address,
        o.district,
        o.total,
        o.payment,
        o.status,
        o.payment_status,
        o.created_at,
      ]),
    ];
    const blob = new Blob(['\uFEFF' + rows.map((r) => r.map(escape).join(',')).join('\r\n')], {
      type: 'text/csv;charset=utf-8',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `craftique-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  if (!user) {
    return (
      <main className="admin-login">
        <div className="admin-login-art">
          <img src="/images/hero.webp" alt="Craftique Yard creative corner" />
          <div className="login-caption">
            Craftique Yard
            <br />
            <em>{t('Store Management', 'স্টোর ম্যানেজমেন্ট')}</em>
          </div>
        </div>
        <div className="admin-login-form">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
            <a className="brand" href="/">
              <img src="/images/logo.jpg" alt="Craftique Yard" width={60} height={60} />
              <span>
                CRAFTIQUE <span className="yard">YARD</span>
              </span>
            </a>
            <button type="button" className="language-btn" onClick={toggleLang}>
              <Globe size={15} />
              {lang === 'en' ? 'বাংলা' : 'English'}
            </button>
          </div>
          <div className="eyebrow">
            <ShieldCheck size={15} />
            {t('ADMIN LOGIN', 'অ্যাডমিন লগইন')}
          </div>
          <h1>{mode === 'setup' ? t('Create Admin Account', 'প্রথম অ্যাডমিন তৈরি করুন') : t('Sign In to Store', 'স্টোর প্যানেলে লগইন')}</h1>
          <p>
            {mode === 'setup'
              ? t(
                  'Enter an approved email, a strong password (12+ characters), and your setup code.',
                  'অনুমোদিত ইমেইল, কমপক্ষে ১২ অক্ষরের পাসওয়ার্ড এবং আপনার সেটআপ কোড দিন।'
                )
              : t(
                  'View customer orders, call to confirm Cash on Delivery, and upload new products.',
                  'গ্রাহকের অর্ডার দেখুন, কল করে কনফার্ম করুন এবং নতুন পণ্য আপলোড করুন।'
                )}
          </p>
          <form className="admin-form" onSubmit={auth}>
            <label>
              {t('Email Address', 'ইমেইল ঠিকানা')}
              <input name="email" type="email" required autoComplete="username" />
            </label>
            <label>
              {mode === 'setup' ? t('Choose Password (12+ characters)', 'পাসওয়ার্ড দিন (কমপক্ষে ১২ অক্ষর)') : t('Password', 'পাসওয়ার্ড')}
              <input
                name="password"
                type="password"
                minLength={mode === 'setup' ? 12 : 1}
                maxLength={128}
                required
                autoComplete={mode === 'setup' ? 'new-password' : 'current-password'}
              />
            </label>
            {mode === 'setup' && (
              <label>
                {t('Setup Code', 'সেটআপ কোড')}
                <input name="code" type="password" required autoComplete="off" />
              </label>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="button primary wide" disabled={busy}>
              {busy ? t('Please wait…', 'অপেক্ষা করুন…') : mode === 'setup' ? t('Create Admin', 'অ্যাডমিন তৈরি করুন') : t('Sign In', 'লগইন করুন')}
              <ArrowUpRight size={18} />
            </button>
          </form>
          <button
            className="text-link"
            onClick={() => {
              setMode((m) => (m === 'setup' ? 'login' : 'setup'));
              setError('');
            }}
          >
            {mode === 'setup' ? t('Already have an account? Sign in', 'আগে থেকেই অ্যাকাউন্ট আছে? লগইন করুন') : t('First-time setup', 'প্রথমবার সেটআপ')}
          </button>
          <a className="text-link" href="/">
            ← {t('Back to Website', 'ওয়েবসাইটে ফিরে যান')}
          </a>
        </div>
      </main>
    );
  }

  const baseIds = new Set(data?.baseProductIds ?? []);
  const existingProductIds = new Set(data?.products.map((p) => p.id) ?? []);
  const serialIndexMap = new Map((data?.products ?? []).map((p, idx) => [p.id, idx]));

  const pending = data?.orders.filter((o) => o.status === 'pending').length || 0;
  const paid =
    data?.orders
      .filter((o) => o.payment_status === 'paid' && o.status !== 'cancelled')
      .reduce((n, o) => n + o.total, 0) || 0;

  const orders =
    data?.orders.filter(
      (o) =>
        (filter === 'all' || o.status === filter) &&
        `${o.reference} ${o.name} ${o.phone}`.toLowerCase().includes(query.toLowerCase())
    ) || [];

  const products =
    data?.products.filter((p) =>
      `${p.name} ${p.nameBn} ${p.category} ${p.categoryBn}`.toLowerCase().includes(query.toLowerCase())
    ) || [];

  const statusText: Record<string, [string, string]> = {
    pending: ['Pending (Call)', 'কল কনফার্ম বাকি'],
    confirmed: ['Confirmed', 'কনফার্মড'],
    processing: ['Processing', 'প্রস্তুত হচ্ছে'],
    shipped: ['Shipped', 'পাঠানো হয়েছে'],
    delivered: ['Delivered', 'ডেলিভারি সম্পন্ন'],
    cancelled: ['Cancelled', 'বাতিল'],
    unpaid: ['Unpaid (COD)', 'বাকি (COD)'],
    verification_pending: ['Verify Payment', 'পেমেন্ট যাচাই বাকি'],
    paid: ['Paid', 'পরিশোধিত'],
    refunded: ['Refunded', 'ফেরত'],
  };

  function openNewProductModal() {
    setEditingProductId(null);
    setManualIdEdited(false);
    setCustomCategory(false);
    setConfirmDeleteProduct(false);
    setProductPosition(1);
    setError('');
    setProduct({
      id: '',
      name: '',
      nameBn: '',
      category: CATEGORY_PRESETS[0].category,
      categoryBn: CATEGORY_PRESETS[0].categoryBn,
      price: 100,
      image: '/images/logo.jpg',
      description: '',
      descriptionBn: '',
      available: true,
      active: true,
      stock: null,
      bestSeller: false,
    });
  }

  function openEditProductModal(p: Product) {
    setEditingProductId(p.id);
    setManualIdEdited(true);
    setCustomCategory(!CATEGORY_PRESETS.some((c) => c.category === p.category));
    setConfirmDeleteProduct(false);
    setProductPosition((serialIndexMap.get(p.id) ?? 0) + 1);
    setError('');
    setProduct({ ...p, bestSeller: Boolean(p.bestSeller) });
  }

  const orderTable = (list: Order[]) => (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>{t('ORDER / DATE', 'অর্ডার / তারিখ')}</th>
            <th>{t('CUSTOMER & PHONE', 'গ্রাহক ও মোবাইল')}</th>
            <th>{t('ITEMS', 'পণ্য')}</th>
            <th>{t('TOTAL', 'মোট')}</th>
            <th>{t('STATUS', 'অবস্থা')}</th>
            <th>{t('PAYMENT', 'পেমেন্ট')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {list.map((o) => (
            <tr key={o.id}>
              <td>
                <strong>{o.reference}</strong>
                <small>{new Date(o.created_at).toLocaleDateString('en-GB')}</small>
              </td>
              <td>
                <strong>{o.name}</strong>
                <small>{o.phone}</small>
              </td>
              <td>
                {o.items.reduce((n, i) => n + i.quantity, 0)} {t('pcs', 'টি')}
                <small>{o.items[0]?.name}</small>
              </td>
              <td>
                <strong>{money(o.total)}</strong>
              </td>
              <td>
                <span className={`status-chip ${o.status}`}>{t(...(statusText[o.status] || [o.status, o.status]))}</span>
              </td>
              <td>
                <span className={`status-chip ${o.payment_status}`}>
                  {t(...(statusText[o.payment_status] || [o.payment_status, o.payment_status]))}
                </span>
              </td>
              <td>
                <button
                  className="button outline admin-row-btn"
                  onClick={() => {
                    setOrder({ ...o });
                    setConfirmCancelOrder(false);
                    setError('');
                  }}
                >
                  <Phone size={13} />
                  {t('View & Call', 'কল ও কনফার্ম')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {list.length === 0 && <div className="admin-no-orders">{t('No orders yet.', 'এখনও কোনো অর্ডার নেই।')}</div>}
    </div>
  );

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a className="brand" href="/">
          <img src="/images/logo.jpg" alt="Craftique Yard" width={48} height={48} />
          <span>
            CRAFTIQUE <span className="yard">YARD</span>
          </span>
        </a>
        <nav className="admin-nav" aria-label="Dashboard navigation">
          {[
            { id: 'overview', name: t('Overview', 'ড্যাশবোর্ড'), icon: LayoutDashboard },
            { id: 'orders', name: t('Orders', 'অর্ডার'), icon: ShoppingBag },
            { id: 'products', name: t('Products & Serial', 'পণ্য ও সিরিয়াল'), icon: Package },
            { id: 'settings', name: t('Shop Settings', 'স্টোর সেটিংস'), icon: Settings },
            { id: 'accounts', name: t('Passwords', 'পাসওয়ার্ড'), icon: Users },
          ].map((n) => (
            <button
              key={n.id}
              className={tab === n.id ? 'active' : ''}
              onClick={() => {
                setTab(n.id);
                setQuery('');
                setFilter('all');
                setError('');
                setSuccess('');
                setMovingId(null);
              }}
            >
              <n.icon size={18} />
              <span>{n.name}</span>
              {n.id === 'orders' && pending > 0 && <span className="admin-badge-count">{pending}</span>}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <button type="button" className="admin-lang-btn" onClick={toggleLang}>
            <Globe size={14} />
            {lang === 'en' ? 'বাংলা মোড' : 'English Mode'}
          </button>
          <span>{user}</span>
          <a href="/" target="_blank">
            {t('Open Website', 'ওয়েবসাইট দেখুন')} <ArrowUpRight size={14} />
          </a>
          <button
            onClick={async () => {
              await call('/api/auth', { action: 'logout' });
              location.reload();
            }}
          >
            <LogOut size={14} />
            {t('Sign Out', 'লগআউট')}
          </button>
        </div>
      </aside>

      <section className="admin-main">
        <div className="admin-top">
          <div>
            <div className="eyebrow">CRAFTIQUE YARD / {tab.toUpperCase()}</div>
            <h1>
              {tab === 'overview'
                ? t('Store Overview', 'স্টোরের সারসংক্ষেপ')
                : tab === 'orders'
                  ? t('Customer Orders & Call Confirm', 'অর্ডার ও কল কনফার্মেশন')
                  : tab === 'products'
                    ? t('Products & Main Page Serial', 'পণ্য ও মেইন পেজ সিরিয়াল')
                    : tab === 'settings'
                      ? t('Delivery & Payment Settings', 'ডেলিভারি ও পেমেন্ট সেটিংস')
                      : t('Admin Accounts & Password', 'অ্যাডমিন পাসওয়ার্ড')}
            </h1>
            <p>
              {tab === 'overview'
                ? t('Check new orders, call customers to confirm, and manage products.', 'নতুন অর্ডার দেখুন, কল করে কনফার্ম করুন এবং পণ্য আপলোড করুন।')
                : tab === 'products'
                  ? t(
                      'Products appear on your main website in this exact #1, #2, #3 serial order. Put Best Selling items first.',
                      'মেইন ওয়েবসাইটে পণ্যগুলো ঠিক এই #১, #২, #৩ সিরিয়াল অনুযায়ী দেখাবে। বেস্ট সেলিং পণ্যগুলো উপরে রাখুন।'
                    )
                  : tab === 'orders'
                    ? t('Click "View & Call" on any Pending order to call the customer and confirm Cash on Delivery.', 'অর্ডারের পাশে "কল ও কনফার্ম" বাটনে ক্লিক করে গ্রাহককে কল দিন ও স্ট্যাটাস আপডেট করুন।')
                    : ''}
            </p>
          </div>
          <button className="button outline" onClick={refresh} disabled={busy}>
            <RefreshCw size={15} />
            {busy ? t('Loading…', 'লোড হচ্ছে…') : t('Refresh', 'রিফ্রেশ')}
          </button>
        </div>

        {error && !product && !order && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="admin-form-success" role="status">
            {success}
          </div>
        )}

        {!data ? (
          <div className="admin-panel">{busy ? t('Loading store data…', 'তথ্য লোড হচ্ছে…') : t('Click Refresh to load data.', 'রিফ্রেশ ক্লিক করুন।')}</div>
        ) : (
          <>
            {tab === 'overview' && (
              <>
                <div className="admin-stats">
                  <div className="admin-stat">
                    <small>{t('ACTIVE PRODUCTS', 'চালু পণ্য')}</small>
                    <strong>{data.products.filter((p) => p.active).length}</strong>
                  </div>
                  <div className="admin-stat">
                    <small>{t('TOTAL ORDERS', 'মোট অর্ডার')}</small>
                    <strong>{data.orders.length}</strong>
                  </div>
                  <div className="admin-stat">
                    <small>{t('NEED CALL CONFIRM', 'কল কনফার্ম বাকি')}</small>
                    <strong>{pending}</strong>
                  </div>
                  <div className="admin-stat">
                    <small>{t('PAID SALES', 'পেইড বিক্রি')}</small>
                    <strong>{money(paid)}</strong>
                  </div>
                </div>
                <div className="admin-notice">
                  {t(
                    'How COD orders work: 1) New orders start as "Pending". 2) Click "View & Call" and tap "Call Customer" to confirm. 3) Click "Confirm Order" before sending.',
                    'কাজের নিয়ম: ১) নতুন অর্ডার "কল কনফার্ম বাকি" হিসেবে আসবে। ২) "কল ও কনফার্ম" খুলে গ্রাহককে কল করুন। ৩) নিশ্চিত হলে "Confirm Order" চাপুন।'
                  )}
                </div>
                <div className="admin-panel">
                  <h3>{t('Recent Orders', 'সাম্প্রতিক অর্ডার')}</h3>
                  {orderTable(data.orders.slice(0, 8))}
                </div>
              </>
            )}

            {tab === 'orders' && (
              <div className="admin-panel">
                <div className="admin-product-tools">
                  <div className="search-box admin-search">
                    <Search size={16} />
                    <input
                      aria-label={t('Search orders', 'অর্ডার খুঁজুন')}
                      placeholder={t('Search by name, phone or order #…', 'নাম, মোবাইল বা অর্ডার নম্বর দিয়ে খুঁজুন…')}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                  <select aria-label={t('Filter order status', 'অর্ডার ফিল্টার')} value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="all">{t('All Orders', 'সব অর্ডার')}</option>
                    <option value="pending">{t('Pending (Need Call)', 'কল কনফার্ম বাকি')}</option>
                    <option value="confirmed">{t('Confirmed', 'কনফার্মড')}</option>
                    <option value="processing">{t('Processing', 'প্রস্তুত হচ্ছে')}</option>
                    <option value="shipped">{t('Shipped', 'পাঠানো হয়েছে')}</option>
                    <option value="delivered">{t('Delivered', 'ডেলিভারি সম্পন্ন')}</option>
                    <option value="cancelled">{t('Cancelled', 'বাতিল')}</option>
                  </select>
                  <button className="button outline" onClick={exportOrders}>
                    <Download size={15} />
                    {t('Download Excel/CSV', 'CSV ডাউনলোড')}
                  </button>
                </div>
                {orderTable(orders)}
              </div>
            )}

            {tab === 'products' && (
              <div className="admin-panel">
                <div className="admin-product-tools">
                  <div className="search-box">
                    <Search size={16} />
                    <input
                      aria-label={t('Search products', 'পণ্য খুঁজুন')}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t('Search product name or category…', 'পণ্যের নাম বা ক্যাটাগরি খুঁজুন…')}
                    />
                  </div>
                  <button className="button primary" onClick={openNewProductModal}>
                    <Plus size={15} />
                    {t('Add New Product', 'নতুন পণ্য যোগ করুন')}
                  </button>
                </div>
                <div className="admin-notice">
                  {t(
                    'Tip: Use "#1 Top", ↑ / ↓ arrows, or click any "#Serial" badge to jump a Best Selling product straight to the front page.',
                    'টিপস: যেকোনো বেস্ট সেলিং পণ্য মেইন পেজের শুরুতে নিতে "#1 Top", ↑ / ↓ বাটনে ক্লিক করুন অথবা "#Serial" নম্বরে ক্লিক করে সরাসরি নম্বর বসান।'
                  )}
                  {reordering && <strong> {t('Saving order…', 'সিরিয়াল সেভ হচ্ছে…')}</strong>}
                </div>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>{t('MAIN PAGE SERIAL', 'মেইন পেজ সিরিয়াল')}</th>
                        <th>{t('PRODUCT', 'পণ্য')}</th>
                        <th>{t('CATEGORY', 'ক্যাটাগরি')}</th>
                        <th>{t('PRICE', 'দাম')}</th>
                        <th>{t('STATUS', 'অবস্থা')}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => {
                        const serialIndex = serialIndexMap.get(p.id) ?? 0;
                        const serialPos = serialIndex + 1;
                        const isFiltered = Boolean(query.trim());
                        return (
                          <tr key={p.id}>
                            <td>
                              {movingId === p.id ? (
                                <form
                                  className="admin-move-form"
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    const n = Number(moveTarget);
                                    if (Number.isFinite(n) && n >= 1) moveProduct(p.id, n);
                                  }}
                                >
                                  <input
                                    type="number"
                                    min={1}
                                    max={data.products.length}
                                    value={moveTarget}
                                    onChange={(e) => setMoveTarget(e.target.value)}
                                    aria-label={t('Move to serial number', 'নতুন সিরিয়াল নম্বর')}
                                    autoFocus
                                  />
                                  <button type="submit" className="admin-mini-btn primary-mini" title={t('Apply', 'সেভ')}>
                                    <Check size={13} />
                                  </button>
                                  <button type="button" className="admin-mini-btn" onClick={() => setMovingId(null)}>
                                    ×
                                  </button>
                                </form>
                              ) : (
                                <div className="admin-serial-controls">
                                  <button
                                    type="button"
                                    className="admin-serial-badge"
                                    title={t('Click to jump to a specific serial #', 'নম্বর লিখে পজিশন পরিবর্তন করুন')}
                                    onClick={() => {
                                      setMovingId(p.id);
                                      setMoveTarget(String(serialPos));
                                    }}
                                  >
                                    #{serialPos}
                                  </button>
                                  <button
                                    type="button"
                                    className="admin-mini-btn"
                                    disabled={reordering || serialPos === 1}
                                    title={t('Send to #1 (Top)', 'সবার উপরে (#1) নিন')}
                                    onClick={() => moveProduct(p.id, 1)}
                                  >
                                    <ChevronsUp size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    className="admin-mini-btn"
                                    disabled={reordering || isFiltered || serialPos === 1}
                                    title={isFiltered ? t('Clear search to nudge up', 'সার্চ খালি করে সরান') : t('Move up', 'উপরে নিন')}
                                    onClick={() => moveProduct(p.id, serialPos - 1)}
                                  >
                                    <ArrowUp size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    className="admin-mini-btn"
                                    disabled={reordering || isFiltered || serialPos === data.products.length}
                                    title={isFiltered ? t('Clear search to nudge down', 'সার্চ খালি করে সরান') : t('Move down', 'নিচে নামান')}
                                    onClick={() => moveProduct(p.id, serialPos + 1)}
                                  >
                                    <ArrowDown size={13} />
                                  </button>
                                </div>
                              )}
                            </td>
                            <td>
                              <div className="admin-product-name">
                                <img src={p.image} alt="" />
                                <div>
                                  <span>{lang === 'bn' ? p.nameBn || p.name : p.name}</span>
                                  {p.bestSeller && <small className="admin-bestseller-tag">{t('Best Seller', 'বেস্ট সেলার')}</small>}
                                </div>
                              </div>
                            </td>
                            <td>{lang === 'bn' ? p.categoryBn || p.category : p.category}</td>
                            <td>{money(p.price)}</td>
                            <td>
                              <span className={`status-chip ${p.active && p.available ? 'confirmed' : 'cancelled'}`}>
                                {!p.active
                                  ? t('Hidden', 'লুকানো')
                                  : !p.available || p.stock === 0
                                    ? t('Out of stock', 'স্টক শেষ')
                                    : p.stock === null
                                      ? t('Visible', 'চালু আছে')
                                      : `${p.stock} ${t('in stock', 'টি স্টক')}`}
                              </span>
                            </td>
                            <td>
                              <button className="text-link" onClick={() => openEditProductModal(p)}>
                                {t('Edit', 'এডিট')} ↗
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'settings' && (
              <form
                className="admin-panel admin-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  await save({ action: 'settings', settings });
                }}
              >
                <h3>{t('1. Payment Options (Turn off bKash/Nagad for COD only)', '১. পেমেন্ট অপশন (শুধু COD চাইলে bKash/Nagad বন্ধ রাখুন)')}</h3>
                <p className="small-muted">
                  {t(
                    'Customers do not pay by card/gateway right now. Uncheck bKash and Nagad if you want only Cash on Delivery at checkout.',
                    'এখন কোনো অনলাইন পেমেন্ট গেটওয়ে নেই। চেকআউটে শুধু Cash on Delivery দেখাতে চাইলে নিচের bKash ও Nagad টিক তুলে দিন।'
                  )}
                </p>
                {(['cod', 'bkash', 'nagad'] as const).map((method) => (
                  <label className="check-label" key={method}>
                    <input
                      type="checkbox"
                      checked={settings[`${method}Enabled`]}
                      onChange={(e) => setSettings((s) => ({ ...s, [`${method}Enabled`]: e.target.checked }))}
                    />
                    {method === 'cod'
                      ? t('Enable Cash on Delivery (COD)', 'ক্যাশ অন ডেলিভারি (COD) চালু রাখুন')
                      : method === 'bkash'
                        ? t('Enable manual bKash number', 'ম্যানুয়াল বিকাশ নম্বর দেখান')
                        : t('Enable manual Nagad number', 'ম্যানুয়াল নগদ নম্বর দেখান')}
                  </label>
                ))}
                <div className="form-row" style={{ marginTop: 14 }}>
                  {(['bkash', 'nagad'] as const).map((m) => (
                    <div key={m}>
                      <label>
                        {m === 'bkash' ? t('bKash Number', 'বিকাশ নম্বর') : t('Nagad Number', 'নগদ নম্বর')}
                        <input
                          value={settings[m]}
                          onChange={(e) => setSettings((s) => ({ ...s, [m]: e.target.value }))}
                          pattern="01[0-9]{9}"
                          required
                        />
                      </label>
                      <label>
                        {t('Account Type', 'অ্যাকাউন্ট ধরন')}
                        <select
                          value={settings[`${m}Type`]}
                          onChange={(e) => setSettings((s) => ({ ...s, [`${m}Type`]: e.target.value as 'merchant' | 'personal' }))}
                        >
                          <option value="personal">{t('Personal', 'পার্সোনাল')}</option>
                          <option value="merchant">{t('Merchant', 'মার্চেন্ট')}</option>
                        </select>
                      </label>
                    </div>
                  ))}
                </div>

                <h3>{t('2. Delivery Charges & Free Shipping', '২. ডেলিভারি চার্জ ও ফ্রি ডেলিভারি')}</h3>
                <div className="form-row">
                  <label>
                    {t('Inside Dhaka (৳)', 'ঢাকার ভিতরে (৳)')}
                    <input
                      type="number"
                      min={0}
                      max={5000}
                      value={settings.insideDhaka}
                      onChange={(e) => setSettings((s) => ({ ...s, insideDhaka: Number(e.target.value) }))}
                      required
                    />
                  </label>
                  <label>
                    {t('Outside Dhaka (৳)', 'ঢাকার বাইরে (৳)')}
                    <input
                      type="number"
                      min={0}
                      max={5000}
                      value={settings.outsideDhaka}
                      onChange={(e) => setSettings((s) => ({ ...s, outsideDhaka: Number(e.target.value) }))}
                      required
                    />
                  </label>
                  <label>
                    {t('Free Delivery Threshold (৳, 0 to disable)', 'ফ্রি ডেলিভারি সীমা (৳, বন্ধ করতে ০ দিন)')}
                    <input
                      type="number"
                      min={0}
                      max={100000}
                      value={settings.freeShippingThreshold ?? 1500}
                      onChange={(e) => setSettings((s) => ({ ...s, freeShippingThreshold: Number(e.target.value) }))}
                      required
                    />
                  </label>
                </div>

                <h3>{t('3. Contact & Shop Address', '৩. যোগাযোগ ও ঠিকানা')}</h3>
                <div className="form-row">
                  {[
                    ['phone', t('Phone Number', 'ফোন নম্বর')],
                    ['whatsapp', t('WhatsApp (digits with 880)', 'WhatsApp (880 সহ নম্বর)')],
                    ['email', t('Business Email', 'ইমেইল')],
                    ['messenger', t('Facebook Page / Messenger ID', 'ফেসবুক পেজ / মেসেঞ্জার ID')],
                  ].map(([key, label]) => (
                    <label key={key}>
                      {label}
                      <input
                        value={String(settings[key as keyof StoreSettings])}
                        onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
                        required
                      />
                    </label>
                  ))}
                </div>
                <label>
                  {t('Shop Address', 'দোকানের ঠিকানা')}
                  <input value={settings.address} onChange={(e) => setSettings((s) => ({ ...s, address: e.target.value }))} required />
                </label>

                <button className="button primary" disabled={busy}>
                  {t('Save Settings', 'সেটিংস সেভ করুন')}
                  <ArrowUpRight size={17} />
                </button>
              </form>
            )}

            {tab === 'accounts' && (
              <>
                <form className="admin-panel admin-form" onSubmit={(e) => account(e, 'password')}>
                  <h3>{t('Change Your Password', 'পাসওয়ার্ড পরিবর্তন করুন')}</h3>
                  <div className="form-row">
                    <label>
                      {t('Current Password', 'বর্তমান পাসওয়ার্ড')}
                      <input name="current" type="password" required autoComplete="current-password" />
                    </label>
                    <label>
                      {t('New Password (12+ characters)', 'নতুন পাসওয়ার্ড (১২+ অক্ষর)')}
                      <input name="password" type="password" required minLength={12} maxLength={128} autoComplete="new-password" />
                    </label>
                  </div>
                  <button className="button primary" disabled={busy}>
                    {t('Update Password', 'পাসওয়ার্ড আপডেট')}
                    <ShieldCheck size={16} />
                  </button>
                </form>
                <form className="admin-panel admin-form" onSubmit={(e) => account(e, 'setup')}>
                  <h3>{t('Add Another Admin', 'নতুন অ্যাডমিন যোগ করুন')}</h3>
                  <p className="small-muted">
                    {t(
                      'Only emails listed in the server ADMIN_EMAILS setting can be added.',
                      'শুধু সার্ভারের ADMIN_EMAILS লিস্টে থাকা ইমেইল এখানে যোগ করা যাবে।'
                    )}
                  </p>
                  <div className="form-row">
                    <label>
                      {t('Approved Email', 'অনুমোদিত ইমেইল')}
                      <input name="email" type="email" required />
                    </label>
                    <label>
                      {t('Password (12+ characters)', 'পাসওয়ার্ড (১২+ অক্ষর)')}
                      <input name="password" type="password" required minLength={12} maxLength={128} autoComplete="new-password" />
                    </label>
                  </div>
                  <button className="button outline" disabled={busy}>
                    {t('Create Admin', 'অ্যাডমিন তৈরি করুন')}
                    <Users size={16} />
                  </button>
                </form>
              </>
            )}
          </>
        )}

        {product && (
          <Modal
            title={editingProductId ? t('Edit Product', 'পণ্য এডিট') : t('Add New Product', 'নতুন পণ্য যোগ')}
            onClose={() => {
              if (!busy && !uploading) {
                setProduct(null);
                setConfirmDeleteProduct(false);
              }
            }}
            className="admin-edit-modal"
          >
            <div className="eyebrow">{t('PRODUCT DETAILS', 'পণ্যের তথ্য')}</div>
            <h2>{editingProductId ? t('Update Product', 'পণ্য আপডেট করুন') : t('Add New Product', 'নতুন পণ্য আপলোড করুন')}</h2>
            <form
              className="admin-form"
              onSubmit={async (e) => {
                e.preventDefault();
                const cleanName = product.name.trim();
                const cleanNameBn = product.nameBn.trim().length >= 2 ? product.nameBn.trim() : cleanName;
                const cleanCat = product.category.trim();
                const cleanCatBn = product.categoryBn.trim().length >= 2 ? product.categoryBn.trim() : cleanCat;
                const cleanDesc = product.description.trim();
                const cleanDescBn = product.descriptionBn.trim() || cleanDesc;
                const finalId =
                  editingProductId ??
                  (product.id.trim() || slugifyProductId(cleanName, existingProductIds));

                const normalized: Product = {
                  ...product,
                  id: finalId,
                  name: cleanName,
                  nameBn: cleanNameBn,
                  category: cleanCat,
                  categoryBn: cleanCatBn,
                  description: cleanDesc,
                  descriptionBn: cleanDescBn,
                  bestSeller: Boolean(product.bestSeller),
                };

                if (
                  await save({
                    action: 'product',
                    product: normalized,
                    position: productPosition,
                  })
                ) {
                  setProduct(null);
                  setConfirmDeleteProduct(false);
                }
              }}
            >
              <div className="upload-control">
                <img className="admin-product-preview" src={product.image} alt="Product preview" />
                <label style={{ marginBottom: 0 }}>
                  <strong>{uploading ? t('Uploading & optimizing photo…', 'ছবি আপলোড হচ্ছে…') : t('1. Upload Product Photo', '১. পণ্যের ছবি আপলোড করুন')}</strong>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploading}
                    onChange={(e) => {
                      if (e.target.files?.[0]) upload(e.target.files[0]);
                    }}
                  />
                  <small>{t('JPG, PNG or WebP (max 5 MB)', 'JPG, PNG বা WebP (সর্বোচ্চ ৫ মেগাবাইট)')}</small>
                </label>
              </div>

              <div className="form-row">
                <label>
                  {t('Product Name *', 'পণ্যের নাম (ইংরেজি) *')}
                  <input
                    value={product.name}
                    required
                    minLength={2}
                    placeholder="e.g., Pastel Satin Ribbon"
                    onChange={(e) => {
                      const val = e.target.value;
                      setProduct((p) => {
                        if (!p) return p;
                        const nextId =
                          editingProductId === null && !manualIdEdited
                            ? slugifyProductId(val, existingProductIds)
                            : p.id;
                        return { ...p, name: val, id: nextId };
                      });
                    }}
                  />
                </label>
                <label>
                  {t('Bangla Name (Optional)', 'বাংলা নাম (ঐচ্ছিক)')}
                  <input
                    value={product.nameBn}
                    placeholder={t('Leave blank to use English name', 'খালি রাখলে ইংরেজি নামই দেখাবে')}
                    onChange={(e) => setProduct((p) => (p ? { ...p, nameBn: e.target.value } : p))}
                  />
                </label>

                <label>
                  {t('Category *', 'ক্যাটাগরি *')}
                  <select
                    value={customCategory ? '__custom__' : product.category}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '__custom__') {
                        setCustomCategory(true);
                        return;
                      }
                      setCustomCategory(false);
                      const preset = CATEGORY_PRESETS.find((c) => c.category === val);
                      if (preset) {
                        setProduct((p) => (p ? { ...p, category: preset.category, categoryBn: preset.categoryBn } : p));
                      }
                    }}
                  >
                    {CATEGORY_PRESETS.map((c) => (
                      <option key={c.category} value={c.category}>
                        {c.category} ({c.categoryBn})
                      </option>
                    ))}
                    <option value="__custom__">{t('Other (Type custom category)', 'অন্যান্য (নিজে লিখুন)')}</option>
                  </select>
                </label>

                <label>
                  {t('Price (৳ BDT) *', 'দাম (টাকা) *')}
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={500000}
                    required
                    value={product.price}
                    onChange={(e) => setProduct((p) => (p ? { ...p, price: Number(e.target.value) } : p))}
                  />
                </label>
              </div>

              {customCategory && (
                <div className="form-row">
                  <label>
                    {t('Custom Category (English) *', 'ক্যাটাগরি নাম (ইংরেজি) *')}
                    <input
                      value={product.category}
                      required
                      minLength={2}
                      onChange={(e) => setProduct((p) => (p ? { ...p, category: e.target.value } : p))}
                    />
                  </label>
                  <label>
                    {t('Custom Category (বাংলা)', 'ক্যাটাগরি নাম (বাংলা)')}
                    <input
                      value={product.categoryBn}
                      placeholder={t('Optional', 'ঐচ্ছিক')}
                      onChange={(e) => setProduct((p) => (p ? { ...p, categoryBn: e.target.value } : p))}
                    />
                  </label>
                </div>
              )}

              <div className="form-row">
                <label>
                  {t('Main Page Serial # (1 = First)', 'মেইন পেজে সিরিয়াল নম্বর (১ = সবার আগে)')}
                  <input
                    type="number"
                    min={1}
                    max={(data?.products.length ?? 100) + 1}
                    value={productPosition}
                    onChange={(e) => setProductPosition(Math.max(1, Number(e.target.value) || 1))}
                  />
                </label>
                <label>
                  {t('Stock Quantity (Blank = Always Available)', 'স্টক সংখ্যা (খালি রাখলে সবসময় অর্ডার নেবে)')}
                  <input
                    type="number"
                    min={0}
                    max={1000000}
                    value={product.stock ?? ''}
                    onChange={(e) =>
                      setProduct((p) => (p ? { ...p, stock: e.target.value === '' ? null : Number(e.target.value) } : p))
                    }
                  />
                </label>
              </div>

              <label>
                {t('Product Details / Description', 'পণ্যের বিস্তারিত বিবরণ')}
                <textarea
                  value={product.description}
                  rows={3}
                  maxLength={2000}
                  placeholder={t('Size, color, pieces per pack, etc.', 'সাইজ, রং, প্রতি প্যাকে কয়টা ইত্যাদি লিখুন…')}
                  onChange={(e) => setProduct((p) => (p ? { ...p, description: e.target.value } : p))}
                />
              </label>

              <label>
                {t('Bangla Description (Optional)', 'বাংলা বিবরণ (ঐচ্ছিক)')}
                <textarea
                  value={product.descriptionBn}
                  rows={2}
                  maxLength={2000}
                  placeholder={t('Leave blank to use the English description above', 'খালি রাখলে উপরের বিবরণই ব্যবহার হবে')}
                  onChange={(e) => setProduct((p) => (p ? { ...p, descriptionBn: e.target.value } : p))}
                />
              </label>

              <label className="check-label">
                <input
                  type="checkbox"
                  checked={Boolean(product.bestSeller)}
                  onChange={(e) => setProduct((p) => (p ? { ...p, bestSeller: e.target.checked } : p))}
                />
                {t('Mark as "Best Seller" (shows badge on main website)', '"Best Seller" ব্যাজ দেখান')}
              </label>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={product.active}
                  onChange={(e) => setProduct((p) => (p ? { ...p, active: e.target.checked } : p))}
                />
                {t('Show on website', 'ওয়েবসাইটে দেখান')}
              </label>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={product.available}
                  onChange={(e) => setProduct((p) => (p ? { ...p, available: e.target.checked } : p))}
                />
                {t('Available to order', 'অর্ডার নেওয়ার জন্য চালু')}
              </label>

              <details className="admin-advanced-id">
                <summary>{t('Advanced: Product URL ID', 'অ্যাডভান্সড: প্রোডাক্ট ID')}</summary>
                <label style={{ marginTop: 10 }}>
                  {t('Auto-generated ID (lowercase letters, numbers, hyphens)', 'অটো-তৈরি ID')}
                  <input
                    value={product.id}
                    pattern="[a-z0-9][a-z0-9-]{0,99}"
                    readOnly={editingProductId !== null}
                    onChange={(e) => {
                      setManualIdEdited(true);
                      setProduct((p) => (p ? { ...p, id: e.target.value } : p));
                    }}
                  />
                </label>
              </details>

              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}

              <button className="button primary wide" disabled={busy || uploading} style={{ marginTop: 16 }}>
                {busy ? t('Saving…', 'সেভ হচ্ছে…') : t('Save Product', 'পণ্য সেভ করুন')}
              </button>

              {editingProductId !== null && (
                <div className="admin-delete-area">
                  {!baseIds.has(editingProductId) ? (
                    confirmDeleteProduct ? (
                      <div className="admin-confirm-delete">
                        <span>{t('Delete this product permanently?', 'এই পণ্যটি স্থায়ীভাবে মুছে ফেলবেন?')}</span>
                        <button
                          type="button"
                          className="button admin-danger-btn"
                          disabled={busy}
                          onClick={async () => {
                            if (
                              await save(
                                { action: 'deleteProduct', id: editingProductId },
                                t('Product deleted.', 'পণ্যটি মুছে ফেলা হয়েছে।')
                              )
                            ) {
                              setProduct(null);
                              setConfirmDeleteProduct(false);
                            }
                          }}
                        >
                          <Trash2 size={15} />
                          {t('Yes, Delete', 'হ্যাঁ, মুছে ফেলুন')}
                        </button>
                        <button type="button" className="button outline" onClick={() => setConfirmDeleteProduct(false)}>
                          {t('Cancel', 'বাতিল')}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="text-link admin-danger-link"
                        onClick={() => setConfirmDeleteProduct(true)}
                      >
                        <Trash2 size={14} />
                        {t('Delete this custom product', 'এই পণ্যটি ডিলিট করুন')}
                      </button>
                    )
                  ) : (
                    <p className="small-muted">
                      {t(
                        'This is a built-in starter catalog item. Uncheck "Show on website" above to hide it.',
                        'এটি শুরুর ক্যাটালগের পণ্য। লুকাতে চাইলে উপরের "ওয়েবসাইটে দেখান" টিক তুলে দিন।'
                      )}
                    </p>
                  )}
                </div>
              )}
            </form>
          </Modal>
        )}

        {order && (
          <Modal
            title={t('Order Details & Call Confirm', 'অর্ডার ও কল কনফার্মেশন')}
            onClose={() => {
              if (!busy) {
                setOrder(null);
                setConfirmCancelOrder(false);
              }
            }}
            className="admin-edit-modal"
          >
            <div className="eyebrow">{t('CUSTOMER ORDER', 'গ্রাহকের অর্ডার')}</div>
            <h2>{order.reference}</h2>

            <div className="admin-order-detail">
              <div>
                <strong>{order.name}</strong>
                <div style={{ marginTop: 4 }}>{order.phone}</div>
                <div style={{ marginTop: 6 }}>
                  {order.address}
                  <br />
                  {order.district} · {order.zone === 'dhaka' ? t('Inside Dhaka', 'ঢাকার ভিতরে') : t('Outside Dhaka', 'ঢাকার বাইরে')}
                </div>
                <div className="admin-call-actions">
                  <a className="button primary admin-phone-link" href={`tel:${order.phone.replace(/[^\d+]/g, '')}`}>
                    <Phone size={15} />
                    {t('Call Customer', 'কল করুন')}
                  </a>
                  <a
                    className="button outline admin-phone-link"
                    href={`https://wa.me/${waNumber(order.phone)}?text=${encodeURIComponent(
                      `Hello ${order.name}, calling from Craftique Yard regarding your order ${order.reference} (Total ৳${order.total}).`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle size={15} />
                    WhatsApp
                  </a>
                </div>
              </div>
              <div>
                <strong>{money(order.total)}</strong>
                {t('Products', 'পণ্যের দাম')}: {money(order.subtotal)}
                <br />
                {t('Delivery', 'ডেলিভারি')}: {money(order.shipping)}
                <br />
                {t('Method', 'পেমেন্ট পদ্ধতি')}: {order.payment.toUpperCase()}
              </div>
            </div>

            {order.note && (
              <p className="admin-notice">
                <strong>{t('Customer Note:', 'গ্রাহকের নোট:')}</strong> {order.note}
              </p>
            )}

            {order.items.map((i) => (
              <div className="admin-order-items" key={i.id}>
                <span>
                  {i.name} × {i.quantity}
                </span>
                <strong>{money(i.price * i.quantity)}</strong>
              </div>
            ))}

            <div className="admin-quick-actions">
              <div className="small-muted" style={{ width: '100%', marginBottom: 4 }}>
                <strong>{t('Quick Actions (1-Click Save):', 'এক ক্লিকে স্ট্যাটাস আপডেট:')}</strong>
              </div>
              <button
                type="button"
                className="button primary"
                disabled={busy}
                onClick={() => quickOrderUpdate('confirmed')}
              >
                <Check size={15} />
                {t('Call Done → Confirm Order', 'কল হয়েছে → অর্ডার কনফার্ম')}
              </button>
              <button
                type="button"
                className="button outline"
                disabled={busy}
                onClick={() => quickOrderUpdate('shipped')}
              >
                {t('Mark Shipped', 'ডেলিভারিতে পাঠানো হয়েছে')}
              </button>
              <button
                type="button"
                className="button outline"
                disabled={busy}
                onClick={() => quickOrderUpdate('delivered', 'paid')}
              >
                {t('Delivered & COD Paid', 'ডেলিভারি ও টাকা প্রাপ্ত')}
              </button>
              {confirmCancelOrder ? (
                <>
                  <button
                    type="button"
                    className="button admin-danger-btn"
                    disabled={busy}
                    onClick={() => quickOrderUpdate('cancelled')}
                  >
                    {t('Confirm Cancel', 'নিশ্চিত বাতিল')}
                  </button>
                  <button type="button" className="button outline" onClick={() => setConfirmCancelOrder(false)}>
                    {t('Keep Order', 'থাকুক')}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="text-link admin-danger-link"
                  onClick={() => setConfirmCancelOrder(true)}
                >
                  {t('Cancel Order', 'অর্ডার বাতিল')}
                </button>
              )}
            </div>

            <form
              className="admin-form"
              onSubmit={async (e) => {
                e.preventDefault();
                if (
                  await save({
                    action: 'order',
                    order: {
                      id: order.id,
                      status: order.status,
                      paymentStatus: order.payment_status,
                      transactionRef: order.transactionRef || '',
                      staffNote: order.staffNote || '',
                    },
                  })
                ) {
                  setOrder(null);
                  setConfirmCancelOrder(false);
                }
              }}
            >
              <label>
                {t('Call / Staff Note (private, only admins see this)', 'কল নোট (শুধু অ্যাডমিন দেখতে পাবেন)')}
                <textarea
                  value={order.staffNote || ''}
                  rows={2}
                  maxLength={1500}
                  placeholder={t('e.g., Called at 4pm, confirmed address, send tomorrow.', 'যেমন: কল করে ঠিকানা কনফার্ম করা হয়েছে, আগামীকাল ডেলিভারি।')}
                  onChange={(e) => setOrder((o) => (o ? { ...o, staffNote: e.target.value } : o))}
                />
              </label>

              <div className="form-row">
                <label>
                  {t('Order Status', 'অর্ডারের অবস্থা')}
                  <select value={order.status} onChange={(e) => setOrder((o) => (o ? { ...o, status: e.target.value } : o))}>
                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                      <option key={s} value={s}>
                        {t(...(statusText[s] || [s, s]))}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {t('Payment Status', 'পেমেন্ট অবস্থা')}
                  <select
                    value={order.payment_status}
                    onChange={(e) => setOrder((o) => (o ? { ...o, payment_status: e.target.value } : o))}
                  >
                    {['unpaid', 'verification_pending', 'paid', 'refunded'].map((s) => (
                      <option key={s} value={s}>
                        {t(...(statusText[s] || [s, s]))}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {order.payment !== 'cod' && (
                <label>
                  {t('bKash / Nagad Transaction ID (if received)', 'bKash / Nagad ট্রানজেকশন ID')}
                  <input
                    value={order.transactionRef || ''}
                    maxLength={100}
                    onChange={(e) => setOrder((o) => (o ? { ...o, transactionRef: e.target.value } : o))}
                  />
                </label>
              )}

              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <button className="button outline wide" disabled={busy}>
                {busy ? t('Saving…', 'সেভ হচ্ছে…') : t('Save Note & Manual Changes', 'নোট ও পরিবর্তন সেভ করুন')}
              </button>
            </form>
          </Modal>
        )}
      </section>
    </main>
  );
}
