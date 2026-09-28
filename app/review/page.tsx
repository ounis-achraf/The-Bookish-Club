 "use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase";

type Book = { id:string; title:string; author:string; cover_url:string|null };

export default function ReviewPage() {
  const supabase = createClient();
  const [book, setBook] = useState<Book|null>(null);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<File|null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.from("books").select("id,title,author,cover_url").eq("is_current", true).maybeSingle()
      .then(({data,error}) => { if(error) setError(error.message); setBook(data); setLoading(false); });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (!book || !name.trim() || !text.trim() || rating < 1) {
      setError("Please complete your name, rating, and review."); return;
    }
    setSending(true);
    try {
      let photo_url: string|null = null;
      if (photo) {
        if (photo.size > 5*1024*1024) throw new Error("Photo must be 5 MB or smaller.");
        const ext = photo.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("review-photos").upload(path, photo, { contentType: photo.type });
        if (uploadError) throw uploadError;
        photo_url = supabase.storage.from("review-photos").getPublicUrl(path).data.publicUrl;
      }
      const { error: insertError } = await supabase.from("reviews").insert({
        book_id: book.id, member_name: name.trim(), rating, review_text: text.trim(), photo_url
      });
      if (insertError) throw insertError;
      setDone(true);
    } catch(err:any) { setError(err.message || "Something went wrong."); }
    finally { setSending(false); }
  }

  if (loading) return <main className="center">Loading this month’s book…</main>;
  if (!book) return <main className="center"><div><h1>No current book</h1><p>The club is between books right now.</p></div></main>;

  if (done) return <main className="center"><div className="success"><div className="check">✓</div><h1>Review submitted!</h1><p>Thank you for sharing your thoughts about <strong>{book.title}</strong>.</p><button onClick={()=>location.reload()}>Submit another review</button></div></main>;

  return <main className="member-shell">
    <section className="book-hero">
      <div className="eyebrow">THIS MONTH’S BOOK</div>
      {book.cover_url ? <img className="cover" src={book.cover_url} alt={`Cover of ${book.title}`} /> : <div className="cover placeholder">📖</div>}
      <h1>{book.title}</h1><p className="author">{book.author}</p>
    </section>
    <form className="card form" onSubmit={submit}>
      <h2>Share your thoughts</h2>
      <label>Your name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" maxLength={100}/></label>
      <fieldset><legend>Your rating</legend><div className="stars">{[1,2,3,4,5].map(n=><button type="button" key={n} className={n<=rating?"star active":"star"} onClick={()=>setRating(n)} aria-label={`${n} stars`}>★</button>)}</div></fieldset>
      <label>Your review<textarea value={text} onChange={e=>setText(e.target.value)} placeholder="What did you think about the book?" maxLength={5000}/></label>
      <label>Photo <span className="optional">optional</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setPhoto(e.target.files?.[0]||null)}/></label>
      {photo && <div className="file-name">{photo.name}</div>}
      {error && <div className="error">{error}</div>}
      <button className="primary" disabled={sending}>{sending ? "Sending…" : "SEND REVIEW"}</button>
    </form>
  </main>;
}