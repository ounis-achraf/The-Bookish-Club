 "use client";
import { useEffect,useState } from "react";
import { createClient } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

type Book={id:string;title:string;author:string;cover_url:string|null;created_at:string};
type Review={id:string;member_name:string;rating:number;review_text:string;photo_url:string|null;created_at:string};

export default function Dashboard(){
 const s=createClient(),router=useRouter(); const [book,setBook]=useState<Book|null>(null),[reviews,setReviews]=useState<Review[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 async function load(){const {data:{user}}=await s.auth.getUser();if(!user){router.replace("/admin/login");return}const b=await s.from("books").select("*").eq("is_current",true).maybeSingle();if(b.error){setError(b.error.message);return}setBook(b.data);if(b.data){const r=await s.from("reviews").select("*").eq("book_id",b.data.id).order("created_at",{ascending:false});setReviews(r.data||[])}setLoading(false)}
 useEffect(()=>{load()},[]);
 async function logout(){await s.auth.signOut();router.replace("/admin/login")}
 async function remove(id:string){if(!confirm("Delete this review?"))return;await s.from("reviews").delete().eq("id",id);load()}
 if(loading)return <main className="center">Loading dashboard…</main>;
 const avg=reviews.length?(reviews.reduce((a,r)=>a+r.rating,0)/reviews.length).toFixed(1):"—";
 return <main className="admin-shell"><header className="admin-header"><div><div className="eyebrow">BOOK CLUB</div><h1>Dashboard</h1></div><div className="header-actions"><a href="/admin/book">Change book</a><button onClick={logout}>Sign out</button></div></header>
 {error&&<div className="error">{error}</div>}
 <section className="admin-book card">{book?.cover_url?<img className="admin-cover" src={book.cover_url}/>:<div className="admin-cover placeholder">📖</div>}<div className="book-info"><div className="eyebrow">CURRENT BOOK</div><h2>{book?.title||"No current book"}</h2><p>{book?.author}</p><strong>{reviews.length} reviews · ★ {avg}</strong></div></section>
 <div className="stats"><div className="stat card"><b>{reviews.length}</b><span>Reviews</span></div><div className="stat card"><b>{avg}</b><span>Average rating</span></div><div className="stat card"><b>{reviews.filter(r=>!!r.photo_url).length}</b><span>Photos</span></div></div>
 <section><div className="section-title"><h2>Reviews</h2><a href="/admin/archive">Book archive →</a></div>{reviews.length===0?<div className="empty card">No reviews yet.</div>:<div className="reviews">{reviews.map(r=><article className="review card" key={r.id}><div className="review-top"><div><strong>{r.member_name}</strong><div className="rating">{"★".repeat(r.rating)}<span>{"★".repeat(5-r.rating)}</span></div></div><button className="delete" onClick={()=>remove(r.id)}>Delete</button></div><p>{r.review_text}</p>{r.photo_url&&<img className="review-photo" src={r.photo_url}/>}<small>{new Date(r.created_at).toLocaleString()}</small></article>)}</div>}</section>
 </main>
}