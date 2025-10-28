"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Builder" },
    { href: "/database", label: "Personagens" },
    // { href: "/cadastro", label: "Cadastro" },
    { href: "/about", label: "Sobre" },
  ];

  return (
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

        {/* Desktop Nav */}
        <div className="navbar__desktop-nav">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="navbar__desktop-link">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Donate */}
        <div className="navbar__desktop-donate">
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="navbar__donate-button"
          >
            Donate
          </a>
        </div>

        {/* Mobile Toggle */}
        <div className="navbar__mobile-toggle">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
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

            <div className="navbar__mobile-divider"></div>

            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="navbar__donate-button"
            >
              Donate
            </a>
          </nav>
        </div>
      )}
    </nav>
  );
}