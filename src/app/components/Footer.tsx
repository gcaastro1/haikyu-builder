"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useState } from "react";

export function Footer() {
  const { isAdmin, login, logout } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const t = useTranslation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      setIsModalOpen(false);
      setPassword("");
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <footer className="footer" style={{ 
      textAlign: "center", 
      padding: "2rem", 
      marginTop: "auto", 
      borderTop: "1px solid #333",
      fontSize: "0.9rem",
      color: "#888"
    }}>
      <p>Haikyu Builder By Kyon - 2025</p>
      
      <div style={{ marginTop: "1rem" }}>
        {isAdmin ? (
          <button 
            onClick={handleLogout}
            style={{ background: "none", border: "none", color: "#666", textDecoration: "underline", cursor: "pointer", fontSize: "0.8rem" }}
          >
            {t.common.logout_admin}
          </button>
        ) : (
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{ background: "none", border: "none", color: "#666", textDecoration: "underline", cursor: "pointer", fontSize: "0.8rem" }}
          >
            {t.common.restricted_access}
          </button>
        )}
      </div>

      {isModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.8)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "#1a1a1a",
            padding: "2rem",
            borderRadius: "8px",
            border: "1px solid #333",
            width: "300px",
            maxWidth: "90%"
          }}>
            <h3 style={{ color: "#fff", marginBottom: "1rem", textAlign: "center" }}>{t.common.admin_access}</h3>
            <form onSubmit={handleLogin}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.common.password}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  marginBottom: "1rem",
                  backgroundColor: "#333",
                  border: "1px solid #444",
                  color: "#fff",
                  borderRadius: "4px"
                }}
                autoFocus
              />
              {error && <p style={{ color: "#ff4444", fontSize: "0.8rem", marginBottom: "1rem" }}>{t.common.incorrect_password}</p>}
              
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setError(false); setPassword(""); }}
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    backgroundColor: "transparent",
                    border: "1px solid #444",
                    color: "#fff",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    backgroundColor: "#e65100",
                    border: "none",
                    color: "#fff",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  {t.common.enter}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
}
