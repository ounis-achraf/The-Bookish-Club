"use client";

import Link from "next/link";

export type AdminTab = "dashboard" | "book" | "archive";

interface AdminNavbarProps {
  activeTab: AdminTab;
}

const navItems = [
  {
    id: "dashboard" as AdminTab,
    label: "الرئيسية",
    href: "/admin/dashboard",
    icon: "grid_view"
  },
  {
    id: "book" as AdminTab,
    label: "كتاب الشهر",
    href: "/admin/book",
    icon: "auto_stories"
  },
  {
    id: "archive" as AdminTab,
    label: "الأرشيف",
    href: "/admin/archive",
    icon: "collections_bookmark"
  }
];

export default function AdminNavbar({ activeTab }: AdminNavbarProps) {
  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface-container-low/95 backdrop-blur-xl shadow-[0_-4px_16px_rgba(65,40,23,0.06)] border-t border-outline-variant/30 font-thmanyah">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-space-xs">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`relative flex flex-col items-center justify-center h-12 px-5 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-primary/10 text-primary font-bold shadow-sm"
                  : "text-on-surface-variant/60 hover:text-primary transition-colors font-medium"
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] transition-transform duration-200 ${
                  isActive ? "scale-110" : ""
                }`}
                style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}
              >
                {item.icon}
              </span>
              <span className={`font-label-sm text-label-sm mt-0.5 ${isActive ? "font-bold" : "font-medium"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
