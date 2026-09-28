"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  created_at: string;
  reviews: { count: number }[];
}

interface Review {
  id: string;
  member_name: string;
  rating: number;
  review_text: string;
  photo_url: string | null;
  created_at: string;
}

export default function Archive() {
  const supabase = createClient();
  const router = useRouter();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // Drawer state
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

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

  async function openBook(book: Book) {
    if (selectedBook?.id === book.id && drawerOpen) {
      closeDrawer();
      return;
    }
    setSelectedBook(book);
    setDrawerOpen(true);
    setReviews([]);
    setReviewsLoading(true);

    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("book_id", book.id)
      .order("created_at", { ascending: false });

    setReviews(data || []);
    setReviewsLoading(false);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setTimeout(() => {
      setSelectedBook(null);
      setReviews([]);
    }, 350);
  }

  function StarRow({ rating }: { rating: number }) {
    return (
      <span className="flex gap-0.5" aria-label={`تقييم ${rating} من 5`}>
        {[1, 2, 3, 4, 5].map((s) => (
          <span
            key={s}
            className={`material-symbols-outlined text-[16px] ${
              s <= rating ? "text-tertiary" : "text-outline/30"
            }`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
        ))}
      </span>
    );
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

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
        <div className="h-16 px-margin flex items-center justify-center relative max-w-2xl mx-auto">
          <button
            aria-label="الرجوع للخلف"
            className="absolute right-4 w-11 h-11 flex items-center justify-center text-on-surface hover:text-primary transition-colors cursor-pointer"
            onClick={() => router.push("/admin/dashboard")}
            type="button"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
          </button>
          <h1 className="font-title-md text-title-md text-primary leading-tight font-semibold font-thmanyah text-center">
            أرشيف الكتب السابقة
          </h1>
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
            <div className="flex flex-col gap-space-sm">
              {books.map((b) => {
                const isActive = selectedBook?.id === b.id && drawerOpen;
                const reviewCount = b.reviews?.[0]?.count || 0;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => openBook(b)}
                    className={`w-full text-right bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border transition-all duration-200 flex gap-space-md items-center cursor-pointer active:scale-[0.99] ${
                      isActive
                        ? "border-primary/40 shadow-md ring-1 ring-primary/20"
                        : "border-surface-container-high hover:border-primary/20 hover:shadow-md"
                    }`}
                  >
                    {/* Cover */}
                    <div className="w-16 h-24 rounded-lg overflow-hidden shrink-0 bg-surface-container flex items-center justify-center shadow-sm">
                      {b.cover_url ? (
                        <img
                          alt={`غلاف ${b.title}`}
                          className="w-full h-full object-cover"
                          src={b.cover_url}
                        />
                      ) : (
                        <span className="material-symbols-outlined text-secondary text-[28px]">book</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <h3 className="font-title-md text-title-md text-primary font-bold truncate">
                        {b.title}
                      </h3>
                      <p className="font-body-sm text-body-sm text-secondary font-medium truncate mb-2">
                        {b.author}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-label-sm text-outline inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">rate_review</span>
                          <span>{reviewCount} مراجعة</span>
                        </span>
                        <span
                          className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${
                            isActive ? "rotate-180 text-primary" : "text-outline/50"
                          }`}
                        >
                          expand_more
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Drawer Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${
          drawerOpen
            ? "bg-black/40 backdrop-blur-sm pointer-events-auto"
            : "bg-transparent pointer-events-none"
        }`}
        onClick={closeDrawer}
      />

      {/* Bottom Sheet Drawer */}
      <div
        ref={drawerRef}
        className={`fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-3xl shadow-2xl transition-transform duration-300 ease-in-out max-h-[80vh] flex flex-col font-thmanyah`}
        style={{
          transform: drawerOpen ? "translateY(0)" : "translateY(100%)",
          willChange: "transform"
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-outline/30" />
        </div>

        {/* Drawer Header */}
        {selectedBook && (
          <div className="px-space-lg pt-space-xs pb-space-sm border-b border-surface-container shrink-0">
            <div className="flex items-center gap-space-md">
              <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-container shadow-sm">
                {selectedBook.cover_url ? (
                  <img
                    alt={`غلاف ${selectedBook.title}`}
                    className="w-full h-full object-cover"
                    src={selectedBook.cover_url}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary text-[22px]">book</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <h2 className="font-title-lg text-title-lg text-primary font-bold truncate">
                  {selectedBook.title}
                </h2>
                <p className="font-body-sm text-body-sm text-secondary truncate">{selectedBook.author}</p>
                <p className="font-label-sm text-label-sm text-outline mt-0.5">
                  {formatDate(selectedBook.created_at)}
                </p>
              </div>
              <button
                onClick={closeDrawer}
                type="button"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-container-high transition-colors shrink-0 cursor-pointer"
                aria-label="إغلاق"
              >
                <span className="material-symbols-outlined text-[20px] text-secondary">close</span>
              </button>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="flex-1 overflow-y-auto px-space-lg py-space-md flex flex-col gap-space-md pb-safe">
          {reviewsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <span className="material-symbols-outlined text-secondary text-[32px] animate-spin">
                autorenew
              </span>
              <p className="font-body-sm text-on-surface-variant">جارٍ تحميل المراجعات...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <span className="material-symbols-outlined text-outline text-[40px]">rate_review</span>
              <p className="font-body-md text-on-surface-variant text-center">
                لا توجد مراجعات لهذا الكتاب.
              </p>
            </div>
          ) : (
            <>
              {/* Summary bar */}
              <div className="bg-secondary-container/40 rounded-2xl px-space-md py-space-sm flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-secondary-container font-semibold">
                  {reviews.length} مراجعة
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="material-symbols-outlined text-tertiary text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span className="font-title-md text-title-md text-primary font-bold">
                    {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
                  </span>
                  <span className="font-label-sm text-label-sm text-secondary">/ 5</span>
                </div>
              </div>

              {reviews.map((r, i) => (
                <article
                  key={r.id}
                  className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container-high flex flex-col gap-space-xs"
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between gap-space-sm">
                    <div className="flex items-center gap-space-sm min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                        <span className="font-title-md text-title-md text-on-primary font-bold text-[13px]">
                          {i + 1}
                        </span>
                      </div>
                      <span className="font-title-md text-title-md text-primary font-semibold truncate">
                        {r.member_name}
                      </span>
                    </div>
                    <StarRow rating={r.rating} />
                  </div>

                  {/* Review text */}
                  <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                    {r.review_text}
                  </p>

                  {/* Photo */}
                  {r.photo_url && (
                    <div className="mt-1 rounded-xl overflow-hidden max-h-52 bg-surface-container">
                      <img
                        alt={`صورة من ${r.member_name}`}
                        className="w-full h-full object-cover"
                        src={r.photo_url}
                      />
                    </div>
                  )}

                  {/* Date */}
                  <span className="font-label-sm text-label-sm text-outline mt-0.5">
                    {formatDate(r.created_at)}
                  </span>
                </article>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 w-full z-30 pb-safe bg-surface-container-low/90 backdrop-blur-xl shadow-[0_-4px_16px_rgba(65,40,23,0.06)] border-t border-outline-variant/30 font-thmanyah">
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