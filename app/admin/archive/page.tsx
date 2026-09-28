"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function Archive() {
  const supabase = createClient();
  const router = useRouter();

  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/admin/login");
        return;
      }
      const { data } = await supabase
        .from("books")
        .select("*,reviews(count)")
        .eq("is_current", false)
        .order("created_at", { ascending: false });
      setBooks(data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <main className="flex-1 flex flex-col justify-center items-center min-h-screen bg-surface px-margin">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-[36px] animate-spin">
            collections_bookmark
          </span>
          <p className="font-body-md text-on-surface-variant font-thmanyah">جارٍ تحميل الأرشيف...</p>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_12px_rgba(65,40,23,0.06)] pt-safe">
        <div className="h-16 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <button
              aria-label="الرجوع للخلف"
              className="w-11 h-11 flex items-center justify-center text-on-surface hover:text-primary transition-colors cursor-pointer"
              onClick={() => router.push("/admin/dashboard")}
              type="button"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center p-1.5 shadow-sm">
              <span className="material-symbols-outlined text-primary text-[18px]">
                collections_bookmark
              </span>
            </div>
            <h1 className="font-title-md text-title-md text-primary leading-tight font-semibold font-thmanyah">
              أرشيف الكتب السابقة
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative w-full pt-20 pb-24 bg-surface px-margin max-w-2xl mx-auto font-thmanyah">
        <div className="flex flex-col w-full pb-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
              الكتب التي تم مناقشتها
            </h2>
            <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container-high text-secondary font-semibold">
              {books.length} كتاب
            </span>
          </div>

          {books.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high">
              لا توجد كتب سابقة في الأرشيف حتى الآن.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              {books.map((b) => (
                <article
                  className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container-high flex gap-space-md items-center"
                  key={b.id}
                >
                  <div className="w-16 h-24 rounded-lg overflow-hidden shrink-0 bg-surface-container flex items-center justify-center shadow-sm">
                    {b.cover_url ? (
                      <img
                        alt={`غلاف ${b.title}`}
                        className="w-full h-full object-cover"
                        src={b.cover_url}
                      />
                    ) : (
                      <span className="material-symbols-outlined text-secondary text-[28px]">
                        book
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <h3 className="font-title-md text-title-md text-primary font-bold truncate">
                      {b.title}
                    </h3>
                    <p className="font-body-sm text-body-sm text-secondary font-medium truncate mb-1">
                      {b.author}
                    </p>
                    <span className="font-label-sm text-label-sm text-outline inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">rate_review</span>
                      <span>{b.reviews?.[0]?.count || 0} مراجعة</span>
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface-container-low/90 backdrop-blur-xl shadow-[0_-4px_16px_rgba(65,40,23,0.06)] border-t border-outline-variant/30 font-thmanyah">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-space-xs">
          <a
            className="flex flex-col items-center justify-center gap-1 w-16 h-12 text-on-surface-variant hover:text-primary transition-colors"
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
            className="flex flex-col items-center justify-center gap-1 w-16 h-12 text-primary font-semibold"
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