"use client"; 

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react'; 

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Builder" },
    { href: "/database", label: "Personagens" },
    { href: "/cadastro", label: "Cadastro" },
    { href: "/about", label: "Sobre" },
  ];

  const linkHoverEffect = `
    relative text-gray-200 transition-colors
    after:content-[''] after:absolute after:bottom-[-6px] after:left-0 
    after:h-[2px] after:w-0 after:bg-orange-500 
    after:transition-all after:duration-300
    hover:after:w-full hover:text-white
  `;

  const donateButtonEffect = `
    bg-transparent border border-orange-500 text-orange-500
    font-bold py-2 px-5 rounded-lg transition-all
    shadow-lg shadow-orange-500/20 
    hover:bg-orange-500 hover:text-white hover:shadow-orange-500/40
  `;

  return (
    <nav className="bg-zinc-950 border-b border-zinc-800 shadow-lg text-white p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        
        <Link href="/" className="font-bricolage text-xl">
          <div className="flex flex-col">
            <div>
              <span className="font-bold">HAIKYU</span>
              <span className="font-normal opacity-80 ml-1">BUILDER</span>
            </div>
            <span className="text-xs font-normal opacity-70 self-end -mt-1">
              By kyOn
            </span>
          </div>
        </Link>

        <div className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkHoverEffect}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:block">
          <a 
            href="#" 
            target="_blank" 
            rel="noopener noreferrer"
            className={donateButtonEffect}
          >
            Donate
          </a>
        </div>

        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden mt-4 p-4 bg-zinc-900 rounded-lg">
          <nav className="flex flex-col gap-4 text-center">
            
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="hover:text-orange-500 transition-colors py-2" 
                onClick={() => setIsMenuOpen(false)} 
              >
                {link.label}
              </Link>
            ))}
            
            <div className="h-px bg-zinc-700 my-2"></div>

            <a 
              href="#" 
              target="_blank" 
              rel="noopener noreferrer"
              className={donateButtonEffect}
            >
              Donate
            </a>
          </nav>
        </div>
      )}
    </nav>
  );
}