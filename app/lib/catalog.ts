import source from '../../research/catalog.json';
import homeImages from '../../research/home-images.json';
export {
  CATEGORY_PRESETS,
  sortProductsByOrder,
  applyProductPosition,
  slugifyProductId,
  type CategoryPreset,
} from './catalog-order';
export type Product = {id:string;name:string;nameBn:string;category:string;categoryBn:string;price:number;image:string;description:string;descriptionBn:string;available:boolean;active:boolean;stock:number|null;bestSeller?:boolean};
export type StoreSettings = {whatsapp:string;messenger:string;phone:string;email:string;address:string;insideDhaka:number;outsideDhaka:number;freeShippingThreshold?:number;bkash:string;nagad:string;bkashType:'personal'|'merchant';nagadType:'personal'|'merchant';codEnabled:boolean;bkashEnabled:boolean;nagadEnabled:boolean};
export const defaults:StoreSettings={whatsapp:'8801733399372',messenger:'61592911649087',phone:'01733-399372',email:'amikaakter162@gmail.com',address:'Uttara Sector 3, Road 14, House 53, Dhaka',insideDhaka:80,outsideDhaka:130,freeShippingThreshold:1500,bkash:'01733399372',nagad:'01733399372',bkashType:'personal',nagadType:'personal',codEnabled:true,bkashEnabled:true,nagadEnabled:true};
function category(id:string):[string,string] {
  if(id.includes('about-100')) return ['Chenille stems','পাইপ ক্লিনার'];
  if(id.includes('ribbon')) return ['Ribbons','রিবন'];
  if(id.includes('yarn')) return ['Bouquet mesh','বুকেট মেশ'];
  if(id.includes('paper')||id.includes('roll')) return ['Wrapping paper','র‍্যাপিং পেপার'];
  if(id.includes('beg')||id.startsWith('1-packet')) return ['Bouquet bags','বুকেট ব্যাগ'];
  if(id.includes('lamp')||id.includes('light-2')) return ['Fairy lights','ফেয়ারি লাইট'];
  if(['light-green','light-green-1','green','green-1'].includes(id)) return ['Floral tape','ফ্লোরাল টেপ'];
  if(id.includes('bamboo')) return ['Tools & accessories','টুলস ও অ্যাকসেসরিজ'];
  return ['Flower stamens','ফুলের রেণু'];
}
const colors:Record<string,string>={'light green':'হালকা সবুজ','light pink':'হালকা গোলাপি','light blue':'হালকা নীল','dark yellow':'গাঢ় হলুদ','light yellow':'হালকা হলুদ','deep purple':'গাঢ় বেগুনি','deep blue':'গাঢ় নীল','light purple':'হালকা বেগুনি','off white':'অফ হোয়াইট','watermelon red':'তরমুজ লাল','military green':'মিলিটারি সবুজ','bright red':'উজ্জ্বল লাল','light coffee':'হালকা কফি','dark coffee':'গাঢ় কফি','deep maroon':'গাঢ় মেরুন','white':'সাদা','green':'সবুজ','yellow':'হলুদ','purple':'বেগুনি','orange':'কমলা','pink':'গোলাপি','red':'লাল','blue':'নীল','golden':'সোনালি','black':'কালো','levenda':'ল্যাভেন্ডার','light levenda':'হালকা ল্যাভেন্ডার','skin colour':'স্কিন কালার','brown coffee':'বাদামি কফি','light lake blue':'হালকা লেক ব্লু','light mose green':'হালকা মস গ্রিন'};
export const baseProducts:Product[]=source.map(p=>{
  const [cat,catBn]=category(p.id);let name=p.name.replace(/\s*\(?Coming\s*soon\)?/ig,'').replace(/Warping/ig,'Wrapping').replace(/\bBeg\b/ig,'Bag').replace(/Tissu Ribbon/ig,'Tissue Ribbon').trim();
  if(cat==='Chenille stems') name=`Chenille stems - ${name.replace(/\s*\[about 100\]/i,'')} (approx. 100 pcs)`;
  if(cat==='Floral tape') name=`Floral tape - ${name}`;
  if(cat==='Flower stamens'&&!name.toLowerCase().includes('flower core')) name=`Flower stamens - ${name}`;
  if(name==='1 packet 10 pcs') name='Bouquet bags - pack of 10';
  let bn=catBn;const color=Object.keys(colors).sort((a,b)=>b.length-a.length).find(c=>p.name.toLowerCase().includes(c));if(color) bn+=` - ${colors[color]}`;
  if(cat==='Chenille stems') bn+=' (প্রায় ১০০ পিস)';if(cat==='Flower stamens') bn+=' (প্রায় ৪০০ পিস)';if(cat==='Fairy lights') bn+=' - ২ মিটার';
  return {id:p.id,name,nameBn:bn,category:cat,categoryBn:catBn,price:p.price,image:(homeImages as Record<string,string>)[p.id]||p.image,
    description:`${cat} for your next craft project. Select the item shown in the photo. We confirm availability and your order before dispatch. For pack size or bulk quantities, message us.`,
    descriptionBn:`আপনার পরের ক্রাফট প্রজেক্টের জন্য ${catBn}। ছবিতে দেখানো পণ্যটি নির্বাচন করুন। পাঠানোর আগে stock ও অর্ডার নিশ্চিত করা হবে। প্যাকের মাপ বা bulk order-এর জন্য আমাদের মেসেজ করুন।`,available:p.referenceAvailable,active:true,stock:null};
});
export const featuredIds=['light-pink-a12-about-100','just-for-you-ribbon-white','warm-light-2-meters','light-green','bouquet-yarn-2','yellow-400-pcs','flower-beg-1-pcs','colour-ribbon'];
export const baseProductIds = new Set(baseProducts.map((p) => p.id));
export const defaultProductOrder = [
  ...featuredIds.filter((id) => baseProductIds.has(id)),
  ...baseProducts.map((p) => p.id).filter((id) => !featuredIds.includes(id)),
];
