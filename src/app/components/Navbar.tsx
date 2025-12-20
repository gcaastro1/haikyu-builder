"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useI18nStore } from "@/stores/useI18nStore";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DonateModal } from "./DonateModal";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const { lang, setLang } = useI18nStore();
  const t = useTranslation();

  const navLinks = [
    { href: "/", label: t.navbar.builder },
    { href: "/database", label: t.navbar.characters },
    { href: "/memories", label: t.navbar.memories },
    { href: "/exercises", label: t.navbar.exercises },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="navbar__container">
          <Link href="/" className="navbar__logo">
            <div className="navbar__logo-wrapper">
              <div>
                <span className="navbar__logo-main">HAIKYU</span>
                <span className="navbar__logo-sub">BUILDER</span>
              </div>
              <span className="navbar__logo-author">By kyOn</span>
            </div>
          </Link>

          <div className="navbar__desktop-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="navbar__desktop-link"
              >
                {link.label}
              </Link>
            ))}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              className="navbar__lang-select"
              aria-label={t.navbar.select_language}
            >
              <option value="pt">BR</option>
              <option value="en">EN</option>
            </select>
          </div>

          <div className="navbar__desktop-donate">
            <button
              onClick={() => setIsDonateOpen(true)}
              className="navbar__donate-button"
            >
              {t.navbar.donate}
            </button>
          </div>

          <div className="navbar__mobile-toggle">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="navbar__mobile-menu">
            <nav className="navbar__mobile-nav">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="navbar__mobile-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="navbar__mobile-lang">
                <label htmlFor="lang-select">Idioma</label>
                <select
                  id="lang-select"
                  value={lang}
                  onChange={(e) => setLang(e.target.value as any)}
                  className="navbar__lang-select"
                >
                  <option value="pt">BR</option>
                  <option value="en">EN</option>
                </select>
              </div>

              <div className="navbar__mobile-divider"></div>

              <button
                onClick={() => setIsDonateOpen(true)}
                className="navbar__donate-button"
              >
                {t.navbar.donate}
              </button>
            </nav>
          </div>
        )}
      </nav>

      <DonateModal
        isOpen={isDonateOpen}
        onClose={() => setIsDonateOpen(false)}
      />
    </>
  );
}
