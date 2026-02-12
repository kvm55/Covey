"use client";

import Header from "../Header";
import Footer from "../Footer";
import styles from "./SiteLayout.module.css";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer />
    </div>
  );
}