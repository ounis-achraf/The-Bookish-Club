"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

type Book = {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  created_at: string;
};

type Review = {
  id: string;
  member_name: string;
  rating: number;
  review_text: string;
  photo_url: string | null;
  created_at: string;
};

export default function Dashboard() {
  const supabase = createClient();
  const router = useRouter();

  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "high" | "photos">("all");

  async function load() {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/admin/login");
      return;
    }
    const b = await supabase.from("books").select("*").eq("is_current", true).maybeSingle();
    if (b.error) {
      setError(b.error.message);
      return;
    }
    setBook(b.data);
    if (b.data) {
      const r = await supabase
        .from("reviews")
        .select("*")
        .eq("book_id", b.data.id)
        .order("created_at", { ascending: false });
      setReviews(r.data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  async function remove(id: string) {
    if (!confirm("هل أنت تأكد من حذف هذه المراجعة؟")) return;
    await supabase.from("reviews").delete().eq("id", id);
    load();
  }

  if (loading) {
    return (
      <main className="flex-1 flex flex-col justify-center items-center min-h-screen bg-surface px-margin">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-[36px] animate-spin">
            dashboard
          </span>
          <p className="font-body-md text-on-surface-variant font-thmanyah">جارٍ تحميل لوحة التحكم...</p>
        </div>
      </main>
    );
  }

  const avg = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  const photosCount = reviews.filter((r) => !!r.photo_url).length;

  const filteredReviews = reviews.filter((r) => {
    if (filter === "high") return r.rating >= 4;
    if (filter === "photos") return !!r.photo_url;
    return true;
  });

  return (
    <>
      {/* Top Header (Book icon removed, text centered in middle) */}
      <header className="fixed top-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_12px_rgba(65,40,23,0.06)] pt-safe">
        <div className="h-16 px-margin flex items-center justify-center text-center max-w-2xl mx-auto">
          <div className="flex flex-col items-center justify-center text-center">
            <span
              className="text-label-sm text-secondary leading-tight font-semibold font-ballet"
              style={{ fontFamily: "Ballet, serif" }}
            >
              The Bookish Club
            </span>
            <h1 className="font-title-md text-title-md text-primary leading-tight tracking-tight font-bold font-thmanyah">
              لوحة التحكم
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative w-full pt-20 pb-24 bg-surface px-margin max-w-2xl mx-auto font-thmanyah">
        <div className="flex flex-col w-full pb-8 space-y-space-lg select-none">
          {error && (
            <div className="p-3 bg-error-container text-on-error-container rounded-xl text-body-sm font-medium">
              {error}
            </div>
          )}

          {/* Top Admin Welcome Bar */}
          <section className="flex items-center justify-between bg-surface-container-low px-space-md py-space-sm rounded-xl shadow-sm border border-surface-container-high">
            <div className="flex items-center gap-space-sm">
              <div className="relative w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-secondary-container text-[22px]">
                  admin_panel_settings
                </span>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-tertiary-container rounded-full ring-2 ring-surface-container-low"></span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-title-md text-title-md text-primary font-bold">
                    مرحباً، المشرف
                  </span>
                  <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-semibold">
                    مسؤول النادي
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-outline">
                  لوحة إدارة مراجعات كتاب الشهر
                </span>
              </div>
            </div>
            <button
              aria-label="تسجيل الخروج"
              className="flex items-center justify-center w-11 h-11 rounded-lg bg-surface hover:bg-surface-container transition-colors text-primary active:scale-95 shadow-sm border border-outline-variant/40 cursor-pointer"
              onClick={logout}
              title="تسجيل الخروج"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px] transform rotate-180">
                logout
              </span>
            </button>
          </section>

          {/* Featured Section: كتاب الشهر */}
          <section className="flex flex-col bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden border border-surface-container-high">
            <div className="flex items-center justify-between mb-space-sm">
              <div className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-primary-fixed/60 text-primary">
                <span className="material-symbols-outlined text-[15px] text-primary">spa</span>
                <span className="font-label-md text-label-md font-semibold">كتاب الشهر الحالي</span>
              </div>
              <div className="flex items-center gap-1 bg-surface-container-high px-2 py-0.5 rounded-md">
                <span
                  className="material-symbols-outlined text-[14px] text-tertiary-fixed-dim"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                <span className="font-label-sm text-label-sm font-bold text-on-surface">
                  {avg}
                </span>
              </div>
            </div>

            <div className="flex gap-space-md items-start">
              {/* Book Cover Image */}
              <div className="relative shrink-0 w-24 h-36 rounded-lg overflow-hidden shadow-md bg-surface-variant flex items-center justify-center">
                {book?.cover_url ? (
                  <img
                    alt={`غلاف ${book.title}`}
                    className="w-full h-full object-cover"
                    src={book.cover_url}
                  />
                ) : (
                  <span className="material-symbols-outlined text-secondary text-[48px]">
                    menu_book
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent pointer-events-none"></div>
              </div>

              {/* Book Editorial Details */}
              <div className="flex flex-col flex-1 min-w-0 justify-between h-36">
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-primary font-bold leading-tight truncate">
                    {book?.title || "لا يوجد كتاب حالي"}
                  </h2>
                  <p className="font-label-lg text-label-lg text-secondary font-medium mt-0.5">
                    {book?.author || "غير محدد"}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-1.5 leading-relaxed">
                    {reviews.length} مراجعات مستلمة حتى الآن من أعضاء النادي.
                  </p>
                </div>
                <a
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-secondary-container/40 text-primary transition-all active:scale-95 w-fit mt-1 font-semibold text-label-md border border-outline-variant/30"
                  href="/admin/book"
                >
                  <span className="material-symbols-outlined text-[16px]">edit_note</span>
                  <span>تغيير الكتاب</span>
                </a>
              </div>
            </div>
          </section>

          {/* Summary Stats Row (3 Columns) */}
          <section className="grid grid-cols-3 gap-space-sm">
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-container-lowest shadow-sm text-center border border-surface-container-high">
              <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center mb-1">
                <span className="material-symbols-outlined text-on-primary-fixed-variant text-[18px]">
                  menu_book
                </span>
              </div>
              <span className="font-headline-sm text-headline-sm font-bold text-primary">
                {reviews.length}
              </span>
              <span className="font-label-sm text-label-sm text-outline truncate w-full">
                المراجعات
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-container-lowest shadow-sm text-center border border-surface-container-high">
              <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center mb-1">
                <span
                  className="material-symbols-outlined text-on-tertiary-fixed-variant text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  hotel_class
                </span>
              </div>
              <span className="font-headline-sm text-headline-sm font-bold text-primary">
                {avg}
              </span>
              <span className="font-label-sm text-label-sm text-outline truncate w-full">
                متوسط التقييم
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-container-lowest shadow-sm text-center border border-surface-container-high">
              <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center mb-1">
                <span className="material-symbols-outlined text-on-secondary-fixed-variant text-[18px]">
                  photo_camera
                </span>
              </div>
              <span className="font-headline-sm text-headline-sm font-bold text-primary">
                {photosCount}
              </span>
              <span className="font-label-sm text-label-sm text-outline truncate w-full">
                صور مرفقة
              </span>
            </div>
          </section>

          {/* Readers Reviews Section Header & Filter Pills */}
          <section className="flex flex-col space-y-space-sm pt-space-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <h3 className="font-title-md text-title-md text-primary font-bold">
                  أحدث مراجعات القرّاء
                </h3>
                <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container-high text-secondary font-semibold">
                  {reviews.length}
                </span>
              </div>
              <a
                className="font-label-md text-label-md text-secondary font-semibold hover:underline flex items-center gap-1"
                href="/admin/archive"
              >
                <span>الأرشيف</span>
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              </a>
            </div>

            {/* Filter chips with Western numerals */}
            <div className="flex items-center gap-space-sm overflow-x-auto pb-1">
              <button
                className={`px-3 py-1.5 rounded-full font-label-md text-label-md shrink-0 shadow-sm transition-all active:scale-95 cursor-pointer ${filter === "all"
                    ? "bg-primary text-on-primary font-medium"
                    : "bg-surface-container-lowest text-on-surface-variant font-medium hover:bg-surface-container border border-outline-variant/30"
                  }`}
                onClick={() => setFilter("all")}
                type="button"
              >
                الأحدث
              </button>
              <button
                className={`px-3 py-1.5 rounded-full font-label-md text-label-md shrink-0 shadow-sm transition-all active:scale-95 cursor-pointer ${filter === "high"
                    ? "bg-primary text-on-primary font-medium"
                    : "bg-surface-container-lowest text-on-surface-variant font-medium hover:bg-surface-container border border-outline-variant/30"
                  }`}
                onClick={() => setFilter("high")}
                type="button"
              >
                الأعلى تقييماً (4+)
              </button>
              <button
                className={`px-3 py-1.5 rounded-full font-label-md text-label-md shrink-0 shadow-sm transition-all active:scale-95 cursor-pointer ${filter === "photos"
                    ? "bg-primary text-on-primary font-medium"
                    : "bg-surface-container-lowest text-on-surface-variant font-medium hover:bg-surface-container border border-outline-variant/30"
                  }`}
                onClick={() => setFilter("photos")}
                type="button"
              >
                مع صور الجلسة
              </button>
            </div>
          </section>

          {/* Reviews Stack */}
          <section className="flex flex-col space-y-space-md">
            {filteredReviews.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high">
                لا توجد مراجعات تطابق تصفيتك.
              </div>
            ) : (
              filteredReviews.map((r) => (
                <article
                  className="flex flex-col p-space-md bg-surface-container-lowest rounded-xl shadow-sm space-y-space-sm transition-all border border-surface-container-high"
                  key={r.id}
                >
                  <div className="flex items-center justify-between gap-space-sm">
                    <div className="flex items-center gap-space-sm min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-full bg-primary-fixed-dim/40 flex items-center justify-center font-bold text-primary font-title-md shrink-0 text-[13px]">
                        {r.member_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span dir="auto" className="font-label-lg text-label-lg text-primary leading-tight font-bold truncate text-start">
                          {r.member_name}
                        </span>
                        <span className="font-label-sm text-label-sm text-outline">
                          {new Date(r.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "numeric",
                            day: "numeric"
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="inline-flex items-center gap-[1px] px-1.5 py-0.5 rounded-full bg-surface-container-high/70 text-tertiary-fixed-dim shrink-0">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <span
                            className="material-symbols-outlined text-[9px]"
                            key={n}
                            style={{ fontVariationSettings: `'FILL' ${n <= r.rating ? 1 : 0}` }}
                          >
                            star
                          </span>
                        ))}
                      </div>
                      <button
                        aria-label="حذف المراجعة"
                        className="text-error hover:bg-error-container/40 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
                        onClick={() => remove(r.id)}
                        title="حذف"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <p dir="auto" className="font-body-md text-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap text-start">
                      {r.review_text}
                    </p>
                    {r.photo_url && (
                      <a
                        className="mt-2 rounded-xl overflow-hidden shadow-sm bg-surface-container relative group max-w-sm block cursor-pointer"
                        href={r.photo_url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <img
                          alt="صورة المراجعة"
                          className="w-full max-h-72 object-cover group-hover:scale-105 transition-transform"
                          src={r.photo_url}
                        />
                      </a>
                    )}
                  </div>
                </article>
              ))
            )}
          </section>
        </div>
      </main>

      {/* Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface-container-low/90 backdrop-blur-xl shadow-[0_-4px_16px_rgba(65,40,23,0.06)] border-t border-outline-variant/30 font-thmanyah">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-space-xs">
          <a
            className="flex flex-col items-center justify-center gap-1 w-16 h-12 text-primary font-semibold"
            href="/admin/dashboard"
          >
            <span className="material-symbols-outlined text-[22px]">dashboard</span>
            <span className="font-label-sm text-label-sm">الرئيسية</span>
          </a>
          <a
            className="flex flex-col items-center justify-center gap-1 w-16 h-12 text-on-surface-variant hover:text-primary transition-colors"
            href="/admin/book"
          >
            <span className="material-symbols-outlined text-[22px]">auto_stories</span>
            <span className="font-label-sm text-label-sm">كتاب الشهر</span>
          </a>
          <a
            className="flex flex-col items-center justify-center gap-1 w-16 h-12 text-on-surface-variant hover:text-primary transition-colors"
            href="/admin/archive"
          >
            <span className="material-symbols-outlined text-[22px]">collections_bookmark</span>
            <span className="font-label-sm text-label-sm">الأرشيف</span>
          </a>
        </div>
      </nav>
    </>
  );
}