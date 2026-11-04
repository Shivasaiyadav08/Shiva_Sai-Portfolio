import type { Metadata } from "next";
import { Inter, Archivo_Black } from "next/font/google";
import "./globals.css";
import { config } from "@/data/config";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Script from "next/script";
import BackgroundEffects from "@/components/layout/background-effects";
import { Providers } from "@/components/layout/providers";
import { pageMetadata, portfolioSchema } from "@/lib/seo";
export const metadata: Metadata = {
  ...pageMetadata("/"),
  metadataBase: new URL(config.site),
  keywords: config.keywords,
  authors: [{ name: config.author }],
  icons: {
    icon: { url: "/terminal.svg", type: "image/svg+xml", sizes: "any" },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION?.trim() || undefined,
    other: process.env.BING_SITE_VERIFICATION?.trim()
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION.trim() }
      : undefined,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(portfolioSchema()).replace(/</g, "\\u003c"),
          }}
        />
        <noscript>
          <style>{`
          [data-portfolio-intro], [data-scroll-keyboard] { display: none !important; }
          [data-intro-reveal], [data-content-reveal] { opacity: 1 !important; transform: none !important; }
        `}</style>
        </noscript>
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
