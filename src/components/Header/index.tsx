'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "./header.module.css";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Marketplace", href: "/marketplace" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "New Property", href: "/property/new" },
];

export default function Header() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.header__container}>
        <Link href="/" className={styles.logo}>
          Covey
        </Link>
        <nav className={styles.nav}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.nav__link} ${
                pathname === link.href ? styles["nav__link--active"] : ""
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
        <div className={styles.cta}>
          {loading ? null : user ? (
            <>
              <span className={styles.cta__link}>{user.email}</span>
              <button
                onClick={signOut}
                className={`${styles.cta__link} ${styles["cta__link--primary"]}`}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/signin" className={styles.cta__link}>
                Sign In
              </Link>
              <Link
                href="/signup"
                className={`${styles.cta__link} ${styles["cta__link--primary"]}`}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
