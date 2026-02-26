'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import styles from "./header.module.css";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Marketplace", href: "/marketplace" },
  { name: "CoveySelect", href: "/coveyselect" },
  { name: "Compass", href: "/compass" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "New Property", href: "/property/new" },
];

export default function Header() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.header__container}>
        {/* Logo lockup: bobwhite + Covey text */}
        <Link href="/" className={styles.logo}>
          <Image
            src="/bobwhite-slate.svg"
            alt="Covey bobwhite quail"
            width={32}
            height={29}
            className={styles.logo__icon}
          />
          <span className={styles.logo__text}>Covey</span>
        </Link>

        {/* Desktop nav */}
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

        {/* Auth / CTA area */}
        <div className={styles.cta}>
          {loading ? null : user ? (
            <>
              <span className={styles.cta__user}>{user.email}</span>
              <button
                onClick={signOut}
                className={styles.cta__signout}
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
                className={styles.cta__primary}
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={`${styles.hamburger} ${mobileOpen ? styles["hamburger--open"] : ""}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={styles.mobile}>
          <nav className={styles.mobile__nav}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.mobile__link} ${
                  pathname === link.href ? styles["mobile__link--active"] : ""
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className={styles.mobile__auth}>
            {loading ? null : user ? (
              <>
                <span className={styles.mobile__user}>{user.email}</span>
                <button onClick={() => { signOut(); setMobileOpen(false); }} className={styles.mobile__signout}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/signin" className={styles.mobile__link} onClick={() => setMobileOpen(false)}>Sign In</Link>
                <Link href="/signup" className={styles.mobile__primary} onClick={() => setMobileOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
