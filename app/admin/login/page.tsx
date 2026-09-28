 "use client";
import { useState } from "react";
import { createClient } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
  const supabase=createClient(), router=useRouter();
  const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[error,setError]=useState(""),[loading,setLoading]=useState(false);
  async function submit(e:React.FormEvent){e.preventDefault();setLoading(true);setError("");const {error}=await supabase.auth.signInWithPassword({email,password});if(error)setError(error.message);else router.push("/admin/dashboard");setLoading(false);}
  return <main className="center"><form className="card login" onSubmit={submit}><div className="eyebrow">BOOK CLUB ADMIN</div><h1>Sign in</h1><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>{error&&<div className="error">{error}</div>}<button className="primary" disabled={loading}>{loading?"Signing in…":"SIGN IN"}</button></form></main>
}