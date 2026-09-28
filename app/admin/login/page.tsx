"use client";

import { useState } from "react";
import { createClient } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message || "فشل تسجيل الدخول. يرجى التحقق من البيانات.");
      setLoading(false);
    } else {
      router.push("/admin/dashboard");
    }
  }

  return (
    <main className="flex-1 flex flex-col justify-center items-center min-h-screen bg-surface px-margin py-8">
      <div className="flex flex-col w-full max-w-sm mx-auto justify-center">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center p-2 mb-3.5 shadow-sm relative group">
            <span className="material-symbols-outlined text-primary text-[32px]">menu_book</span>
            <div className="absolute -inset-1 rounded-full bg-secondary-fixed/30 -z-10 blur-sm"></div>
          </div>
          <span
            className="font-headline-lg text-display-lg text-primary tracking-wide leading-tight mb-1"
            style={{ fontFamily: "'Noto Serif', serif", fontStyle: "italic" }}
          >
            The Bookish Club
          </span>
          <div className="flex items-center gap-2">
            <span className="h-px w-6 bg-outline-variant/60"></span>
            <p className="font-title-md text-title-md text-secondary tracking-normal font-semibold">
              نادي الكتّاب
            </p>
            <span className="h-px w-6 bg-outline-variant/60"></span>
          </div>
        </div>

        {/* Card Form Container */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-7 shadow-[0_4px_20px_-4px_rgba(65,40,23,0.06)] relative overflow-hidden border border-surface-container-high">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-surface-container mb-3 text-secondary">
              <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
              <span className="font-label-sm text-label-sm font-semibold">بوابة الإدارة</span>
            </div>
            <h1 className="font-headline-md text-headline-md text-primary font-semibold mb-1">
              تسجيل دخول المشرف
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              أهلاً بك مجدداً في مساحتك الأدبية الخاصة
            </p>
          </div>

          <form className="space-y-4" onSubmit={submit}>
            {/* Email Input */}
            <div className="flex flex-col gap-1.5 text-right">
              <label className="font-label-lg text-label-lg text-primary font-medium flex items-center justify-between" htmlFor="email">
                <span>البريد الإلكتروني</span>
              </label>
              <div className="relative flex items-center">
                <input
                  className="w-full h-12 px-4 pl-11 text-right bg-surface-container-low text-on-surface font-body-md text-body-md rounded-xl transition-all duration-200 outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_#5a3e2b]"
                  dir="ltr"
                  id="email"
                  name="email"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bookishclub.com"
                  required
                  type="email"
                  value={email}
                />
                <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none">
                  mail
                </span>
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5 text-right">
              <label className="font-label-lg text-label-lg text-primary font-medium flex items-center justify-between" htmlFor="password">
                <span>كلمة المرور</span>
              </label>
              <div className="relative flex items-center">
                <input
                  className={`w-full h-12 px-4 pl-11 text-right bg-surface-container-low text-on-surface font-body-md text-body-md rounded-xl transition-all duration-200 outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_#5a3e2b] ${
                    !showPassword ? "tracking-widest" : ""
                  }`}
                  dir="ltr"
                  id="password"
                  name="password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label="تبديل ظهور كلمة المرور"
                  className="absolute left-3 p-1 text-outline hover:text-primary transition-colors flex items-center justify-center rounded-lg focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-error-container text-on-error-container rounded-xl text-body-sm font-medium">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              className="w-full h-12 mt-2 bg-primary-container hover:bg-primary active:scale-[0.99] text-on-primary font-title-md text-title-md font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                  <span>جارٍ التحقق...</span>
                </>
              ) : (
                <>
                  <span>دخول</span>
                  <span className="material-symbols-outlined text-[18px] transform rotate-180">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="flex flex-col items-center text-center mt-8 gap-2">
          <div className="flex items-center gap-1.5 text-outline">
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
            <span className="font-label-sm text-label-sm">منصة مجتمع القراءة المعرفي</span>
          </div>
          <p className="font-label-sm text-label-sm text-outline-variant">
            نظام إدارة نادي القراءة الخاص
          </p>
        </div>
      </div>
    </main>
  );
}