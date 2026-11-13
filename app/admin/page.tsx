import Admin from './panel';
import {getAdmin} from '../lib/auth';
export const dynamic='force-dynamic';
export const metadata={title:'Store dashboard | Craftique Yard',robots:{index:false,follow:false}};
export default async function Page(){let user:string|null=null;try{user=await getAdmin();}catch{}return <Admin user={user}/>;}
