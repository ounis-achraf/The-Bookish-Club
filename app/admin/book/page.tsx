 "use client";
import { useEffect,useState } from "react";
import { createClient } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function BookManager(){
 const s=createClient(),router=useRouter();const [title,setTitle]=useState(""),[author,setAuthor]=useState(""),[cover,setCover]=useState<File|null>(null),[old,setOld]=useState<any>(null),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState("");
 useEffect(()=>{(async()=>{const {data:{user}}=await s.auth.getUser();if(!user){router.replace("/admin/login");return}const {data}=await s.from("books").select("*").eq("is_current",true).maybeSingle();if(data){setOld(data);setTitle(data.title);setAuthor(data.author)}setLoading(false)})()},[]);
 async function save(e:React.FormEvent){e.preventDefault();if(!title.trim()||!author.trim()){setError("Title and author are required.");return}setSaving(true);setError("");try{let cover_url=old?.cover_url||null;if(cover){if(cover.size>5*1024*1024)throw new Error("Cover must be 5 MB or smaller.");const ext=cover.name.split(".").pop()?.toLowerCase()||"jpg";const path=`${crypto.randomUUID()}.${ext}`;const u=await s.storage.from("book-covers").upload(path,cover,{contentType:cover.type,upsert:false});if(u.error)throw u.error;cover_url=s.storage.from("book-covers").getPublicUrl(path).data.publicUrl}
 if(old){await s.from("books").update({is_current:false}).eq("id",old.id)}
 const {error:e2}=await s.from("books").insert({title:title.trim(),author:author.trim(),cover_url,is_current:true});if(e2)throw e2;router.push("/admin/dashboard")}catch(e:any){setError(e.message||"Could not save.")}finally{setSaving(false)}}
 if(loading)return <main className="center">Loading…</main>;
 return <main className="center"><form className="card login wide" onSubmit={save}><a href="/admin/dashboard">← Dashboard</a><div className="eyebrow">MONTHLY BOOK</div><h1>{old?"Change book":"Choose book"}</h1><p className="muted">The previous book stays safely in the archive. Its reviews are not deleted.</p><label>Book title<input value={title} onChange={e=>setTitle(e.target.value)} required/></label><label>Author<input value={author} onChange={e=>setAuthor(e.target.value)} required/></label><label>Book cover <span className="optional">optional</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setCover(e.target.files?.[0]||null)}/></label>{error&&<div className="error">{error}</div>}<button className="primary" disabled={saving}>{saving?"Saving…":"START THIS BOOK"}</button></form></main>
}