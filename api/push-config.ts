type Req={method?:string;headers:Record<string,string|undefined>}
type Res={status:(n:number)=>{json:(v:unknown)=>void}}
const publicKey='BM2lcgVrfn2qkEvnv8bY3mJAH7d1rwc16_0QOLSnXS1c3iqdhMNW0n3OHYbqDU3zxXwBxZPCOmyAmVQL4Q9Svzo'
export default async function handler(req:Req,res:Res){
 if(req.method!=='GET')return res.status(405).json({error:'Méthode non autorisée'})
 const url=process.env.VITE_SUPABASE_URL?.replace(/\/$/,'')
 const anon=process.env.VITE_SUPABASE_ANON_KEY
 const service=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!url||!anon||!service)return res.status(503).json({error:'Configuration serveur incomplète'})
 const authorization=req.headers.authorization||''
 if(!authorization.startsWith('Bearer '))return res.status(401).json({error:'Connexion requise'})
 try{
  const response=await fetch(url+'/auth/v1/user',{headers:{apikey:anon,Authorization:authorization}})
  if(!response.ok)return res.status(401).json({error:'Session expirée'})
  const user=await response.json()
  const email=String(user.email||'').trim().toLowerCase()
  const allowed=String(process.env.ADMIN_EMAIL||'').trim().toLowerCase()
  const privileged=user.app_metadata?.role==='admin'||user.app_metadata?.is_admin===true
  if(!(privileged||(allowed&&email===allowed)))return res.status(403).json({error:'Accès réservé à l’administration'})
  return res.status(200).json({publicKey})
 }catch(error){
  console.error('Push config failure',error)
  return res.status(500).json({error:'Service indisponible'})
 }
}
