type Req={method?:string;headers:Record<string,string|undefined>;body?:unknown}
type Res={status:(n:number)=>{json:(v:unknown)=>void}}
export default async function handler(req:Req,res:Res){
 if(req.method!=='POST')return res.status(405).json({error:'Méthode non autorisée'})
 try {
  const url=process.env.VITE_SUPABASE_URL?.replace(/\/$/,'')
  const anon=process.env.VITE_SUPABASE_ANON_KEY
  const service=process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!url||!anon||!service)return res.status(503).json({error:'Configuration serveur incomplète'})
  const authorization=req.headers.authorization||''
  if(!authorization.startsWith('Bearer '))return res.status(401).json({error:'Connexion requise'})
  const authResponse=await fetch(url+'/auth/v1/user',{headers:{apikey:anon,Authorization:authorization}})
  if(!authResponse.ok)return res.status(401).json({error:'Session expirée'})
  const user=await authResponse.json()
  const email=String(user.email||'').trim().toLowerCase()
  const allowed=String(process.env.ADMIN_EMAIL||'').trim().toLowerCase()
  const privileged=user.app_metadata?.role==='admin'||user.app_metadata?.is_admin===true
  if(!(privileged||(allowed&&email===allowed)))return res.status(403).json({error:'Accès réservé à l’administration'})
  const admin={url,service,userId:String(user.id)}
  let body:unknown
  try { body=typeof req.body==='string'?JSON.parse(req.body):req.body }
  catch { return res.status(400).json({error:'Corps de requête invalide'}) }
  const item=body as {endpoint?:unknown;keys?:{p256dh?:unknown;auth?:unknown}}|null
  if(typeof item?.endpoint!=='string'||!item.endpoint.startsWith('https://')||item.endpoint.length>2048||typeof item.keys?.p256dh!=='string'||typeof item.keys?.auth!=='string')return res.status(400).json({error:'Abonnement invalide'})
  const response=await fetch(admin.url+'/rest/v1/admin_push_subscriptions?on_conflict=endpoint',{
   method:'POST',headers:{apikey:admin.service,Authorization:'Bearer '+admin.service,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},
   body:JSON.stringify({endpoint:item.endpoint,p256dh:item.keys.p256dh,auth:item.keys.auth,admin_user_id:admin.userId})
  })
  if(!response.ok){
   const errorBody=await response.json().catch(()=>null) as {code?:string}|null
   console.error('Push subscription storage failed',response.status,errorBody?.code||'unknown')
   return res.status(503).json({error:'Enregistrement Supabase indisponible (HTTP '+response.status+(errorBody?.code?', code '+errorBody.code:'')+')'})
  }
  return res.status(200).json({ok:true})
 } catch(error) {
  console.error('Push subscription handler failed',error)
  return res.status(503).json({error:'Service de notifications indisponible : erreur serveur'})
 }
}
