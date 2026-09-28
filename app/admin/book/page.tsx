"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function BookManager() {
  const supabase = createClient();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [old, setOld] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
        .select("*")
        .eq("is_current", true)
        .maybeSingle();
      if (data) {
        setOld(data);
        setTitle(data.title);
        setAuthor(data.author);
      }
      setLoading(false);
    })();
  }, []);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCover(file);
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
    } else {
      setCoverPreview(null);
    }
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      setError("يرجى إدخال عنوان الكتاب واسم المؤلف.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      let cover_url = old?.cover_url || null;
      if (cover) {
        if (cover.size > 5 * 1024 * 1024) throw new Error("يجب أن تكون صورة الغلاف 5 ميجابايت أو أقل.");
        const ext = cover.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const u = await supabase.storage
          .from("book-covers")
          .upload(path, cover, { contentType: cover.type, upsert: false });
        if (u.error) throw u.error;
        cover_url = supabase.storage.from("book-covers").getPublicUrl(path).data.publicUrl;
      }

      if (old) {
        await supabase.from("books").update({ is_current: false }).eq("id", old.id);
      }

      const { error: e2 } = await supabase.from("books").insert({
        title: title.trim(),
        author: author.trim(),
        cover_url,
        is_current: true
      });

      if (e2) throw e2;

      router.push("/admin/dashboard");
    } catch (e: any) {
      setError(e.message || "تعذر حفظ التغييرات.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex-1 flex flex-col justify-center items-center min-h-screen bg-surface px-margin">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-[36px] animate-spin">
            auto_stories
          </span>
          <p className="font-body-md text-on-surface-variant">جارٍ التحميل...</p>
        </div>
      </main>
    );
  }

  const effectiveCover = coverPreview || old?.cover_url;

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
                auto_stories
              </span>
            </div>
            <h1 className="font-title-md text-title-md text-primary leading-tight font-semibold">
              تغيير كتاب الشهر
            </h1>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative w-full pt-20 pb-32 bg-surface px-margin max-w-xl mx-auto">
        <div className="flex flex-col w-full pb-10">
          {/* Current Book Summary Card */}
          {old && (
            <div className="mb-space-lg">
              <div className="flex items-center justify-between mb-space-xs">
                <span className="font-title-md text-label-lg text-secondary font-semibold">
                  الكتاب الحالي المُعتمد
                </span>
                <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant font-medium">
                  النسخة النشطة
                </span>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex items-center gap-space-md border border-surface-container-high">
                <div className="w-14 h-20 rounded-lg overflow-hidden shrink-0 bg-surface-container flex items-center justify-center shadow-sm">
                  {old.cover_url ? (
                    <img alt={`غلاف ${old.title}`} className="w-full h-full object-cover" src={old.cover_url} />
                  ) : (
                    <span className="material-symbols-outlined text-secondary text-[24px]">book</span>
                  )}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-space-xs mb-1">
                    <span className="material-symbols-outlined text-secondary text-[16px]">calendar_today</span>
                    <span className="font-label-sm text-label-sm text-secondary">الكتاب الحالي</span>
                  </div>
                  <h2 className="font-title-md text-body-md text-primary truncate font-bold">{old.title}</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate font-medium">{old.author}</p>
                </div>
                <div className="shrink-0 pl-1">
                  <span className="material-symbols-outlined text-secondary text-[22px]">verified</span>
                </div>
              </div>
            </div>
          )}

          {/* Form Container Card */}
          <form className="flex flex-col gap-space-md" onSubmit={save}>
            <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container-high flex flex-col gap-space-md">
              <div className="flex items-center gap-space-sm mb-1 pb-space-xs border-b border-surface-container">
                <span className="material-symbols-outlined text-primary text-[20px]">auto_stories</span>
                <h3 className="font-title-md text-title-md text-primary font-bold">
                  بيانات الاختيار الجديد
                </h3>
              </div>

              {/* Title Input */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-title-md text-label-lg text-primary font-semibold" htmlFor="book-title">
                    عنوان الكتاب
                  </label>
                  <span className="font-label-sm text-label-sm text-secondary">* مطلوب</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    className="w-full h-12 bg-surface-container-low text-primary px-space-md pl-10 rounded-xl font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all placeholder:text-outline"
                    id="book-title"
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: موسم الهجرة إلى الشمال"
                    required
                    type="text"
                    value={title}
                  />
                  <span className="material-symbols-outlined text-outline absolute left-3 pointer-events-none text-[20px]">
                    book
                  </span>
                </div>
              </div>

              {/* Author Input */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-title-md text-label-lg text-primary font-semibold" htmlFor="book-author">
                    اسم المؤلف
                  </label>
                  <span className="font-label-sm text-label-sm text-outline">* مطلوب</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    className="w-full h-12 bg-surface-container-low text-primary px-space-md pl-10 rounded-xl font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all placeholder:text-outline"
                    id="book-author"
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="مثال: الطيب صالح"
                    required
                    type="text"
                    value={author}
                  />
                  <span className="material-symbols-outlined text-outline absolute left-3 pointer-events-none text-[20px]">
                    person_outline
                  </span>
                </div>
              </div>

              {/* Book Cover Upload */}
              <div className="flex flex-col gap-1.5">
                <label className="font-title-md text-label-lg text-primary font-semibold">
                  صورة الغلاف الفني (اختياري)
                </label>
                <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col items-center justify-center text-center gap-space-sm relative border border-dashed border-outline-variant">
                  {effectiveCover ? (
                    <div className="flex items-center gap-space-md w-full justify-between bg-surface-container-lowest p-space-sm rounded-lg shadow-sm">
                      <div className="flex items-center gap-space-sm">
                        <img
                          alt="معاينة الغلاف"
                          className="w-12 h-16 rounded object-cover shadow-sm shrink-0"
                          src={effectiveCover}
                        />
                        <div className="text-right min-w-0">
                          <span className="font-title-md text-label-md text-primary block truncate">
                            {cover?.name || "الغلاف المعتمد"}
                          </span>
                          <span className="font-body-sm text-label-sm text-outline block">
                            جاهز للعرض
                          </span>
                        </div>
                      </div>
                      <label className="h-9 px-space-sm rounded-lg bg-surface-container text-secondary font-label-md text-label-md flex items-center gap-1 hover:bg-surface-container-high transition-colors cursor-pointer shrink-0">
                        <input
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={handleCoverChange}
                          type="file"
                        />
                        <span className="material-symbols-outlined text-[16px]">cached</span>
                        <span>تغيير</span>
                      </label>
                    </div>
                  ) : (
                    <label className="w-full flex flex-col items-center justify-center gap-2 cursor-pointer py-3">
                      <input
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleCoverChange}
                        type="file"
                      />
                      <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-[22px]">cloud_upload</span>
                      </div>
                      <span className="font-label-md text-label-md text-primary font-medium">
                        اختر صورة الغلاف
                      </span>
                      <span className="font-label-sm text-label-sm text-outline">
                        PNG أو JPG (حتى 5MB)
                      </span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Live Preview Section */}
            <div className="mt-2">
              <div className="flex items-center justify-between mb-space-xs px-1">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-[18px]">visibility</span>
                  <h3 className="font-title-md text-label-lg text-primary font-semibold">
                    معاينة حية للبطاقة في الصفحة الرئيسية
                  </h3>
                </div>
                <span className="font-label-sm text-label-sm text-secondary bg-surface-container-high px-2 py-0.5 rounded-full font-medium">
                  تحديث فوري
                </span>
              </div>

              <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-md border border-surface-container-high">
                <div className="flex gap-space-md items-start">
                  <div className="relative shrink-0 w-20 h-28 shadow-md rounded-lg overflow-hidden bg-surface-variant flex items-center justify-center">
                    {effectiveCover ? (
                      <img alt="معاينة الغلاف" className="w-20 h-28 object-cover rounded-lg" src={effectiveCover} />
                    ) : (
                      <span className="material-symbols-outlined text-secondary text-[32px]">book</span>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-space-xs mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary-container font-label-sm text-label-sm inline-block font-semibold">
                        كتاب الشهر
                      </span>
                    </div>
                    <h4 className="font-headline-sm text-headline-sm text-primary truncate leading-tight mb-1 font-bold">
                      {title.trim() || "عنوان الكتاب الجديد"}
                    </h4>
                    <p className="font-body-md text-label-lg text-secondary truncate mb-2 font-medium">
                      {author.trim() ? `بقلم: ${author.trim()}` : "اسم المؤلف"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-error-container text-on-error-container rounded-xl text-body-sm font-medium">
                {error}
              </div>
            )}

            {/* Sticky Bottom Actions Bar */}
            <div className="fixed bottom-4 left-margin right-margin z-40 max-w-xl mx-auto inset-x-0 px-4">
              <div className="bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl shadow-xl p-space-sm flex items-center gap-space-sm border border-outline-variant/30">
                <button
                  className="flex-1 h-12 bg-primary-container text-on-primary font-title-md text-title-md font-semibold rounded-xl flex items-center justify-center gap-space-xs shadow-md hover:bg-primary active:bg-primary transition-all disabled:opacity-60 cursor-pointer"
                  disabled={saving}
                  type="submit"
                >
                  {saving ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">
                        autorenew
                      </span>
                      <span>جارٍ الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">check</span>
                      <span>اعتماد هذا الكتاب</span>
                    </>
                  )}
                </button>
                <button
                  className="h-12 px-space-md text-on-surface-variant hover:text-primary font-label-lg text-label-lg rounded-xl hover:bg-surface-container transition-colors font-medium cursor-pointer"
                  onClick={() => router.push("/admin/dashboard")}
                  type="button"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}