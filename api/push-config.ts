import { requireAdmin } from './_push-auth'
type Req={method?:string;headers:Record<string,string|undefined>}
type Res={status:(n:number)=>{json:(v:unknown)=>void}}
export default async function handler(req:Req,res:Res){
 if(req.method!=='GET')return res.status(405).json({error:'Méthode non autorisée'})
 if(!await requireAdmin(req))return res.status(401).json({error:'Accès administrateur requis'})
 const publicKey=process.env.VAPID_PUBLIC_KEY
 if(!publicKey)return res.status(503).json({error:'Notifications non configurées'})
 return res.status(200).json({publicKey})
}
