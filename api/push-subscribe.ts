import { requireAdmin } from './_push-auth'
type Req={method?:string;headers:Record<string,string|undefined>;body?:unknown}
type Res={status:(n:number)=>{json:(v:unknown)=>void}}
export default async function handler(req:Req,res:Res){
 if(req.method!=='POST')return res.status(405).json({error:'Méthode non autorisée'})
 const admin=await requireAdmin(req)
 if(!admin)return res.status(401).json({error:'Accès administrateur requis'})
 const body=typeof req.body==='string'?JSON.parse(req.body):req.body
 const item=body as {endpoint?:unknown;keys?:{p256dh?:unknown;auth?:unknown}}
 if(typeof item?.endpoint!=='string'||!item.endpoint.startsWith('https://')||item.endpoint.length>2048||typeof item.keys?.p256dh!=='string'||typeof item.keys?.auth!=='string')return res.status(400).json({error:'Abonnement invalide'})
 const response=await fetch(admin.url+'/rest/v1/admin_push_subscriptions?on_conflict=endpoint',{
 method:'POST',headers:{apikey:admin.service,Authorization:'Bearer '+admin.service,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},
 body:JSON.stringify({endpoint:item.endpoint,p256dh:item.keys.p256dh,auth:item.keys.auth,admin_user_id:admin.userId})
 })
 if(!response.ok)return res.status(503).json({error:'Enregistrement indisponible'})
 return res.status(200).json({ok:true})
}
