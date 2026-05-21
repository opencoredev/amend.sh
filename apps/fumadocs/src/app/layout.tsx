import { RootProvider } from "fumadocs-ui/provider/next";
import "./global.css";
import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://docs.amend.sh"),
  title: {
    default: "Amend.sh Docs",
    template: "%s | Amend.sh Docs",
  },
  description: "Source-linked product update docs for Amend.sh.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    description: "Source-linked product update docs for Amend.sh.",
    siteName: "Amend.sh Docs",
    title: "Amend.sh Docs",
    type: "website",
    url: "https://docs.amend.sh",
  },
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.className} flex flex-col min-h-screen`}
        style={{
          fontFamily: "var(--font-geist-sans), Inter, ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <RootProvider theme={{ defaultTheme: "dark", enableSystem: false }}>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
