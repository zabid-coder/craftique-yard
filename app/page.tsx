import Storefront from './storefront';
import {getProducts,getSettings} from './lib/store';
import {baseProducts,defaults} from './lib/catalog';
export const dynamic='force-dynamic';
export default async function Home(){let products=baseProducts,settings=defaults;try{[products,settings]=await Promise.all([getProducts(),getSettings()]);}catch{}return <Storefront products={products} settings={settings}/>;}
