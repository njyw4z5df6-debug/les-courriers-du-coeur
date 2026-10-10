type Req={method?:string;headers:Record<string,string|undefined>;query?:{id?:string}}
type Res={status:(n:number)=>{json:(x:unknown)=>void}}
export default async function handler(req:Req,res:Res){
 if(req.method!=='DELETE')return res.status(405).json({error:'Méthode non autorisée'})
 const base=process.env.VITE_SUPABASE_URL
 const anon=process.env.VITE_SUPABASE_ANON_KEY
 const service=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!base||!anon||!service)return res.status(503).json({error:'Configuration manquante'})
 const bearer=req.headers.authorization||''
 if(!bearer.startsWith('Bearer '))return res.status(401).json({error:'Connexion requise'})
 const id=Number(req.query?.id)
 if(!Number.isSafeInteger(id)||id<=0)return res.status(400).json({error:'Identifiant invalide'})
 try{
  const auth=await fetch(base+'/auth/v1/user',{headers:{apikey:anon,Authorization:bearer}})
  if(!auth.ok)return res.status(401).json({error:'Session expirée'})
  const user=await auth.json()
  const allowed=String(process.env.ADMIN_EMAIL||'').trim().toLowerCase()
  if(!(user.app_metadata?.role==='admin'||user.app_metadata?.is_admin===true||(allowed&&String(user.email||'').trim().toLowerCase()===allowed)))return res.status(403).json({error:'Accès interdit'})
  const result=await fetch(base+'/rest/v1/reponses?id=eq.'+id+'&est_admin=eq.true&statut=eq.valide',{method:'DELETE',headers:{apikey:service,Authorization:'Bearer '+service,Prefer:'return=representation'}})
  if(!result.ok)throw new Error('Suppression refusée')
  const removed=await result.json()
  if(!Array.isArray(removed)||removed.length!==1)return res.status(404).json({error:'Réponse introuvable'})
  return res.status(200).json({success:true})
 }catch(error){console.error(error);return res.status(500).json({error:'Suppression impossible'})}
}
