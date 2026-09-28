"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase";

type Book = { id: string; title: string; author: string; cover_url: string | null };

const RATING_TEXTS: Record<number, string> = {
  1: "انقر للتقييم: غير مُرضٍ (1 من 5)",
  2: "انقر للتقييم: مقبول (2 من 5)",
  3: "انقر للتقييم: جيد (3 من 5)",
  4: "انقر للتقييم: رائع جداً (4 من 5)",
  5: "انقر للتقييم: ممتاز (5 من 5)"
};

export default function ReviewPage() {
  const supabase = createClient();
  const [book, setBook] = useState<Book | null>(null);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase
      .from("books")
      .select("id,title,author,cover_url")
      .eq("is_current", true)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setBook(data);
        setLoading(false);
      });
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPhoto(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    } else {
      setPhotoPreview(null);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!book || !name.trim() || !text.trim() || rating < 1) {
      setError("يرجى إكمال الاسم والتقييم والمراجعة.");
      return;
    }
    setSending(true);
    try {
      let photo_url: string | null = null;
      if (photo) {
        if (photo.size > 5 * 1024 * 1024) throw new Error("يجب أن تكون الصورة 5 ميجابايت أو أقل.");
        const ext = photo.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("review-photos")
          .upload(path, photo, { contentType: photo.type });
        if (uploadError) throw uploadError;
        photo_url = supabase.storage.from("review-photos").getPublicUrl(path).data.publicUrl;
      }
      const { error: insertError } = await supabase.from("reviews").insert({
        book_id: book.id,
        member_name: name.trim(),
        rating,
        review_text: text.trim(),
        photo_url
      });
      if (insertError) throw insertError;
      setDone(true);
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <main className="flex-1 flex flex-col justify-center items-center min-h-screen bg-surface px-margin">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-[36px] animate-spin">
            auto_stories
          </span>
          <p className="font-body-md text-on-surface-variant font-thmanyah">جارٍ تحميل كتاب هذا الشهر...</p>
        </div>
      </main>
    );
  }

  if (!book) {
    return (
      <main className="flex-1 flex flex-col justify-center items-center min-h-screen bg-surface px-margin text-center">
        <div className="bg-surface-container-lowest p-space-xl rounded-2xl shadow-sm max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-secondary mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">menu_book</span>
          </div>
          <h1 className="font-headline-md text-primary font-semibold mb-2 font-thmanyah">لا يوجد كتاب حالي</h1>
          <p className="font-body-md text-on-surface-variant font-thmanyah">النادي في فترة استراحة بين الكتب حالياً.</p>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Fixed Top Header (Title centered in middle) */}
      <header className="fixed top-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_12px_rgba(65,40,23,0.06)] pt-safe">
        <div className="h-16 px-margin flex items-center justify-center relative max-w-xl mx-auto">
          <h1 className="font-title-md text-title-md text-primary leading-tight font-semibold font-thmanyah text-center">
            صفحة المراجعة
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative w-full pt-20 pb-safe bg-surface px-margin max-w-xl mx-auto font-thmanyah">
        <div className="flex flex-col w-full pb-10">
          {/* Literary Brand Header */}
          <section className="flex flex-col items-center justify-center text-center py-4 px-margin mb-2">
            <span
              className="text-display-lg text-primary tracking-wide mb-0.5 font-ballet"
              style={{ fontFamily: "Ballet, serif" }}
            >
              The Bookish Club
            </span>
          </section>

          {/* Current Book Spotlight Card */}
          <section className="w-full bg-surface-container-lowest rounded-xl p-space-md mb-space-lg shadow-sm border border-surface-container-high">
            <div className="flex items-start gap-space-md">
              <div className="relative w-20 h-28 rounded-lg overflow-hidden shrink-0 shadow-md bg-surface-variant flex items-center justify-center">
                {book.cover_url ? (
                  <img
                    alt={`غلاف ${book.title}`}
                    className="w-full h-full object-cover"
                    src={book.cover_url}
                  />
                ) : (
                  <span className="material-symbols-outlined text-secondary text-[36px]">
                    book
                  </span>
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1 justify-center">
                <div className="flex items-center gap-space-xs mb-1">
                  <span className="material-symbols-outlined text-secondary text-[16px]">
                    menu_book
                  </span>
                  <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                    كتاب هذا الشهر
                  </span>
                </div>
                <h2 className="font-headline-sm text-headline-sm text-primary truncate leading-tight mb-0.5 font-bold">
                  {book.title}
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-2 font-medium">
                  {book.author}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant/80 italic leading-relaxed line-clamp-2">
                  "شاركونا انطباعاتكم ومشاعركم الصادقة حول قراءة هذا الشهر لنناقشها سوياً."
                </p>
              </div>
            </div>
          </section>

          {done ? (
            /* Confirmation Success Card */
            <div
              className="w-full bg-surface-container-lowest rounded-xl p-space-xl text-center shadow-lg flex flex-col items-center justify-center my-4 border border-surface-container-high"
              id="success-confirmation"
            >
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-secondary mb-space-md animate-bounce">
                <span
                  className="material-symbols-outlined text-[36px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md text-primary mb-space-xs font-bold font-thmanyah">
                شكراً لمشاركتك القيّمة!
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed max-w-xs font-thmanyah">
                تم استلام مراجعتك حول كتاب <strong>"{book.title}"</strong> بنجاح.
              </p>
              <button
                className="mt-6 px-6 h-11 bg-primary text-on-primary font-title-md text-title-md font-semibold rounded-xl shadow-md hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                onClick={() => {
                  setDone(false);
                  setName("");
                  setRating(5);
                  setText("");
                  setPhoto(null);
                  setPhotoPreview(null);
                }}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                <span>أضف مراجعة أخرى</span>
              </button>
            </div>
          ) : (
            /* Interactive Review Form Container */
            <div
              className="w-full bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg shadow-sm border border-surface-container-high"
              id="review-form-container"
            >
              <div className="mb-space-lg">
                <h3 className="font-headline-md text-headline-md text-primary mb-1 font-bold font-thmanyah">
                  بطــاقة المــراجــعـة
                </h3>
              </div>

              <form className="flex flex-col gap-space-lg" onSubmit={submit}>
                {/* Input: Name */}
                <div className="flex flex-col gap-space-xs">
                  <label
                    className="font-label-lg text-label-lg text-primary font-medium flex items-center justify-between"
                    htmlFor="reviewer-name"
                  >
                    <span>الاسم</span>
                    <span className="text-secondary font-normal font-label-sm text-label-sm">
                      مطلوب
                    </span>
                  </label>
                  <div className="relative w-full">
                    <input
                      className="w-full h-12 px-space-md pr-4 pl-10 bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/60 rounded-lg outline-none font-body-md text-body-md focus:bg-surface-container transition-all"
                      dir="auto"
                      id="reviewer-name"
                      maxLength={100}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="اسمك الكريم"
                      required
                      type="text"
                      value={name}
                    />
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 pointer-events-none text-[20px]">
                      person_outline
                    </span>
                  </div>
                </div>

                {/* Rating Section */}
                <div className="flex flex-col gap-space-xs">
                  <span className="font-label-lg text-label-lg text-primary font-medium">
                    التقييم العام
                  </span>
                  <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col items-center justify-center gap-space-sm">
                    <div className="flex items-center gap-2" dir="ltr" id="star-rating-group">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          aria-label={`${n} نجوم`}
                          className={`star-btn transition-transform active:scale-90 p-1 ${
                            n <= rating ? "text-[#C08A3E]" : "text-on-surface-variant/40"
                          }`}
                          key={n}
                          onClick={() => setRating(n)}
                          type="button"
                        >
                          <span
                            className="material-symbols-outlined text-[34px] leading-none"
                            style={{ fontVariationSettings: `'FILL' ${n <= rating ? 1 : 0}` }}
                          >
                            star
                          </span>
                        </button>
                      ))}
                    </div>
                    <span
                      className="font-label-md text-label-md text-secondary font-medium"
                      id="rating-label"
                    >
                      {RATING_TEXTS[rating] || "انقر للتقييم"}
                    </span>
                  </div>
                </div>

                {/* Input: Review Textarea */}
                <div className="flex flex-col gap-space-xs">
                  <label
                    className="font-label-lg text-label-lg text-primary font-medium flex items-center justify-between"
                    htmlFor="review-content"
                  >
                    <span>مراجعتك الأدبية</span>
                    <span className="text-secondary font-normal font-label-sm text-label-sm">
                      مطلوب
                    </span>
                  </label>
                  <textarea
                    className="w-full p-space-md bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/60 rounded-lg outline-none font-body-md text-body-md focus:bg-surface-container transition-all resize-none leading-relaxed"
                    dir="auto"
                    id="review-content"
                    maxLength={5000}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="ما رأيك في أسلوب السرد، بناء الشخصيات، أو الفكرة المركزية؟ شاركنا أكثر اقتباس أو فكرة أثرت فيك..."
                    required
                    rows={4}
                    value={text}
                  />
                </div>

                {/* Photo Upload Box / Attachment */}
                <div className="flex flex-col gap-space-xs">
                  <span className="font-label-lg text-label-lg text-primary font-medium flex items-center justify-between">
                    <span>إضافة صورة من جلستك</span>
                    <span className="text-on-surface-variant/70 font-normal font-label-sm text-label-sm">
                      اختياري
                    </span>
                  </span>

                  {photoPreview ? (
                    <div className="relative bg-surface-container-low rounded-xl p-space-sm flex items-center justify-between gap-space-md">
                      <div className="flex items-center gap-space-md min-w-0">
                        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 shadow-sm bg-surface-container">
                          <img
                            alt="صورة مرفقة"
                            className="w-full h-full object-cover"
                            src={photoPreview}
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-md text-label-md text-primary font-medium truncate">
                            {photo?.name}
                          </span>
                          <span className="font-label-sm text-label-sm text-secondary">
                            جاهزة للمشاركة
                          </span>
                        </div>
                      </div>
                      <button
                        aria-label="حذف الصورة"
                        className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-error transition-colors shrink-0 cursor-pointer"
                        onClick={removePhoto}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                  ) : (
                    <label className="w-full bg-surface-container-low rounded-xl p-space-md text-center flex flex-col items-center justify-center gap-space-xs cursor-pointer hover:bg-surface-container transition-colors border border-dashed border-outline-variant">
                      <input
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handlePhotoChange}
                        type="file"
                      />
                      <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-[22px]">
                          add_a_photo
                        </span>
                      </div>
                      <p className="font-label-md text-label-md text-primary font-medium">
                        التقط صورة أو اختر من المعرض
                      </p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant/70">
                        لكوب قهوتك، الكتاب، أو ملاحظاتك
                      </p>
                    </label>
                  )}
                </div>

                {/* Literary Quote Divider */}
                <div className="bg-surface-container-low rounded-lg p-space-sm pr-space-md relative overflow-hidden flex items-center gap-space-sm">
                  <div className="w-1 h-8 bg-secondary rounded-full shrink-0"></div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant font-thmanyah">
                    "إن القراءة ليست عملاً سلبياً.. إنها حوار ممتد بين كاتب يسأل وقارئ يجيب."
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-error-container text-on-error-container rounded-xl text-body-sm font-medium">
                    {error}
                  </div>
                )}

                {/* Action Button */}
                <button
                  className="w-full h-12 bg-primary-container text-on-primary font-title-md text-title-md font-semibold rounded-xl shadow-md hover:bg-primary active:bg-primary transition-all flex items-center justify-center gap-space-sm disabled:opacity-60 cursor-pointer"
                  disabled={sending}
                  type="submit"
                >
                  {sending ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">
                        autorenew
                      </span>
                      <span>جارٍ الإرسال...</span>
                    </>
                  ) : (
                    <>
                      <span>إرسال المراجعة</span>
                      <span className="material-symbols-outlined text-[20px]">send</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Literary Footnote */}
          <footer className="mt-space-lg text-center flex flex-col items-center justify-center gap-1">
            <div className="flex items-center gap-1 text-on-surface-variant/50">
              <span className="material-symbols-outlined text-[16px]">local_cafe</span>
              <span className="font-label-sm text-label-sm">
                طابت أوقاتكم برفقة الكتب والمشروبات الدافئة
              </span>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}