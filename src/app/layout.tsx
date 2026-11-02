import type { Metadata } from "next";
import { Inter, Archivo_Black } from "next/font/google";
import "./globals.css";
import { config } from "@/data/config";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Script from "next/script";
import BackgroundEffects from "@/components/layout/background-effects";
import { Providers } from "@/components/layout/providers";
export const metadata: Metadata = {
  metadataBase: new URL(config.site || "http://localhost:3000"),
  title: config.title,
  description: config.description.long,
  keywords: config.keywords,
  authors: [{ name: config.author }],
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: config.title,
    description: config.description.short,
    ...(config.site ? { url: config.site } : {}),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: config.title,
    description: config.description.short,
  },
  robots: { index: true, follow: true },
};
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={[inter.variable, archivoBlack.variable, "font-sans"].join(" ")}
      suppressHydrationWarning
    >
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[3000] bg-background p-3"
        >
          Skip to content
        </a>
        <Providers>
          <Header />
          <div id="main-content">{children}</div>
          <Footer />
          <BackgroundEffects />
        </Providers>
        {process.env.UMAMI_DOMAIN && process.env.UMAMI_SITE_ID && (
          <Script
            src={process.env.UMAMI_DOMAIN}
            data-website-id={process.env.UMAMI_SITE_ID}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
