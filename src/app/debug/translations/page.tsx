"use client";

import { dictionary } from "@/app/lib/i18n/dictionary";
import { useI18nStore } from "@/stores/useI18nStore";
import { useState } from "react";

export default function TranslationsDebugPage() {
  const { lang, setLang } = useI18nStore();
  const [filter, setFilter] = useState("");
  
  // Flatten dictionary for comparison
  const flatten = (obj: any, prefix = ""): Record<string, string> => {
    return Object.keys(obj).reduce((acc: any, k) => {
      const pre = prefix.length ? prefix + "." : "";
      if (typeof obj[k] === "object" && obj[k] !== null && !Array.isArray(obj[k]))
        Object.assign(acc, flatten(obj[k], pre + k));
      else
        acc[pre + k] = obj[k];
      return acc;
    }, {});
  };

  const ptFlat = flatten(dictionary.pt);
  const enFlat = flatten(dictionary.en);

  const ptKeys = Object.keys(ptFlat);
  const enKeys = Object.keys(enFlat);

  const missingInEn = ptKeys.filter(k => !enKeys.includes(k));
  const missingInPt = enKeys.filter(k => !ptKeys.includes(k));

  const emptyInEn = enKeys.filter(k => !enFlat[k] || enFlat[k].trim() === "");
  const emptyInPt = ptKeys.filter(k => !ptFlat[k] || ptFlat[k].trim() === "");

  // Check for potentially untranslated values (identical in PT and EN)
  // Ignoring short strings or common proper nouns might be needed, but listing them is helpful.
  const identicalValues = ptKeys.filter(k => enKeys.includes(k) && ptFlat[k] === enFlat[k] && ptFlat[k].length > 2);

  const filteredKeys = [...new Set([...ptKeys, ...enKeys])].filter(k => k.toLowerCase().includes(filter.toLowerCase())).sort();

  return (
    <div style={{ padding: "2rem", color: "#e4e4e7", background: "#18181b", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem", color: "white" }}>Translation System Status</h1>
      
      <div style={{ marginBottom: "2rem", padding: "1.5rem", border: "1px solid #3f3f46", borderRadius: "8px", background: "#27272a" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>System Health</h2>
            <div style={{ display: "flex", gap: "2rem" }}>
              <div>
                <span style={{ color: "#a1a1aa", fontSize: "0.875rem" }}>Total Keys (PT)</span>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{ptKeys.length}</div>
              </div>
              <div>
                <span style={{ color: "#a1a1aa", fontSize: "0.875rem" }}>Total Keys (EN)</span>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{enKeys.length}</div>
              </div>
              <div>
                 <span style={{ color: "#a1a1aa", fontSize: "0.875rem" }}>Coverage</span>
                 <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: missingInEn.length === 0 ? "#4ade80" : "#f87171" }}>
                    {Math.round((enKeys.length / ptKeys.length) * 100)}%
                 </div>
              </div>
            </div>
          </div>

          <div>
             <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Language Switcher Test</h3>
             <div style={{ display: "flex", gap: "0.5rem" }}>
                <button 
                    onClick={() => setLang("pt")} 
                    style={{ 
                        padding: "0.5rem 1rem", 
                        background: lang === "pt" ? "#f97316" : "#3f3f46", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold"
                    }}
                >
                    PT-BR
                </button>
                <button 
                    onClick={() => setLang("en")} 
                    style={{ 
                        padding: "0.5rem 1rem", 
                        background: lang === "en" ? "#f97316" : "#3f3f46", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold"
                    }}
                >
                    EN-US
                </button>
            </div>
            <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#a1a1aa" }}>
                Current active language: <strong style={{ color: "#f97316" }}>{lang.toUpperCase()}</strong>
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        
        {/* Missing Keys Section */}
        <div style={{ border: "1px solid #3f3f46", borderRadius: "8px", padding: "1rem", background: "#27272a" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: missingInEn.length ? "#ef4444" : "#4ade80" }}></span>
                Missing in EN
            </h3>
            {missingInEn.length > 0 ? (
                <ul style={{ maxHeight: "200px", overflowY: "auto", fontSize: "0.875rem", color: "#ef4444" }}>
                    {missingInEn.map(k => <li key={k} style={{ marginBottom: "0.25rem" }}>{k}</li>)}
                </ul>
            ) : <p style={{ color: "#4ade80", fontSize: "0.875rem" }}>All Portuguese keys are present in English dictionary.</p>}
        </div>

        <div style={{ border: "1px solid #3f3f46", borderRadius: "8px", padding: "1rem", background: "#27272a" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: missingInPt.length ? "#ef4444" : "#4ade80" }}></span>
                Missing in PT
            </h3>
            {missingInPt.length > 0 ? (
                <ul style={{ maxHeight: "200px", overflowY: "auto", fontSize: "0.875rem", color: "#ef4444" }}>
                    {missingInPt.map(k => <li key={k} style={{ marginBottom: "0.25rem" }}>{k}</li>)}
                </ul>
            ) : <p style={{ color: "#4ade80", fontSize: "0.875rem" }}>All English keys are present in Portuguese dictionary.</p>}
        </div>

        {/* Empty Values Section */}
        <div style={{ border: "1px solid #3f3f46", borderRadius: "8px", padding: "1rem", background: "#27272a" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: (emptyInEn.length || emptyInPt.length) ? "#f59e0b" : "#4ade80" }}></span>
                Empty Values
            </h3>
            {(emptyInEn.length > 0 || emptyInPt.length > 0) ? (
                <div style={{ maxHeight: "200px", overflowY: "auto", fontSize: "0.875rem" }}>
                    {emptyInEn.map(k => <div key={k} style={{ color: "#f59e0b" }}>EN: {k}</div>)}
                    {emptyInPt.map(k => <div key={k} style={{ color: "#f59e0b" }}>PT: {k}</div>)}
                </div>
            ) : <p style={{ color: "#4ade80", fontSize: "0.875rem" }}>No empty translation values found.</p>}
        </div>

        {/* Identical Values Section (Potential untranslated) */}
        <div style={{ border: "1px solid #3f3f46", borderRadius: "8px", padding: "1rem", background: "#27272a" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#3b82f6" }}></span>
                Identical Values (Warning)
            </h3>
            <p style={{ fontSize: "0.75rem", color: "#a1a1aa", marginBottom: "0.5rem" }}>
                Values that are exactly the same in PT and EN (excluding short strings). Check if they should be translated.
            </p>
            {identicalValues.length > 0 ? (
                <ul style={{ maxHeight: "160px", overflowY: "auto", fontSize: "0.875rem", color: "#fbbf24" }}>
                    {identicalValues.map(k => (
                        <li key={k} style={{ marginBottom: "0.25rem", display: "flex", justifyContent: "space-between" }}>
                            <span>{k}</span>
                            <span style={{ color: "#a1a1aa" }}>"{ptFlat[k]}"</span>
                        </li>
                    ))}
                </ul>
            ) : <p style={{ color: "#4ade80", fontSize: "0.875rem" }}>No identical values found.</p>}
        </div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Dictionary Explorer</h3>
            <input 
                type="text" 
                placeholder="Filter keys..." 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ 
                    padding: "0.5rem", 
                    borderRadius: "4px", 
                    border: "1px solid #3f3f46", 
                    background: "#27272a", 
                    color: "white",
                    minWidth: "300px"
                }}
            />
        </div>
        
        <div style={{ overflowX: "auto", border: "1px solid #3f3f46", borderRadius: "8px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
                <thead>
                    <tr style={{ background: "#27272a", borderBottom: "1px solid #3f3f46" }}>
                        <th style={{ padding: "1rem", width: "30%" }}>Key</th>
                        <th style={{ padding: "1rem", width: "35%" }}>PT (Portuguese)</th>
                        <th style={{ padding: "1rem", width: "35%" }}>EN (English)</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredKeys.length > 0 ? filteredKeys.map(k => (
                        <tr key={k} style={{ borderBottom: "1px solid #27272a", background: "#18181b" }}>
                            <td style={{ padding: "0.75rem 1rem", fontFamily: "monospace", color: "#a1a1aa" }}>{k}</td>
                            <td style={{ padding: "0.75rem 1rem" }}>{ptFlat[k]}</td>
                            <td style={{ padding: "0.75rem 1rem" }}>
                                {enFlat[k] ? (
                                    enFlat[k] === ptFlat[k] ? (
                                        <span style={{ color: "#fbbf24" }} title="Identical to PT">{enFlat[k]}</span>
                                    ) : (
                                        enFlat[k]
                                    )
                                ) : (
                                    <span style={{ color: "#ef4444", fontWeight: "bold" }}>MISSING</span>
                                )}
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={3} style={{ padding: "2rem", textAlign: "center", color: "#71717a" }}>
                                No keys found matching "{filter}"
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
