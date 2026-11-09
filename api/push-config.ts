import { requireAdmin } from './_push-auth'
type Req={method?:string;headers:Record<string,string|undefined>}
type Res={status:(n:number)=>{json:(v:unknown)=>void}}
const publicKey='BM2lcgVrfn2qkEvnv8bY3mJAH7d1rwc16_0QOLSnXS1c3iqdhMNW0n3OHYbqDU3zxXwBxZPCOmyAmVQL4Q9Svzo'
export default async function handler(req:Req,res:Res){
 if(req.method!=='GET')return res.status(405).json({error:'Méthode non autorisée'})
 try {
  const admin=await requireAdmin(req)
  if(!admin)return res.status(401).json({error:'Accès administrateur requis'})
  return res.status(200).json({publicKey})
 }catch(error){
  console.error('Push config authorization failed',error)
  return res.status(503).json({error:'Service temporairement indisponible'})
 }
}
