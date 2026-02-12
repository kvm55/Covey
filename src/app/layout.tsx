import "@/styles/styles.css";
import SiteLayout from "@/components/SiteLayout";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "Covey – Real Estate Investing Platform",
  description: "Smarter real estate investing built for modern operators.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SiteLayout>{children}</SiteLayout>
        </AuthProvider>
      </body>
    </html>
  );
}