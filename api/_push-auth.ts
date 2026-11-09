export async function requireAdmin(req: {headers: Record<string,string|undefined>}) {
 const url=process.env.VITE_SUPABASE_URL?.replace(/\\/$/,'')
 const anon=process.env.VITE_SUPABASE_ANON_KEY
 const service=process.env.SUPABASE_SERVICE_ROLE_KEY
 const bearer=req.headers.authorization||''
 if(!url||!anon||!service) return null
 if(!bearer.startsWith('Bearer ')) return null
 const response=await fetch(url+'/auth/v1/user',{headers:{apikey:anon,Authorization:bearer}})
 if(!response.ok) return null
 const user=await response.json()
 const email=String(user.email||'').trim().toLowerCase()
 const allowed=String(process.env.ADMIN_EMAIL||'').trim().toLowerCase()
 if(!(user.app_metadata?.role==='admin'||user.app_metadata?.is_admin===true||(allowed&&email===allowed))) return null
 return {url,service,userId:String(user.id)}
}
