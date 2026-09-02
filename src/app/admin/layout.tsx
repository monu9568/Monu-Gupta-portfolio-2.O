import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin CMS • Spatial Studio Suite",
  description: "Administrative control center for the luxury portfolio experience.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-lenis-prevent="true" className="min-h-screen bg-[#06070a] text-slate-100 overflow-y-auto">
      {children}
    </div>
  );
}
