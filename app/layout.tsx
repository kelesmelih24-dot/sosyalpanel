import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://sosyalpanel.com"),
  title: "SosyalPanel — SMM Panel",
  description: "Instagram, TikTok, YouTube ve daha fazlası için toptan sosyal medya hizmetleri paneli.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="tr"><body className="font-body antialiased">{children}</body></html>);
}
