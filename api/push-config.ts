import { requireAdmin } from './_push-auth'
type Req={method?:string;headers:Record<string,string|undefined>}
type Res={status:(n:number)=>{json:(v:unknown)=>void}}
export default async function handler(req:Req,res:Res){
 if(req.method!=='GET')return res.status(405).json({error:'Méthode non autorisée'})
 if(!await requireAdmin(req))return res.status(401).json({error:'Accès administrateur requis'})
 const admin=await requireAdmin(req)
 if(!admin)return res.status(401).json({error:'Accès administrateur requis'})
 const response=await fetch(admin.url+'/rest/v1/push_server_config?id=eq.1&select=vapid_public_key',{headers:{apikey:admin.service,Authorization:'Bearer '+admin.service}})
 if(!response.ok)return res.status(503).json({error:'Notifications non configurées'})
 const rows=await response.json()
 if(!rows[0]?.vapid_public_key)return res.status(503).json({error:'Clé de notifications absente'})
 return res.status(200).json({publicKey:rows[0].vapid_public_key})
}
