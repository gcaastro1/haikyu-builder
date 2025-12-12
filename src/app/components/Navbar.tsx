"use client";

import { useI18nStore } from "@/stores/useI18nStore";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DonateModal } from "./DonateModal";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const { lang, setLang } = useI18nStore();

  const navLinks = [
    { href: "/", label: "Builder" },
    { href: "/database", label: "Personagens" },
   // { href: "/about", label: "Sobre" },
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
              aria-label="Selecionar idioma"
            >
              <option value="pt">PT</option>
              <option value="en">EN</option>
              <option value="es">ES</option>
            </select>
          </div>

          <div className="navbar__desktop-donate">
            <button
              onClick={() => setIsDonateOpen(true)}
              className="navbar__donate-button"
            >
              Donate
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
                  <option value="pt">PT</option>
                  <option value="en">EN</option>
                  <option value="es">ES</option>
                </select>
              </div>

              <div className="navbar__mobile-divider"></div>

              <button
                onClick={() => setIsDonateOpen(true)}
                className="navbar__donate-button"
              >
                Donate
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
