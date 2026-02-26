import "@/styles/styles.css";
import { Jura, Merriweather } from "next/font/google";
import type { Metadata, Viewport } from "next";
import SiteLayout from "@/components/SiteLayout";
import { AuthProvider } from "@/context/AuthContext";

const jura = Jura({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-family-headings",
  display: "swap",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-family-body",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Covey – Real Estate Investing Platform",
  description: "Smarter real estate investing built for modern operators.",
  openGraph: {
    title: "Covey – Real Estate Investing Platform",
    description: "Smarter real estate investing built for modern operators.",
    siteName: "Covey",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jura.variable} ${merriweather.variable}`}>
      <body>
        <AuthProvider>
          <SiteLayout>{children}</SiteLayout>
        </AuthProvider>
      </body>
    </html>
  );
}